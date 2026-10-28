import React from 'react';
import { Heart, MapPin, Calendar, Users, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function ClubCard({
  club,
  onSelect,
  onToggleFavorite,
  onRequestJoin,
  isFavorited = false,
  membershipStatus = null,
  showActions = true,
}) {
  const categoryGradients = {
    Technology: 'from-blue-600 to-indigo-600',
    Arts: 'from-pink-500 to-rose-600',
    Sports: 'from-amber-500 to-orange-600',
    Communication: 'from-emerald-500 to-teal-600',
    Entrepreneurship: 'from-purple-600 to-indigo-700',
    'Culture & Community': 'from-teal-500 to-cyan-600',
  };

  const gradient = categoryGradients[club.category] || 'from-indigo-600 to-brand-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-smooth card-hover overflow-hidden flex flex-col h-full">
      {/* Banner / Header */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {club.banner_image ? (
          <img
            src={club.banner_image}
            alt={club.name}
            className="w-full h-full object-cover transition-smooth duration-500 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${gradient} opacity-90`} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold bg-white/95 text-slate-800 rounded-full shadow-sm backdrop-blur-sm">
            {club.category}
          </span>
        </div>

        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(club.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-smooth ${
              isFavorited
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-red-500'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Club Name overlay on bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3
            onClick={() => onSelect && onSelect(club.id)}
            className="text-lg font-bold text-white hover:text-indigo-200 cursor-pointer truncate font-heading drop-shadow-sm"
          >
            {club.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          {/* Interests & Skills Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {club.interests &&
              club.interests.slice(0, 3).map((item) => (
                <span
                  key={typeof item === 'string' ? item : item.name}
                  className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                >
                  {typeof item === 'string' ? item : item.name}
                </span>
              ))}
            {club.interests && club.interests.length > 3 && (
              <span className="px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
                +{club.interests.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Info Meta */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center space-x-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{club.meeting_info || 'Weekly meetings'}</span>
          </div>
          <div className="flex items-center space-x-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{club.location || 'Campus Center'}</span>
          </div>
          {club.member_count !== undefined && (
            <div className="flex items-center space-x-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{club.member_count} active members</span>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {showActions && (
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={() => onSelect && onSelect(club.id)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 py-1.5 px-2.5 rounded-lg hover:bg-brand-50 transition-smooth"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {membershipStatus === 'approved' ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Member</span>
              </span>
            ) : membershipStatus === 'pending' ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestJoin && onRequestJoin(club);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-smooth"
              >
                Join Club
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
