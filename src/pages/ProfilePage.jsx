import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { Grid, Play, MapPin, Globe, GitBranch, CheckCircle, Settings, Award, TrendingUp, Heart, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import ProBadge from '../components/ui/ProBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { pageVariants, fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../utils/animations';
import { use3DTilt } from '../hooks/use3DTilt';

const getGradient = (p) => {
  if (p.gradient) return p.gradient;
  const gradients = [
    'linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A45 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    'linear-gradient(135deg, #1d2671 0%, #c33764 100%)',
    'linear-gradient(135deg, #093028 0%, #237a57 100%)',
    'linear-gradient(135deg, #2c1654 0%, #7928ca 50%, #ff0080 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d1b1b 100%)',
    'linear-gradient(135deg, #0d0d0d 0%, #1a0533 50%, #2d0b00 100%)',
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  ];
  const id = p._id || p.id || '1';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

function StatCard({ label, value, icon: Icon, to }) {
  const content = (
    <div className="glass rounded-2xl p-4 text-center h-full flex flex-col justify-center select-none">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {Icon && <Icon size={14} className="text-[#561C24]/60" />}
        <span className="font-extrabold text-xl text-[#561C24] dark:text-cream">
          {typeof value === 'number' && value >= 1000
            ? value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : `${(value/1000).toFixed(1)}K`
            : value}
        </span>
      </div>
      <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 font-semibold">{label}</p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block transition-transform hover:scale-105 active:scale-95 duration-200">
        {content}
      </Link>
    );
  }

  return content;
}

function ProjectMiniCard({ project }) {
  const { tiltRef, tiltStyle, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 6 });
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const videoSrc = typeof project.videoUrl === 'string' ? project.videoUrl : project.videoUrl?.url;
  const hasVideo = !!videoSrc;

  useEffect(() => {
    if (project && user) {
      setLiked(project.likes?.includes(user._id || user.id) || false);
    }
  }, [project, user]);

  useEffect(() => {
    if (!videoRef.current || !hasVideo) return;
    if (isHovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, hasVideo]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to like.');
      return;
    }
    try {
      const res = await projectService.toggleLike(project._id || project.id);
      if (res.success) {
        setLiked(res.liked);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const techList = project.techStack || project.tech || [];

  return (
    <Link to={`/project/${project._id || project.id}`}>
      <div
        ref={tiltRef}
        onMouseMove={(e) => { onMouseMove(e); }}
        onMouseLeave={(e) => { onMouseLeave(e); setIsHovered(false); }}
        onMouseEnter={() => setIsHovered(true)}
        className="glass rounded-2xl overflow-hidden cursor-pointer group tilt-card"
        style={tiltStyle}
      >
        <div className="h-36 relative bg-black overflow-hidden">
          {hasVideo ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0" style={{ background: getGradient(project) }} />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
            <Play size={24} className="text-white" fill="white" />
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full z-10">
            {project.category}
          </div>
        </div>
        <div className="p-3">
          <p className="font-bold text-xs text-[#561C24] dark:text-cream truncate">{project.title}</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex flex-wrap gap-1">
              {techList.slice(0, 2).map(t => (
                <span key={t} className="tech-tag text-[9px]">{t}</span>
              ))}
            </div>
            <button onClick={handleLike} className="text-[#561C24]/50 hover:text-red-500 transition-colors">
              <Heart size={13} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ReelMiniCard({ project, username }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const videoSrc = typeof project.videoUrl === 'string' ? project.videoUrl : project.videoUrl?.url;
  const hasVideo = !!videoSrc;

  useEffect(() => {
    if (!videoRef.current || !hasVideo) return;
    if (isHovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, hasVideo]);

  const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n;

  return (
    <Link to={`/project/${project._id || project.id}`}>
      <div
        className="h-60 rounded-3xl relative overflow-hidden cursor-pointer group bg-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
          />
        ) : (
          <div className="absolute inset-0" style={{ background: getGradient(project) }} />
        )}
        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 z-10">
          <div>
            <p className="font-bold text-white text-sm truncate max-w-[150px]">{project.title}</p>
            <p className="text-white/70 text-xs">@{username}</p>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] text-white font-semibold z-10">
          <Eye size={9} />
          {fmt(project.views || 0)}
        </div>
      </div>
    </Link>
  );
}

const ACHIEVEMENTS = [
  { icon: '🚀', label: 'First Launch', desc: 'Published first project' },
  { icon: '🔥', label: 'On Fire', desc: '10K+ likes received' },
  { icon: '⭐', label: 'Top Creator', desc: 'Featured by BuildTok' },
  { icon: '🌍', label: 'Global Reach', desc: '50+ countries' },
  { icon: '💎', label: 'Diamond Builder', desc: '50+ projects uploaded' },
  { icon: '🤝', label: 'Connector', desc: '1K+ followers' },
];

function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [skills, setSkills] = useState(Array.isArray(user.skills) ? user.skills.join(', ') : '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [github, setGithub] = useState(user.github || '');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar?.url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('username', username.trim().toLowerCase());
      formData.append('bio', bio.trim());
      formData.append('skills', skills);
      formData.append('location', location.trim());
      formData.append('website', website.trim());
      formData.append('github', github.trim());

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await userService.updateProfile(formData);
      if (res.success && res.data) {
        onSave(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal box */}
      <motion.div
        className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-extrabold text-2xl text-[#561C24] dark:text-cream">Edit Profile</h2>
          <button onClick={onClose} className="text-[#561C24]/60 hover:text-[#561C24] dark:text-cream/60 dark:hover:text-cream"><X size={18} /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="relative group cursor-pointer w-20 h-20 rounded-full overflow-hidden border border-white/20">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#561C24]/10 flex items-center justify-center text-[#561C24]/50">📸</div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <span className="text-[10px] text-[#561C24]/60 dark:text-beige-warm/60">Click image to upload</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="input-premium py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required className="input-premium py-2 text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} className="input-premium py-2 text-xs resize-none" placeholder="Describe who you are..." />
            <p className="text-[9px] text-[#561C24]/40 mt-0.5 text-right">{bio.length}/300</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Skills (comma separated)</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input-premium py-2 text-xs" placeholder="e.g. React, Node.js, Python" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-premium py-2 text-xs" placeholder="e.g. London, UK" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">Website URL</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input-premium py-2 text-xs" placeholder="e.g. https://myportfolio.dev" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-1">GitHub Username</label>
            <input value={github} onChange={(e) => setGithub(e.target.value)} className="input-premium py-2 text-xs" placeholder="e.g. github_username" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 btn-ghost py-2 text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-2 text-xs">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const targetId = searchParams.get('id') || authUser?._id || authUser?.id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    let active = true;
    const loadProfileData = async () => {
      try {
        setLoading(true);
        // Load user profile details
        const uRes = await userService.getUserById(targetId);
        if (active && uRes.success) {
          setProfileUser(uRes.data);
          
          // Check follow status
          if (authUser) {
            const isFollowing = authUser.following?.some(
              f => (f._id || f) === targetId
            );
            setFollowing(!!isFollowing);
          }
        }

        // Load user projects
        const pRes = await projectService.getFeed({ creator: targetId });
        if (active && pRes.success) {
          setUserProjects(pRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfileData();
    return () => { active = false; };
  }, [targetId, authUser]);

  const handleFollow = async () => {
    if (!authUser) {
      alert('Please log in to follow creators.');
      return;
    }
    try {
      const res = await userService.followUser(targetId);
      if (res.success) {
        setFollowing(res.following);
        // Sync context
        const updatedFollowing = res.following
          ? [...(authUser.following || []), targetId]
          : (authUser.following || []).filter(id => (id._id || id) !== targetId);
        setAuthUser({ ...authUser, following: updatedFollowing });

        // Update profile followers count locally
        setProfileUser(prev => {
          if (!prev) return prev;
          const followersList = prev.followers || [];
          const updatedFollowers = res.following
            ? [...followersList, authUser._id]
            : followersList.filter(id => id !== authUser._id);
          return {
            ...prev,
            followers: updatedFollowers,
            followersCount: updatedFollowers.length
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    }
  };

  const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 pt-16 px-6 max-w-5xl mx-auto flex flex-col justify-center">
          <SkeletonLoader type="profile" />
          <div className="mt-8">
            <SkeletonLoader type="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (!targetId) {
    return <Navigate to="/login" replace />;
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 flex flex-col items-center justify-center p-6 gap-3">
          <p className="text-white/60">Creator profile not found</p>
          <Link to="/" className="text-[#561C24] font-semibold underline">Back to Feed</Link>
        </div>
      </div>
    );
  }

  const user = profileUser;
  const isSelf = authUser?._id === user._id || authUser?.id === user._id || authUser?.id === user.id;
  const followersCount = user.followersCount || user.followers?.length || 0;
  const followingCount = user.followingCount || user.following?.length || 0;
  const totalLikes = userProjects.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

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
        {/* Hero header with parallax */}
        <div className="relative h-52 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-maroon-gradient"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated pattern */}
            <div className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.5) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)',
              }}
            />
            {/* Floating shapes */}
            {[1,2,3,4].map(i => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/10"
                style={{
                  width: 60 + i * 40,
                  height: 60 + i * 40,
                  top: `${10 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
              />
            ))}
          </motion.div>

          {/* Edit/Settings */}
          {isSelf && (
            <Link to="/settings" className="absolute top-4 right-4 z-10">
              <button className="w-9 h-9 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition-colors">
                <Settings size={16} className="text-white" />
              </button>
            </Link>
          )}
        </div>

        <div className="px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Profile row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-6 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Avatar user={user} size="2xl" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display font-extrabold text-2xl text-[#561C24] dark:text-cream">{user.name}</h1>
                  {user.verified && <CheckCircle size={18} className="text-[#561C24]" fill="rgba(86,28,36,0.15)" />}
                  {user.isPro && <ProBadge size="md" />}
                  {user.badge && <Badge label={user.badge} variant="achievement" />}
                </div>
                <p className="text-[#561C24]/65 dark:text-beige-warm/65 text-sm">@{user.username}</p>
              </motion.div>
            </div>

            <div className="flex gap-2 sm:mt-12">
              {isSelf ? (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="btn-ghost !py-2 !px-6 text-sm flex items-center justify-center font-bold"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <motion.button
                    onClick={handleFollow}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      following ? 'glass text-[#561C24] dark:text-cream border border-[#561C24]/20' : 'btn-primary'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    id="profile-follow-btn"
                  >
                    {following ? '✓ Following' : '+ Follow'}
                  </motion.button>
                  <button className="btn-ghost !py-2 !px-5 text-sm">Message</button>
                </>
              )}
            </div>
          </div>

          {/* Bio & info */}
          <motion.div
            className="mb-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-[#561C24]/80 dark:text-beige-warm/80 text-sm leading-relaxed max-w-2xl">{user.bio}</p>
            <div className="flex flex-wrap gap-4 text-xs text-[#561C24]/65 dark:text-beige-warm/65">
              {user.location && <span className="flex items-center gap-1"><MapPin size={12} />{user.location}</span>}
              {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#561C24] transition-colors"><Globe size={12} />{user.website}</a>}
              {user.github && <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#561C24] transition-colors"><GitBranch size={12} />github.com/{user.github}</a>}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {user.skills && user.skills.map(skill => (
                <span key={skill} className="tech-tag">{skill}</span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            <StatCard label="Projects" value={userProjects.length} icon={Play} />
            <StatCard label="Followers" value={followersCount} icon={TrendingUp} to={`/profile/followers?id=${user._id}`} />
            <StatCard label="Following" value={followingCount} to={`/profile/following?id=${user._id}`} />
            <StatCard label="Total Likes" value={totalLikes} icon={Heart} />
            <StatCard label="Total Views" value={userProjects.reduce((acc, p) => acc + (p.views || 0), 0)} icon={Eye} />
          </div>

          {/* Achievements */}
          <div className="glass rounded-3xl p-5 mb-6">
            <h2 className="font-display font-bold text-base text-[#561C24] dark:text-cream mb-4 flex items-center gap-2">
              <Award size={16} className="text-[#561C24]" />
              Achievements
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((a) => (
                <motion.div
                  key={a.label}
                  className="text-center p-2.5 rounded-2xl bg-[#561C24]/05 group cursor-pointer hover:bg-[#561C24]/10 transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  title={a.desc}
                >
                  <span className="text-2xl block mb-1">{a.icon}</span>
                  <p className="text-[9px] font-bold text-[#561C24] dark:text-cream leading-tight">{a.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Projects tabs */}
          <div>
            <div className="flex items-center gap-1 mb-6 glass rounded-2xl p-1 w-fit">
              {[
                { id: 'grid', icon: Grid, label: 'Grid' },
                { id: 'reel', icon: Play, label: 'Reels' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  id={`profile-tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-maroon-gradient text-cream-light shadow-maroon'
                      : 'text-[#561C24]/65 hover:text-[#561C24]'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {userProjects.map((p, i) => (
                    <motion.div key={p._id || p.id} variants={scaleInVariants} custom={i} initial="hidden" animate="visible">
                      <ProjectMiniCard project={p} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="reel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {userProjects.map((p, i) => (
                    <motion.div
                      key={p._id || p.id}
                      variants={scaleInVariants}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                    >
                      <ReelMiniCard project={p} username={user.username} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            user={user}
            onSave={(updatedUser) => {
              setProfileUser(updatedUser);
              setAuthUser(updatedUser);
              localStorage.setItem('buildtok_user', JSON.stringify(updatedUser));
            }}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </motion.div>
  );
}
