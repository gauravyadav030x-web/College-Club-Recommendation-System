import React, { useState, useEffect } from 'react';
import { Heart, Compass, ArrowRight } from 'lucide-react';
import { favoritesApi } from '../api/favorites';
import ClubCard from '../components/ClubCard';
import JoinClubModal from '../components/JoinClubModal';

export default function FavoritesPage({ onNavigate }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalClub, setModalClub] = useState(null);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoritesApi.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (clubId) => {
    try {
      await favoritesApi.removeFavorite(clubId);
      setFavorites((prev) => prev.filter((c) => c.id !== clubId && c.club_id !== clubId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-600 mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Saved Clubs Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            My Favorite Clubs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Clubs you bookmarked for later review and membership applications.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/clubs')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-smooth flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Compass className="w-4 h-4 text-brand-600" />
          <span>Browse More Clubs</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Saved Clubs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any recommended or explored club to save it here for quick access.
          </p>
          <button
            onClick={() => onNavigate('/clubs')}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isFavorited={true}
              membershipStatus={club.membership_status}
              onSelect={(id) => onNavigate(`/clubs/${id}`)}
              onToggleFavorite={handleToggleFavorite}
              onRequestJoin={(c) => setModalClub(c)}
            />
          ))}
        </div>
      )}

      <JoinClubModal
        club={modalClub}
        isOpen={!!modalClub}
        onClose={() => setModalClub(null)}
        onSuccess={() => loadFavorites()}
      />
    </div>
  );
}
