import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, X, TrendingUp, Heart, MessageCircle, Bookmark, CheckCircle, ExternalLink, GitBranch } from 'lucide-react';
import { TRENDING_CATEGORIES } from '../data/mockData';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Avatar from '../components/ui/Avatar';
import ProBadge from '../components/ui/ProBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { pageVariants, fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../utils/animations';

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

function ProjectGrid({ projects }) {
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project, i) => {
        const techList = project.techStack || project.tech || [];
        return (
          <motion.div
            key={project._id || project.id}
            variants={scaleInVariants}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            <Link to={`/project/${project._id || project.id}`}>
              <motion.div
                className="glass rounded-3xl overflow-hidden group cursor-pointer"
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              >
                <div className="h-40 relative" style={{ background: getGradient(project) }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                    </div>
                  </div>
                  {project.trending && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold">
                      <TrendingUp size={9} /> Trending
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-semibold">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#561C24] dark:text-cream">{project.title}</h3>
                    <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 line-clamp-2 mt-0.5">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {techList.slice(0, 3).map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <Link to={`/profile?id=${project.creator?._id || project.creator?.id}`} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Avatar user={project.creator} size="xs" ring={false} />
                      <span className="text-xs font-semibold text-[#561C24] dark:text-cream">{project.creator?.name}</span>
                    </Link>
                    <div className="flex items-center gap-3 text-[#561C24]/60">
                      <span className="flex items-center gap-1 text-xs">
                        <Heart size={11} className={project.likes?.length > 0 ? 'text-red-500' : ''} fill={project.likes?.length > 0 ? 'currentColor' : 'none'} />
                        {fmt(project.likes?.length || project.likesCount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function CreatorRow({ user }) {
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (currentUser && user) {
      const isFollowing = currentUser.following?.some(
        f => (f._id || f) === (user._id || user.id)
      );
      setFollowing(!!isFollowing);
    }
  }, [user, currentUser]);

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to follow creators.');
      return;
    }
    const creatorId = user._id || user.id;
    if (creatorId === (currentUser._id || currentUser.id)) {
      return;
    }
    try {
      const res = await userService.followUser(creatorId);
      if (res.success) {
        setFollowing(res.following);
        const updatedFollowing = res.following
          ? [...(currentUser.following || []), creatorId]
          : (currentUser.following || []).filter(id => (id._id || id) !== creatorId);
        setCurrentUser({ ...currentUser, following: updatedFollowing });
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  const getMutualsCount = () => {
    if (!currentUser || !user) return 0;
    const currentFollowingIds = (currentUser.following || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    const listedFollowerIds = (user.followers || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    const intersect = currentFollowingIds.filter(id => listedFollowerIds.includes(id));
    return intersect.length;
  };

  const followsYou = () => {
    if (!currentUser || !user) return false;
    const currentId = currentUser._id || currentUser.id;
    const listedFollowingIds = (user.following || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    return listedFollowingIds.includes(currentId);
  };

  const isSelf = currentUser?._id === user._id || currentUser?.id === user._id || currentUser?.id === user.id;
  const showFollowBack = followsYou() && !following && !isSelf;
  const mutualsCount = getMutualsCount();

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#561C24]/05 transition-colors">
      <Link to={`/profile?id=${user._id || user.id}`}>
        <Avatar user={user} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile?id=${user._id || user.id}`} className="hover:underline flex items-center gap-1">
          <span className="font-bold text-sm text-[#561C24] dark:text-cream truncate">{user.name}</span>
          {user.verified && <CheckCircle size={12} className="text-[#561C24] shrink-0" />}
          {user.isPro && <ProBadge size="xs" />}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">@{user.username}</span>
          {showFollowBack && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#561C24]/10 text-[#561C24] dark:text-cream font-bold shrink-0">
              Follows you
            </span>
          )}
        </div>
        {mutualsCount > 0 && (
          <p className="text-[10px] text-[#561C24]/40 dark:text-beige-warm/40 font-semibold mt-1">
            {mutualsCount} mutual follower{mutualsCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
      {!isSelf && currentUser && (
        <motion.button
          onClick={handleFollow}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            following ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream' : 'bg-maroon-gradient text-cream-light'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {following ? '✓' : showFollowBack ? 'Follow Back' : 'Follow'}
        </motion.button>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [projects, setProjects] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  // Load feed based on selected category
  useEffect(() => {
    let active = true;
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const params = {};
        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        const response = await projectService.getFeed(params);
        if (active && response.success) {
          setProjects(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch projects feed:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFeed();
    return () => {
      active = false;
    };
  }, [activeCategory]);

  // Search creators debounced
  useEffect(() => {
    if (!query || query.length < 2) {
      setCreators([]);
      return;
    }
    let active = true;
    const delayDebounce = setTimeout(async () => {
      try {
        const uRes = await userService.searchUsers(query);
        if (active && uRes.success) {
          setCreators(uRes.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [query]);

  // Filter projects locally by search query
  const displayedProjects = projects.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    const techList = p.techStack || p.tech || [];
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      techList.some(t => t.toLowerCase().includes(q)) ||
      p.creator?.name?.toLowerCase().includes(q)
    );
  });

  // Display unique creators from feed projects if no query search results
  const topCreators = creators.length > 0 ? creators : Array.from(
    new Map(projects.map(p => [p.creator?._id || p.creator?.id, p.creator])).values()
  ).filter(Boolean).slice(0, 5);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <motion.h1 variants={fadeUpVariants} custom={0}
              className="font-display font-extrabold text-4xl text-[#561C24] dark:text-cream mb-1">
              Explore
            </motion.h1>
            <motion.p variants={fadeUpVariants} custom={1}
              className="text-[#561C24]/65 dark:text-beige-warm/65">
              Discover projects, creators, and technologies
            </motion.p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="relative mb-6"
            animate={{ scale: searchFocused ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`flex items-center gap-3 glass rounded-2xl px-4 py-3.5 transition-all duration-300 ${
              searchFocused ? 'shadow-maroon-lg ring-2 ring-[#561C24]/20' : ''
            }`}>
              <Search size={18} className="text-[#561C24]/60 shrink-0" />
              <input
                ref={inputRef}
                id="explore-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search projects, creators, technologies..."
                className="flex-1 bg-transparent outline-none text-[#561C24] dark:text-cream placeholder-[#561C24]/40 dark:placeholder-beige-warm/40 text-sm font-medium"
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setQuery('')}
                    className="text-[#561C24]/50 hover:text-[#561C24] transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
            {TRENDING_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                id={`explore-cat-${cat.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-maroon-gradient text-cream-light shadow-maroon'
                    : 'glass text-[#561C24]/75 dark:text-beige-warm/75 hover:bg-[#561C24]/08'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Projects Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-[#561C24] dark:text-cream">
                  {displayedProjects.length} {query || activeCategory !== 'all' ? 'Results' : 'Projects'}
                </h2>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <SkeletonLoader type="card" count={3} />
                </div>
              ) : displayedProjects.length > 0 ? (
                <ProjectGrid projects={displayedProjects} />
              ) : (
                <div className="text-center py-20 glass rounded-3xl">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="font-bold text-lg text-[#561C24] dark:text-cream mb-2">No results found</p>
                  <p className="text-[#561C24]/60 dark:text-beige-warm/60 text-sm">Try a different search term or category</p>
                </div>
              )}
            </div>

            {/* Sidebar — creators & tags */}
            <div className="space-y-4">
              <div className="glass rounded-3xl p-5">
                <h3 className="font-display font-bold text-base text-[#561C24] dark:text-cream mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#561C24]" />
                  Active Creators
                </h3>
                <div className="space-y-1">
                  {topCreators.map(user => (
                    <CreatorRow key={user._id || user.id} user={user} />
                  ))}
                  {topCreators.length === 0 && (
                    <p className="text-xs text-white/40 text-center py-4">No creators found</p>
                  )}
                </div>
              </div>

              <div className="glass rounded-3xl p-5">
                <h3 className="font-display font-bold text-sm text-[#561C24] dark:text-cream mb-3">
                  🔥 Trending Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['#React', '#AI', '#OpenSource', '#WebDev', '#TypeScript', '#Rust', '#Figma', '#SwiftUI', '#Solidity'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag.slice(1))}
                      className="tech-tag cursor-pointer hover:bg-[#561C24]/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
