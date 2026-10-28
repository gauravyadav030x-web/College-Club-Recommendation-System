import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        onNavigate('/admin');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async (role) => {
    if (role === 'student') {
      setEmail('student@university.edu');
      setPassword('Student@College2026');
    } else {
      setEmail('admin@university.edu');
      setPassword('Admin@College2026');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Sign In to CampusConnect
          </h2>
          <p className="text-xs text-slate-500">
            Access your personalized club recommendations and membership requests
          </p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-700 text-center uppercase tracking-wide">
            ⚡ Quick Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-2xs flex items-center justify-center space-x-1.5 transition-smooth"
            >
              <User className="w-3.5 h-3.5" />
              <span>Fill Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="px-3 py-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-semibold shadow-2xs flex items-center justify-center space-x-1.5 transition-smooth"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Fill Admin</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow transition-smooth flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          New to CampusConnect?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2"
          >
            Create a student account
          </button>
        </p>
      </div>
    </div>
  );
}
