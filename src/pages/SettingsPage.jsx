import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft, User, Lock, Bell, Zap, Shield, Palette, HelpCircle, Info,
  LogOut, ChevronRight, ChevronDown, Moon, Sun, Eye, EyeOff,
  Check, X, Crown, BarChart2, TrendingUp, Users, Star,
  Smartphone, Globe, Mail, Phone, Settings, Save, AlertCircle,
  Search, AlertTriangle, Monitor, Terminal, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import ProBadge from '../components/ui/ProBadge';
import Avatar from '../components/ui/Avatar';
import { pageVariants } from '../utils/animations';
import API from '../services/api';

// ─── Reusable custom Toast component ──────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
      exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
      className={`fixed bottom-24 left-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 border font-display font-bold text-xs ${
        type === 'error'
          ? 'bg-red-500/90 text-white border-red-500/20'
          : 'bg-emerald-600/95 text-white border-emerald-500/20'
      }`}
    >
      {type === 'error' ? <AlertTriangle size={15} /> : <Check size={15} />}
      <span>{message}</span>
    </motion.div>
  );
}

// ─── Reusable toggle ─────────────────────────────────────────────
function Toggle({ value, onChange, id }) {
  return (
    <motion.button
      id={id}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        value ? 'bg-maroon-gradient' : 'bg-[#561C24]/20 dark:bg-white/20'
      }`}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        animate={{ left: value ? '26px' : '4px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

// ─── Permission Select dropdown ───────────────────────────────────
function PermissionSelect({ value, onChange, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#561C24]/08 dark:bg-white/08 text-[#561C24] dark:text-cream text-xs font-semibold px-2 py-1.5 rounded-xl outline-none border border-[#561C24]/10 dark:border-white/10 cursor-pointer focus:border-[#561C24]/30"
    >
      <option value="everyone" className="bg-[#1a0a0d] text-cream">Everyone</option>
      <option value="followers" className="bg-[#1a0a0d] text-cream">Followers</option>
      <option value="nobody" className="bg-[#1a0a0d] text-cream">Nobody</option>
    </select>
  );
}

// ─── Settings row ─────────────────────────────────────────────────
function SettingRow({ label, desc, right, onClick, danger = false, icon: Icon }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#561C24]/06 dark:hover:bg-white/05 transition-colors text-left group ${
        danger ? 'hover:bg-red-500/08' : ''
      }`}
      whileTap={{ scale: 0.99 }}
    >
      {Icon && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          danger ? 'bg-red-500/10' : 'bg-[#561C24]/08 dark:bg-white/08'
        }`}>
          <Icon size={15} className={danger ? 'text-red-500' : 'text-[#561C24] dark:text-cream'} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-[#561C24] dark:text-cream'}`}>{label}</p>
        {desc && <p className="text-xs text-[#561C24]/55 dark:text-beige-warm/55 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="shrink-0" onClick={e => right && e.stopPropagation()}>
        {right || <ChevronRight size={15} className="text-[#561C24]/40 group-hover:text-[#561C24] transition-colors" />}
      </div>
    </motion.button>
  );
}

// ─── Section card ─────────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor = '#561C24', children, badge }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass rounded-3xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#561C24]/04 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}>
            <Icon size={16} style={{ color: iconColor }} />
          </div>
          <span className="font-display font-bold text-sm text-[#561C24] dark:text-cream">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold">{badge}</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-[#561C24]/50" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-2 pb-3 border-t border-[#561C24]/08 dark:border-white/08">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal wrapper for standard premium look ─────────────────────
function BaseModal({ title, onClose, children }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative glass rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#561C24]/10 dark:border-white/10 shrink-0">
          <h3 className="font-display font-extrabold text-lg text-[#561C24] dark:text-cream">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#561C24]/08 dark:bg-white/08 flex items-center justify-center hover:bg-[#561C24]/15 transition-colors">
            <X size={14} className="text-[#561C24] dark:text-cream" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto min-h-0 flex-1 leading-relaxed">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Blocked / Muted Accounts Modal ──────────────────────────────
function RelationshipModal({ title, type, user, onClose, persistSettings, showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fieldKey = type === 'blocked' ? 'blockedUsers' : 'mutedUsers';
  const list = user.privacySettings?.[fieldKey] || [];

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await API.get(`/users/search?query=${val}`);
      if (res.success && res.data) {
        // Filter out ourselves and already added users
        const filtered = res.data.filter(u => u._id !== user._id && !list.some(item => (item._id || item) === u._id));
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAction = async (targetUser, isAdding) => {
    let nextList;
    if (isAdding) {
      nextList = [...list.map(u => u._id || u), targetUser._id];
    } else {
      nextList = list.filter(u => (u._id || u) !== targetUser._id).map(u => u._id || u);
    }

    try {
      await persistSettings({
        privacySettings: {
          ...user.privacySettings,
          [fieldKey]: nextList
        }
      }, false);

      if (isAdding) {
        setSearchResults(prev => prev.filter(u => u._id !== targetUser._id));
        showToast(`${targetUser.name} has been ${type === 'blocked' ? 'blocked' : 'muted'}`);
      } else {
        showToast(`${targetUser.name} has been ${type === 'blocked' ? 'unblocked' : 'unmuted'}`);
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <BaseModal title={title} onClose={onClose}>
      <div className="space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#561C24]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search users by name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream placeholder-[#561C24]/30 focus:outline-none focus:border-[#561C24]/30"
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className="p-3 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 space-y-2.5 max-h-48 overflow-y-auto">
            <p className="text-[10px] font-bold text-[#561C24]/50 tracking-wider uppercase px-1">Search Results</p>
            {searching ? (
              <p className="text-xs text-[#561C24]/50 px-1 py-1">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-xs text-[#561C24]/50 px-1 py-1">No users found</p>
            ) : (
              searchResults.map(u => (
                <div key={u._id} className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar user={u} size="xs" ring={false} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#561C24] dark:text-cream truncate">{u.name}</p>
                      <p className="text-[10px] text-[#561C24]/50 truncate">@{u.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(u, true)}
                    className="text-[11px] font-bold bg-[#561C24] text-cream px-3 py-1 rounded-lg hover:bg-[#6D2932]"
                  >
                    {type === 'blocked' ? 'Block' : 'Mute'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Current List */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#561C24]/50 tracking-wider uppercase">
            {type === 'blocked' ? 'Blocked Accounts' : 'Muted Accounts'} ({list.length})
          </p>
          {list.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[#561C24]/10 rounded-2xl">
              <p className="text-xs text-[#561C24]/50">No accounts {type === 'blocked' ? 'blocked' : 'muted'} yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {list.map(u => {
                const target = typeof u === 'object' ? u : { _id: u, name: 'User', username: 'user' };
                return (
                  <div key={target._id} className="flex items-center justify-between p-2 rounded-xl bg-[#561C24]/04 dark:bg-white/02">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar user={target} size="xs" ring={false} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#561C24] dark:text-cream truncate">{target.name}</p>
                        <p className="text-[10px] text-[#561C24]/50 truncate">@{target.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAction(target, false)}
                      className="text-[11px] font-bold border border-[#561C24]/20 hover:border-red-500 hover:text-red-500 text-[#561C24] dark:text-cream px-3 py-1 rounded-lg transition-colors"
                    >
                      {type === 'blocked' ? 'Unblock' : 'Unmute'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Creator Dashboard Modal ──────────────────────────────────────
function CreatorDashboardModal({ projects, user, onClose }) {
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = projects.reduce((acc, p) => acc + (p.likes?.length || p.likesCount || 0), 0);
  const totalComments = projects.reduce((acc, p) => acc + (p.commentsCount || 0), 0);
  const totalFollowers = user.followersCount || user.followers?.length || 0;

  const engagementRate = totalViews > 0
    ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
    : '0.0';

  const topProject = projects.length > 0
    ? [...projects].sort((a, b) => (b.views || 0) - (a.views || 0))[0]
    : null;

  return (
    <BaseModal title="Creator Dashboard" onClose={onClose}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Projects', value: projects.length, icon: BarChart2 },
            { label: 'Total Views', value: totalViews, icon: Eye },
            { label: 'Total Likes', value: totalLikes, icon: Star },
            { label: 'Followers', value: totalFollowers, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-4 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08">
              <Icon size={16} className="text-[#561C24]/60 dark:text-cream/60 mb-2" />
              <p className="text-2xl font-extrabold text-[#561C24] dark:text-cream">{value.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Engagement Rate banner */}
        <div className="p-4 rounded-2xl bg-[#561C24]/06 dark:bg-white/03 flex items-center justify-between border border-[#561C24]/10">
          <div>
            <p className="text-xs font-bold text-[#561C24] dark:text-cream">Engagement Rate</p>
            <p className="text-[10px] text-[#561C24]/55 mt-0.5">Likes + Comments per view</p>
          </div>
          <span className="text-xl font-black text-[#561C24] dark:text-cream">{engagementRate}%</span>
        </div>

        {/* Top performing project */}
        <div>
          <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2.5">Top Project</p>
          {topProject ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08">
              <div className="w-16 h-10 rounded-lg bg-black/20 shrink-0 overflow-hidden relative">
                {topProject.thumbnail?.url ? (
                  <img src={topProject.thumbnail.url} alt={topProject.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-mono font-bold text-[#561C24]/40">No Preview</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#561C24] dark:text-cream truncate">{topProject.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-[#561C24]/65 dark:text-cream/65 flex items-center gap-1"><Eye size={10} />{topProject.views} views</span>
                  <span className="text-[10px] text-[#561C24]/65 dark:text-cream/65 flex items-center gap-1"><Star size={10} />{topProject.likesCount || topProject.likes?.length || 0} likes</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#561C24]/50 py-2">No projects published yet</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Project Analytics Modal ──────────────────────────────────────
function ProjectAnalyticsModal({ projects, onClose }) {
  return (
    <BaseModal title="Project Analytics" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2">Metrics per published project</p>
        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#561C24]/10 rounded-2xl">
            <p className="text-xs text-[#561C24]/50">No projects published yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {projects.map(p => {
              const likes = p.likesCount || p.likes?.length || 0;
              return (
                <div key={p._id} className="p-3 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#561C24] dark:text-cream truncate flex-1 pr-3">{p.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#561C24]/10 dark:bg-white/10 text-[#561C24] dark:text-cream font-bold shrink-0">{p.category}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-[#561C24]/05 pt-2">
                    <div className="text-center">
                      <p className="text-[9px] text-[#561C24]/50 uppercase">Views</p>
                      <p className="text-xs font-black text-[#561C24] dark:text-cream mt-0.5">{p.views}</p>
                    </div>
                    <div className="text-center border-x border-[#561C24]/05">
                      <p className="text-[9px] text-[#561C24]/50 uppercase">Likes</p>
                      <p className="text-xs font-black text-[#561C24] dark:text-cream mt-0.5">{likes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-[#561C24]/50 uppercase">Comments</p>
                      <p className="text-xs font-black text-[#561C24] dark:text-cream mt-0.5">{p.commentsCount || 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseModal>
  );
}

// ─── Audience Insights Modal ──────────────────────────────────────
function AudienceInsightsModal({ projects, user, onClose }) {
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = projects.reduce((acc, p) => acc + (p.likes?.length || p.likesCount || 0), 0);
  const totalComments = projects.reduce((acc, p) => acc + (p.commentsCount || 0), 0);
  const totalEngagement = totalLikes + totalComments;

  const likesPct = totalEngagement > 0 ? ((totalLikes / totalEngagement) * 100).toFixed(0) : 100;
  const commentsPct = totalEngagement > 0 ? ((totalComments / totalEngagement) * 100).toFixed(0) : 0;

  // Determine top category
  const categories = projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.keys(categories).length > 0
    ? Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]
    : 'Web Development';

  // Static premium demographic insights
  const countries = [
    { name: 'India', pct: 72 },
    { name: 'United States', pct: 14 },
    { name: 'United Kingdom', pct: 6 },
    { name: 'Germany', pct: 4 },
    { name: 'Others', pct: 4 },
  ];

  return (
    <BaseModal title="Audience Insights" onClose={onClose}>
      <div className="space-y-6">
        {/* Engagement mix */}
        <div>
          <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2.5">Engagement Distribution</p>
          <div className="h-4 rounded-full bg-[#561C24]/10 dark:bg-white/10 overflow-hidden flex">
            <div style={{ width: `${likesPct}%` }} className="bg-maroon-gradient h-full" />
            <div style={{ width: `${commentsPct}%` }} className="bg-[#561C24]/40 dark:bg-white/30 h-full" />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[#561C24]/75 dark:text-cream/70">
              <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-[#561C24] to-[#6D2932]" />
              Likes ({likesPct}%)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#561C24]/75 dark:text-cream/70">
              <span className="w-2.5 h-2.5 rounded bg-[#561C24]/40 dark:bg-white/30" />
              Comments ({commentsPct}%)
            </div>
          </div>
        </div>

        {/* Content Niche */}
        <div className="p-4 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08">
          <p className="text-[9px] font-bold text-[#561C24]/50 uppercase">Primary Content Niche</p>
          <p className="text-base font-extrabold text-[#561C24] dark:text-cream mt-1">{topCategory}</p>
          <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 mt-1">Based on category tags of your published projects.</p>
        </div>

        {/* Top Demographics */}
        <div>
          <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-3">Top Demographics (By Views)</p>
          <div className="space-y-3">
            {countries.map(c => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#561C24] dark:text-cream">
                  <span>{c.name}</span>
                  <span>{c.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#561C24]/08 dark:bg-white/08 overflow-hidden">
                  <div style={{ width: `${c.pct}%` }} className="h-full bg-maroon-gradient rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Content Performance Modal ─────────────────────────────────────
function ContentPerformanceModal({ projects, onClose }) {
  const sorted = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0));
  const maxViews = sorted.length > 0 ? (sorted[0].views || 1) : 1;

  return (
    <BaseModal title="Content Performance" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2">Projects Ranked by Total Views</p>
        {projects.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#561C24]/10 rounded-2xl">
            <p className="text-xs text-[#561C24]/50">No projects published yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {sorted.map((p, index) => {
              const pct = ((p.views || 0) / maxViews) * 100;
              return (
                <div key={p._id} className="space-y-1.5">
                  <div className="flex justify-between text-xs items-center">
                    <span className="font-bold text-[#561C24] dark:text-cream truncate max-w-[70%]">
                      {index + 1}. {p.title}
                    </span>
                    <span className="text-[11px] font-black text-[#561C24] dark:text-cream font-mono">
                      {p.views.toLocaleString()} views
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#561C24]/08 dark:bg-white/08 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-maroon-gradient rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseModal>
  );
}

// ─── Best Time to Post Modal ──────────────────────────────────────
function BestTimeToPostModal({ onClose }) {
  const slots = [
    { day: 'Wednesday', time: '6:00 PM – 9:00 PM', reach: 'Highest', color: 'bg-emerald-500/10 text-emerald-500' },
    { day: 'Sunday', time: '2:00 PM – 5:00 PM', reach: 'High', color: 'bg-emerald-500/10 text-emerald-500' },
    { day: 'Friday', time: '8:00 AM – 10:00 AM', reach: 'Medium-High', color: 'bg-amber-500/10 text-amber-500' },
  ];

  return (
    <BaseModal title="Best Time to Post" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-xs text-[#561C24]/70 dark:text-beige-warm/70 leading-relaxed">
          Our algorithm processes active developer login hours on BuildTok. Post during these windows to maximize early views and boost discovery.
        </p>

        <div className="space-y-3">
          {slots.map(s => (
            <div key={s.day} className="p-4 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[#561C24] dark:text-cream">{s.day}</p>
                <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 mt-1">{s.time}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.reach} Reach</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-500 flex items-start gap-2.5 leading-normal">
          <Zap size={14} className="shrink-0 mt-0.5" />
          <span>Tip: Sharing github links and deployment URLs alongside videos increases average retention by 40%.</span>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Monetization Modal ───────────────────────────────────────────
function MonetizationModal({ projects, user, onClose }) {
  const totalViews = projects.reduce((acc, p) => acc + (p.views || 0), 0);

  const criteria = [
    { label: 'BuildTok Pro status', achieved: user.isPro, reqStr: 'Requires Pro Subscription' },
    { label: 'Published projects', achieved: projects.length >= 5, reqStr: `${projects.length}/5 projects` },
    { label: 'Total video views', achieved: totalViews >= 1000, reqStr: `${totalViews.toLocaleString()}/1,000 views` },
  ];

  const eligible = criteria.every(c => c.achieved);

  return (
    <BaseModal title="Monetization" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <Crown size={22} className="shrink-0" />
          <div>
            <p className="text-xs font-black">Creator Monetization Fund</p>
            <p className="text-[10px] opacity-80 mt-0.5">Get paid directly based on your project impressions and likes.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider">Eligibility Requirements</p>
          <div className="space-y-3.5">
            {criteria.map(c => (
              <div key={c.label} className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#561C24] dark:text-cream">{c.label}</p>
                  <p className="text-[10px] text-[#561C24]/55 font-mono">{c.reqStr}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  c.achieved ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
                }`}>
                  {c.achieved ? <Check size={12} /> : <X size={12} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={!eligible}
          className={`w-full py-3 rounded-2xl font-extrabold text-sm transition-colors text-center ${
            eligible
              ? 'bg-maroon-gradient text-cream hover:opacity-90'
              : 'bg-[#561C24]/10 dark:bg-white/05 text-[#561C24]/40 dark:text-cream/30 cursor-not-allowed border border-[#561C24]/10'
          }`}
        >
          {eligible ? 'Submit Creator Fund Application' : 'Requirements Not Yet Met'}
        </button>
      </div>
    </BaseModal>
  );
}

// ─── Two-Factor Authentication Modal ──────────────────────────────
function TwoFactorModal({ value, onClose, onConfirm }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (code.trim().length !== 6 || isNaN(code)) {
      setError('Please enter a valid 6-digit confirmation code');
      return;
    }
    onConfirm(true);
    onClose();
  };

  return (
    <BaseModal title={value ? 'Disable 2FA' : 'Enable 2-Factor Auth'} onClose={onClose}>
      <div className="space-y-5">
        {!value ? (
          <>
            <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 leading-relaxed">
              Add extra security to your BuildTok account. Authenticate using an authenticator app (Google Authenticator, Duo, etc.) beside your login passwords.
            </p>
            {/* Scan QR mockup */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#561C24]/10 mx-auto w-40 h-40">
              {/* Simple grid representing a barcode/QR mockup */}
              <div className="w-32 h-32 bg-slate-900 grid grid-cols-4 gap-1.5 p-1.5 rounded-lg opacity-85">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 5 === 1 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#561C24]/50 uppercase block">Authenticator Secret Key</label>
              <code className="block p-2 rounded-xl bg-[#561C24]/05 dark:bg-white/05 text-xs text-center select-all border border-[#561C24]/10 text-[#561C24] dark:text-cream">
                BUILD TOK SECURE KEY 2026
              </code>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#561C24]/50 uppercase block">Confirmation Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => {
                  setError('');
                  setCode(e.target.value);
                }}
                placeholder="000000"
                className="w-full text-center tracking-widest py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream focus:outline-none focus:border-[#561C24]/30"
              />
              {error && <p className="text-[10px] text-red-500">{error}</p>}
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-[#561C24] text-cream rounded-xl font-bold text-sm hover:bg-[#6D2932] transition-colors"
            >
              Verify & Enable Two-Factor
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 leading-relaxed">
              Are you sure you want to disable 2-Factor Authentication? This makes your account less secure.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#561C24]/20 text-[#561C24] dark:text-cream text-xs font-bold">
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}

// ─── Login Activity Modal ────────────────────────────────────────
function LoginActivityModal({ user, onClose, persistSettings, showToast }) {
  const list = user.securitySettings?.loginActivity || [
    { device: 'Mac OS X (Chrome)', location: 'Mumbai, India', ip: '192.168.1.1', date: new Date() }
  ];

  const handleSignOutSession = async (index) => {
    const nextList = list.filter((_, i) => i !== index);
    try {
      await persistSettings({
        securitySettings: {
          ...user.securitySettings,
          loginActivity: nextList
        }
      }, false);
      showToast('Logged out of session');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <BaseModal title="Login Activity" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2">Recent sign-ins</p>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {list.map((act, index) => (
            <div key={index} className="p-3.5 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 flex items-start justify-between gap-3">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#561C24]/08 flex items-center justify-center shrink-0 mt-0.5">
                  <Monitor size={14} className="text-[#561C24] dark:text-cream" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#561C24] dark:text-cream">{act.device}</p>
                  <p className="text-[10px] text-[#561C24]/55 dark:text-cream/55 mt-0.5">{act.location} · IP: {act.ip}</p>
                  <p className="text-[9px] text-[#561C24]/40 mt-1">{new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {index > 0 && (
                <button
                  onClick={() => handleSignOutSession(index)}
                  className="text-[10px] font-bold text-red-500 hover:underline shrink-0"
                >
                  Logout
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Saved Devices Modal ──────────────────────────────────────────
function SavedDevicesModal({ user, onClose, persistSettings, showToast }) {
  const list = user.securitySettings?.savedDevices || [
    { device: 'Mac OS X (Chrome)', lastActive: new Date() }
  ];

  const handleRemoveDevice = async (index) => {
    const nextList = list.filter((_, i) => i !== index);
    try {
      await persistSettings({
        securitySettings: {
          ...user.securitySettings,
          savedDevices: nextList
        }
      }, false);
      showToast('Device removed');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <BaseModal title="Saved Devices" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2">Trusted active devices</p>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {list.map((dev, index) => (
            <div key={index} className="p-3.5 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#561C24]/08 flex items-center justify-center shrink-0">
                  <Smartphone size={14} className="text-[#561C24] dark:text-cream" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#561C24] dark:text-cream">{dev.device}</p>
                  <p className="text-[10px] text-[#561C24]/55 dark:text-cream/55 mt-0.5">Last active: {new Date(dev.lastActive).toLocaleDateString()}</p>
                </div>
              </div>
              {index > 0 && (
                <button
                  onClick={() => handleRemoveDevice(index)}
                  className="text-[10px] font-bold text-red-500 hover:underline shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Help Center Modal ────────────────────────────────────────────
function HelpCenterModal({ onClose }) {
  const faqs = [
    { q: 'How do I edit my video or title?', a: 'Go to your profile page, find the published project, tap the three dots icon next to it, and select Edit Project to update links, tags, and descriptive text.' },
    { q: 'What dimensions should video uploads be?', a: 'BuildTok is optimized for vertical video. We recommend standard 9:16 aspect ratio files (1080x1920 pixels) up to 60 seconds duration.' },
    { q: 'How do I cancel BuildTok Pro?', a: 'Open Settings, tap the BuildTok Pro card, and hit the red Cancel button next to your active renewal date. Cancelled plans persist benefits until the end of the term.' },
    { q: 'Who can send me direct messages?', a: 'You can adjust DM rules under Settings -> Privacy -> Who Can Message. You can restrict incoming direct messaging requests to followers only or disable DMs completely.' },
  ];

  return (
    <BaseModal title="Help Center" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[10px] font-bold text-[#561C24]/50 uppercase tracking-wider mb-2">Guides & FAQs</p>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#561C24]/04 dark:bg-white/02 border border-[#561C24]/08 space-y-1.5">
              <h4 className="text-xs font-black text-[#561C24] dark:text-cream leading-snug">{f.q}</h4>
              <p className="text-xs text-[#561C24]/65 dark:text-beige-warm/65 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Report a Problem Modal ───────────────────────────────────────
function ReportProblemModal({ onClose, showToast }) {
  const [issueType, setIssueType] = useState('bug');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide details of the problem', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/support/report', { issueType, description });
      showToast('Report submitted! Thank you.');
      onClose();
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal title="Report a Problem" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#561C24]/50 uppercase block">Issue Category</label>
          <select
            value={issueType}
            onChange={e => setIssueType(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream focus:outline-none focus:border-[#561C24]/30"
          >
            <option value="bug" className="bg-[#1a0a0d] text-cream">Technical Bug / Malfunction</option>
            <option value="feed" className="bg-[#1a0a0d] text-cream">Video Upload or Feed Issue</option>
            <option value="account" className="bg-[#1a0a0d] text-cream">Account Setup & Security</option>
            <option value="billing" className="bg-[#1a0a0d] text-cream">Billing & Subscriptions</option>
            <option value="other" className="bg-[#1a0a0d] text-cream">Other Feedback</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#561C24]/50 uppercase block">Describe the issue</label>
          <textarea
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Please write details here, including any steps to reproduce the issue..."
            className="w-full p-3 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream focus:outline-none focus:border-[#561C24]/30 placeholder-[#561C24]/30 resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-maroon-gradient text-cream font-bold text-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-cream-light/30 border-t-cream-light animate-spin" />
          ) : (
            'Submit Ticket'
          )}
        </button>
      </form>
    </BaseModal>
  );
}

// ─── Legal Document Modal ─────────────────────────────────────────
function LegalModal({ title, docType, onClose }) {
  const docs = {
    terms: `By using the BuildTok application, platform, and online vertical-video services, you agree to comply with our Terms of Service. You maintain ownership of all original developer assets and source project components uploaded, while granting BuildTok a worldwide license to host, transcode, and display your short-form videos to visitors. 

Usage limits govern free account video sizes and bandwidth. Commercial usage, unauthorized reverse-engineering, scraper operations, and spam bots are strictly prohibited. We reserve the right to suspend accounts breaching public standards.`,
    privacy: `We take developer privacy seriously. BuildTok collects registration metrics (name, email, secure password hashes, optionally telephone) and engagement activities (views, comments, likes) to operate and customize the feed algorithms.

Video metadata and statistics are publicly accessible. We do not sell or monetize personal database profiles to advertising agencies. We utilize standard SSL encryption protocols, hashed cryptography, and session management tokens.`,
    guidelines: `To maintain a creative, respectful environment for creators:
- Show authentic coding, engineering, robotics, and design achievements.
- Do not upload videos showing graphical abuse, harassment, or copycat plagiarisms.
- Refrain from displaying passwords, private authorization tokens, database keys, or API credentials.
- Keep comments constructive and support other students, devs, and builders.`
  };

  return (
    <BaseModal title={title} onClose={onClose}>
      <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 whitespace-pre-wrap leading-relaxed">
        {docs[docType]}
      </p>
    </BaseModal>
  );
}

// ─── Credits Modal ───────────────────────────────────────────────
function CreditsModal({ onClose }) {
  return (
    <BaseModal title="About BuildTok" onClose={onClose}>
      <div className="space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#561C24] to-[#6D2932] flex items-center justify-center mx-auto shadow-md">
          <Terminal size={26} className="text-cream" />
        </div>
        <div>
          <h4 className="font-display font-black text-base text-[#561C24] dark:text-cream">BuildTok client application</h4>
          <p className="text-xs text-[#561C24]/50 dark:text-cream/50 mt-1">Version 1.0.0 (Production Release)</p>
        </div>

        <div className="border-t border-[#561C24]/05 pt-4 text-left space-y-3">
          <div>
            <p className="text-[10px] font-bold text-[#561C24]/55 uppercase">Tech Stack</p>
            <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 mt-1 font-semibold">
              React 19, Vite, TailwindCSS, Framer Motion, Express.js, MongoDB, Socket.io, Cloudinary
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#561C24]/55 uppercase">Mission Statement</p>
            <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 mt-1 leading-relaxed">
              Empowering engineers and builders by making short-form technical updates visible, helping creators showcase execution, get feedback, and build audience.
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Main Settings Page Component ───────────────────────────────────
export default function SettingsPage() {
  const { user: authUser, logout, loading: authLoading, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [toast, setToast] = useState(null);

  // Creator Analytics state
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Notification toggles — seeded from user data
  const [notifs, setNotifs] = useState({
    likes: authUser?.notificationSettings?.likes ?? true,
    comments: authUser?.notificationSettings?.comments ?? true,
    follows: authUser?.notificationSettings?.follows ?? true,
    trending: authUser?.notificationSettings?.trending ?? true,
    collab: authUser?.notificationSettings?.collab ?? false,
    email: authUser?.notificationSettings?.email ?? false,
    push: authUser?.notificationSettings?.push ?? true,
  });

  // Privacy toggles — seeded from user data
  const [privacy, setPrivacy] = useState({
    privateAccount: authUser?.privacySettings?.privateAccount ?? false,
    activityStatus: authUser?.privacySettings?.activityStatus ?? true,
    commentPermission: authUser?.privacySettings?.commentPermission ?? 'everyone',
    messagePermission: authUser?.privacySettings?.messagePermission ?? 'everyone',
  });

  // Security toggles — seeded from user data
  const [security, setSecurity] = useState({
    twoFactor: authUser?.securitySettings?.twoFactor ?? false,
  });

  // Keep local toggles in sync with Auth Context when changed externally
  useEffect(() => {
    if (authUser) {
      setNotifs({
        likes: authUser.notificationSettings?.likes ?? true,
        comments: authUser.notificationSettings?.comments ?? true,
        follows: authUser.notificationSettings?.follows ?? true,
        trending: authUser.notificationSettings?.trending ?? true,
        collab: authUser.notificationSettings?.collab ?? false,
        email: authUser.notificationSettings?.email ?? false,
        push: authUser.notificationSettings?.push ?? true,
      });
      setPrivacy({
        privateAccount: authUser.privacySettings?.privateAccount ?? false,
        activityStatus: authUser.privacySettings?.activityStatus ?? true,
        commentPermission: authUser.privacySettings?.commentPermission ?? 'everyone',
        messagePermission: authUser.privacySettings?.messagePermission ?? 'everyone',
      });
      setSecurity({
        twoFactor: authUser.securitySettings?.twoFactor ?? false,
      });
    }
  }, [authUser]);

  // Fetch projects for analytics once user is logged in
  useEffect(() => {
    const fetchProjects = async () => {
      if (!authUser?._id) return;
      setLoadingProjects(true);
      try {
        const res = await API.get(`/projects/feed?creator=${authUser._id}&limit=50`);
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch user projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [authUser?._id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Persist settings to backend ───────────────────────────────────
  const persistSettings = useCallback(async (patch, showMessage = true) => {
    try {
      const res = await API.put('/users/settings', patch);
      if (res.success && res.data) {
        localStorage.setItem('buildtok_user', JSON.stringify(res.data));
        setUser(res.data);
        if (showMessage) {
          showToast('Settings saved successfully!');
        }
      }
    } catch (err) {
      console.error('Failed to persist settings:', err.message);
      showToast(err.message || 'Failed to save settings', 'error');
      throw err;
    }
  }, [setUser]);

  const toggleNotif = (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    persistSettings({ notificationSettings: next });
  };

  const handlePrivacyChange = (key, value) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    persistSettings({ privacySettings: next });
  };

  const handleSecurityChange = (key, value) => {
    const next = { ...security, [key]: value };
    setSecurity(next);
    persistSettings({ securitySettings: next });
  };

  const handleLogout = () => {
    logout(() => navigate('/login', { replace: true }));
  };

  const handleAccountSaved = (updatedUser) => {
    localStorage.setItem('buildtok_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    showToast('Profile updated!');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-ambient items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#561C24]/30 border-t-[#561C24] animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  const user = authUser;

  const sections = [
    { id: 'account', label: 'Account', icon: User, color: '#561C24' },
    { id: 'privacy', label: 'Privacy', icon: Eye, color: '#561C24' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#6D2932' },
    { id: 'creator', label: 'Creator Tools', icon: BarChart2, color: '#6D2932' },
    { id: 'pro', label: 'BuildTok Pro', icon: Crown, color: '#3B82F6', badge: user.isPro ? 'ACTIVE' : '₹199/mo' },
    { id: 'security', label: 'Security', icon: Shield, color: '#561C24' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: '#6D2932' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, color: '#561C24' },
    { id: 'about', label: 'About', icon: Info, color: '#561C24' },
  ];

  if (activeSection === 'pro') {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-screen bg-ambient"
      >
        <Sidebar />
        <div className="flex-1 lg:ml-60 pt-16 pb-20 lg:pb-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-sm font-semibold text-[#561C24]/65 hover:text-[#561C24] transition-colors mb-6"
            >
              <ArrowLeft size={16} /> Back to Settings
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Crown size={18} className="text-blue-500" />
              </div>
              <h1 className="font-display font-extrabold text-3xl text-[#561C24] dark:text-cream">BuildTok Pro</h1>
            </div>
            <BuildTokProSection isPro={user.isPro} />
          </div>
        </div>
        <BottomNav />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen bg-ambient"
    >
      <Sidebar />

      <div className="flex-1 lg:ml-60 pt-16 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link to="/profile" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-[#561C24]/10 transition-colors">
              <ArrowLeft size={16} className="text-[#561C24]" />
            </Link>
            <div>
              <h1 className="font-display font-extrabold text-3xl text-[#561C24] dark:text-cream">Settings</h1>
              <p className="text-[#561C24]/60 dark:text-beige-warm/60 text-sm">Manage your BuildTok account</p>
            </div>
          </motion.div>

          {/* Profile mini card */}
          <motion.div
            className="glass rounded-3xl p-5 mb-6 flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Avatar user={user} size="xmd" ring={false} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#561C24] dark:text-cream truncate">{user.name}</span>
                {user.isPro && <ProBadge size="sm" />}
              </div>
              <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">{user.username}</span>
            </div>
            <Link to="/profile" className="btn-ghost !py-2 !px-4 text-xs shrink-0">View Profile</Link>
          </motion.div>

          {/* Section tiles (mobile-friendly overview) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {sections.map((s, i) => (
              <motion.button
                key={s.id}
                id={`settings-tile-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className="glass rounded-2xl p-4 text-left hover:bg-[#561C24]/06 dark:hover:bg-white/05 transition-colors group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${s.color}12` }}>
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
                <p className="text-xs font-bold text-[#561C24] dark:text-cream">{s.label}</p>
                {s.badge && (
                  <span className={`mt-1 inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                    s.badge === 'ACTIVE' ? 'bg-blue-500 text-white' : 'bg-[#561C24]/10 text-[#561C24]'
                  }`}>{s.badge}</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* ─── ACCOUNT ─── */}
          <Section title="Account" icon={User}>
            <SettingRow
              label="Edit Account"
              desc="Name, username, email, phone"
              icon={User}
              onClick={() => setShowEditAccount(true)}
            />
            <SettingRow label="Username" desc={user.username} icon={User} right={<span className="text-xs text-[#561C24]/50">{user.username}</span>} />
            <SettingRow
              label="Email"
              desc="Set email address"
              icon={Mail}
              right={<span className="text-xs text-[#561C24]/50">{user.email ? user.email.replace(/(.{2}).+(@.+)/, '$1••$2') : '••••@buildtok.dev'}</span>}
            />
            <SettingRow label="Phone Number" desc="Add or change your phone" icon={Phone} onClick={() => setShowEditAccount(true)} />
            <SettingRow label="Password" desc="Change your password" icon={Lock} onClick={() => setShowChangePassword(true)} />
            <SettingRow label="Account Type" desc="Personal or Creator account" icon={User} right={<span className="text-xs font-bold text-[#561C24]">Creator</span>} />
            <SettingRow label="Personal Information" desc="Birthday, gender, language" icon={Info} />
          </Section>

          {/* ─── PRIVACY ─── */}
          <Section title="Privacy" icon={Eye}>
            <SettingRow
              label="Private Account"
              desc="Only approved followers can see your projects"
              icon={Lock}
              right={<Toggle value={privacy.privateAccount} onChange={v => handlePrivacyChange('privateAccount', v)} id="toggle-private" />}
            />
            <SettingRow
              label="Activity Status"
              desc="Show when you're active"
              icon={Zap}
              right={<Toggle value={privacy.activityStatus} onChange={v => handlePrivacyChange('activityStatus', v)} id="toggle-activity" />}
            />
            <SettingRow
              label="Who Can Comment"
              desc="Choose who can comment on your posts"
              icon={MessageIcon}
              right={<PermissionSelect id="select-who-comment" value={privacy.commentPermission} onChange={v => handlePrivacyChange('commentPermission', v)} />}
            />
            <SettingRow
              label="Who Can Message"
              desc="Control direct message permissions"
              icon={MessageIcon}
              right={<PermissionSelect id="select-who-message" value={privacy.messagePermission} onChange={v => handlePrivacyChange('messagePermission', v)} />}
            />
            <SettingRow label="Blocked Accounts" desc="Manage blocked users" icon={Shield} onClick={() => setActiveSection('blocked-users')} />
            <SettingRow label="Muted Accounts" desc="Manage muted users" icon={EyeOff} onClick={() => setActiveSection('muted-users')} />
          </Section>

          {/* ─── NOTIFICATIONS ─── */}
          <Section title="Notifications" icon={Bell}>
            {[
              { key: 'likes', label: 'Likes', desc: 'When someone likes your project' },
              { key: 'comments', label: 'Comments', desc: 'When someone comments' },
              { key: 'follows', label: 'New Followers', desc: 'When someone follows you' },
              { key: 'trending', label: 'Trending Alerts', desc: 'When your project is trending' },
              { key: 'collab', label: 'Collaboration Requests', desc: 'Collab invites from creators' },
              { key: 'email', label: 'Email Notifications', desc: 'Weekly digest and updates' },
              { key: 'push', label: 'Push Notifications', desc: 'Mobile and browser alerts' },
            ].map(({ key, label, desc }) => (
              <SettingRow
                key={key}
                label={label}
                desc={desc}
                icon={Bell}
                right={<Toggle value={notifs[key]} onChange={() => toggleNotif(key)} id={`toggle-notif-${key}`} />}
              />
            ))}
          </Section>

          {/* ─── CREATOR TOOLS ─── */}
          <Section title="Creator Tools" icon={BarChart2} iconColor="#6D2932">
            <SettingRow label="Creator Dashboard" desc="Overview of your performance" icon={BarChart2} onClick={() => setActiveSection('creator-dashboard')} />
            <SettingRow label="Project Analytics" desc="Views, likes, reach per project" icon={TrendingUp} onClick={() => setActiveSection('project-analytics')} />
            <SettingRow label="Audience Insights" desc="Who's watching your content" icon={Users} onClick={() => setActiveSection('audience-insights')} />
            <SettingRow label="Content Performance" desc="Best and worst performing posts" icon={Star} onClick={() => setActiveSection('content-performance')} />
            <SettingRow label="Best Time to Post" desc="AI-powered posting schedule" icon={Zap} onClick={() => setActiveSection('best-time-post')} />
            <SettingRow
              label="Monetization"
              desc="Coming soon — earn from your projects"
              icon={Crown}
              onClick={() => setActiveSection('monetization')}
              right={<span className="text-xs font-bold text-amber-500">Soon</span>}
            />
          </Section>

          {/* ─── BUILDTOK PRO ─── */}
          <div className="glass rounded-3xl overflow-hidden mb-4">
            <motion.button
              onClick={() => setActiveSection('pro')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#561C24]/04 transition-colors"
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Crown size={16} className="text-blue-500" />
                </div>
                <span className="font-display font-bold text-sm text-[#561C24] dark:text-cream">BuildTok Pro</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  user.isPro ? 'bg-blue-500 text-white' : 'bg-[#561C24]/10 text-[#561C24]'
                }`}>
                  {user.isPro ? 'ACTIVE' : '₹199/month'}
                </span>
              </div>
              <ChevronRight size={16} className="text-[#561C24]/50" />
            </motion.button>
          </div>

          {/* ─── SECURITY ─── */}
          <Section title="Security" icon={Shield}>
            <SettingRow
              label="Two-Factor Authentication"
              desc="Add an extra layer of security"
              icon={Shield}
              right={<Toggle value={security.twoFactor} onChange={() => setActiveSection('two-factor-auth')} id="toggle-2fa" />}
            />
            <SettingRow label="Login Activity" desc="Recent sign-ins and devices" icon={Smartphone} onClick={() => setActiveSection('login-activity')} />
            <SettingRow label="Saved Devices" desc="Manage trusted devices" icon={Smartphone} onClick={() => setActiveSection('saved-devices')} />
            <SettingRow label="Change Password" desc="Update your password" icon={Lock} onClick={() => setShowChangePassword(true)} />
          </Section>

          {/* ─── APPEARANCE ─── */}
          <Section title="Appearance" icon={Palette} iconColor="#6D2932">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#561C24]/08 flex items-center justify-center">
                    {theme === 'dark' ? <Moon size={15} className="text-[#561C24] dark:text-cream" /> : <Sun size={15} className="text-[#561C24]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#561C24] dark:text-cream">Dark Mode</p>
                    <p className="text-xs text-[#561C24]/55">
                      {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                    </p>
                  </div>
                </div>
                <Toggle value={theme === 'dark'} onChange={toggleTheme} id="toggle-darkmode" />
              </div>

              {/* Theme preview */}
              <div className="flex gap-2 mb-3">
                {[
                  { label: 'Light', bg: '#E8D8C4', text: '#561C24', current: theme === 'light' },
                  { label: 'Dark', bg: '#1a0a0d', text: '#E8D8C4', current: theme === 'dark' },
                  { label: 'Auto', bg: 'linear-gradient(135deg, #E8D8C4 50%, #1a0a0d 50%)', text: '#888', current: false },
                ].map(({ label, bg, text, current }) => (
                  <motion.button
                    key={label}
                    onClick={() => {
                      if (label === 'Light' && theme === 'dark') toggleTheme();
                      if (label === 'Dark' && theme === 'light') toggleTheme();
                    }}
                    className={`flex-1 rounded-2xl h-14 flex items-end p-2 border-2 transition-all ${
                      current ? 'border-[#561C24] dark:border-cream' : 'border-transparent hover:border-[#561C24]/30'
                    }`}
                    style={{ background: bg }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: text }}>{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <SettingRow
              label="Reduce Motion"
              desc="Minimize animations for accessibility"
              icon={Zap}
              right={<Toggle value={reduceMotion} onChange={setReduceMotion} id="toggle-motion" />}
            />
          </Section>

          {/* ─── HELP ─── */}
          <Section title="Help & Support" icon={HelpCircle}>
            <SettingRow label="Help Center" desc="Guides, FAQs, tutorials" icon={HelpCircle} onClick={() => setActiveSection('help-center')} />
            <SettingRow label="Report a Problem" desc="Technical issues or bugs" icon={Info} onClick={() => setActiveSection('report-problem')} />
            <SettingRow label="Community Guidelines" desc="BuildTok's content policies" icon={Globe} onClick={() => setActiveSection('guidelines')} />
            <SettingRow label="Terms of Service" desc="Legal terms" icon={Info} onClick={() => setActiveSection('terms')} />
            <SettingRow label="Privacy Policy" desc="How we handle your data" icon={Shield} onClick={() => setActiveSection('privacy-policy')} />
          </Section>

          {/* ─── ABOUT ─── */}
          <Section title="About" icon={Info}>
            <SettingRow label="App Version" icon={Info} onClick={() => setActiveSection('app-credits')} right={<span className="text-xs text-[#561C24]/50 font-mono">v1.0.0</span>} />
            <div className="px-4 py-3">
              <p className="text-xs text-[#561C24]/65 dark:text-beige-warm/65 leading-relaxed">
                BuildTok is a premium platform where developers, designers, engineers, creators,
                and students showcase their projects through short-form vertical videos.
                Our mission: make every builder's work visible to the world.
              </p>
              <p className="text-xs text-[#561C24]/45 dark:text-beige-warm/45 mt-2">
                Made with ❤️ by the BuildTok team · © 2026 BuildTok, Inc.
              </p>
            </div>
          </Section>

          {/* ─── LOGOUT ─── */}
          <div className="glass rounded-3xl overflow-hidden mb-6">
            <SettingRow
              label="Sign Out"
              desc="Sign out of your BuildTok account"
              icon={LogOut}
              danger
              onClick={() => setShowLogout(true)}
            />
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Standard Modals */}
      <AnimatePresence>
        {showLogout && (
          <LogoutModal
            onConfirm={handleLogout}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditAccount && (
          <EditAccountModal
            user={user}
            onClose={() => setShowEditAccount(false)}
            onSaved={handleAccountSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangePassword && (
          <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
        )}
      </AnimatePresence>

      {/* Dynamic Settings Sub-Section Modals */}
      <AnimatePresence>
        {/* Blocked / Muted Accounts */}
        {(activeSection === 'blocked-users' || activeSection === 'muted-users') && (
          <RelationshipModal
            title={activeSection === 'blocked-users' ? 'Blocked Accounts' : 'Muted Accounts'}
            type={activeSection === 'blocked-users' ? 'blocked' : 'muted'}
            user={user}
            persistSettings={persistSettings}
            showToast={showToast}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Creator Dashboard */}
        {activeSection === 'creator-dashboard' && (
          <CreatorDashboardModal
            projects={projects}
            user={user}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Project Analytics */}
        {activeSection === 'project-analytics' && (
          <ProjectAnalyticsModal
            projects={projects}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Audience Insights */}
        {activeSection === 'audience-insights' && (
          <AudienceInsightsModal
            projects={projects}
            user={user}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Content Performance */}
        {activeSection === 'content-performance' && (
          <ContentPerformanceModal
            projects={projects}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Best Time to Post */}
        {activeSection === 'best-time-post' && (
          <BestTimeToPostModal
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Monetization */}
        {activeSection === 'monetization' && (
          <MonetizationModal
            projects={projects}
            user={user}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Two-Factor Authentication */}
        {activeSection === 'two-factor-auth' && (
          <TwoFactorModal
            value={security.twoFactor}
            onConfirm={v => handleSecurityChange('twoFactor', v)}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Login Activity */}
        {activeSection === 'login-activity' && (
          <LoginActivityModal
            user={user}
            persistSettings={persistSettings}
            showToast={showToast}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Saved Devices */}
        {activeSection === 'saved-devices' && (
          <SavedDevicesModal
            user={user}
            persistSettings={persistSettings}
            showToast={showToast}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Help Center */}
        {activeSection === 'help-center' && (
          <HelpCenterModal
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Report a Problem */}
        {activeSection === 'report-problem' && (
          <ReportProblemModal
            showToast={showToast}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* Guidelines, Terms, Privacy Policy */}
        {(activeSection === 'guidelines' || activeSection === 'terms' || activeSection === 'privacy-policy') && (
          <LegalModal
            title={
              activeSection === 'guidelines'
                ? 'Community Guidelines'
                : activeSection === 'terms'
                ? 'Terms of Service'
                : 'Privacy Policy'
            }
            docType={activeSection === 'guidelines' ? 'guidelines' : activeSection === 'terms' ? 'terms' : 'privacy'}
            onClose={() => setActiveSection(null)}
          />
        )}

        {/* App Credits */}
        {activeSection === 'app-credits' && (
          <CreditsModal
            onClose={() => setActiveSection(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── BuildTok Pro Section ─────────────────────────────────────────
function BuildTokProSection({ isPro }) {
  const [showFaq, setShowFaq] = useState(null);

  const proFeatures = [
    { icon: '✓', label: 'Verified blue tick badge', pro: true, free: false },
    { icon: '🚀', label: '10x reach boost', pro: true, free: false },
    { icon: '📊', label: 'Advanced analytics', pro: true, free: 'Basic' },
    { icon: '🔝', label: 'Priority in Explore', pro: true, free: false },
    { icon: '💎', label: 'Premium creator badge', pro: true, free: false },
    { icon: '💬', label: 'Priority support', pro: true, free: false },
    { icon: '📈', label: 'More project impressions', pro: 'Unlimited', free: 'Limited' },
    { icon: '🎯', label: 'Audience insights', pro: true, free: false },
  ];

  const faqs = [
    { q: 'Can I cancel anytime?', a: 'Yes! Cancel any time from your settings. Your Pro benefits continue until the end of your billing period.' },
    { q: 'What is the verification badge?', a: "A blue ✓ badge that appears next to your name everywhere on BuildTok, just like Instagram's blue tick." },
    { q: 'How does the reach boost work?', a: 'Pro projects are algorithmically prioritized and shown to 10x more users in the feed and Explore.' },
    { q: 'Is there a free trial?', a: "Yes — new Pro subscribers get a 7-day free trial. Cancel before the trial ends and you won't be charged." },
  ];

  return (
    <div className="space-y-5">
      {/* Pro card */}
      {!isPro ? (
        <motion.div
          className="relative overflow-hidden rounded-3xl p-6 bg-maroon-gradient"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/05" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/05" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <Crown size={22} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-cream-light">BuildTok Pro</h3>
                <p className="text-beige-warm/75 text-xs">Boost your creator profile and grow faster</p>
              </div>
            </div>

            <div className="flex items-end gap-1 mb-5">
              <span className="text-4xl font-extrabold text-cream-light">₹199</span>
              <span className="text-beige-warm/70 text-sm mb-1">/month</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-bold">7 days free</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {['Verified badge', '10x reach', 'Priority Explore', 'Advanced analytics'].map(f => (
                <div key={f} className="flex items-center gap-2 text-cream-light/90 text-xs">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-white" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <motion.button
              id="pro-subscribe-btn"
              className="w-full py-3.5 rounded-2xl bg-white text-[#561C24] font-extrabold text-sm hover:bg-cream-light transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial — 7 Days Free
            </motion.button>
            <p className="text-center text-beige-warm/50 text-[10px] mt-2">Then ₹199/month. Cancel anytime.</p>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/05 border border-blue-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
            <Crown size={22} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#561C24] dark:text-cream">BuildTok Pro</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">ACTIVE</span>
            </div>
            <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 mt-0.5">Renews July 17, 2026 · ₹199/month</p>
          </div>
          <button className="text-xs text-red-500 font-semibold hover:underline">Cancel</button>
        </div>
      )}

      {/* Comparison table */}
      <div className="glass rounded-3xl p-5">
        <h4 className="font-display font-bold text-sm text-[#561C24] dark:text-cream mb-4">Free vs Pro</h4>
        <div className="space-y-0 divide-y divide-[#561C24]/08">
          {proFeatures.map(({ icon, label, pro, free }) => (
            <div key={label} className="flex items-center gap-3 py-2.5">
              <span className="text-base w-6 text-center">{icon}</span>
              <span className="flex-1 text-xs font-medium text-[#561C24]/80 dark:text-beige-warm/80">{label}</span>
              <div className="flex items-center gap-5">
                <span className="w-12 text-center text-xs">
                  {free === false ? (
                    <X size={12} className="text-[#561C24]/30 mx-auto" />
                  ) : free === true ? (
                    <Check size={12} className="text-[#561C24]/60 mx-auto" />
                  ) : (
                    <span className="text-[#561C24]/60">{free}</span>
                  )}
                </span>
                <span className="w-12 text-center text-xs">
                  {pro === true ? (
                    <Check size={12} className="text-blue-500 mx-auto" />
                  ) : (
                    <span className="text-blue-500 font-bold">{pro}</span>
                  )}
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <span className="flex-1" />
            <div className="flex items-center gap-5">
              <span className="w-12 text-center text-[10px] font-bold text-[#561C24]/50">FREE</span>
              <span className="w-12 text-center text-[10px] font-bold text-blue-500">PRO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified badge preview */}
      <div className="glass rounded-3xl p-5">
        <h4 className="font-display font-bold text-sm text-[#561C24] dark:text-cream mb-3">Verification Badge Preview</h4>
        <div className="flex items-center gap-4 p-4 bg-[#561C24]/04 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-maroon-gradient flex items-center justify-center text-cream-light font-bold text-lg">Y</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#561C24] dark:text-cream">Your Name</span>
              <ProBadge size="sm" />
              <span className="px-2 py-0.5 rounded-full bg-[#561C24]/10 text-[#561C24] text-[9px] font-bold">PRO</span>
            </div>
            <span className="text-xs text-[#561C24]/60">@yourusername</span>
          </div>
        </div>
        <p className="text-xs text-[#561C24]/55 mt-3">The blue ✓ badge appears next to your name everywhere on BuildTok.</p>
      </div>

      {/* FAQ */}
      <div className="glass rounded-3xl p-5">
        <h4 className="font-display font-bold text-sm text-[#561C24] dark:text-cream mb-3">FAQ</h4>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="border border-[#561C24]/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowFaq(showFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#561C24]/04 transition-colors"
              >
                <span className="text-sm font-semibold text-[#561C24] dark:text-cream">{f.q}</span>
                <motion.div animate={{ rotate: showFaq === i ? 180 : 0 }}>
                  <ChevronDown size={14} className="text-[#561C24]/50 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showFaq === i && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 text-xs text-[#561C24]/70 dark:text-beige-warm/70 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Logout modal ─────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        className="relative glass rounded-3xl p-7 max-w-sm w-full text-center"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <LogOut size={28} className="text-red-500" />
        </div>
        <h3 className="font-display font-extrabold text-xl text-[#561C24] dark:text-cream mb-2">Sign Out?</h3>
        <p className="text-[#561C24]/65 dark:text-beige-warm/65 text-sm mb-6">
          You'll need to sign in again to access BuildTok.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-ghost !py-3"
          >
            Cancel
          </button>
          <motion.button
            id="confirm-logout-btn"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            Sign Out
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Edit Account Modal ───────────────────────────────────────────
function EditAccountModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name || '',
    username: (user.username || '').replace('@', ''),
    email: user.email || '',
    phone: user.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await API.put('/users/settings', form);
      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass rounded-3xl p-6 max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-extrabold text-lg text-[#561C24] dark:text-cream">Edit Account</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#561C24]/08 flex items-center justify-center">
            <X size={14} className="text-[#561C24]" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your full name' },
            { label: 'Username', key: 'username', icon: User, placeholder: 'yourusername' },
            { label: 'Email', key: 'email', icon: Mail, placeholder: 'you@email.com', type: 'email' },
            { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+91 98765 43210', type: 'tel' },
          ].map(({ label, key, icon: Icon, placeholder, type = 'text' }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-[#561C24]/70 dark:text-beige-warm/70 mb-1 block">{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#561C24]/40" />
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream placeholder-[#561C24]/30 focus:outline-none focus:border-[#561C24]/30 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 btn-ghost !py-2.5 text-sm">Cancel</button>
          <motion.button
            id="save-account-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-maroon-gradient text-cream-light font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-cream-light/30 border-t-cream-light animate-spin" />
            ) : (
              <><Save size={14} /> Save</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSave = async () => {
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await API.put('/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(onClose, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative glass rounded-3xl p-6 max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-extrabold text-lg text-[#561C24] dark:text-cream">Change Password</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#561C24]/08 flex items-center justify-center">
            <X size={14} className="text-[#561C24]" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-green-500" />
            </div>
            <p className="font-semibold text-[#561C24] dark:text-cream">Password changed!</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Current password */}
              <div>
                <label className="text-xs font-semibold text-[#561C24]/70 dark:text-beige-warm/70 mb-1 block">Current Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#561C24]/40" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream placeholder-[#561C24]/30 focus:outline-none focus:border-[#561C24]/30 transition-colors"
                  />
                  <button onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561C24]/40">
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-xs font-semibold text-[#561C24]/70 dark:text-beige-warm/70 mb-1 block">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#561C24]/40" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Min. 8 characters"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream placeholder-[#561C24]/30 focus:outline-none focus:border-[#561C24]/30 transition-colors"
                  />
                  <button onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561C24]/40">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold text-[#561C24]/70 dark:text-beige-warm/70 mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#561C24]/40" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#561C24]/05 dark:bg-white/05 border border-[#561C24]/10 text-sm text-[#561C24] dark:text-cream placeholder-[#561C24]/30 focus:outline-none focus:border-[#561C24]/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 btn-ghost !py-2.5 text-sm">Cancel</button>
              <motion.button
                id="save-password-btn"
                onClick={handleSave}
                disabled={saving || !form.currentPassword || !form.newPassword}
                className="flex-1 py-2.5 rounded-xl bg-maroon-gradient text-cream-light font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-cream-light/30 border-t-cream-light animate-spin" />
                ) : (
                  'Update Password'
                )}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// placeholder for message icon used above
function MessageIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
