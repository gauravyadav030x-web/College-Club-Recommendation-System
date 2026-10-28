import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  Heart,
  UserCheck,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';

export default function Navbar({ currentPath = '/', onNavigate }) {
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Explore Clubs', path: '/clubs', icon: Compass, public: true },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles, authRequired: true },
    { label: 'My Favorites', path: '/favorites', icon: Heart, authRequired: true },
    { label: 'Memberships', path: '/memberships', icon: UserCheck, authRequired: true },
  ];

  const handleNav = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-indigo-600 bg-clip-text text-transparent font-heading">
                CampusConnect
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Club Recommender
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => handleNav(isAuthenticated ? '/dashboard' : '/')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentPath === '/dashboard' || currentPath === '/'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isAuthenticated ? 'Dashboard' : 'Home'}
            </button>

            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    isActive
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => handleNav('/admin')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                  currentPath.startsWith('/admin')
                    ? 'text-purple-700 bg-purple-100 border border-purple-200'
                    : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>Admin Hub</span>
              </button>
            )}
          </div>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleNav('/profile')}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-smooth"
                  title="View Profile & Interests"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {user?.full_name?.charAt(0) || 'S'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-smooth"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm hover:shadow transition-smooth"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => handleNav(isAuthenticated ? '/dashboard' : '/')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </button>
          {navLinks.map((link) => {
            if (link.authRequired && !isAuthenticated) return null;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
              >
                <link.icon className="w-4 h-4 text-brand-600" />
                <span>{link.label}</span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => handleNav('/admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50 flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>Admin Hub</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('/profile')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>My Profile ({user?.email})</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => handleNav('/login')}
                  className="flex-1 py-2 text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
