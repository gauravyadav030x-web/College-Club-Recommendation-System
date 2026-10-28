import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  UserCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Tag,
  GraduationCap,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recommendationsApi } from '../api/recommendations';
import { favoritesApi } from '../api/favorites';
import { membershipsApi } from '../api/memberships';
import RecommendationCard from '../components/RecommendationCard';
import JoinClubModal from '../components/JoinClubModal';
import FeedbackModal from '../components/FeedbackModal';

export default function StudentDashboard({ onNavigate }) {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalClub, setModalClub] = useState(null);
  const [feedbackClub, setFeedbackClub] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [recData, memData, favData] = await Promise.all([
        recommendationsApi.getRecommendations({ top_k: 4 }),
        membershipsApi.getMyMemberships().catch(() => []),
        favoritesApi.getFavorites().catch(() => []),
      ]);
      setRecommendations(recData.recommendations || []);
      setMemberships(memData || []);
      setFavorites(favData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleFavorite = async (clubId) => {
    const isFav = favorites.some((f) => f.id === clubId || f.club_id === clubId);
    try {
      if (isFav) {
        await favoritesApi.removeFavorite(clubId);
        setFavorites((prev) => prev.filter((f) => f.id !== clubId && f.club_id !== clubId));
      } else {
        await favoritesApi.addFavorite(clubId);
        setFavorites((prev) => [...prev, { id: clubId, club_id: clubId }]);
      }
      // Refresh recommendations favorite state
      setRecommendations((prev) =>
        prev.map((r) => (r.club_id === clubId ? { ...r, is_favorited: !isFav } : r))
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleJoinSuccess = (clubId) => {
    loadDashboardData();
  };

  const approvedMemberships = memberships.filter((m) => m.status === 'approved');
  const pendingMemberships = memberships.filter((m) => m.status === 'pending');
  const studentInterests = profile?.interests?.map((i) => i.name) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{profile?.department || 'Student Dashboard'} • {profile?.year || 'Undergraduate'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Scholar'}!
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Your personalized recommendation feed is tuned to your interests in{' '}
            <span className="font-semibold text-white">
              {studentInterests.slice(0, 3).join(', ') || 'campus clubs'}
            </span>
            {studentInterests.length > 3 && ` and +${studentInterests.length - 3} more`}.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('/recommendations')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-700 hover:bg-indigo-50 shadow-sm transition-smooth flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Full Recommendation Feed</span>
            </button>
            <button
              onClick={() => onNavigate('/interests')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-smooth flex items-center space-x-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Update My Interests</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Memberships */}
        <div
          onClick={() => onNavigate('/memberships')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Joined Clubs</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {approvedMemberships.length}
          </p>
          <p className="text-[11px] text-slate-400">
            {pendingMemberships.length} pending approval
          </p>
        </div>

        {/* Favorite Clubs */}
        <div
          onClick={() => onNavigate('/favorites')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saved Favorites</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {favorites.length}
          </p>
          <p className="text-[11px] text-slate-400">Bookmarked for later</p>
        </div>

        {/* Selected Interests */}
        <div
          onClick={() => onNavigate('/interests')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Interests</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {studentInterests.length}
          </p>
          <p className="text-[11px] text-brand-600 font-medium">Click to modify</p>
        </div>

        {/* Top Match Score */}
        <div
          onClick={() => onNavigate('/recommendations')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peak Relevance</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {recommendations[0]?.score ? `${recommendations[0].score}%` : '95%'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">High affinity match</p>
        </div>
      </div>

      {/* Top Recommendations Feed */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Recommended Clubs for You</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked with TF-IDF vector similarity, set overlap, and NetworkX BFS traversal.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-smooth"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('/recommendations')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Recommendations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Select your favorite interests and preferred activities to generate instant club matches.
            </p>
            <button
              onClick={() => onNavigate('/interests')}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
            >
              Select Interests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const mem = memberships.find((m) => m.club_id === rec.club_id);
              const isFav = favorites.some((f) => f.id === rec.club_id || f.club_id === rec.club_id);
              return (
                <RecommendationCard
                  key={rec.club_id}
                  rec={rec}
                  isFavorited={isFav}
                  membershipStatus={mem?.status || rec.membership_status}
                  onSelect={(id) => onNavigate(`/clubs/${id}`)}
                  onToggleFavorite={handleToggleFavorite}
                  onRequestJoin={(club) => setModalClub(club)}
                  onOpenFeedback={(club) => setFeedbackClub(club)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Explore Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold font-heading">
            Looking for something specific?
          </h3>
          <p className="text-xs text-slate-400">
            Browse our full campus directory of 18+ registered organizations across Arts, Tech, Sports, and Leadership.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/clubs')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-smooth flex items-center space-x-1.5 flex-shrink-0"
        >
          <Compass className="w-4 h-4 text-brand-600" />
          <span>Browse All Clubs</span>
        </button>
      </div>

      {/* Modals */}
      <JoinClubModal
        club={modalClub}
        isOpen={!!modalClub}
        onClose={() => setModalClub(null)}
        onSuccess={handleJoinSuccess}
      />

      <FeedbackModal
        club={feedbackClub}
        isOpen={!!feedbackClub}
        onClose={() => setFeedbackClub(null)}
        onSuccess={() => {}}
      />
    </div>
  );
}
