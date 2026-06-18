import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft, User, Lock, Bell, Zap, Shield, Palette, HelpCircle, Info,
  LogOut, ChevronRight, ChevronDown, Moon, Sun, Eye, EyeOff,
  Check, X, Crown, BarChart2, TrendingUp, Users, Star,
  Smartphone, Globe, Mail, Phone, Settings, Save, AlertCircle,
} from 'lucide-react';
import { motion as m } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import ProBadge from '../components/ui/ProBadge';
import Avatar from '../components/ui/Avatar';
import { pageVariants, fadeUpVariants } from '../utils/animations';
import API from '../services/api';

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
      <div className="shrink-0">
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

// ─── Main Settings Page ───────────────────────────────────────────
export default function SettingsPage() {
  const { user: authUser, logout, loading: authLoading, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  const [activeSection, setActiveSection] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification toggles — seeded from user data
  const [notifs, setNotifs] = useState({
    likes: user.notificationSettings?.likes ?? true,
    comments: user.notificationSettings?.comments ?? true,
    follows: user.notificationSettings?.follows ?? true,
    trending: user.notificationSettings?.trending ?? true,
    collab: user.notificationSettings?.collab ?? false,
    email: user.notificationSettings?.email ?? false,
    push: user.notificationSettings?.push ?? true,
  });

  // Privacy toggles — seeded from user data
  const [privacy, setPrivacy] = useState({
    privateAccount: user.privacySettings?.privateAccount ?? false,
    activityStatus: user.privacySettings?.activityStatus ?? true,
  });

  // Security toggles — seeded from user data
  const [security, setSecurity] = useState({
    twoFactor: user.securitySettings?.twoFactor ?? false,
  });

  // ── Persist settings to backend ───────────────────────────────────
  const persistSettings = useCallback(async (patch) => {
    try {
      const res = await API.put('/users/settings', patch);
      if (res.success && res.data) {
        // Sync updated user into AuthContext
        localStorage.setItem('buildtok_user', JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to persist settings:', err.message);
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
  };

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
            <SettingRow label="Who Can Comment" desc="Everyone, followers, nobody" icon={MessageIcon} right={<span className="text-xs text-[#561C24]/50">Everyone</span>} />
            <SettingRow label="Who Can Message" desc="Control DM permissions" icon={MessageIcon} right={<span className="text-xs text-[#561C24]/50">Everyone</span>} />
            <SettingRow label="Blocked Accounts" desc="Manage blocked users" icon={Shield} />
            <SettingRow label="Muted Accounts" desc="Manage muted users" icon={EyeOff} />
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
            <SettingRow label="Creator Dashboard" desc="Overview of your performance" icon={BarChart2} />
            <SettingRow label="Project Analytics" desc="Views, likes, reach per project" icon={TrendingUp} />
            <SettingRow label="Audience Insights" desc="Who's watching your content" icon={Users} />
            <SettingRow label="Content Performance" desc="Best and worst performing posts" icon={Star} />
            <SettingRow label="Best Time to Post" desc="AI-powered posting schedule" icon={Zap} />
            <SettingRow
              label="Monetization"
              desc="Coming soon — earn from your projects"
              icon={Crown}
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
              right={<Toggle value={security.twoFactor} onChange={v => handleSecurityChange('twoFactor', v)} id="toggle-2fa" />}
            />
            <SettingRow label="Login Activity" desc="Recent sign-ins and devices" icon={Smartphone} />
            <SettingRow label="Saved Devices" desc="Manage trusted devices" icon={Smartphone} />
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
                  { label: 'Light', bg: '#E8D8C4', text: '#561C24' },
                  { label: 'Dark', bg: '#1a0a0d', text: '#E8D8C4' },
                  { label: 'Auto', bg: 'linear-gradient(135deg, #E8D8C4 50%, #1a0a0d 50%)', text: '#888' },
                ].map(({ label, bg, text }) => (
                  <motion.button
                    key={label}
                    className="flex-1 rounded-2xl h-14 flex items-end p-2 border-2 border-transparent hover:border-[#561C24]/30 transition-all"
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
            <SettingRow label="Help Center" desc="Guides, FAQs, tutorials" icon={HelpCircle} />
            <SettingRow label="Report a Problem" desc="Technical issues or bugs" icon={Info} />
            <SettingRow label="Community Guidelines" desc="BuildTok's content policies" icon={Globe} />
            <SettingRow label="Terms of Service" desc="Legal terms" icon={Info} />
            <SettingRow label="Privacy Policy" desc="How we handle your data" icon={Shield} />
          </Section>

          {/* ─── ABOUT ─── */}
          <Section title="About" icon={Info}>
            <SettingRow label="App Version" icon={Info} right={<span className="text-xs text-[#561C24]/50 font-mono">v1.0.0</span>} />
            <div className="px-4 py-3">
              <p className="text-xs text-[#561C24]/65 dark:text-beige-warm/65 leading-relaxed">
                BuildTok is a premium platform where developers, designers, engineers, creators,
                and students showcase their projects through short-form vertical videos.
                Our mission: make every builder's work visible to the world.
              </p>
              <p className="text-xs text-[#561C24]/45 dark:text-beige-warm/45 mt-2">
                Made with ❤️ by the BuildTok team · © 2025 BuildTok, Inc.
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

      {/* Modals */}
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
