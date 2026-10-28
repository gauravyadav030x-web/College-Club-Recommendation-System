import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InterestSelector from '../components/InterestSelector';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('1st Year');
  const [selectedInterests, setSelectedInterests] = useState(['Coding', 'Web Development']);
  const [skills, setSkills] = useState('Python, JavaScript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        department,
        year,
        interests: selectedInterests,
        skills: skillsArray,
      });
      onNavigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
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

  const years = ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)', 'Graduate / Post-grad'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Create Your Student Profile
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tell us about your academic department, skills, and interests to receive immediate, personalized club recommendations.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Account Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth bg-white"
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
                  Year of Study
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth bg-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y.split(' ')[0] + ' ' + y.split(' ')[1]}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, Figma, Public Speaking, Photography..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
              />
            </div>
          </div>

          {/* Interests multi-select */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>3. Select Your Extracurricular Interests</span>
              </h3>
            </div>

            <InterestSelector
              selectedInterests={selectedInterests}
              onChange={setSelectedInterests}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-brand-500/35 transition-smooth flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Creating your profile...</span>
            ) : (
              <>
                <span>Complete Registration & View Recommended Clubs</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500">
        Already registered?{' '}
        <button
          onClick={() => onNavigate('/login')}
          className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2"
        >
          Sign in here
        </button>
      </p>
    </div>
  );
}
