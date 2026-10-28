import React, { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { clubsApi } from '../api/clubs';
import InterestSelector from '../components/InterestSelector';

export default function InterestSelectionPage({ onNavigate }) {
  const { profile, refreshProfile } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load student current interests
    if (profile?.interests) {
      setSelectedInterests(profile.interests.map((i) => i.name));
    }

    // Load available interests from catalog
    async function loadCatalog() {
      try {
        const catalog = await clubsApi.getAllInterests();
        setAvailableInterests(catalog);
      } catch (e) {
        console.warn('Could not load catalog interests:', e);
      }
    }
    loadCatalog();
  }, [profile]);

  const handleSave = async (redirect = false) => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await authApi.updateProfile({
        interest_names: selectedInterests,
      });
      await refreshProfile();
      setSaveSuccess(true);
      if (redirect) {
        onNavigate('/recommendations');
      } else {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save interests');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Extracurricular Preference Tuning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Choose Your Interests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Select the topics, technologies, arts, or sports you want to participate in this semester.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-smooth flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>Save & View Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Interests updated successfully! Your recommendation vector has been refreshed.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Selector Component */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <InterestSelector
          selectedInterests={selectedInterests}
          onChange={setSelectedInterests}
          availableInterests={availableInterests}
        />
      </div>
    </div>
  );
}
