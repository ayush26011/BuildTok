import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Moon, Sun, Menu, X, Zap, PlusSquare, LogOut, User, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLanding = location.pathname === '/';

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isLanding
          ? 'glass border-b border-white/10 shadow-glass'
          : 'bg-transparent'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            className="w-9 h-9 rounded-xl bg-maroon-gradient flex items-center justify-center shadow-maroon"
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Zap size={18} className="text-cream-light" fill="currentColor" />
          </motion.div>
          <span className="font-display font-800 text-xl text-[#561C24] dark:text-cream tracking-tight group-hover:opacity-80 transition-opacity">
            Build<span className="text-gradient">Tok</span>
          </span>
        </Link>

        {/* Center — Search (desktop) */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              className="flex-1 max-w-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter') { navigate('/explore'); setSearchOpen(false); }
                }}
                placeholder="Search projects, creators, tech..."
                className="input-premium text-sm"
              />
            </motion.div>
          ) : (
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { to: '/feed', label: 'Feed' },
                { to: '/explore', label: 'Explore' },
                { to: '/profile', label: 'Profile' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location.pathname === to
                      ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream'
                      : 'text-[#561C24]/70 dark:text-beige-warm/70 hover:text-[#561C24] dark:hover:text-cream hover:bg-[#561C24]/05'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </AnimatePresence>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <motion.button
            id="search-toggle"
            onClick={() => setSearchOpen(s => !s)}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#561C24]/70 hover:text-[#561C24] transition-colors"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </motion.button>

          <motion.button
            id="theme-toggle"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#561C24]/70 hover:text-[#561C24] transition-colors"
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          {user && (
            <Link to="/messages" id="nav-messages-btn">
              <motion.button
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-[#561C24]/70 hover:text-[#561C24] transition-colors relative"
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                title="Messages"
              >
                <MessageSquare size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-cream-light font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#1a1a2e] shadow-maroon">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
            </Link>
          )}

          {user ? (
            <>
              <Link to="/upload">
                <motion.button
                  id="upload-btn"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-maroon-gradient text-cream-light text-sm font-semibold shadow-maroon"
                  whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  <PlusSquare size={15} />
                  <span>Upload</span>
                </motion.button>
              </Link>

              <div className="relative">
                <motion.button
                  id="profile-menu-btn"
                  onClick={() => setProfileOpen(p => !p)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  <Avatar user={user} size="sm" />
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 top-12 w-52 glass-strong rounded-2xl p-2 shadow-glass-lg"
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div className="px-3 py-2 mb-1 border-b border-white/10">
                        <p className="font-semibold text-sm text-[#561C24] dark:text-cream">{user.name}</p>
                        <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">{user.username}</p>
                      </div>
                      {[
                        { icon: User, label: 'Profile', to: '/profile' },
                        { icon: PlusSquare, label: 'Upload Project', to: '/upload' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={to} to={to} onClick={() => setProfileOpen(false)}>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#561C24]/08 transition-colors cursor-pointer">
                            <Icon size={15} className="text-[#561C24]/70 dark:text-beige-warm/70" />
                            <span className="text-sm font-medium text-[#561C24]/80 dark:text-beige-warm/80">{label}</span>
                          </div>
                        </Link>
                      ))}
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors mt-1"
                        onClick={() => { logout(() => navigate('/login')); setProfileOpen(false); }}
                      >
                        <LogOut size={15} className="text-red-500" />
                        <span className="text-sm font-medium text-red-500">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" id="login-btn">Log In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" id="signup-btn">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <motion.button
            id="mobile-menu-btn"
            className="lg:hidden w-9 h-9 rounded-full glass flex items-center justify-center"
            onClick={onMenuToggle}
            whileTap={{ scale: 0.95 }}
          >
            {menuOpen ? <X size={16} className="text-[#561C24]" /> : <Menu size={16} className="text-[#561C24]" />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
