import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Mail,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles,
  Tag,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import InterestSelector from '../components/InterestSelector';

export default function StudentProfilePage({ onNavigate }) {
  const { user, profile, refreshProfile } = useAuth();
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      setDepartment(profile.department || 'Computer Science & Engineering');
      setYear(profile.year || '1st Year');
      setBio(profile.bio || '');
      setSkills(profile.skills ? profile.skills.join(', ') : '');
      setSelectedInterests(profile.interests ? profile.interests.map((i) => i.name) : []);
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await authApi.updateProfile({
        department,
        year,
        bio,
        skills: skillsArray,
        interest_names: selectedInterests,
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Business Administration & Management',
    'Arts & Humanities',
    'Applied Sciences & Mathematics',
    'Law & Public Policy',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate / Post-grad'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-500/20">
            {user?.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              {user?.full_name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
              <span>{user?.email}</span>
              <span>•</span>
              <span className="capitalize font-semibold text-brand-600">{user?.role}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile changes and extracurricular interests saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider text-slate-400">
            Academic Background
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Major
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clubs what excites you and what you're hoping to build..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Skills & Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, Figma, Public Speaking, Guitar..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Interests Selector Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Extracurricular Interests</span>
            </h2>
            <span className="text-xs text-brand-600 font-semibold">
              {selectedInterests.length} selected
            </span>
          </div>

          <InterestSelector
            selectedInterests={selectedInterests}
            onChange={setSelectedInterests}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : 'Save All Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
