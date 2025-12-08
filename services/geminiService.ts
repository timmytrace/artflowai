
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Painting, PaintingLesson } from '../types';

// Using Pollinations.ai for mock images ensures they match the description visually
const MOCK_PAINTINGS: Painting[] = [
    { title: "Crimson Twilight", description: "A breathtaking sunset over calm waters, with fiery reds and oranges reflecting on the gentle waves.", difficulty: "Beginner", imageUrl: "https://image.pollinations.ai/prompt/oil%20painting%20breathtaking%20sunset%20over%20calm%20waters%20fiery%20reds?width=800&height=600&nologo=true&seed=101" },
];

const MOCK_LESSON: PaintingLesson = {
    paintingTitle: "Creative Flow (Demo)",
    steps: [
        {
            stepNumber: 1,
            title: "Setting the Scene",
            instruction: "Let's start by establishing our background. Take your largest brush and apply broad, sweeping strokes to cover the canvas.",
            brushes: ["Large Flat Brush"],
            colors: ["#87CEEB", "#FFFFFF"],
            visualDescription: "A canvas covered in a smooth, light blue gradient."
        },
        {
            stepNumber: 2,
            title: "Blocking Shapes",
            instruction: "Now, switch to a round brush. We're going to block in the main shapes of our composition. Don't worry about details yet!",
            brushes: ["Round Brush"],
            colors: ["#4B0082", "#2E8B57"],
            visualDescription: "Basic abstract shapes forming the foundation of the image."
        },
        {
            stepNumber: 3,
            title: "Adding Definition",
            instruction: "It's time to refine those shapes. Use a smaller brush to add clearer edges and define the forms.",
            brushes: ["Medium Round Brush"],
            colors: ["#FFA500", "#FF4500"],
            visualDescription: "The subject matter starts to become recognizable."
        },
        {
            stepNumber: 4,
            title: "Highlights & Shadows",
            instruction: "Bring your painting to life by adding shadows for depth and highlights for dimension.",
            brushes: ["Detail Brush"],
            colors: ["#000000", "#FFFFFF"],
            visualDescription: "The painting now has depth and 3D qualities."
        },
        {
            stepNumber: 5,
            title: "Final Touches",
            instruction: "Add your personal flair! splatter some paint, add tiny details, and don't forget to sign your masterpiece.",
            brushes: ["Detail Brush", "Fan Brush"],
            colors: ["#FFD700"],
            visualDescription: "A completed, vibrant work of art."
        }
    ]
};

// Helper function to strip Markdown code blocks from JSON response
function cleanJsonString(text: string): string {
  return text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
}

async function generatePaintingImage(paintingTitle: string, paintingDescription: string, ai: GoogleGenAI): Promise<string> {
    try {
        const prompt = `A high-quality, realistic photo of a finished canvas painting. The painting's title is '${paintingTitle}', depicting '${paintingDescription}'. The scene is a cozy art studio setup: the canvas is on a small easel on a wooden table. Beside it are paint brushes in a jar, and a palette with dried, mixed paint splotches. The lighting is warm and inviting. The style of the painting on the canvas should be beautiful and artistic.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.warn(`Quota exceeded or error generating image for "${paintingTitle}". Using fallback.`);
        // Fallback: Use Pollinations.ai with the specific description to ensure the image correlates with the text
        const safeDesc = encodeURIComponent(paintingDescription.slice(0, 200));
        return `https://image.pollinations.ai/prompt/oil%20painting%20${safeDesc}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    }
}

/**
 * Generates a full painting object (Metadata + Image) from a simple user prompt.
 */
export async function generateCustomPainting(userPrompt: string): Promise<Painting> {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
        throw new Error("API_KEY not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Generate Metadata (Title, Description, Difficulty)
    const metadataPrompt = `
    Based on the user's idea: "${userPrompt}", create a creative metadata entry for a painting.
    Return a JSON object with:
    - title: A catchy, artistic title.
    - description: A vivid, inspiring description (2 sentences max).
    - difficulty: 'Beginner', 'Intermediate', or 'Advanced'.
    `;

    const metadataSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] }
        },
        required: ["title", "description", "difficulty"]
    };

    let paintingData: Omit<Painting, 'imageUrl'>;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: metadataPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: metadataSchema,
            },
        });
        const jsonText = cleanJsonString(response.text.trim());
        paintingData = JSON.parse(jsonText);
    } catch (e) {
        console.warn("Failed to generate metadata, using defaults", e);
        paintingData = {
            title: "My Creative Idea",
            description: userPrompt,
            difficulty: "Intermediate"
        };
    }

    // 2. Generate Image based on the new description
    const imageUrl = await generatePaintingImage(paintingData.title, paintingData.description, ai);

    return {
        ...paintingData,
        imageUrl
    };
}

// Deprecated batch function, kept for type safety but effectively unused in new flow
export async function generatePaintingIdeasBatch(): Promise<Painting[]> {
    return Promise.resolve(MOCK_PAINTINGS);
}

const MOCK_GUIDE: string[] = [
    "Prepare your canvas! Squeeze out your primary colors: red, blue, yellow, and white.",
    "Sketch the main shapes. Lightly outline the horizon and any major elements with a pencil.",
    "Block in the sky. Mix blues and whites and paint the sky, fading from dark at the top to light near the horizon.",
    "Paint the main subject. Use your reference image and start adding the base colors for the central part of your painting.",
    "Add shadows and highlights. This is where your painting comes to life! Add darker tones for shadows and lighter ones for highlights.",
    "Finishing touches. Add small details, like stars, reflections, or texture. Don't be afraid to experiment!",
    "Sign your masterpiece! You did it! Find a spot and proudly sign your name."
];

export async function generatePaintingGuide(painting: Painting): Promise<string[]> {
  if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
      console.warn("API_KEY not found. Returning mock painting guide.");
      return Promise.resolve(MOCK_GUIDE);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a beginner-friendly, step-by-step painting guide for a piece titled "${painting.title}" with the description: "${painting.description}". The guide should have between 5 and 7 clear, encouraging steps. The tone should be fun and relaxed, perfect for a paint and sip event. Output a JSON object with a single key "steps", which is an array of strings.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: 'A step in the painting guide.'
        },
        description: 'An array of strings, where each string is a step in the painting guide.'
      }
    },
    required: ['steps']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = cleanJsonString(response.text.trim());
    const result = JSON.parse(jsonText);
    return result.steps || MOCK_GUIDE;
  } catch (error) {
    console.error("Error generating painting guide:", error);
    return MOCK_GUIDE;
  }
}

export async function generateHeroImage(): Promise<string> {
    const fallbackUrl = 'https://image.pollinations.ai/prompt/abstract%20art%20studio%20painting%20colorful%20creative%20blurred?width=1600&height=900&nologo=true';
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
        console.warn("API_KEY not found. Returning fallback hero image.");
        return fallbackUrl;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const prompt = "A beautiful, abstract painting that evokes a sense of creativity and relaxation, suitable as a background for a paint and sip website. The image should be artistic, colorful, and slightly blurred to be used as a hero background. Widescreen aspect ratio.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in hero response.");
    } catch (error) {
        console.warn("Error generating hero image (using fallback):", error);
        return fallbackUrl;
    }
}

export async function refineUserPainting(imageBase64: string, userPrompt: string): Promise<string> {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
        throw new Error("API_KEY not found.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Remove data URL prefix if present to get just the base64 string
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `Transform this user's rough sketch into a high-quality, beautiful artistic painting. 
    Style: Oil painting or acrylic on canvas. 
    Subject: ${userPrompt || 'A creative masterpiece'}. 
    Maintain the general composition and colors of the sketch but make it look professional, detailed, and finished. 
    The result should look like a real painting on a canvas.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: 'image/png', 
                            data: base64Data 
                        } 
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.error("Error refining painting:", error);
        throw error;
    }
}

export async function generateImageFromPrompt(userPrompt: string): Promise<string> {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
         throw new Error("API_KEY not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Create a painting of: ${userPrompt}. Style: Artistic, suitable for a digital canvas background. The image should be complete and fill the canvas.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: { aspectRatio: "4:3" }
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data found.");
    } catch (error) {
        console.warn("Error generating image from prompt, using fallback:", error);
        // Fallback to a prompt-based image so the user sees something relevant
        return getFallbackImage(userPrompt);
    }
}

async function getFallbackImage(prompt: string): Promise<string> {
    // Using Pollinations for prompt-based fallbacks
    const url = `https://image.pollinations.ai/prompt/artistic%20painting%20${encodeURIComponent(prompt)}?width=800&height=600&nologo=true`;
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
         return url;
    }
}

export async function createPaintingLesson(userPrompt: string): Promise<PaintingLesson> {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY") {
        throw new Error("API_KEY not found.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // The 'Human Instructor' prompt logic
    const prompt = `
    Act as a professional art instructor for a "Paint and Sip" class.
    I want to paint: "${userPrompt}".
    
    Break this down into a structured, step-by-step lesson (5 to 7 steps) that leads to the final result.
    Focus on layers: Background first, then middle ground, then foreground details.
    
    For each step:
    1. Title of the step.
    2. Specific instruction (friendly, encouraging tone, like "Now grab your big brush and mix blue...").
    3. Brushes needed (e.g., "Flat Brush", "Round Brush", "Detail Brush", "Fan Brush").
    4. Colors needed (Hex codes only, pick from standard palette).
    5. A short visual description of what the canvas should look like after this step.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            paintingTitle: { type: Type.STRING },
            steps: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        stepNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        instruction: { type: Type.STRING },
                        brushes: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING } 
                        },
                        colors: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING, description: "Hex color code" } 
                        },
                        visualDescription: { type: Type.STRING }
                    },
                    required: ["stepNumber", "title", "instruction", "brushes", "colors", "visualDescription"]
                }
            }
        },
        required: ["paintingTitle", "steps"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = cleanJsonString(response.text.trim());
        return JSON.parse(jsonText);
    } catch (error) {
        console.warn("Error creating lesson (quota or otherwise), returning mock lesson:", error);
        const mockCopy = JSON.parse(JSON.stringify(MOCK_LESSON));
        mockCopy.paintingTitle = `Lesson: ${userPrompt} (Demo)`;
        return mockCopy;
    }
}
