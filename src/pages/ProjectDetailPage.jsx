import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, GitBranch, ExternalLink, CheckCircle, Send } from 'lucide-react';
import { mockProjects, mockComments } from '../data/mockData';
import { pageVariants } from '../utils/animations';
import Avatar from '../components/ui/Avatar';
import ProBadge from '../components/ui/ProBadge';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const project = mockProjects.find(p => p.id === id) || mockProjects[0];
  const [liked, setLiked] = useState(project.likedByUser);
  const [saved, setSaved] = useState(project.savedByUser);
  const [likeCount, setLikeCount] = useState(project.likes);
  const [following, setFollowing] = useState(false);
  const [comment, setComment] = useState('');

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen bg-ambient"
    >
      <Sidebar />

      <div className="flex-1 lg:ml-60 pt-16 pb-20 lg:pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Back */}
          <Link to="/feed" className="inline-flex items-center gap-2 text-sm font-semibold text-[#561C24]/65 hover:text-[#561C24] transition-colors mb-6">
            <ArrowLeft size={16} />
            Back to Feed
          </Link>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Main content */}
            <div className="space-y-6">
              {/* Project showcase */}
              <motion.div
                className="rounded-4xl overflow-hidden relative h-80 sm:h-96"
                style={{ background: project.gradient }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <motion.div
                      className="text-8xl opacity-30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    >
                      {project.category === 'AI' ? '🧠' :
                       project.category === 'Design' ? '🎨' :
                       project.category === 'Mobile' ? '📱' :
                       project.category === 'Robotics' ? '🤖' : '💻'}
                    </motion.div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {project.tech.map(t => (
                        <span key={t} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-6"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                  <h1 className="font-display font-extrabold text-3xl text-white mb-1">{project.title}</h1>
                  <p className="text-white/75 text-sm">{project.views.toLocaleString()} views</p>
                </div>
              </motion.div>

              {/* Actions bar */}
              <div className="glass rounded-2xl p-4 flex items-center gap-4">
                {[
                  { icon: Heart, count: fmt(likeCount), active: liked, onClick: handleLike, color: 'red' },
                  { icon: MessageCircle, count: fmt(project.comments), color: null },
                  { icon: Bookmark, count: fmt(project.saves), active: saved, onClick: () => setSaved(s => !s) },
                  { icon: Share2, count: fmt(project.shares) },
                ].map(({ icon: Icon, count, active, onClick, color }, i) => (
                  <motion.button
                    key={i}
                    onClick={onClick}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                      active
                        ? color === 'red' ? 'text-red-500' : 'text-[#561C24]'
                        : 'text-[#561C24]/60 hover:text-[#561C24]'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={18} fill={active ? 'currentColor' : 'none'} />
                    <span className="hidden sm:inline">{count}</span>
                  </motion.button>
                ))}
                <div className="ml-auto flex gap-2">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-[#561C24] text-xs font-bold hover:bg-[#561C24]/10 transition-colors">
                      <GitBranch size={14} /> GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-maroon-gradient text-cream-light text-xs font-bold shadow-maroon">
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass rounded-3xl p-6">
                <h2 className="font-display font-bold text-lg text-[#561C24] dark:text-cream mb-3">About this project</h2>
                <p className="text-[#561C24]/80 dark:text-beige-warm/80 leading-relaxed">{project.description}</p>

                <div className="mt-5">
                  <h3 className="font-bold text-sm text-[#561C24]/65 dark:text-beige-warm/65 mb-3 uppercase tracking-wider">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="font-bold text-sm text-[#561C24]/65 dark:text-beige-warm/65 mb-3 uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-beige-warm/40 text-[#561C24] text-xs font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="glass rounded-3xl p-6">
                <h2 className="font-display font-bold text-lg text-[#561C24] dark:text-cream mb-5">
                  {project.comments.toLocaleString()} Comments
                </h2>

                {/* Add comment */}
                <div className="flex gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-maroon-gradient flex items-center justify-center text-cream-light text-xs font-bold shrink-0">
                    ME
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      id="add-comment-input"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="input-premium flex-1 !py-2"
                    />
                    <motion.button
                      className="w-10 h-10 rounded-xl bg-maroon-gradient flex items-center justify-center text-cream-light shrink-0"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setComment('')}
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>
                </div>

                {/* Comment list */}
                <div className="space-y-5">
                  {mockComments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar user={c.user} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-[#561C24] dark:text-cream">{c.user.name}</span>
                          <span className="text-xs text-[#561C24]/45 dark:text-beige-warm/45">{c.time}</span>
                        </div>
                        <p className="text-sm text-[#561C24]/80 dark:text-beige-warm/80 leading-relaxed">{c.text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-[#561C24]/50 hover:text-red-500 transition-colors">
                            <Heart size={11} /> {c.likes}
                          </button>
                          <button className="text-xs text-[#561C24]/50 hover:text-[#561C24] transition-colors font-medium">Reply</button>
                        </div>
                        {/* Replies */}
                        {c.replies?.map(r => (
                          <div key={r.id} className="flex gap-2 mt-3 ml-4">
                            <Avatar user={r.user} size="xs" />
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-xs text-[#561C24] dark:text-cream">{r.user.name}</span>
                                <span className="text-[10px] text-[#561C24]/45">{r.time}</span>
                              </div>
                              <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75">{r.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar — creator info */}
            <div className="space-y-4">
              {/* Creator card */}
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-sm text-[#561C24]/65 dark:text-beige-warm/65 uppercase tracking-wider mb-4">Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar user={project.creator} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#561C24] dark:text-cream">{project.creator.name}</span>
                      {project.creator.verified && <CheckCircle size={14} className="text-[#561C24]" />}
                      {project.creator.isPro && <ProBadge size="sm" />}
                    </div>
                    <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">{project.creator.username}</span>
                  </div>
                </div>
                <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 leading-relaxed mb-4">{project.creator.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.creator.skills.slice(0, 4).map(s => (
                    <span key={s} className="tech-tag text-[10px]">{s}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-[#561C24]/05 rounded-xl p-2">
                    <p className="font-extrabold text-sm text-[#561C24] dark:text-cream">
                      {project.creator.followers.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#561C24]/55">Followers</p>
                  </div>
                  <div className="bg-[#561C24]/05 rounded-xl p-2">
                    <p className="font-extrabold text-sm text-[#561C24] dark:text-cream">{project.creator.projects}</p>
                    <p className="text-[10px] text-[#561C24]/55">Projects</p>
                  </div>
                </div>
                <motion.button
                  id="project-follow-creator-btn"
                  onClick={() => setFollowing(f => !f)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    following ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream border border-[#561C24]/20' : 'bg-maroon-gradient text-cream-light shadow-maroon'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {following ? '✓ Following' : '+ Follow Creator'}
                </motion.button>
              </div>

              {/* More from creator */}
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-sm text-[#561C24]/65 uppercase tracking-wider mb-4">More Projects</h3>
                <div className="space-y-3">
                  {mockProjects.filter(p => p.creator.id === project.creator.id && p.id !== project.id).slice(0, 3).map(p => (
                    <Link key={p.id} to={`/project/${p.id}`}>
                      <div className="flex gap-3 p-2 rounded-xl hover:bg-[#561C24]/05 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: p.gradient }} />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[#561C24] dark:text-cream truncate">{p.title}</p>
                          <p className="text-[10px] text-[#561C24]/55 mt-0.5 flex items-center gap-1">
                            <Heart size={8} /> {fmt(p.likes)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {mockProjects.filter(p => p.creator.id === project.creator.id && p.id !== project.id).length === 0 && (
                    <p className="text-xs text-[#561C24]/50 text-center py-2">No other projects yet</p>
                  )}
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
