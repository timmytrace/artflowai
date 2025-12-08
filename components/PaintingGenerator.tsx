
import React, { useState } from 'react';
import type { Painting } from '../types';
import { generateCustomPainting } from '../services/geminiService';

interface PaintingGeneratorProps {
  onPaintInStudio: (painting: Painting) => void;
}

const EaselDisplay: React.FC<{ imageUrl: string; title: string }> = ({ imageUrl, title }) => {
    return (
        <div className="relative h-96 w-full flex justify-center items-end pb-4 group overflow-visible z-0 mt-8">
            {/* Floor Shadow */}
            <div className="absolute bottom-4 w-48 h-4 bg-black/50 blur-xl rounded-[100%] z-0"></div>

            {/* Back Leg Top */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-32 bg-[#3E2723] rounded-t-sm z-0"></div>

            {/* Front Legs */}
            <div className="absolute top-10 bottom-4 left-[20%] w-4 bg-[#5D4037] -rotate-6 z-0 rounded-b-sm shadow-lg border-r border-[#3E2723] origin-top"></div>
            <div className="absolute top-10 bottom-4 right-[20%] w-4 bg-[#5D4037] rotate-6 z-0 rounded-b-sm shadow-lg border-l border-[#3E2723] origin-top"></div>

            {/* Canvas Area */}
            <div className="relative z-10 mb-12 transform transition-transform duration-500 hover:scale-105">
                 {/* Top Clamp */}
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-[#3E2723] rounded-sm shadow z-20"></div>

                 <div className="bg-[#5D4037] p-2 shadow-2xl rounded-[2px] relative">
                    <div className="bg-white p-0.5 relative overflow-hidden">
                        <img 
                            src={imageUrl} 
                            alt={title} 
                            className="w-72 h-56 object-cover bg-gray-700"
                        />
                         {/* Canvas Texture Overlay */}
                         <div className="absolute inset-0 bg-black/5 pointer-events-none mix-blend-multiply opacity-50" style={{backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+")'}}></div>
                    </div>
                 </div>
                 
                 {/* Ledge */}
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] h-4 bg-[#4E342E] rounded-sm shadow-lg flex items-center justify-center border-t border-[#6D4C41]"></div>
            </div>
        </div>
    );
};

const PaintingGenerator: React.FC<PaintingGeneratorProps> = ({ onPaintInStudio }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPainting, setGeneratedPainting] = useState<Painting | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedPainting(null);
    setError(null);

    try {
      const painting = await generateCustomPainting(prompt);
      setGeneratedPainting(painting);
    } catch (err) {
      console.error(err);
      setError('The muse is sleeping. Please try describing your idea again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-gray-900 text-white min-h-[600px] flex items-center">
      <div className="container mx-auto px-6">
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Dream It. Generate It. Paint It.
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Describe your vision below, and our AI will create a unique masterpiece reference for you to paint in the studio.
          </p>

          {/* Generator Input Section */}
          {!generatedPainting && (
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px]"></div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div>
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A futuristic city made of crystal at sunset..."
                            className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl p-5 text-xl text-white placeholder-gray-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all"
                            disabled={isGenerating}
                        />
                    </div>
                    
                    {error && <div className="text-red-400 text-sm font-semibold">{error}</div>}

                    <div className="flex justify-center gap-4">
                        <button 
                            type="submit" 
                            disabled={isGenerating || !prompt.trim()}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Dreaming up your art...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    Generate Masterpiece
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
          )}

          {/* Result Section */}
          {generatedPainting && (
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 animate-fade-in-up">
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                      <div className="flex-1 w-full flex justify-center">
                         <EaselDisplay imageUrl={generatedPainting.imageUrl} title={generatedPainting.title} />
                      </div>
                      
                      <div className="flex-1 text-left space-y-6">
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-purple-900/50 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-700/50">
                                      AI Generated Concept
                                  </span>
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                      generatedPainting.difficulty === 'Beginner' ? 'border-green-800 text-green-400' :
                                      generatedPainting.difficulty === 'Intermediate' ? 'border-yellow-800 text-yellow-400' :
                                      'border-red-800 text-red-400'
                                  }`}>
                                      {generatedPainting.difficulty}
                                  </span>
                              </div>
                              <h3 className="text-3xl md:text-4xl font-bold font-playfair text-white leading-tight">
                                  {generatedPainting.title}
                              </h3>
                          </div>
                          
                          <p className="text-gray-300 text-lg leading-relaxed border-l-4 border-gray-600 pl-4">
                              {generatedPainting.description}
                          </p>

                          <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={() => onPaintInStudio(generatedPainting)}
                                    className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full shadow-xl transform transition-transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                    Paint This in Studio
                                </button>
                                <button 
                                    onClick={() => setGeneratedPainting(null)}
                                    className="bg-transparent border border-gray-600 hover:border-white text-gray-400 hover:text-white font-bold py-4 px-6 rounded-full transition-colors"
                                >
                                    Generate New Idea
                                </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </div>
      </div>
      <style>{`
          @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
              animation: fade-in-up 0.5s ease-out forwards;
          }
      `}</style>
    </section>
  );
};

export default PaintingGenerator;
