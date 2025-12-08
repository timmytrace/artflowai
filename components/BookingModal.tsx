import React, { useState, useMemo } from 'react';
import type { Painting } from '../types';
import { generatePaintingGuide } from '../services/geminiService';

interface BookingModalProps {
  painting: Painting;
  onClose: () => void;
  onPaintInStudio?: (painting: Painting) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ painting, onClose, onPaintInStudio }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [guide, setGuide] = useState<string[] | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState<boolean>(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const handleGenerateGuide = async () => {
    setIsGeneratingGuide(true);
    setGuideError(null);
    try {
      const steps = await generatePaintingGuide(painting);
      setGuide(steps);
    } catch (err) {
      setGuideError('Sorry, the AI guide is taking a nap. Please try again later.');
      console.error(err);
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleBookingConfirmation = () => {
    if (selectedDate && selectedTime) {
      console.log('Booking Confirmed:', {
        painting: painting.title,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
      });
      setIsBooked(true);
    }
  };

  const availableDates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  }), []);

  const availableTimes = ['5:00 PM', '7:00 PM', '9:00 PM'];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative h-64 shrink-0">
             <img
              src={painting.imageUrl}
              alt={painting.title}
              className="w-full h-full object-cover"
            />
            {onPaintInStudio && (
                 <button
                    onClick={() => onPaintInStudio(painting)}
                    className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 text-purple-700 font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 10v4.243zM16 4l2.293 2.293a1 1 0 010 1.414l-2.293 2.293L12 6l4-2z" clipRule="evenodd" />
                    </svg>
                     Paint in Studio
                 </button>
            )}
        </div>
        
        <div className="p-8 overflow-y-auto">
          {isBooked ? (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold font-playfair mb-2">Booking Confirmed!</h2>
              <p className="text-gray-300 mb-4">
                You're all set for <span className="font-bold text-purple-400">{painting.title}</span> on <span className="font-bold">{selectedDate ? formatDate(selectedDate) : ''}</span> at <span className="font-bold">{selectedTime}</span>.
              </p>
              <p className="text-gray-400 text-sm mb-6">Check your email for confirmation and a list of recommended supplies.</p>
              <button 
                onClick={onClose}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-full transition-colors duration-300"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold font-playfair mb-2">{painting.title}</h2>
              <p className="text-purple-400 mb-4 font-semibold">A Virtual Paint & Sip Experience</p>
              <p className="text-gray-300 mb-6">{painting.description}</p>
              
              <div className="mb-6">
                {!guide && !isGeneratingGuide && !guideError && (
                  <button
                    onClick={handleGenerateGuide}
                    className="w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Get Text Guide
                  </button>
                )}
                {isGeneratingGuide && (
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin mr-3 h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-300">Generating your personal guide...</span>
                    </div>
                  </div>
                )}
                {guideError && (
                  <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{guideError}</div>
                )}
                {guide && (
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-purple-400 mb-3">Your Painting Guide</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                      {guide.map((step, index) => <li key={index}>{step}</li>)}
                    </ol>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Select a Date</h3>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {availableDates.map(date => (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 whitespace-nowrap ${selectedDate?.toDateString() === date.toDateString() ? 'bg-purple-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>
                 <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Select a Time</h3>
                  <div className="flex space-x-2">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-full transition-colors duration-200 ${selectedTime === time ? 'bg-purple-600 text-white font-bold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBookingConfirmation}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 hover:scale-105 disabled:bg-purple-800/50 disabled:cursor-not-allowed disabled:scale-100"
              >
                Confirm & Book My Spot
              </button>
            </>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BookingModal;