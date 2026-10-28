import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  Cpu,
  Share2,
  Network
} from 'lucide-react';

export default function RecommendationCard({
  rec,
  onSelect,
  onToggleFavorite,
  onRequestJoin,
  onOpenFeedback,
  isFavorited = false,
  membershipStatus = null,
}) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // Score styling
  const score = rec.score || 0;
  const isHighMatch = score >= 80;
  const isMedMatch = score >= 65 && score < 80;

  const scoreBadgeBg = isHighMatch
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isMedMatch
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : 'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-smooth card-hover overflow-hidden flex flex-col justify-between">
      {/* Top Banner & Match Bar */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {rec.category}
              </span>
              <span className="text-[11px] text-slate-400">ID #{rec.club_id}</span>
            </div>
            <h3
              onClick={() => onSelect && onSelect(rec.club_id)}
              className="text-lg font-bold text-slate-900 hover:text-brand-600 cursor-pointer font-heading leading-tight truncate"
            >
              {rec.club_name}
            </h3>
          </div>

          {/* Relevance Score Pill */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center space-x-1.5 shadow-sm ${scoreBadgeBg}`}
              title="Content-based relevance score based on TF-IDF, Overlap, and Graph distance"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{rec.score}% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Relevance Score</span>
          </div>
        </div>

        {/* Reason Explanation Box (Crucial for ML transparency requirement) */}
        <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/60 border border-indigo-100/80">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-semibold text-slate-900">Why recommended: </span>
              <span className="text-slate-700">{rec.reason}</span>
            </div>
          </div>
        </div>

        {/* Matched Interests Pills */}
        {rec.matched_interests && rec.matched_interests.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Matched Interests:</span>
            {rec.matched_interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{interest}</span>
              </span>
            ))}
          </div>
        )}

        {/* Matched Skills Pills if present */}
        {rec.matched_skills && rec.matched_skills.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Matched Skills:</span>
            {rec.matched_skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Description Excerpt */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {rec.description}
        </p>

        {/* Toggle Score Breakdown */}
        <div className="mt-2.5">
          <button
            onClick={() => setShowScoreDetails(!showScoreDetails)}
            className="text-[11px] text-slate-500 hover:text-brand-600 font-medium flex items-center space-x-1"
          >
            <span>Algorithm Score Breakdown</span>
            {showScoreDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showScoreDetails && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1 rounded bg-white border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">TF-IDF Vector</p>
                <p className="font-bold text-slate-800">{rec.tfidf_score}%</p>
              </div>
              <div className="p-1 rounded bg-white border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Set Overlap</p>
                <p className="font-bold text-slate-800">{rec.overlap_score}%</p>
              </div>
              <div className="p-1 rounded bg-white border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Graph BFS</p>
                <p className="font-bold text-slate-800">{rec.graph_score}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleFavorite && onToggleFavorite(rec.club_id)}
            className={`p-2 rounded-lg border transition-smooth ${
              isFavorited
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-slate-500 hover:text-red-500 border-slate-200'
            }`}
            title={isFavorited ? 'Favorited' : 'Add to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onOpenFeedback && onOpenFeedback(rec)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-smooth"
            title="Give recommendation feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelect && onSelect(rec.club_id)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-white rounded-lg transition-smooth"
          >
            Details
          </button>

          {membershipStatus === 'approved' ? (
            <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Joined</span>
            </span>
          ) : membershipStatus === 'pending' ? (
            <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
              <span>Requested</span>
            </span>
          ) : (
            <button
              onClick={() => onRequestJoin && onRequestJoin({ id: rec.club_id, name: rec.club_name })}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm hover:shadow transition-smooth flex items-center space-x-1"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
