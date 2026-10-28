import React, { useState } from 'react';
import { X, Send, GraduationCap, CheckCircle } from 'lucide-react';
import { membershipsApi } from '../api/memberships';

export default function JoinClubModal({ club, isOpen, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !club) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await membershipsApi.requestMembership(club.id, message);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess && onSuccess(club.id);
        onClose();
        setSubmitted(false);
        setMessage('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit membership application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-heading text-base">Request to Join</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">{club.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              The club officers will review your request. You can track status under "Memberships".
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note for Club Leads (Optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention why you want to join, your relevant skills or experience..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth resize-none"
              />
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">What happens next?</p>
              <p>Your student profile & interests will be shared with the club officers for review.</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-smooth"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow transition-smooth flex items-center space-x-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
