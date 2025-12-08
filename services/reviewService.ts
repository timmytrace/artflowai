import type { Review } from '../types';

const REVIEWS_STORAGE_KEY = 'ai-art-sip-reviews';

// Mock reviews for initial state if localStorage is empty
const MOCK_REVIEWS: Review[] = [
    {
        id: '1',
        paintingTitle: 'Crimson Twilight',
        name: 'Jane D.',
        rating: 5,
        comment: 'Absolutely loved this session! The instructor was fantastic and I created something I\'m truly proud of. Highly recommend for a relaxing evening.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: '2',
        paintingTitle: 'Galactic Dreams',
        name: 'Mark T.',
        rating: 4,
        comment: 'A really fun and unique experience. The cosmic theme was so cool to paint. My only wish is that the session was a bit longer!',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
     {
        id: '3',
        paintingTitle: 'Enchanted Forest',
        name: 'Emily R.',
        rating: 5,
        comment: 'Magical is the perfect word for it. The instructions were clear and I felt like a real artist. Can\'t wait for my next session!',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    },
];

export function getReviews(): Review[] {
  try {
    const reviewsJson = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (reviewsJson && reviewsJson !== '[]') {
      return JSON.parse(reviewsJson);
    } else {
      // If no reviews, populate with mock data and return it
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(MOCK_REVIEWS));
      return MOCK_REVIEWS;
    }
  } catch (error) {
    console.error('Failed to parse reviews from localStorage', error);
    return MOCK_REVIEWS;
  }
}

export function addReview(review: Omit<Review, 'id' | 'date'>): Review {
  const reviews = getReviews();
  const newReview: Review = {
    ...review,
    id: new Date().getTime().toString(),
    date: new Date().toISOString(),
  };
  const updatedReviews = [newReview, ...reviews];
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
  return newReview;
}
