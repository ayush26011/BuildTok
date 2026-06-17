import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Grid, Play, MapPin, Globe, GitBranch, CheckCircle, Settings, Award, TrendingUp, Heart, Eye } from 'lucide-react';
import { mockUsers, mockProjects } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { pageVariants, fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../utils/animations';
import { use3DTilt } from '../hooks/use3DTilt';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
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
}

function ProjectMiniCard({ project }) {
  const { tiltRef, tiltStyle, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 6 });
  const [liked, setLiked] = useState(project.likedByUser);

  return (
    <div
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="glass rounded-2xl overflow-hidden cursor-pointer group tilt-card"
      style={tiltStyle}
    >
      <div className="h-36 relative" style={{ background: project.gradient }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <Play size={24} className="text-white" fill="white" />
        </div>
        <div className="absolute top-2 right-2 text-[10px] font-bold text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {project.category}
        </div>
      </div>
      <div className="p-3">
        <p className="font-bold text-xs text-[#561C24] dark:text-cream truncate">{project.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex flex-wrap gap-1">
            {project.tech.slice(0, 2).map(t => (
              <span key={t} className="tech-tag text-[9px]">{t}</span>
            ))}
          </div>
          <button onClick={() => setLiked(l => !l)} className="text-[#561C24]/50 hover:text-red-500 transition-colors">
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-red-500' : ''} />
          </button>
        </div>
      </div>
    </div>
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

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const user = authUser || mockUsers[0]; // Show demo profile if not logged in
  const [activeTab, setActiveTab] = useState('grid');
  const [following, setFollowing] = useState(false);
  const userProjects = mockProjects.filter((_, i) => i % 2 === 0); // Demo: half projects

  const fmt = (n) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : n;

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
          {authUser && (
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
                  <Badge label={user.badge} variant="achievement" />
                </div>
                <p className="text-[#561C24]/65 dark:text-beige-warm/65 text-sm">{user.username}</p>
              </motion.div>
            </div>

            <div className="flex gap-2 sm:mt-12">
              {authUser?.id === user.id ? (
                <button className="btn-ghost !py-2 !px-6 text-sm">Edit Profile</button>
              ) : (
                <>
                  <motion.button
                    onClick={() => setFollowing(f => !f)}
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
              {user.skills.map(skill => (
                <span key={skill} className="tech-tag">{skill}</span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Projects" value={user.projects} icon={Play} />
            <StatCard label="Followers" value={user.followers} icon={TrendingUp} />
            <StatCard label="Following" value={user.following} />
            <StatCard label="Total Likes" value={user.totalLikes} icon={Heart} />
          </div>

          {/* Achievements */}
          <div className="glass rounded-3xl p-5 mb-6">
            <h2 className="font-display font-bold text-base text-[#561C24] dark:text-cream mb-4 flex items-center gap-2">
              <Award size={16} className="text-[#561C24]" />
              Achievements
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {ACHIEVEMENTS.map((a, i) => (
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
                    <motion.div key={p.id} variants={scaleInVariants} custom={i} initial="hidden" animate="visible">
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
                      key={p.id}
                      variants={scaleInVariants}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                    >
                      <div
                        className="h-60 rounded-3xl relative overflow-hidden cursor-pointer group"
                        style={{ background: p.gradient }}
                      >
                        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60">
                          <div>
                            <p className="font-bold text-white text-sm">{p.title}</p>
                            <p className="text-white/70 text-xs">{p.creator.username}</p>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-[10px] text-white font-semibold">
                          <Eye size={9} />
                          {fmt(p.views)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
