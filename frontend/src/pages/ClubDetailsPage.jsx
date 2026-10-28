import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Users,
  Heart,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Cpu,
  Activity
} from 'lucide-react';
import { clubsApi } from '../api/clubs';
import { favoritesApi } from '../api/favorites';
import { membershipsApi } from '../api/memberships';
import JoinClubModal from '../components/JoinClubModal';

export default function ClubDetailsPage({ clubId, onNavigate }) {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadClub = async () => {
    setLoading(true);
    try {
      const data = await clubsApi.getClubById(clubId);
      setClub(data);
      setIsFavorited(data.is_favorited);
      setMembershipStatus(data.membership_status);
    } catch (err) {
      setError(err.message || 'Club not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClub();
  }, [clubId]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoritesApi.removeFavorite(clubId);
        setIsFavorited(false);
      } else {
        await favoritesApi.addFavorite(clubId);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Club Not Found</h3>
        <p className="text-xs text-slate-500">The club you are looking for does not exist or has been deactivated.</p>
        <button
          onClick={() => onNavigate('/clubs')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Return to Clubs Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/clubs')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-smooth"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </button>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {club.banner_image ? (
            <img
              src={club.banner_image}
              alt={club.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/80 text-white backdrop-blur-md">
              {club.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              {club.name}
            </h1>
            <p className="text-xs text-slate-300 flex items-center space-x-2">
              <span>Led by {club.leader_name}</span>
              <span>•</span>
              <span>{club.member_count} active members</span>
            </p>
          </div>

          {/* Quick Actions in Hero */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-2xl border transition-smooth backdrop-blur-md ${
                isFavorited
                  ? 'bg-red-500 text-white border-red-500 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25 border-white/20'
              }`}
              title={isFavorited ? 'Saved to Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {membershipStatus === 'approved' ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-500 text-white shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                <span>You are a Member</span>
              </span>
            ) : membershipStatus === 'pending' ? (
              <span className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-white shadow-md">
                <Clock className="w-4 h-4" />
                <span>Application Pending</span>
              </span>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-smooth flex items-center space-x-1.5"
              >
                <span>Request to Join</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Mission, Skills, Activities */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              About the Club
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {club.description}
            </p>
          </div>

          {/* Extracurricular Interests Targeted */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              <span>Targeted Interests & Themes</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {club.interests && club.interests.map((int) => (
                <span
                  key={int.name}
                  className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100"
                >
                  {int.name}
                </span>
              ))}
            </div>
          </div>

          {/* Skills & Prerequisites */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Associated Skills & Technologies</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {club.skills_required && club.skills_required.length > 0 ? (
                club.skills_required.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg border border-blue-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">All student skill levels welcome!</span>
              )}
            </div>
          </div>

          {/* Preferred Activities */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Typical Club Activities</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {club.preferred_activities && club.preferred_activities.length > 0 ? (
                club.preferred_activities.map((act) => (
                  <span
                    key={act}
                    className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100"
                  >
                    {act}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Workshops, speaker sessions, and campus events.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meeting Info, Logistics & Contact */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Meeting Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Schedule & Frequency</p>
                  <p className="text-slate-600 mt-0.5">{club.meeting_info}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{club.schedule}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Location</p>
                  <p className="text-slate-600 mt-0.5">{club.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
                <Mail className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Official Contact</p>
                  <a
                    href={`mailto:${club.contact_email}`}
                    className="text-brand-600 hover:underline mt-0.5 block truncate"
                  >
                    {club.contact_email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
                <Users className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Faculty / President</p>
                  <p className="text-slate-600 mt-0.5">{club.leader_name}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                disabled={membershipStatus === 'approved'}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth disabled:opacity-50"
              >
                {membershipStatus === 'approved'
                  ? 'Joined Member'
                  : membershipStatus === 'pending'
                  ? 'Application Pending'
                  : 'Join This Club'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <JoinClubModal
        club={club}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => loadClub()}
      />
    </div>
  );
}
