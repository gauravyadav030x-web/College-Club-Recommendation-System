import React, { useState } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, Send, CheckCircle2 } from 'lucide-react';
import { feedbackApi } from '../api/feedback';

export default function FeedbackModal({ club, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('helpful');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await feedbackApi.submitFeedback(club.club_id || club.id, rating, feedbackType, comment);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
        setSubmitted(false);
        setComment('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const feedbackTypes = [
    { id: 'helpful', label: 'Highly Relevant' },
    { id: 'somewhat_relevant', label: 'Somewhat Relevant' },
    { id: 'not_helpful', label: 'Not Relevant' },
    { id: 'already_member', label: 'Already a Member' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 font-heading text-base">Rate Recommendation</h3>
            <p className="text-xs text-slate-500 truncate max-w-[260px]">
              {club.club_name || club.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Thank You!</h4>
            <p className="text-xs text-slate-500">
              Your feedback trains our content recommendation engine and improves future match accuracy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Star Rating */}
            <div className="text-center space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                How accurate was this recommendation?
              </label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {rating === 5 && '🌟 Outstanding match for my interests!'}
                {rating === 4 && '👍 Great recommendation.'}
                {rating === 3 && '👌 Decent, but could be closer.'}
                {rating === 2 && '👎 Not quite what I was looking for.'}
                {rating === 1 && '❌ Irrelevant recommendation.'}
              </p>
            </div>

            {/* Feedback category chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFeedbackType(t.id)}
                    className={`px-3 py-2 text-xs rounded-xl border text-center transition-smooth font-medium ${
                      feedbackType === t.id
                        ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What made this club appealing or unappealing?"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-smooth"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-smooth flex items-center space-x-1.5 disabled:opacity-60"
              >
                {loading ? <span>Sending...</span> : <span>Submit Rating</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
