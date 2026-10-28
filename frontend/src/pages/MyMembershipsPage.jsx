import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { membershipsApi } from '../api/memberships';

export default function MyMembershipsPage({ onNavigate }) {
  const [memberships, setMemberships] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadMemberships = async () => {
    setLoading(true);
    try {
      const data = await membershipsApi.getMyMemberships();
      setMemberships(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this membership application?')) return;
    try {
      await membershipsApi.cancelMembership(id);
      setMemberships((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to cancel application');
    }
  };

  const filtered = memberships.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved Member</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Under Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Application Declined</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Membership Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            My Club Memberships
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status of your applications and manage joined college organizations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {['all', 'approved', 'pending', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-smooth ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f} ({memberships.filter((m) => f === 'all' || m.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Memberships Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any membership requests under this filter yet.
          </p>
          <button
            onClick={() => onNavigate('/clubs')}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
          >
            Find Clubs to Join
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-smooth flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {item.club?.category || 'General'}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3
                  onClick={() => item.club && onNavigate(`/clubs/${item.club.id}`)}
                  className="text-base font-bold text-slate-900 hover:text-brand-600 cursor-pointer font-heading"
                >
                  {item.club?.name || 'Club'}
                </h3>

                {item.message && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{item.message}"
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Applied: {new Date(item.created_at).toLocaleDateString()}</span>
                  </span>
                  {item.club?.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.club.location}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:self-center">
                {item.club && (
                  <button
                    onClick={() => onNavigate(`/clubs/${item.club.id}`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-smooth flex items-center space-x-1"
                  >
                    <span>View Club</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-smooth"
                    title="Cancel request"
                  >
                    <Trash2 className="w-4 h-4" />
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
