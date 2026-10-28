import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Compass
} from 'lucide-react';
import { adminApi } from '../api/admin';

export default function MembershipManagementPage({ onNavigate }) {
  const [memberships, setMemberships] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMemberships(filter === 'all' ? null : filter);
      setMemberships(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const handleReview = async (membershipId, newStatus) => {
    setUpdatingId(membershipId);
    try {
      await adminApi.reviewMembership(membershipId, newStatus);
      setMemberships((prev) =>
        prev.map((m) => (m.id === membershipId ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      alert(err.message || 'Failed to update membership status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intelligence Hub</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Student Membership Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming requests from students desiring to join campus clubs.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-smooth ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : memberships.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Applications in Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no membership applications with status '{filter}'.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memberships.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-smooth flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                    Application #{req.id}
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span>Status: {req.status}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {req.student?.full_name || 'Student'}
                  </h3>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <p className="text-xs font-semibold text-brand-600">
                    Applying for: {req.club?.name || 'Club'}
                  </p>
                </div>

                {req.message && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                    "{req.message}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{req.student?.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted: {new Date(req.created_at).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 md:self-center">
                {req.status !== 'approved' && (
                  <button
                    onClick={() => handleReview(req.id, 'approved')}
                    disabled={updatingId === req.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-smooth flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {req.status !== 'rejected' && (
                  <button
                    onClick={() => handleReview(req.id, 'rejected')}
                    disabled={updatingId === req.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-smooth flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
