import React, { useRef, useState, useEffect } from 'react';
import { refineUserPainting, generateImageFromPrompt, createPaintingLesson } from '../services/geminiService';
import type { PaintingLesson, LessonStep, Painting } from '../types';

const INITIAL_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#FFA500', '#FFFF00', 
  '#008000', '#0000FF', '#4B0082', '#EE82EE', '#8B4513'
];

type BrushStyle = 'round' | 'square' | 'spray' | 'marker' | 'bristle' | 'charcoal' | 'watercolor';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line';

interface InteractiveStudioProps {
    initialPainting?: Painting | null;
    onBack?: () => void;
    isPremium?: boolean;
    onUpgrade?: () => void;
}

const InteractiveStudio: React.FC<InteractiveStudioProps> = ({ initialPainting, onBack, isPremium = false, onUpgrade }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number, y: number } | null>(null);
  const startPosRef = useRef<{ x: number, y: number } | null>(null); // For shapes
  const snapshotRef = useRef<ImageData | null>(null); // For shape preview
  const canvasRectRef = useRef<DOMRect | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const smudgeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Used for 'bristle' brush to maintain consistent offset lines
  const bristleOffsetsRef = useRef<{dx: number, dy: number}[]>([]);
  
  // Wet Paint / Bleed Simulation State
  const wetPointsRef = useRef<{x: number, y: number, color: string, size: number, time: number}[]>([]);
  const animationFrameRef = useRef<number>();

  // Studio State
  const [color, setColor] = useState('#000000');
  const [recentColors, setRecentColors] = useState<string[]>(INITIAL_COLORS.slice(0, 8));
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [isSmudgeActive, setIsSmudgeActive] = useState(false);
  const [isShapeActive, setIsShapeActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Mixer State
  const [mixerColor1, setMixerColor1] = useState('#FF0000');
  const [mixerColor2, setMixerColor2] = useState('#FFFFFF');
  const [mixRatio, setMixRatio] = useState(0.5); // 0.0 (color1) to 1.0 (color2)
  
  // Brush Settings
  // Increased default size to account for higher resolution canvas (1920x1440)
  const [brushSize, setBrushSize] = useState(24);
  const [brushOpacity, setBrushOpacity] = useState(100); // 0-100
  const [brushStyle, setBrushStyle] = useState<BrushStyle>('round');

  // Shape Settings
  const [shapeType, setShapeType] = useState<ShapeType>('rectangle');

  // Advanced Brush Settings
  const [brushFlow, setBrushFlow] = useState(100); // 1-100, affects density/buildup
  const [brushScatter, setBrushScatter] = useState(0); // 0-100, positional randomness
  const [brushJitter, setBrushJitter] = useState(0); // 0-100, size randomness
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Eraser Settings
  const [eraserSize, setEraserSize] = useState(60);
  const [eraserOpacity, setEraserOpacity] = useState(100);
  
  // Content State
  const [prompt, setPrompt] = useState(initialPainting ? `A painting of ${initialPainting.title}: ${initialPainting.description}` : '');
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Lesson/Instructor Mode State
  const [lesson, setLesson] = useState<PaintingLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const hasGreetedRef = useRef(false);

  // Premium Modal State
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // TTS Helper
  const speakInstruction = (text: string, interrupt: boolean = true) => {
      if ('speechSynthesis' in window && !isMuted) {
          if (interrupt) {
              window.speechSynthesis.cancel();
          }
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0; // Slightly higher pitch for a friendly tone if desired, but 1.0 is standard
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
      }
  };

  // Check feature access
  const checkPremiumFeature = (action: () => void) => {
      if (isPremium) {
          action();
      } else {
          setShowPremiumModal(true);
      }
  };

  // Initialize from initialPainting if present
  useEffect(() => {
      if (initialPainting && !hasGreetedRef.current) {
          hasGreetedRef.current = true;
          setPrompt(initialPainting.title);
          
          if (isPremium) {
              // Warm Greeting
              const greeting = `Hello! Welcome to your private art studio. I absolutely love this concept for ${initialPainting.title}. It's going to look amazing on the canvas. Are you ready to start your painting session? Let's get creative!`;
              speakInstruction(greeting, true);

              const timer = setTimeout(() => {
                  // Pass true to queue the first step instruction after the greeting
                  handleTeachMe(initialPainting.title, initialPainting.description, true);
              }, 1000);
              return () => clearTimeout(timer);
          } else {
              // Free user greeting - upsell
              const greeting = `Welcome to the studio! To have me guide you step-by-step through ${initialPainting.title}, please upgrade to Pro. Otherwise, feel free to free-paint!`;
              speakInstruction(greeting, true);
          }
      }
  }, [initialPainting, isPremium]);

  // Cancel speech on unmount or mute
  useEffect(() => {
      if (isMuted) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
      }
  }, [isMuted]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  // Prevent accidental navigation with unsaved changes
  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (hasUnsavedChanges) {
              e.preventDefault();
              e.returnValue = ''; // Chrome requires returnValue to be set
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleExit = () => {
      if (hasUnsavedChanges) {
          if (window.confirm("You have unsaved masterpieces! Are you sure you want to leave without saving?")) {
              onBack?.();
          }
      } else {
          onBack?.();
      }
  };

  // Watercolor Bleed Simulation Loop
  useEffect(() => {
    const bleed = () => {
        if (wetPointsRef.current.length === 0) {
            animationFrameRef.current = requestAnimationFrame(bleed);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const now = Date.now();
        // Remove dry points (older than 3s)
        wetPointsRef.current = wetPointsRef.current.filter(p => now - p.time < 3000);

        if (wetPointsRef.current.length > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            
            wetPointsRef.current.forEach(p => {
                // Chance to bleed this frame for this point
                if (Math.random() < 0.05) {
                    const age = now - p.time;
                    const spreadFactor = age / 3000; // 0 to 1
                    
                    // The "bleed" is a random offset circle that is very faint
                    // It expands slightly over time (spreadFactor)
                    const radius = (p.size / 2) * (1 + spreadFactor * 1.5);
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * radius;
                    const offsetX = Math.cos(angle) * dist;
                    const offsetY = Math.sin(angle) * dist;
                    
                    ctx.fillStyle = p.color;
                    // Very low alpha to create subtle buildup over many frames
                    ctx.globalAlpha = 0.015; 
                    
                    ctx.beginPath();
                    ctx.arc(p.x + offsetX, p.y + offsetY, radius * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            ctx.restore();
        }
        
        animationFrameRef.current = requestAnimationFrame(bleed);
    };
    
    animationFrameRef.current = requestAnimationFrame(bleed);
    
    return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // --- HELPER FUNCTIONS ---
  const activateTool = (tool: 'paint' | 'eraser' | 'smudge' | 'shape') => {
      setIsEraserActive(tool === 'eraser');
      setIsSmudgeActive(tool === 'smudge');
      setIsShapeActive(tool === 'shape');
      setIsEyedropperActive(false);
  };

  const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  };

  const getMixedColor = () => {
      const rgb1 = hexToRgb(mixerColor1);
      const rgb2 = hexToRgb(mixerColor2);
      const r = rgb1.r * (1 - mixRatio) + rgb2.r * mixRatio;
      const g = rgb1.g * (1 - mixRatio) + rgb2.g * mixRatio;
      const b = rgb1.b * (1 - mixRatio) + rgb2.b * mixRatio;
      return rgbToHex(r, g, b);
  };

  const handleColorChange = (newColor: string) => {
      setColor(newColor);
      setRecentColors(prev => {
          // Avoid duplicates at the start
          const filtered = prev.filter(c => c.toLowerCase() !== newColor.toLowerCase());
          return [newColor, ...filtered].slice(0, 12);
      });
  };
  
  const applyMixedColor = () => {
      handleColorChange(getMixedColor());
  };

  const activateEyedropper = async () => {
      activateTool('paint'); // Reset other tools but keep eyedropper logic separate
      // Use native EyeDropper API if available
      if ('EyeDropper' in window) {
          try {
              // @ts-ignore - EyeDropper is not yet in standard TS lib
              const eyeDropper = new window.EyeDropper();
              const result = await eyeDropper.open();
              handleColorChange(result.sRGBHex);
          } catch (e) {
              console.log('Eyedropper cancelled');
          }
      } else {
          // Fallback to canvas click mode
          setIsEyedropperActive(!isEyedropperActive);
      }
  };

  const pickColorFromCanvas = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      // Convert RGB to Hex
      const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
      handleColorChange(hex);
      setIsEyedropperActive(false);
  };

  const getCoordinates = (e: React.PointerEvent) => {
    if (!canvasRectRef.current && canvasRef.current) {
        canvasRectRef.current = canvasRef.current.getBoundingClientRect();
    }
    const rect = canvasRectRef.current!;
    const canvas = canvasRef.current;
    
    // Default to 1 if canvas not ready, but it should be
    const scaleX = canvas ? (canvas.width / rect.width) : 1;
    const scaleY = canvas ? (canvas.height / rect.height) : 1;

    return { 
        x: (e.clientX - rect.left) * scaleX, 
        y: (e.clientY - rect.top) * scaleY 
    };
  };

  const generateBristleOffsets = (size: number) => {
      const count = Math.max(3, Math.floor(size * 1.5));
      const offsets = [];
      for (let i = 0; i < count; i++) {
          // Random offset within the brush radius
          const r = Math.random() * (size / 2);
          const angle = Math.random() * Math.PI * 2;
          offsets.push({
              dx: Math.cos(angle) * r,
              dy: Math.sin(angle) * r
          });
      }
      return offsets;
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling/gestures
    canvasRef.current?.setPointerCapture(e.pointerId);

    const { x, y } = getCoordinates(e);

    if (isEyedropperActive) {
        pickColorFromCanvas(x, y);
        return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvasRectRef.current = canvas.getBoundingClientRect();
    isDrawingRef.current = true;
    
    lastPosRef.current = { x, y };

    if (isShapeActive) {
        // Save state for previewing shapes without trails
        startPosRef.current = { x, y };
        snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
        const currentSize = isEraserActive ? eraserSize : brushSize;

        if (brushStyle === 'bristle') {
            bristleOffsetsRef.current = generateBristleOffsets(currentSize);
        }
        
        // Draw the initial dot/spray immediately
        drawBatch([e], true); 
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.releasePointerCapture(e.pointerId);
    isDrawingRef.current = false;
    lastPosRef.current = null;
    startPosRef.current = null;
    snapshotRef.current = null;
    canvasRectRef.current = null;
    bristleOffsetsRef.current = [];
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath(); // Reset path
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    if (isShapeActive) {
        drawShapePreview(e);
    } else {
        // @ts-ignore
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        drawBatch(events, false);
    }
  };

  const drawShapePreview = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!startPosRef.current || !snapshotRef.current) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      // Restore initial state to wipe previous frame of drag
      ctx.putImageData(snapshotRef.current, 0, 0);

      // Draw Shape
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = brushOpacity / 100;
      
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;
      const width = x - startX;
      const height = y - startY;

      if (shapeType === 'rectangle') {
          ctx.strokeRect(startX, startY, width, height);
      } else if (shapeType === 'circle') {
          const radius = Math.sqrt(width * width + height * height);
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, Math.PI * 2);
          ctx.stroke();
      } else if (shapeType === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(startX + width / 2, startY);
          ctx.lineTo(startX, startY + height);
          ctx.lineTo(startX + width, startY + height);
          ctx.closePath();
          ctx.stroke();
      } else if (shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.stroke();
      }

      ctx.restore();
      
      if (!hasUnsavedChanges) {
          setHasUnsavedChanges(true);
      }
  };

  const drawBatch = (events: React.PointerEvent<HTMLCanvasElement>[] | React.PointerEvent[], isStart: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
    }
    
    if (!canvasRectRef.current) {
         canvasRectRef.current = canvas.getBoundingClientRect();
    }
    const rect = canvasRectRef.current;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.save(); 

    const currentSize = isEraserActive ? eraserSize : brushSize;
    const currentOpacity = isEraserActive ? eraserOpacity : brushOpacity;
    
    const flowMultiplier = isEraserActive ? 1 : (brushFlow / 100); 
    const alphaValue = (currentOpacity / 100) * flowMultiplier;

    ctx.lineWidth = currentSize;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    let compositeOp: GlobalCompositeOperation = 'source-over';
    
    if (isEraserActive) {
        compositeOp = 'destination-out';
        ctx.strokeStyle = '#000000';
        ctx.fillStyle = '#000000';
    }

    // --- TOOL LOGIC ---

    if (isSmudgeActive) {
        // ... (Existing Smudge Logic)
        if (!smudgeCanvasRef.current) {
            smudgeCanvasRef.current = document.createElement('canvas');
            smudgeCanvasRef.current.width = 50; 
            smudgeCanvasRef.current.height = 50;
        }
        const sCanvas = smudgeCanvasRef.current;
        if (sCanvas.width < currentSize) { sCanvas.width = currentSize; sCanvas.height = currentSize; }
        const sCtx = sCanvas.getContext('2d');
        
        if (sCtx) {
            const r = currentSize / 2;
            const smudgeOpacity = (currentOpacity / 100) * 0.4; 

            for (const evt of events) {
                const x = (evt.clientX - rect.left) * scaleX;
                const y = (evt.clientY - rect.top) * scaleY;

                if (lastPosRef.current) {
                    const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
                    const steps = Math.ceil(dist / 2); 

                    for (let i = 1; i <= steps; i++) {
                        const t = i / steps;
                        const cx = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
                        const cy = lastPosRef.current.y + (y - lastPosRef.current.y) * t;
                        
                        const px = lastPosRef.current.x + (x - lastPosRef.current.x) * ((i - 1) / steps);
                        const py = lastPosRef.current.y + (y - lastPosRef.current.y) * ((i - 1) / steps);

                        sCtx.clearRect(0, 0, currentSize, currentSize);
                        sCtx.drawImage(canvas, px - r, py - r, currentSize, currentSize, 0, 0, currentSize, currentSize);

                        if (brushStyle !== 'square' && brushStyle !== 'marker') {
                            sCtx.globalCompositeOperation = 'destination-in';
                            sCtx.beginPath();
                            sCtx.arc(currentSize / 2, currentSize / 2, r, 0, Math.PI * 2);
                            sCtx.fill();
                            sCtx.globalCompositeOperation = 'source-over';
                        }

                        ctx.globalAlpha = smudgeOpacity;
                        ctx.drawImage(sCanvas, cx - r, cy - r);
                    }
                }
                lastPosRef.current = { x, y };
            }
        }
    } else if (brushStyle === 'spray' || brushStyle === 'charcoal') {
        // ... (Existing Spray Logic)
        const isCharcoal = brushStyle === 'charcoal';
        const density = isCharcoal ? Math.max(10, currentSize * 2) : Math.max(5, Math.floor(currentSize)); 
        const radius = currentSize * (isCharcoal ? 1.5 : 2);
        const particleSize = isCharcoal ? 1.5 : 1;
        
        ctx.globalAlpha = isCharcoal ? alphaValue * 0.8 : alphaValue;
        ctx.globalCompositeOperation = compositeOp; 
        
        ctx.beginPath();
        
        for (const evt of events) {
            const x = (evt.clientX - rect.left) * scaleX;
            const y = (evt.clientY - rect.top) * scaleY;
            
            if (lastPosRef.current && !isStart) {
                const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
                const steps = Math.ceil(dist / (currentSize / 2)); 
                
                for (let j = 0; j <= steps; j++) {
                    const t = j / steps;
                    const cx = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
                    const cy = lastPosRef.current.y + (y - lastPosRef.current.y) * t;

                    for (let i = 0; i < density / 2; i++) { 
                        const angle = Math.random() * Math.PI * 2;
                        const r = Math.random() * radius * (1 + (brushJitter / 100)); 
                        const distOffset = isCharcoal ? (Math.random() * r) : r; 
                        
                        const scatterX = (Math.random() - 0.5) * (brushScatter * 2);
                        const scatterY = (Math.random() - 0.5) * (brushScatter * 2);

                        ctx.rect(
                            cx + Math.cos(angle) * distOffset + scatterX, 
                            cy + Math.sin(angle) * distOffset + scatterY, 
                            particleSize, 
                            particleSize
                        );
                    }
                }
            } else {
                 for (let i = 0; i < density; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * radius * (1 + (brushJitter / 100));
                    const distOffset = isCharcoal ? (Math.random() * r) : r;
                     
                    const scatterX = (Math.random() - 0.5) * (brushScatter * 2);
                    const scatterY = (Math.random() - 0.5) * (brushScatter * 2);

                    ctx.rect(
                        x + Math.cos(angle) * distOffset + scatterX, 
                        y + Math.sin(angle) * distOffset + scatterY, 
                        particleSize, 
                        particleSize
                    );
                }
            }
            lastPosRef.current = { x, y };
        }
        ctx.fill(); 

    } else if (brushStyle === 'bristle') {
        // ... (Existing Bristle Logic)
        ctx.globalAlpha = alphaValue * 0.5; 
        ctx.globalCompositeOperation = compositeOp;
        
        ctx.lineWidth = Math.max(1, currentSize / 6); 
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const offsets = bristleOffsetsRef.current;

        for (const offset of offsets) {
            ctx.beginPath();
            
            let prevX = lastPosRef.current ? lastPosRef.current.x + offset.dx : null;
            let prevY = lastPosRef.current ? lastPosRef.current.y + offset.dy : null;

            for (const evt of events) {
                const currX = ((evt.clientX - rect.left) * scaleX) + offset.dx;
                const currY = ((evt.clientY - rect.top) * scaleY) + offset.dy;

                let jitterX = 0, jitterY = 0;
                if (brushScatter > 0 && !isEraserActive) {
                    jitterX = (Math.random() - 0.5) * brushScatter;
                    jitterY = (Math.random() - 0.5) * brushScatter;
                }

                if (prevX !== null && prevY !== null && !isStart) {
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(currX + jitterX, currY + jitterY);
                } else {
                     ctx.moveTo(currX + jitterX, currY + jitterY);
                     ctx.lineTo(currX + jitterX, currY + jitterY);
                }
                prevX = currX + jitterX;
                prevY = currY + jitterY;
            }
            ctx.stroke();
        }
        
        const lastEvt = events[events.length - 1];
        lastPosRef.current = { 
            x: (lastEvt.clientX - rect.left) * scaleX, 
            y: (lastEvt.clientY - rect.top) * scaleY 
        };

    } else {
        // ... (Existing Path Logic)
        const useStamping = !isEraserActive && (brushScatter > 0 || brushJitter > 0 || brushStyle === 'watercolor');

        ctx.globalAlpha = alphaValue;
        ctx.lineCap = brushStyle === 'square' ? 'square' : 'round';
        ctx.lineJoin = 'round';

        if (!isEraserActive) {
            if (brushStyle === 'marker') {
                ctx.globalAlpha = alphaValue * 0.5; 
                ctx.lineCap = 'butt'; 
                ctx.lineJoin = 'bevel';
                compositeOp = 'multiply'; 
            } else if (brushStyle === 'watercolor') {
                ctx.globalAlpha = alphaValue * 0.1; 
                if (color !== '#000000') {
                    compositeOp = 'multiply';
                }
                ctx.shadowBlur = currentSize * 0.5;
                ctx.shadowColor = color;
            }
        } else {
             if (brushStyle === 'marker') {
                 ctx.lineCap = 'butt'; 
             }
        }
        
        ctx.globalCompositeOperation = compositeOp;

        if (useStamping) {
            const stepSize = Math.max(1, currentSize * (brushStyle === 'watercolor' ? 0.2 : 0.1));
            
            for (const evt of events) {
                const x = (evt.clientX - rect.left) * scaleX;
                const y = (evt.clientY - rect.top) * scaleY;

                if (lastPosRef.current) {
                    const dist = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
                    const steps = Math.ceil(dist / stepSize);

                    for (let i = 0; i <= steps; i++) {
                         // ... (Stamping Loop)
                         const t = i / steps;
                         let cx = lastPosRef.current.x + (x - lastPosRef.current.x) * t;
                         let cy = lastPosRef.current.y + (y - lastPosRef.current.y) * t;

                         if (brushScatter > 0) {
                             cx += (Math.random() - 0.5) * (brushScatter * 1.5);
                             cy += (Math.random() - 0.5) * (brushScatter * 1.5);
                         }
                         
                         let size = currentSize;
                         if (brushJitter > 0) {
                             size = currentSize * (1 + (Math.random() - 0.5) * (brushJitter / 50));
                         }
                         if (size < 0.5) size = 0.5;

                         ctx.beginPath();
                         if (brushStyle === 'square') {
                             ctx.rect(cx - size/2, cy - size/2, size, size);
                         } else {
                             ctx.arc(cx, cy, size/2, 0, Math.PI * 2);
                         }
                         ctx.fill();

                         if (brushStyle === 'watercolor' && Math.random() < 0.2) {
                             wetPointsRef.current.push({ x: cx, y: cy, color, size, time: Date.now() });
                         }
                    }
                } else {
                     ctx.beginPath();
                     ctx.arc(x, y, currentSize/2, 0, Math.PI * 2);
                     ctx.fill();
                }
                lastPosRef.current = { x, y };
            }

        } else {
            ctx.beginPath();
            
            if (lastPosRef.current && !isStart) {
                ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
            } else if (events.length > 0) {
                 const first = events[0];
                 const x = (first.clientX - rect.left) * scaleX;
                 const y = (first.clientY - rect.top) * scaleY;
                 ctx.moveTo(x, y);
                 if (isStart && events.length === 1) {
                     ctx.lineTo(x, y);
                 }
            }

            for (const evt of events) {
                const x = (evt.clientX - rect.left) * scaleX;
                const y = (evt.clientY - rect.top) * scaleY;
                ctx.lineTo(x, y);
                lastPosRef.current = { x, y };
            }
            ctx.stroke();
        }
    }
    
    ctx.restore(); 
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setGeneratedImage(null);
        setLesson(null);
        wetPointsRef.current = []; // Clear wet points
        setHasUnsavedChanges(false);
        if (initialPainting) {
            setPrompt(initialPainting.title);
        }
      }
    }
  };

  // --- SESSION MANAGEMENT ---
  const saveSession = () => {
      checkPremiumFeature(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          try {
              const dataUrl = canvas.toDataURL();
              localStorage.setItem('ai-art-sip-saved-canvas', dataUrl);
              localStorage.setItem('ai-art-sip-saved-prompt', prompt);
              setHasUnsavedChanges(false);
              alert("Session saved successfully!");
          } catch (e) {
              console.error("Save failed:", e);
              alert("Failed to save session.");
          }
      });
  };

  const loadSession = () => {
      checkPremiumFeature(() => {
          const savedCanvas = localStorage.getItem('ai-art-sip-saved-canvas');
          const savedPrompt = localStorage.getItem('ai-art-sip-saved-prompt');
          
          if (!savedCanvas) {
              alert("No saved session found.");
              return;
          }

          const img = new Image();
          img.src = savedCanvas;
          img.onload = () => {
              const canvas = canvasRef.current;
              if (canvas) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0);
                      if (savedPrompt) setPrompt(savedPrompt);
                      setGeneratedImage(null);
                      setLesson(null);
                      wetPointsRef.current = [];
                      setHasUnsavedChanges(false);
                  }
              }
          };
      });
  };

  const handleDownload = () => {
      // Allow download for everyone, but create a composited "Studio View" image
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      try {
          const tempCanvas = document.createElement('canvas');
          const ctx = tempCanvas.getContext('2d');
          if (!ctx) return;

          // Target output size: Portrait aspect suitable for sharing
          tempCanvas.width = 1200;
          tempCanvas.height = 1400;

          const centerX = tempCanvas.width / 2;
          
          // 1. Draw Background (Studio Wall)
          const gradient = ctx.createLinearGradient(0, 0, 0, tempCanvas.height);
          gradient.addColorStop(0, '#2d2d2d'); 
          gradient.addColorStop(1, '#1a1a1a'); 
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          // Floor
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 1100, tempCanvas.width, 300);

          // 2. Draw Easel
          const easelBaseY = 1200;
          // Target size for the painting on the easel (4:3 aspect ratio)
          const targetPaintingWidth = 800;
          const targetPaintingHeight = 600; 

          // Back Leg
          ctx.fillStyle = '#3E2723';
          ctx.beginPath();
          ctx.moveTo(centerX - 15, 200);
          ctx.lineTo(centerX + 15, 200);
          ctx.lineTo(centerX + 30, 1250);
          ctx.lineTo(centerX - 30, 1250);
          ctx.fill();

          // Front Legs (Angled)
          ctx.fillStyle = '#5D4037';
          // Left
          ctx.beginPath();
          ctx.moveTo(centerX - 40, 250);
          ctx.lineTo(centerX - 10, 250);
          ctx.lineTo(centerX - 240, easelBaseY);
          ctx.lineTo(centerX - 280, easelBaseY);
          ctx.fill();
          // Right
          ctx.beginPath();
          ctx.moveTo(centerX + 10, 250);
          ctx.lineTo(centerX + 40, 250);
          ctx.lineTo(centerX + 280, easelBaseY);
          ctx.lineTo(centerX + 240, easelBaseY);
          ctx.fill();

          // Shadow behind canvas
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(centerX - targetPaintingWidth/2 + 20, 400 + 20, targetPaintingWidth, targetPaintingHeight);

          // 3. Draw The User's Painting
          // White border/canvas edge
          ctx.fillStyle = '#f0f0f0';
          const borderWidth = 12;
          ctx.fillRect(centerX - targetPaintingWidth/2 - borderWidth, 400 - borderWidth, targetPaintingWidth + borderWidth*2, targetPaintingHeight + borderWidth*2);
          
          // User Art
          ctx.drawImage(canvas, centerX - targetPaintingWidth/2, 400, targetPaintingWidth, targetPaintingHeight);
          
          // Overlay Texture (Canvas effect)
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = 'rgba(0,0,0,0.05)';
          ctx.fillRect(centerX - targetPaintingWidth/2, 400, targetPaintingWidth, targetPaintingHeight);
          ctx.globalCompositeOperation = 'source-over';

          // 4. Easel Hardware
          // Bottom Shelf (Ledge)
          ctx.fillStyle = '#4E342E';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = 5;
          ctx.fillRect(centerX - targetPaintingWidth/2 - 60, 400 + targetPaintingHeight + borderWidth, targetPaintingWidth + 120, 50);
          ctx.shadowColor = 'transparent';

          // Top Clamp
          ctx.fillStyle = '#3E2723';
          ctx.fillRect(centerX - 25, 400 - borderWidth - 30, 50, 50);
          ctx.fillStyle = '#1a1a1a'; // screw
          ctx.beginPath(); ctx.arc(centerX, 400 - borderWidth - 5, 5, 0, Math.PI*2); ctx.fill();

          // 5. Branding
          ctx.fillStyle = '#888';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText("Created with AI Art & Sip", centerX, 1350);

          // Trigger Download
          const image = tempCanvas.toDataURL("image/png", 0.9);
          const link = document.createElement('a');
          link.href = image;
          const dateStr = new Date().toISOString().slice(0, 10);
          link.download = `Studio-Masterpiece-${dateStr}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error("Download failed:", e);
          alert("Failed to create studio export.");
      }
  };

  // --- AI ACTIONS ---

  const handleMagic = async () => {
    checkPremiumFeature(async () => {
        if (!prompt.trim()) {
            alert("Please describe what you are painting first!");
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsGenerating(true);
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const result = await refineUserPainting(dataUrl, prompt);
            setGeneratedImage(result);
            setHasUnsavedChanges(true);
        } catch (error) {
            console.error(error);
            alert("Sorry, the creative muse is away.");
        } finally {
            setIsGenerating(false);
        }
    });
  };

  const handleAutoPaint = async () => {
    checkPremiumFeature(async () => {
        if (!prompt.trim()) {
        alert("Please describe what you want the AI to paint first!");
        return;
        }
        setIsGenerating(true);
        setLesson(null);
        try {
        const base64Image = await generateImageFromPrompt(prompt);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setGeneratedImage(null); 
                    wetPointsRef.current = [];
                    setHasUnsavedChanges(true);
                };
                img.src = base64Image;
            }
        }
        } catch (error) {
        console.error(error);
        alert("Sorry, could not generate the painting.");
        } finally {
        setIsGenerating(false);
        }
    });
  };

  const handleTeachMe = async (forcePrompt?: string, forceDesc?: string, queueSpeech: boolean = false) => {
      checkPremiumFeature(async () => {
          const promptToUse = forcePrompt || prompt;
          const descToUse = forceDesc || '';

          if (!promptToUse.trim()) return;
          setIsGenerating(true);
          try {
              const fullPrompt = descToUse ? `${promptToUse}. ${descToUse}` : promptToUse;
              const newLesson = await createPaintingLesson(fullPrompt);
              setLesson(newLesson);
              setCurrentStepIndex(0);
              speakInstruction(newLesson.steps[0].instruction, !queueSpeech);
          } catch (e) {
              console.error(e);
              alert("Couldn't create a lesson plan right now.");
          } finally {
              setIsGenerating(false);
          }
      });
  };

  const handleNextStep = () => {
      if (lesson && currentStepIndex < lesson.steps.length - 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);
          speakInstruction(lesson.steps[nextIndex].instruction);
      }
  };

  const handlePrevStep = () => {
      if (lesson && currentStepIndex > 0) {
          const prevIndex = currentStepIndex - 1;
          setCurrentStepIndex(prevIndex);
          speakInstruction(lesson.steps[prevIndex].instruction);
      }
  };
  
  const handleBrushChange = (style: BrushStyle) => {
      // Lock complex brushes for Free tier
      const premiumBrushes: BrushStyle[] = ['charcoal', 'watercolor', 'bristle'];
      if (!isPremium && premiumBrushes.includes(style)) {
          setShowPremiumModal(true);
          return;
      }
      setBrushStyle(style);
  };

  const currentStep = lesson ? lesson.steps[currentStepIndex] : null;

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-stone-100 font-inter overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>
        
        {/* PREMIUM MODAL */}
        {showPremiumModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowPremiumModal(false)}>
                <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/50 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowPremiumModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Unlock Pro Features</h2>
                        <p className="text-gray-300 mb-6">This feature is available exclusively to Pro members. Upgrade to access the AI Instructor, Advanced Brushes, and more.</p>
                        <button 
                            onClick={() => { setShowPremiumModal(false); onUpgrade?.(); }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-full transition-all"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- LEFT PANEL: STUDIO CONTROLS (AI & META) --- */}
        <aside className={`w-full lg:w-[400px] bg-gray-900 text-gray-300 flex-col shadow-xl z-20 h-auto lg:h-screen overflow-y-auto border-r border-gray-800 order-3 lg:order-1 ${isFullScreen ? 'hidden' : 'flex'}`}>
            {/* Header / Back */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h1 className="font-playfair font-bold text-white text-lg">AI Studio</h1>
                    {isPremium ? (
                         <span className="bg-purple-900/50 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-purple-500/30">Pro</span>
                    ) : (
                         <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                    )}
                </div>
                {onBack && (
                    <button onClick={handleExit} className="text-gray-400 hover:text-white" title="Exit Studio">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            <div className="p-5 space-y-8 flex-1">
                
                {/* AI Assistant Section */}
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                 Creative Assistant
                             </h3>
                             <button 
                                onClick={() => setIsMuted(!isMuted)} 
                                className={`p-1.5 rounded-full transition-colors ${isMuted ? 'text-red-400 bg-red-900/30' : 'text-green-400 bg-green-900/30'}`}
                                title={isMuted ? "Unmute Voice" : "Mute Voice"}
                             >
                                 {isMuted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                 ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                 )}
                             </button>
                        </div>
                        
                        {/* If painting/lesson is active, show the Reference Image here INSTEAD of the textbox */}
                        {initialPainting ? (
                            <div className="space-y-4">
                                <div className="bg-black p-0 rounded-lg border border-gray-700 shadow-lg overflow-hidden relative group">
                                    <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/70 to-transparent p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex justify-between">
                                            <span>Reference</span>
                                            <span className="text-purple-400 truncate ml-2">{initialPainting.title}</span>
                                        </div>
                                    </div>
                                    <img 
                                        src={initialPainting.imageUrl} 
                                        alt="Reference" 
                                        className="w-full h-auto object-contain max-h-[500px]"
                                    />
                                </div>

                                {/* PREMIUM LOCK OVERLAY IF NO LESSON YET */}
                                {!lesson && !isPremium && (
                                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center space-y-3">
                                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">AI Instructor Locked</h4>
                                            <p className="text-sm text-gray-400">Upgrade to get a step-by-step lesson for this painting.</p>
                                        </div>
                                        <button onClick={() => setShowPremiumModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-6 rounded-full">
                                            Unlock Lesson
                                        </button>
                                    </div>
                                )}
                                
                                {/* Lesson Guide Controls */}
                                {lesson && currentStep && (
                                     <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-purple-500 animate-fade-in">
                                         <div className="flex justify-between items-center mb-2">
                                            <span className="bg-purple-900/50 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Step {currentStep.stepNumber}/{lesson.steps.length}</span>
                                            <button onClick={() => speakInstruction(currentStep.instruction)} className={`p-1.5 rounded-full transition-colors ${isSpeaking ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                            </button>
                                         </div>
                                         <h3 className="font-bold text-white leading-tight mb-1">{currentStep.title}</h3>
                                         <p className="text-sm text-gray-400 italic mb-4">"{currentStep.instruction}"</p>
                                         
                                         <div className="flex justify-between items-center">
                                            <button onClick={handlePrevStep} disabled={currentStepIndex === 0} className="text-xs font-bold text-gray-500 hover:text-gray-300 disabled:opacity-30">&larr; Back</button>
                                            <button onClick={handleNextStep} disabled={currentStepIndex === lesson.steps.length - 1} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-full disabled:opacity-50">Next Step &rarr;</button>
                                         </div>
                                     </div>
                                )}
                            </div>
                        ) : (
                            /* Free Paint Mode - Show Inputs */
                            <>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your idea..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20 placeholder-gray-500"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={handleAutoPaint} disabled={isGenerating || !prompt} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-3 rounded transition-colors shadow-lg active:scale-95 duration-200 relative overflow-hidden">
                                        {!isPremium && <div className="absolute top-0 right-0 p-1"><svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
                                        Auto-Paint
                                    </button>
                                    <button onClick={() => handleTeachMe()} disabled={isGenerating || !prompt} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-3 rounded transition-colors shadow-lg active:scale-95 duration-200 relative overflow-hidden">
                                        {!isPremium && <div className="absolute top-0 right-0 p-1"><svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
                                        Teach Me
                                    </button>
                                </div>
                                <button onClick={handleMagic} disabled={isGenerating || !prompt} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold py-2.5 px-3 rounded hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 duration-200 relative overflow-hidden">
                                    {!isPremium && <div className="absolute top-0 right-0 p-1"><svg className="w-3 h-3 text-white/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Refine Painting
                                </button>
                            </>
                        )}
                </div>

                <hr className="border-gray-800" />
                
                {/* Session Actions */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Project</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={saveSession} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 px-3 rounded transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 relative">
                            {hasUnsavedChanges && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-gray-900"></span>
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>
                            Save
                        </button>
                        <button onClick={loadSession} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 px-3 rounded transition-all flex items-center justify-center gap-2 active:scale-95 duration-200">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                            Load
                        </button>
                    </div>
                    <button onClick={handleDownload} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold py-2 px-3 rounded transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 border border-gray-700">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Download Art
                    </button>
                </div>

            </div>
        </aside>

        {/* --- MAIN CANVAS AREA --- */}
        <main className="flex-1 relative flex flex-col h-[60vh] lg:h-screen bg-stone-200 overflow-hidden order-1 lg:order-2 shadow-inner">
            
            {/* Background Texture */}
             <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #a8a29e 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}></div>
            
             {/* Full Screen Toggle Button */}
            <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="absolute top-4 right-4 z-50 bg-gray-800/60 hover:bg-gray-800 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
                {isFullScreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                )}
            </button>

            {/* CANVAS CONTAINER */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
                 <div className="relative transform transition-transform duration-500 scale-[0.85] md:scale-100">
                    {/* Easel Top */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-[#4E342E] rounded-t-sm shadow-md z-20 border-b border-[#3E2723] flex flex-col items-center justify-end pb-2">
                        <div className="w-16 h-1 bg-black/30 rounded-full"></div>
                    </div>
                    
                    {/* Canvas Container */}
                    <div className="bg-[#5D4037] p-3 rounded-sm shadow-2xl mx-auto inline-block">
                         <div className={`bg-white relative shadow-inner overflow-hidden ${isEyedropperActive ? 'cursor-[crosshair]' : isEraserActive ? 'cursor-cell' : 'cursor-crosshair'}`}>
                             {isEyedropperActive && (
                                <div className="absolute inset-0 bg-black/10 z-50 pointer-events-none flex items-center justify-center">
                                    <span className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md shadow-lg animate-pulse">
                                        Tap canvas to pick color
                                    </span>
                                </div>
                             )}
                             <canvas
                                ref={canvasRef}
                                width={1920}
                                height={1440}
                                className="touch-none block bg-white max-w-full h-auto"
                                style={{ touchAction: 'none' }}
                                onPointerDown={startDrawing}
                                onPointerMove={draw}
                                onPointerUp={stopDrawing}
                                onPointerLeave={stopDrawing}
                                onPointerCancel={stopDrawing}
                             />
                             {generatedImage && !lesson && (
                                 <div className="absolute inset-0 z-10 animate-fade-in group">
                                     <img src={generatedImage} alt="AI Generated Art" className="w-full h-full object-cover" />
                                     <button onClick={() => setGeneratedImage(null)} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                     </button>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Easel Bottom Ledge */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[110%] h-8 bg-[#4E342E] rounded-sm shadow-xl flex items-center justify-center border-t border-[#8D6E63]">
                         {/* Paint tubes decoration */}
                         <div className="flex gap-2 opacity-80">
                             <div className="w-6 h-2 bg-red-600 rounded-full"></div>
                             <div className="w-6 h-2 bg-blue-600 rounded-full"></div>
                             <div className="w-6 h-2 bg-yellow-400 rounded-full"></div>
                         </div>
                    </div>
                    
                    {/* Legs */}
                    <div className="absolute top-[10%] -left-[10%] w-5 h-[120%] bg-[#5D4037] transform -rotate-6 -z-10 rounded-full hidden lg:block border-r border-[#3E2723]"></div>
                    <div className="absolute top-[10%] -right-[10%] w-5 h-[120%] bg-[#5D4037] transform rotate-6 -z-10 rounded-full hidden lg:block border-l border-[#3E2723]"></div>
                    <div className="absolute -top-[30%] left-1/2 w-5 h-[150%] bg-[#4E342E] transform -translate-x-1/2 -z-20 hidden lg:block"></div>
                </div>
            </div>

        </main>

        {/* --- RIGHT PANEL: ART SUPPLIES (TOOLS) --- */}
        <aside className={`w-full lg:w-72 bg-gray-800 text-gray-200 flex-col z-20 h-auto lg:h-screen overflow-y-auto border-l border-gray-700 shadow-2xl order-2 lg:order-3 ${isFullScreen ? 'hidden' : 'flex'}`}>
             <div className="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur sticky top-0 z-10">
                 <h2 className="font-playfair font-bold text-white text-lg flex items-center gap-2">
                     <span className="text-purple-400">✦</span> Art Supplies
                 </h2>
             </div>
             
             <div className="p-5 space-y-8">
                
                {/* TOOL TOGGLE (PAINT / SMUDGE / ERASE / SHAPE) */}
                <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-700">
                    <button
                        onClick={() => activateTool('paint')}
                        title="Apply color to the canvas"
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 ${!isEraserActive && !isSmudgeActive && !isEyedropperActive && !isShapeActive ? 'bg-purple-600 text-white shadow scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </button>
                    <button
                        onClick={() => activateTool('smudge')}
                        title="Blend existing colors together"
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 ${isSmudgeActive ? 'bg-indigo-600 text-white shadow scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11" />
                        </svg>
                    </button>
                    <button
                        onClick={() => activateTool('shape')}
                        title="Draw geometric shapes"
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 ${isShapeActive ? 'bg-blue-600 text-white shadow scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                    </button>
                    <button
                        onClick={() => activateTool('eraser')}
                        title="Remove pigment to reveal the canvas"
                        className={`flex-1 flex items-center justify-center py-2 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 ${isEraserActive ? 'bg-red-600 text-white shadow scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                 {/* 1. BRUSH / SHAPE SETTINGS */}
                <div className="space-y-4">
                    {!isShapeActive ? (
                        <>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Tool Settings</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'round', label: 'Round', desc: 'Standard opaque brush for basic strokes', icon: <div className="w-3 h-3 bg-current rounded-full" /> },
                                { id: 'square', label: 'Square', desc: 'Blocky brush for sharp edges', icon: <div className="w-3 h-3 bg-current" /> },
                                { id: 'marker', label: 'Marker', desc: 'Semi-transparent ink for layering', icon: <div className="w-3 h-3 bg-current transform -skew-x-12 opacity-50" /> },
                                { id: 'spray', label: 'Spray', desc: 'Scatters particles for texture', icon: <div className="w-3 h-3 flex flex-wrap justify-center content-center gap-[1px]"><div className="w-0.5 h-0.5 bg-current rounded-full"></div><div className="w-0.5 h-0.5 bg-current rounded-full"></div><div className="w-0.5 h-0.5 bg-current rounded-full"></div><div className="w-0.5 h-0.5 bg-current rounded-full"></div></div> },
                                { id: 'bristle', label: 'Bristle', desc: 'Multi-line strokes simulating hair', icon: <div className="w-3 h-3 flex justify-between"><div className="w-0.5 h-full bg-current"></div><div className="w-0.5 h-full bg-current"></div><div className="w-0.5 h-full bg-current"></div></div> },
                                { id: 'charcoal', label: 'Charcoal', desc: 'Textured, grainy strokes', icon: <div className="w-3 h-3 bg-current opacity-70 border border-current border-dashed" /> },
                                { id: 'watercolor', label: 'Water', desc: 'Soft, blending strokes with bleed effect', icon: <div className="w-3 h-3 bg-current rounded-full blur-[1px] opacity-50" /> },
                            ].map((b) => {
                                // Determine if this brush is premium only
                                const isLocked = !isPremium && ['charcoal', 'watercolor', 'bristle'].includes(b.id);
                                return (
                                    <button
                                        key={b.id}
                                        onClick={() => handleBrushChange(b.id as BrushStyle)}
                                        title={b.desc}
                                        className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 active:scale-95 ${brushStyle === b.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105 ring-1 ring-purple-400' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:scale-105'}`}
                                    >
                                        {isLocked && <div className="absolute top-1 right-1 text-yellow-500"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
                                        <div className="mb-1">{b.icon}</div>
                                        <span className="text-[10px] font-semibold">{b.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        </>
                    ) : (
                        <>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Shape Type</h3>
                        <div className="grid grid-cols-4 gap-2">
                             {[
                                { id: 'rectangle', label: 'Rect', icon: <div className="w-4 h-3 border border-current"></div> },
                                { id: 'circle', label: 'Circle', icon: <div className="w-3 h-3 border border-current rounded-full"></div> },
                                { id: 'triangle', label: 'Tri', icon: <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-current"></div> },
                                { id: 'line', label: 'Line', icon: <div className="w-4 h-0.5 bg-current transform -rotate-45"></div> },
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setShapeType(s.id as ShapeType)}
                                    className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 active:scale-95 ${shapeType === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105 ring-1 ring-blue-400' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:scale-105'}`}
                                >
                                    <div className="mb-1">{s.icon}</div>
                                    <span className="text-[10px] font-semibold">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        </>
                    )}

                    <div className="space-y-4 mt-2 bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                        {/* Size/Opacity sliders */}
                         <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">
                                    {isEraserActive ? 'Eraser Size' : isShapeActive ? 'Line Width' : 'Brush Size'}
                                </span>
                                <span className="text-gray-200 font-mono">{isEraserActive ? eraserSize : brushSize}px</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={isEraserActive ? eraserSize : brushSize} 
                                onChange={(e) => isEraserActive ? setEraserSize(Number(e.target.value)) : setBrushSize(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">
                                    {isEraserActive ? 'Eraser Opacity' : isSmudgeActive ? 'Smudge Strength' : 'Opacity'}
                                </span>
                                <span className="text-gray-200 font-mono">{isEraserActive ? eraserOpacity : brushOpacity}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={isEraserActive ? eraserOpacity : brushOpacity} 
                                onChange={(e) => isEraserActive ? setEraserOpacity(Number(e.target.value)) : setBrushOpacity(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
                            />
                        </div>

                         {/* Advanced Settings Toggle */}
                        {!isEraserActive && !isSmudgeActive && !isShapeActive && (
                            <div>
                                <button 
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-[10px] uppercase font-bold text-gray-500 hover:text-white flex items-center gap-1 w-full pt-2 border-t border-gray-700 mt-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Advanced Settings
                                </button>
                                
                                {showAdvanced && (
                                    <div className="pt-2 space-y-3 animate-fade-in">
                                         <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Flow</span>
                                                <span className="text-gray-200 font-mono">{brushFlow}%</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="100" 
                                                value={brushFlow} 
                                                onChange={(e) => setBrushFlow(Number(e.target.value))}
                                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                                            />
                                        </div>
                                         <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Jitter (Size)</span>
                                                <span className="text-gray-200 font-mono">{brushJitter}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" 
                                                value={brushJitter} 
                                                onChange={(e) => setBrushJitter(Number(e.target.value))}
                                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                                            />
                                        </div>
                                         <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Scattering</span>
                                                <span className="text-gray-200 font-mono">{brushScatter}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="100" 
                                                value={brushScatter} 
                                                onChange={(e) => setBrushScatter(Number(e.target.value))}
                                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-700" />

                {/* 2. COLOR PALETTE */}
                <div className={`space-y-4 transition-opacity duration-300 ${isEraserActive || isSmudgeActive ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    {/* ... (Existing Palette Logic) */}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex justify-between items-center">
                        Palette
                        {isEyedropperActive && <span className="text-green-400 text-[10px] animate-pulse">PICKER ACTIVE</span>}
                    </h3>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group w-14 h-14 rounded-full overflow-hidden border-2 border-gray-500 shadow-inner bg-black cursor-pointer hover:scale-105 transition-transform duration-200" title="Click to pick a color from the system dialog">
                             <input 
                                ref={colorInputRef}
                                type="color" 
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 m-0 cursor-pointer opacity-0"
                              />
                             <div className="w-full h-full" style={{ backgroundColor: color }}></div>
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/50 mix-blend-difference">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </div>
                        </div>
                        <div className="flex-1">
                             <button 
                                onClick={activateEyedropper}
                                disabled={isEraserActive || isSmudgeActive}
                                title="Pick a color directly from your artwork"
                                className={`w-full flex items-center justify-center gap-2 py-3 px-3 rounded text-xs font-bold uppercase transition-all duration-200 active:scale-95 ${isEyedropperActive ? 'bg-green-500 text-white shadow-lg shadow-green-900/50 scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                {isEyedropperActive ? 'Pick Color' : 'Eyedropper'}
                             </button>
                        </div>
                    </div>

                    {lesson && (
                        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
                            <span className="text-[10px] uppercase text-purple-400 font-bold block mb-2">Lesson Colors</span>
                            <div className="flex flex-wrap gap-2">
                                {lesson.steps[currentStepIndex].colors.map((c) => (
                                    <button
                                        key={`lesson-${c}`}
                                        onClick={() => handleColorChange(c)}
                                        className="w-8 h-8 rounded-full border border-gray-500 hover:scale-110 transition-transform shadow-sm"
                                        style={{ backgroundColor: c }}
                                        title={`Lesson Color: ${c}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block mb-2">History</span>
                        <div className="grid grid-cols-6 gap-2">
                            {recentColors.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleColorChange(c)}
                                    className="w-full aspect-square rounded-full border border-gray-600 hover:border-white transition-all transform hover:scale-105"
                                    style={{ backgroundColor: c }}
                                    title={`Recent Color: ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-700" />
                
                {/* 3. COLOR MIXER */}
                <div className={`space-y-3 transition-opacity duration-300 ${isEraserActive || isSmudgeActive ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Color Mixer</h3>
                     <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 space-y-4">
                         {/* Controls */}
                         <div className="flex justify-between items-center gap-2">
                             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600 shadow-sm cursor-pointer group" title="Select Mix Color 1">
                                <input type="color" value={mixerColor1} onChange={e => setMixerColor1(e.target.value)} className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0" />
                                <div className="absolute inset-0 pointer-events-none" style={{backgroundColor: mixerColor1}}></div>
                             </div>
                             
                             {/* Gradient Slider */}
                             <div className="flex-1 h-3 rounded-full relative shadow-inner border border-gray-600/50" style={{ background: `linear-gradient(to right, ${mixerColor1}, ${mixerColor2})` }} title="Adjust Mix Ratio">
                                 <input 
                                     type="range" 
                                     min="0" 
                                     max="1" 
                                     step="0.01" 
                                     value={mixRatio} 
                                     onChange={(e) => setMixRatio(parseFloat(e.target.value))}
                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                 />
                                 <div 
                                    className="absolute top-0 bottom-0 w-3 h-3 bg-white rounded-full shadow-md pointer-events-none transition-transform border border-gray-300"
                                    style={{ left: `${mixRatio * 100}%`, transform: 'translateX(-50%)' }}
                                 ></div>
                             </div>

                             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600 shadow-sm cursor-pointer group" title="Select Mix Color 2">
                                <input type="color" value={mixerColor2} onChange={e => setMixerColor2(e.target.value)} className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0" />
                                <div className="absolute inset-0 pointer-events-none" style={{backgroundColor: mixerColor2}}></div>
                             </div>
                         </div>
                         
                         {/* Result Area */}
                         <div className="flex items-center gap-3 pt-1">
                             <div 
                                className="w-10 h-10 rounded-lg shadow-md border border-gray-600 transition-colors duration-200"
                                style={{ backgroundColor: getMixedColor() }}
                                title="Mixed Result"
                             ></div>
                             <button 
                                 onClick={applyMixedColor}
                                 title="Add this custom mixed color to your palette"
                                 className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3 rounded transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to Palette
                             </button>
                         </div>
                     </div>
                </div>

                <div className="mt-auto pt-8">
                     <button onClick={clearCanvas} title="Reset the entire canvas to white" className="w-full border border-red-900/50 text-red-400 hover:bg-red-900/20 text-xs font-bold py-3 rounded transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Clear Canvas
                    </button>
                </div>
             </div>
        </aside>

        <style>{`
            .cursor-crosshair { cursor: crosshair; }
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 1s ease-out forwards; }
            .animate-fade-in-up { animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
    </div>
  );
};

export default InteractiveStudio;