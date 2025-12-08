import React, { useState, useEffect } from 'react';
import type { Review, Painting } from '../types';
import { getReviews, addReview } from '../services/reviewService';

interface ReviewsProps {
  paintings: Painting[];
}

const Reviews: React.FC<ReviewsProps> = ({ paintings }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [paintingTitle, setPaintingTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setReviews(getReviews());
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset form
    setName('');
    setPaintingTitle(paintings.length > 0 ? paintings[0].title : '');
    setRating(5);
    setComment('');
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !paintingTitle) {
      setFormError('Please fill in all fields.');
      return;
    }

    const newReview = addReview({
      name,
      paintingTitle,
      rating,
      comment,
    });

    setReviews([newReview, ...reviews]);
    setIsModalOpen(false);
  };

  return (
    <section id="reviews" className="py-16 bg-gray-800 text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-playfair">What Our Painters Say</h2>
            <p className="text-gray-400 mt-2">Real experiences from our virtual creative community.</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="mt-6 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            Leave a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="text-yellow-400 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-600 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-lg mb-1 text-purple-300">{review.paintingTitle}</h3>
              <p className="text-gray-300 italic mb-4">"{review.comment}"</p>
              <p className="text-sm font-semibold text-gray-400">- {review.name}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold font-playfair mb-6">Share Your Thoughts</h2>
            
            {formError && <div className="bg-red-900/50 text-red-300 p-3 rounded mb-4 text-sm">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Painting</label>
                <select 
                  value={paintingTitle} 
                  onChange={(e) => setPaintingTitle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="" disabled>Select a painting</option>
                  {paintings.map(p => (
                    <option key={p.title} value={p.title}>{p.title}</option>
                  ))}
                  {/* Fallback if painting list is empty or for custom events */}
                  <option value="Custom Session">Custom Session</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`focus:outline-none transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                      <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Comment</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                  placeholder="Tell us about your experience..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full transition-all duration-300"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
