import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import CursorGlow from './components/ui/CursorGlow';
import ScrollProgress from './components/ui/ScrollProgress';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SettingsPage from './pages/SettingsPage';
import FollowListPage from './pages/FollowListPage';

// Navbar only on pages that need it (landing page kept at /landing)
const NO_NAV_ROUTES = ['/login', '/register', '/feed', '/'];

function AppRoutes() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isFeedPage = location.pathname === '/' || location.pathname === '/feed';
  const showNav = !isAuthPage && !isFeedPage;
  const showScrollProgress = showNav;

  return (
    <>
      <CursorGlow />
      {showScrollProgress && <ScrollProgress />}
      {showNav && (
        <Navbar onMenuToggle={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* "/" → Home Feed directly (TikTok/Instagram style) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<HomePage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* App pages */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/followers" element={<FollowListPage type="followers" />} />
          <Route path="/profile/following" element={<FollowListPage type="following" />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Landing kept at /landing for reference */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Convenience redirects */}
          <Route path="/trending" element={<Navigate to="/explore" />} />
          <Route path="/saved" element={<Navigate to="/feed" />} />
          <Route path="/help" element={<Navigate to="/settings" />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
