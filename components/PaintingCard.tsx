import React from 'react';
import type { Painting } from '../types';

interface PaintingCardProps {
  painting: Painting;
  onViewDetails: (painting: Painting) => void;
}

// A more subtle, combined icon-and-text component for displaying difficulty.
const DifficultyIndicator: React.FC<{ difficulty: Painting['difficulty'] }> = ({ difficulty }) => {
  const difficultyStyles = {
    Beginner: { color: 'text-green-400', level: 1 },
    Intermediate: { color: 'text-yellow-400', level: 2 },
    Advanced: { color: 'text-red-400', level: 3 },
  };

  const { color, level } = difficultyStyles[difficulty];

  // Renders a 3-bar icon where the number of filled bars indicates the difficulty level.
  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <div className="flex items-end gap-1 h-4" aria-hidden="true">
        <span className={`w-1.5 rounded-full transition-all ${level >= 1 ? 'h-1/3 bg-current' : 'h-1/3 bg-gray-600'}`}></span>
        <span className={`w-1.5 rounded-full transition-all ${level >= 2 ? 'h-2/3 bg-current' : 'h-2/3 bg-gray-600'}`}></span>
        <span className={`w-1.5 rounded-full transition-all ${level >= 3 ? 'h-full bg-current' : 'h-full bg-gray-600'}`}></span>
      </div>
      <span className="text-sm font-semibold uppercase tracking-wider">
        {difficulty}
      </span>
    </div>
  );
};

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
            <div className="relative z-10 mb-12 transform transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
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
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[110%] h-4 bg-[#4E342E] rounded-sm shadow-lg flex items-center justify-center border-t border-[#6D4C41]">
                 </div>
            </div>
        </div>
    );
};

const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onViewDetails }) => {
  return (
    <div 
        className="bg-gray-800 rounded-lg overflow-visible shadow-lg flex flex-col pt-4 relative border-b-4 border-[#251A18]"
        onClick={() => onViewDetails(painting)}
    >
      <div className="cursor-pointer">
         <EaselDisplay imageUrl={painting.imageUrl} title={painting.title} />
      </div>
      
      <div className="p-6 flex flex-col flex-grow bg-gray-800 rounded-b-lg relative z-20">
        <DifficultyIndicator difficulty={painting.difficulty} />
        <h3 className="text-2xl font-bold font-playfair mt-2 mb-2 text-white">{painting.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{painting.description}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetails(painting); }}
          className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 hover:scale-105"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default PaintingCard;