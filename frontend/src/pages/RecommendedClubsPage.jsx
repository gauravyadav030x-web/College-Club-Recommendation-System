import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Filter,
  Network,
  Cpu,
  Layers,
  Heart,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recommendationsApi } from '../api/recommendations';
import { favoritesApi } from '../api/favorites';
import { membershipsApi } from '../api/memberships';
import RecommendationCard from '../components/RecommendationCard';
import JoinClubModal from '../components/JoinClubModal';
import FeedbackModal from '../components/FeedbackModal';

export default function RecommendedClubsPage({ onNavigate }) {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [graphInsights, setGraphInsights] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [modalClub, setModalClub] = useState(null);
  const [feedbackClub, setFeedbackClub] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recData, favData, memData] = await Promise.all([
        recommendationsApi.getRecommendations({
          category_filter: categoryFilter === 'All' ? null : categoryFilter,
          top_k: 12,
        }),
        favoritesApi.getFavorites().catch(() => []),
        membershipsApi.getMyMemberships().catch(() => []),
      ]);

      setRecommendations(recData.recommendations || []);
      setGraphInsights(recData.graph_insights || {});
      setFavorites(favData || []);
      setMemberships(memData || []);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [categoryFilter]);

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
      setRecommendations((prev) =>
        prev.map((r) => (r.club_id === clubId ? { ...r, is_favorited: !isFav } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'Technology', 'Arts', 'Sports', 'Communication', 'Entrepreneurship', 'Culture & Community'];
  const studentInterests = profile?.interests?.map((i) => i.name) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Tuning bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Hybrid Content-Based & Graph Recommendation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Personalized Club Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-objective ranking based on TF-IDF cosine similarity (50%), set overlap (35%), and BFS proximity (15%).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/interests')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-smooth flex items-center space-x-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-brand-600" />
            <span>Edit Interests</span>
          </button>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-compute Matches</span>
          </button>
        </div>
      </div>

      {/* Query Profile Snapshot & Graph Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Query Snapshot */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-600" />
              <span>Current Profile Query Vector:</span>
            </span>
            <span className="text-slate-400 font-normal">
              {studentInterests.length} selected interests
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {studentInterests.length > 0 ? (
              studentInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                No interests selected in profile. Serving popular baseline clubs.
              </span>
            )}
          </div>
        </div>

        {/* Graph Insights Box */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-purple-900">
            <Network className="w-4 h-4 text-purple-600" />
            <span>Graph Analytics</span>
          </div>
          <p className="text-purple-700 text-[11px] leading-relaxed">
            Active Subgraph: <span className="font-semibold">{graphInsights.total_nodes || 0} nodes</span>,{' '}
            <span className="font-semibold">{graphInsights.total_edges || 0} edges</span>.
          </p>
          <p className="text-[10px] text-purple-600">
            Network density: {graphInsights.density || 0} • Components: {graphInsights.connected_components || 1}
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-smooth ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Clubs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category filter or selecting more diverse interests to expand candidate generation.
          </p>
          <button
            onClick={() => setCategoryFilter('All')}
            className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded-xl"
          >
            Clear Category Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Modals */}
      <JoinClubModal
        club={modalClub}
        isOpen={!!modalClub}
        onClose={() => setModalClub(null)}
        onSuccess={() => fetchRecommendations()}
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
