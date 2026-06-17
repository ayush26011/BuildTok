import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, X, TrendingUp, Heart, MessageCircle, Bookmark, CheckCircle, ExternalLink, GitBranch } from 'lucide-react';
import { mockProjects, mockUsers, TRENDING_CATEGORIES } from '../data/mockData';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Avatar from '../components/ui/Avatar';
import { pageVariants, fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../utils/animations';

function ProjectGrid({ projects }) {
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          variants={scaleInVariants}
          custom={i}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="glass rounded-3xl overflow-hidden group cursor-pointer"
            whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
          >
            <div className="h-40 relative" style={{ background: project.gradient }}>
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
                {project.tech.slice(0, 3).map(t => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <Link to="/profile" className="flex items-center gap-2">
                  <Avatar user={project.creator} size="xs" ring={false} />
                  <span className="text-xs font-semibold text-[#561C24] dark:text-cream">{project.creator.name}</span>
                </Link>
                <div className="flex items-center gap-3 text-[#561C24]/60">
                  <span className="flex items-center gap-1 text-xs"><Heart size={11} fill={project.likedByUser ? 'currentColor' : 'none'} className={project.likedByUser ? 'text-red-500' : ''} />{fmt(project.likes)}</span>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}><GitBranch size={12} className="hover:text-[#561C24] transition-colors" /></a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function CreatorRow({ user }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#561C24]/05 transition-colors">
      <Avatar user={user} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm text-[#561C24] dark:text-cream truncate">{user.name}</span>
          {user.verified && <CheckCircle size={12} className="text-[#561C24] shrink-0" />}
        </div>
        <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">{user.username}</span>
      </div>
      <motion.button
        onClick={() => setFollowing(f => !f)}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
          following ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream' : 'bg-maroon-gradient text-cream-light'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {following ? '✓' : '+Follow'}
      </motion.button>
    </div>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef(null);

  const filteredProjects = mockProjects.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQ = !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.tech.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
      p.creator.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

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
                <span className={`text-[10px] ${activeCategory === cat.id ? 'text-cream-light/75' : 'text-[#561C24]/45'}`}>
                  {cat.count.toLocaleString()}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-[#561C24] dark:text-cream">
                  {filteredProjects.length} {query || activeCategory !== 'all' ? 'Results' : 'Projects'}
                </h2>
                <select className="input-premium !w-auto !py-2 !px-3 text-sm">
                  <option>Most Liked</option>
                  <option>Most Recent</option>
                  <option>Trending</option>
                </select>
              </div>

              {filteredProjects.length > 0 ? (
                <ProjectGrid projects={filteredProjects} />
              ) : (
                <div className="text-center py-20 glass rounded-3xl">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="font-bold text-lg text-[#561C24] dark:text-cream mb-2">No results found</p>
                  <p className="text-[#561C24]/60 dark:text-beige-warm/60 text-sm">Try a different search term or category</p>
                </div>
              )}
            </div>

            {/* Sidebar — top creators */}
            <div className="space-y-4">
              <div className="glass rounded-3xl p-5">
                <h3 className="font-display font-bold text-base text-[#561C24] dark:text-cream mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#561C24]" />
                  Top Creators
                </h3>
                <div className="space-y-1">
                  {mockUsers.map(user => (
                    <CreatorRow key={user.id} user={user} />
                  ))}
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
