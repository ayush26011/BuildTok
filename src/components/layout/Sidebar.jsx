import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Compass, Upload, User, Zap, TrendingUp,
  Bookmark, Settings, HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/feed', id: 'nav-home' },
  { icon: Compass, label: 'Explore', to: '/explore', id: 'nav-explore' },
  { icon: Upload, label: 'Upload', to: '/upload', id: 'nav-upload' },
  { icon: Bookmark, label: 'Saved', to: '/saved', id: 'nav-saved' },
  { icon: TrendingUp, label: 'Trending', to: '/trending', id: 'nav-trending' },
  { icon: User, label: 'Profile', to: '/profile', id: 'nav-profile' },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 py-6 px-3 border-r border-white/10 glass"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle */}
      <motion.button
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#561C24] text-cream-light flex items-center justify-center shadow-maroon"
        onClick={() => setCollapsed(c => !c)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>

      {/* User mini profile */}
      {user && (
        <div className={`mb-6 ${collapsed ? 'px-0' : 'px-1'}`}>
          <Link to="/profile" className="flex items-center gap-3 group">
            <Avatar user={user} size="md" />
            {!collapsed && (
              <motion.div
                initial={false}
                animate={{ opacity: collapsed ? 0 : 1 }}
                className="min-w-0"
              >
                <p className="font-semibold text-sm text-[#561C24] dark:text-cream truncate">{user.name}</p>
                <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 truncate">{user.username}</p>
              </motion.div>
            )}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label, to, id }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} id={id}>
              <motion.div
                className={`sidebar-item ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                whileHover={{ x: collapsed ? 0 : 4 }}
                title={collapsed ? label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && (
                  <span className="text-sm truncate">{label}</span>
                )}
                {!collapsed && label === 'Upload' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#561C24] animate-pulse" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1 pt-4 border-t border-white/10">
        {[
          { icon: Settings, label: 'Settings', to: '/settings' },
          { icon: HelpCircle, label: 'Help', to: '/help' },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}>
            <motion.div
              className={`sidebar-item ${collapsed ? 'justify-center' : ''}`}
              whileHover={{ x: collapsed ? 0 : 4 }}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0 opacity-70" />
              {!collapsed && <span className="text-xs opacity-70">{label}</span>}
            </motion.div>
          </Link>
        ))}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="glass-maroon rounded-2xl p-3 text-center">
              <Zap size={16} className="text-[#561C24] mx-auto mb-1" />
              <p className="text-[10px] font-bold text-[#561C24] dark:text-beige-warm">BuildTok Pro</p>
              <p className="text-[9px] text-[#561C24]/60 dark:text-beige-warm/60 mt-0.5">Analytics & more</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
