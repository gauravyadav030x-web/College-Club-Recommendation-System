import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import InterestSelectionPage from './pages/InterestSelectionPage';
import RecommendedClubsPage from './pages/RecommendedClubsPage';
import ExploreClubsPage from './pages/ExploreClubsPage';
import ClubDetailsPage from './pages/ClubDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import MyMembershipsPage from './pages/MyMembershipsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ClubManagementPage from './pages/ClubManagementPage';
import MembershipManagementPage from './pages/MembershipManagementPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });

  // Keep path synced with window.location.hash for shareable links & browser back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading CampusConnect...</p>
      </div>
    );
  }

  // Render appropriate page
  const renderPage = () => {
    // Club details route: /clubs/:id
    if (currentPath.startsWith('/clubs/') && currentPath !== '/clubs/') {
      const parts = currentPath.split('/');
      const id = parseInt(parts[2], 10);
      if (!isNaN(id)) {
        return <ClubDetailsPage clubId={id} onNavigate={navigate} />;
      }
    }

    switch (currentPath) {
      case '/':
        return isAuthenticated ? (
          <StudentDashboard onNavigate={navigate} />
        ) : (
          <LandingPage onNavigate={navigate} />
        );

      case '/login':
        return <LoginPage onNavigate={navigate} />;

      case '/register':
        return <RegisterPage onNavigate={navigate} />;

      case '/dashboard':
        return isAuthenticated ? (
          <StudentDashboard onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/interests':
        return isAuthenticated ? (
          <InterestSelectionPage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/recommendations':
        return <RecommendedClubsPage onNavigate={navigate} />;

      case '/clubs':
        return <ExploreClubsPage onNavigate={navigate} />;

      case '/favorites':
        return isAuthenticated ? (
          <FavoritesPage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/memberships':
        return isAuthenticated ? (
          <MyMembershipsPage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/profile':
        return isAuthenticated ? (
          <StudentProfilePage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/admin':
        return isAdmin ? (
          <AdminDashboard onNavigate={navigate} />
        ) : isAuthenticated ? (
          <StudentDashboard onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/admin/clubs':
        return isAdmin ? (
          <ClubManagementPage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      case '/admin/memberships':
        return isAdmin ? (
          <MembershipManagementPage onNavigate={navigate} />
        ) : (
          <LoginPage onNavigate={navigate} />
        );

      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
