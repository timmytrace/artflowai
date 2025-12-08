import React from 'react';

interface HeroProps {
    onNavigateToStudio?: () => void;
}

const HeroEaselDisplay: React.FC = () => {
    // Static beautiful image for the mockup
    const imageUrl = "https://image.pollinations.ai/prompt/oil%20painting%20starry%20night%20cosmic%20dreamscape%20vibrant%20colors%20masterpiece?width=800&height=600&nologo=true";
    
    return (
        <div className="relative w-full max-w-lg mx-auto h-[500px] flex justify-center items-end pb-8 group perspective-1000">
            {/* Floor Shadow */}
            <div className="absolute bottom-8 w-64 h-8 bg-black/60 blur-2xl rounded-[100%] z-0 transform scale-110"></div>

            {/* Back Leg Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-40 bg-[#3E2723] rounded-t-md z-0 shadow-inner"></div>

            {/* Front Legs */}
            <div className="absolute top-12 bottom-8 left-[15%] w-5 bg-gradient-to-r from-[#5D4037] to-[#4E342E] -rotate-[8deg] z-0 rounded-b-md shadow-2xl border-r border-[#3E2723] origin-top"></div>
            <div className="absolute top-12 bottom-8 right-[15%] w-5 bg-gradient-to-l from-[#5D4037] to-[#4E342E] rotate-[8deg] z-0 rounded-b-md shadow-2xl border-l border-[#3E2723] origin-top"></div>

            {/* Canvas Area */}
            <div className="relative z-10 mb-16 transform transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2">
                 {/* Top Clamp */}
                 <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-8 bg-[#3E2723] rounded-sm shadow-lg z-20 border-b border-[#2d1b18]">
                    <div className="w-1.5 h-1.5 bg-[#8D6E63] rounded-full mx-auto mt-2 shadow-inner"></div>
                 </div>

                 <div className="bg-[#5D4037] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2px] relative">
                    <div className="bg-white p-1 relative overflow-hidden ring-1 ring-black/10">
                        <img 
                            src={imageUrl} 
                            alt="Masterpiece" 
                            className="w-[350px] h-[280px] md:w-[450px] md:h-[350px] object-cover bg-gray-800 shadow-inner"
                        />
                         {/* Canvas Texture Overlay */}
                         <div className="absolute inset-0 bg-black/10 pointer-events-none mix-blend-multiply opacity-60" style={{backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+")'}}></div>
                         
                         {/* Highlight Glare */}
                         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none"></div>
                    </div>
                 </div>
                 
                 {/* Ledge */}
                 <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[115%] h-6 bg-[#4E342E] rounded-sm shadow-xl flex items-center justify-center border-t border-[#6D4C41] z-20">
                     {/* Tools on Ledge */}
                     <div className="absolute left-4 -top-6 w-2 h-10 bg-yellow-600/80 rotate-12 rounded-sm shadow-sm"></div>
                     <div className="absolute right-8 -top-8 w-8 h-8 bg-gray-200/20 backdrop-blur-sm rounded-full border border-white/20 shadow-sm"></div>
                 </div>
            </div>
            
            {/* Horizontal Crossbar (Support) */}
            <div className="absolute bottom-[30%] left-[18%] right-[18%] h-4 bg-[#3E2723] z-0 shadow-lg"></div>
        </div>
    );
};

const Hero: React.FC<HeroProps> = ({ onNavigateToStudio }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-gray-900 overflow-hidden pt-10 pb-20">
      {/* Abstract Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left: Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left space-y-8">
                <h1 className="text-5xl md:text-7xl font-extrabold font-playfair leading-tight">
                    <span className="block text-white mb-2">Uncork Your</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 filter drop-shadow-lg">
                        Creativity
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light border-l-4 border-purple-500 pl-6">
                    Join the future of paint and sip. Experience a live, interactive art studio from the comfort of your home. No mess, just pure digital artistry guided by AI.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                     <button 
                        onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
                     >
                        <span>Start Creating</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                     </button>
                     <span className="text-gray-500 text-sm italic">No sign-up required</span>
                </div>
            </div>

            {/* Right: Large Static Easel Mockup */}
            <div className="lg:w-1/2 w-full flex justify-center lg:justify-end mt-12 lg:mt-0">
                <div className="relative">
                     {/* Decorative Elements behind easel */}
                     <div className="absolute top-10 right-10 w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin-slow"></div>
                     <div className="absolute bottom-20 left-10 w-12 h-12 border-4 border-pink-500/30 rotate-45"></div>
                     
                     <HeroEaselDisplay />
                     
                     {/* Floating Badge */}
                     <div className="absolute top-[20%] -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl animate-bounce-slow hidden md:block">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                 AI
                             </div>
                             <div>
                                 <p className="text-xs text-gray-300 uppercase font-bold">Powered By</p>
                                 <p className="text-white font-bold">Gemini 2.0</p>
                             </div>
                         </div>
                     </div>
                </div>
            </div>

        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;