import React from 'react';
import type { Painting } from '../types';
import PaintingCard from './PaintingCard';

interface EventGridProps {
  paintings: Painting[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (painting: Painting) => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse">
    <div className="w-full h-56 bg-gray-700"></div>
    <div className="p-6">
      <div className="h-6 w-3/4 mb-2 bg-gray-700 rounded"></div>
      <div className="h-4 w-1/4 mb-4 bg-gray-700 rounded"></div>
      <div className="h-4 w-full mb-1 bg-gray-700 rounded"></div>
      <div className="h-4 w-full mb-4 bg-gray-700 rounded"></div>
      <div className="h-10 w-full bg-purple-700 rounded-full"></div>
    </div>
  </div>
);


const EventGrid: React.FC<EventGridProps> = ({ paintings, isLoading, error, onViewDetails }) => {
  return (
    <section id="gallery" className="py-16 sm:py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair">Upcoming Virtual Events</h2>
          <p className="text-gray-400 mt-2">Select a painting to book your live, guided session.</p>
        </div>

        {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => <LoadingSkeleton key={index} />)
          ) : (
            paintings.map((painting, index) => (
              <PaintingCard key={index} painting={painting} onViewDetails={onViewDetails} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default EventGrid;