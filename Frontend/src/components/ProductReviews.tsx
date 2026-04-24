import React, { useState, useEffect } from 'react';
import { Star, Send, Search, Filter } from 'lucide-react';
import { Review } from '../types';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`);
        const data = await res.json();
        if (res.ok) {
          setReviews(data.data);
        }
      } catch {
        // Silent review fetch failure.
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to leave a review.');
      return;
    }

    if (!newReview.trim()) {
      setError('Please write a review before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment: newReview
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviews([data.data, ...reviews]);
      setNewReview('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    : 0;

  // Mock specific feedback scores based on average rating for realistic display
  const getFeedbackScore = (base: number) => {
    if (reviews.length === 0) return 0;
    return Math.min(98, Math.max(60, (averageRating / 5) * 100 - (10 - base)));
  };

  const fabricScore = getFeedbackScore(8);
  const workScore = getFeedbackScore(5);
  const lengthScore = getFeedbackScore(9);
  const photoScore = getFeedbackScore(7);

  const getLabel = (score: number, type: string) => {
    if (type === 'length') return score >= 80 ? 'As Expected' : 'Slightly Off';
    if (type === 'photo') return score >= 80 ? 'Yes' : 'Somewhat';
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 50) return 'Average';
    return 'Poor';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === null || review.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="mt-16 border-t border-brand-border pt-16">
      <h2 className="text-2xl font-serif font-bold text-brand-text mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Summary & Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-brand-card p-6 rounded-2xl border border-brand-border text-center">
            <div className="text-5xl font-bold text-brand-text mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-current' : 'text-brand-border'}`} />
              ))}
            </div>
            <div className="text-sm text-brand-muted">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Detailed Feedback Summary */}
          {reviews.length > 0 && (
            <div className="bg-brand-card p-6 rounded-2xl border border-brand-border">
              <h3 className="text-sm font-medium text-brand-text uppercase tracking-wider mb-5">Customer Feedback</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-brand-muted">Fabric Quality</span>
                    <span className="font-medium text-brand-text">{getLabel(fabricScore, 'quality')}</span>
                  </div>
                  <div className="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${fabricScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-brand-muted">Product Work</span>
                    <span className="font-medium text-brand-text">{getLabel(workScore, 'work')}</span>
                  </div>
                  <div className="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${workScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-brand-muted">Length</span>
                    <span className="font-medium text-brand-text">{getLabel(lengthScore, 'length')}</span>
                  </div>
                  <div className="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${lengthScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-brand-muted">Matches Photo</span>
                    <span className="font-medium text-brand-text">{getLabel(photoScore, 'photo')}</span>
                  </div>
                  <div className="w-full bg-brand-bg rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${photoScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-brand-card p-6 rounded-2xl border border-brand-border">
            <h3 className="text-lg font-medium text-brand-text mb-4">Write a Review</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-muted mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${star <= rating ? 'text-amber-500' : 'text-brand-border hover:text-amber-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-muted mb-2">Your Review</label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
                placeholder="What did you like or dislike?"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">

          {/* Filters */}
          {reviews.length > 0 && (
            <div className="bg-brand-card p-4 rounded-2xl border border-brand-border flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-text text-brand-text"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <Filter className="w-4 h-4 text-brand-muted flex-shrink-0" />
                <span className="text-sm text-brand-muted mr-2 flex-shrink-0">Filter:</span>
                <button
                  onClick={() => setRatingFilter(null)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${ratingFilter === null ? 'bg-brand-text text-brand-bg' : 'bg-brand-bg text-brand-muted hover:bg-brand-border'}`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map(star => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(star)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 transition-colors ${ratingFilter === star ? 'bg-brand-text text-brand-bg' : 'bg-brand-bg text-brand-muted hover:bg-brand-border'}`}
                  >
                    {star} <Star className={`w-3 h-3 ${ratingFilter === star ? 'fill-current' : 'fill-amber-500 text-amber-500'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-brand-bg rounded-2xl border border-brand-border border-dashed">
              <p className="text-brand-muted">
                {reviews.length === 0 ? "No reviews yet. Be the first to review this product!" : "No reviews match your filters."}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-brand-card p-6 rounded-2xl border border-brand-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-bg flex items-center justify-center text-brand-text font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-brand-text">{review.userName}</div>
                      <div className="text-xs text-brand-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-brand-border'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-brand-muted leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
