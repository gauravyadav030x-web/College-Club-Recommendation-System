import React, { useState, useEffect } from 'react';
import { Search, Filter, Compass, X, Sparkles } from 'lucide-react';
import { clubsApi } from '../api/clubs';
import { favoritesApi } from '../api/favorites';
import { membershipsApi } from '../api/memberships';
import ClubCard from '../components/ClubCard';
import JoinClubModal from '../components/JoinClubModal';

export default function ExploreClubsPage({ onNavigate }) {
  const [clubs, setClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalClub, setModalClub] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubList, catList, favList, memList] = await Promise.all([
        clubsApi.getClubs({
          search: searchTerm || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
        }),
        clubsApi.getCategories().catch(() => []),
        favoritesApi.getFavorites().catch(() => []),
        membershipsApi.getMyMemberships().catch(() => []),
      ]);

      setClubs(clubList || []);
      setCategories(['All', ...catList.map((c) => c.category)]);
      setFavorites(favList || []);
      setMemberships(memList || []);
    } catch (err) {
      console.error('Failed to load explore clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

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
      setClubs((prev) =>
        prev.map((c) => (c.id === clubId ? { ...c, is_favorited: !isFav } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 mb-1">
            <Compass className="w-4 h-4" />
            <span>Campus Extracurricular Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Explore All Clubs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and connect with 18+ active student-run college organizations.
          </p>
        </div>

        {/* Quick CTA to Recommendations */}
        <button
          onClick={() => onNavigate('/recommendations')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Switch to AI Matches</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, technology, or activity..."
            className="w-full text-xs pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white shadow-2xs transition-smooth"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {clubs.length} clubs
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-smooth ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Clubs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active clubs match your current search criteria. Try a different keyword or category.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const mem = memberships.find((m) => m.club_id === club.id);
            const isFav = favorites.some((f) => f.id === club.id || f.club_id === club.id);
            return (
              <ClubCard
                key={club.id}
                club={club}
                isFavorited={isFav || club.is_favorited}
                membershipStatus={mem?.status || club.membership_status}
                onSelect={(id) => onNavigate(`/clubs/${id}`)}
                onToggleFavorite={handleToggleFavorite}
                onRequestJoin={(c) => setModalClub(c)}
              />
            );
          })}
        </div>
      )}

      {/* Join Request Modal */}
      <JoinClubModal
        club={modalClub}
        isOpen={!!modalClub}
        onClose={() => setModalClub(null)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
