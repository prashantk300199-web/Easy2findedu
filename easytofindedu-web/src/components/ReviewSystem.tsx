import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSystemProps {
  hostelId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewSubmit: (rating: number, comment: string) => Promise<void>;
}

function StarRating({ rating, size = 'md', interactive = false, onRate }: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const displayRating = interactive ? (hoverRating || rating) : rating;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${sizes[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <span className={star <= displayRating ? 'text-gold-500' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function ReviewSystem({ hostelId: _hostelId, reviews, averageRating, totalReviews, onReviewSubmit }: ReviewSystemProps) {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      alert('Please provide both rating and comment');
      return;
    }

    setSubmitting(true);
    try {
      await onReviewSubmit(rating, comment);
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      alert('Review submitted successfully!');
    } catch (error) {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Average Rating Display */}
      <div className="border border-cream-300 bg-cream-50 p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-display text-5xl text-night-800 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="md" />
            <p className="text-sm text-ink-500 mt-2">{totalReviews} reviews</p>
          </div>

          {user && (
            <div className="flex-1">
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-gold-500 hover:bg-gold-600 text-night-900 px-6 py-3 font-medium transition-colors"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>
          )}

          {!user && (
            <div className="flex-1">
              <p className="text-sm text-ink-500">Please login to write a review</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gold-400 bg-white p-6"
        >
          <h3 className="font-display text-xl text-night-800 mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink-600 mb-2">Your Rating</label>
              <StarRating rating={rating} size="lg" interactive onRate={setRating} />
            </div>

            <div>
              <label className="block text-sm text-ink-600 mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this hostel..."
                className="w-full border border-cream-300 p-4 min-h-[120px] focus:outline-none focus:border-gold-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-night-800 hover:bg-gold-600 text-cream-100 px-8 py-3 font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-display text-2xl text-night-800">Reviews ({totalReviews})</h3>

        {reviews.length === 0 ? (
          <p className="text-ink-500 py-8 text-center">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-cream-300 bg-white p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-night-900 font-bold">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-night-800">{review.user.name}</p>
                      <p className="text-xs text-ink-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-ink-600">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact review display for hostel cards
export function CompactReviewDisplay({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size="sm" />
      <span className="text-sm text-ink-600">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  );
}
