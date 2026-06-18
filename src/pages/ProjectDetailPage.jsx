import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, GitBranch, ExternalLink, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import Avatar from '../components/ui/Avatar';
import ProBadge from '../components/ui/ProBadge';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { pageVariants } from '../utils/animations';

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

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user: authUser, setUser: setAuthUser } = useAuth();
  
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [moreProjects, setMoreProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [commentInput, setCommentInput] = useState('');

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

  useEffect(() => {
    if (!id) return;
    let active = true;
    
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const pRes = await projectService.getProjectById(id);
        if (!active) return;
        
        if (pRes.success && pRes.data) {
          const pData = pRes.data;
          setProject(pData);
          
          const engagement = pData.userEngagement || {};
          const isLiked = authUser ? (pData.likes?.includes(authUser._id || authUser.id) || engagement.liked) : false;
          const isSaved = authUser ? (pData.saves?.includes(authUser._id || authUser.id) || engagement.saved) : false;
          const isFollowing = authUser ? authUser.following?.some(f => (f._id || f) === (pData.creator?._id || pData.creator?.id)) : false;

          setLiked(!!isLiked);
          setSaved(!!isSaved);
          setFollowing(!!isFollowing);
          setLikeCount(pData.likes?.length || pData.likesCount || 0);
          setSaveCount(pData.saves?.length || pData.savesCount || 0);

          // Get project comments
          const cRes = await projectService.getComments(pData._id || pData.id);
          if (active && cRes.success) {
            setComments(cRes.data || []);
          }

          // Get more projects from same creator
          const creatorId = pData.creator?._id || pData.creator?.id;
          if (creatorId) {
            const moreRes = await projectService.getFeed({ creator: creatorId });
            if (active && moreRes.success) {
              const others = (moreRes.data || []).filter(p => (p._id || p.id) !== id);
              setMoreProjects(others.slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load project page data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProjectData();
    return () => { active = false; };
  }, [id, authUser]);

  const handleLike = async () => {
    if (!authUser) {
      alert('Please log in to like this project.');
      return;
    }
    try {
      const res = await projectService.toggleLike(project._id || project.id);
      if (res.success) {
        setLiked(res.liked);
        setLikeCount(res.likesCount);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleSave = async () => {
    if (!authUser) {
      alert('Please log in to save this project.');
      return;
    }
    try {
      const res = await projectService.toggleSave(project._id || project.id);
      if (res.success) {
        setSaved(res.saved);
        setSaveCount(res.savesCount);
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  const handleFollow = async () => {
    if (!authUser) {
      alert('Please log in to follow creators.');
      return;
    }
    const creatorId = project.creator?._id || project.creator?.id;
    if (creatorId === (authUser._id || authUser.id)) {
      alert('You cannot follow yourself.');
      return;
    }
    try {
      const res = await userService.followUser(creatorId);
      if (res.success) {
        setFollowing(res.following);
        const updatedFollowing = res.following
          ? [...(authUser.following || []), creatorId]
          : (authUser.following || []).filter(id => (id._id || id) !== creatorId);
        setAuthUser({ ...authUser, following: updatedFollowing });

        // Update follower count in page state
        setProject(prev => {
          if (!prev || !prev.creator) return prev;
          const followersList = prev.creator.followers || [];
          const updatedFollowers = res.following
            ? [...followersList, authUser._id]
            : followersList.filter(id => id !== authUser._id);
          return {
            ...prev,
            creator: {
              ...prev.creator,
              followers: updatedFollowers,
            }
          };
        });
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    if (!authUser) {
      alert('Please log in to leave a comment.');
      return;
    }
    try {
      const res = await projectService.addComment(project._id || project.id, commentInput);
      if (res.success && res.data) {
        setComments(prev => [res.data, ...prev]);
        setCommentInput('');
      }
    } catch (err) {
      console.error('Post comment failed:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 pt-16 px-6 max-w-5xl mx-auto flex flex-col justify-center">
          <SkeletonLoader type="profile" />
          <div className="mt-8">
            <SkeletonLoader type="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 flex flex-col items-center justify-center p-6 gap-3">
          <p className="text-white/60">Project details not found</p>
          <Link to="/" className="text-[#561C24] font-semibold underline">Back to Feed</Link>
        </div>
      </div>
    );
  }

  const techList = project.techStack || project.tech || [];
  const tagList = project.tags || [];
  const videoSrc = typeof project.videoUrl === 'string' ? project.videoUrl : project.videoUrl?.url;
  const hasVideo = !!videoSrc;
  const creatorFollowers = project.creator.followersCount || (Array.isArray(project.creator.followers) ? project.creator.followers.length : (parseInt(project.creator.followers) || 0));
  const creatorProjects = project.creator.projectsCount || (Array.isArray(project.creator.projects) ? project.creator.projects.length : (parseInt(project.creator.projects) || 0));

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
                className="rounded-4xl overflow-hidden relative h-80 sm:h-96 bg-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {hasVideo ? (
                  <video
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    onError={(e) => console.error("❌ Error loading video in details:", project.title, e)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: getGradient(project) }}>
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
                        {techList.map(t => (
                          <span key={t} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                  <h1 className="font-display font-extrabold text-3xl text-white mb-1">{project.title}</h1>
                  <p className="text-white/75 text-sm">{(project.views || 0).toLocaleString()} views</p>
                </div>
              </motion.div>

              {/* Actions bar */}
              <div className="glass rounded-2xl p-4 flex items-center gap-4">
                {[
                  { icon: Heart, count: fmt(likeCount), active: liked, onClick: handleLike, color: 'red' },
                  { icon: MessageCircle, count: fmt(comments.length), color: null },
                  { icon: Bookmark, count: fmt(saveCount), active: saved, onClick: handleSave },
                  { icon: Share2, count: fmt(project.shares || 0) },
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
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-[#561C24] text-xs font-bold hover:bg-[#561C24]/10 transition-colors">
                      <GitBranch size={14} /> GitHub
                    </a>
                  )}
                  {project.liveDemoLink && (
                    <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer"
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
                    {techList.map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="font-bold text-sm text-[#561C24]/65 dark:text-beige-warm/65 mb-3 uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tagList.map(tag => (
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
                  {comments.length.toLocaleString()} Comments
                </h2>

                {/* Add comment */}
                <div className="flex gap-3 mb-6">
                  <Avatar user={authUser} size="sm" ring={true} className="shrink-0" />
                  <div className="flex-1 flex gap-2">
                    <input
                      id="add-comment-input"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={authUser ? "Share your thoughts..." : "Log in to share your thoughts"}
                      disabled={!authUser}
                      className="input-premium flex-1 !py-2"
                    />
                    <motion.button
                      className="w-10 h-10 rounded-xl bg-maroon-gradient flex items-center justify-center text-cream-light shrink-0 disabled:opacity-55"
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCommentSubmit}
                      disabled={!commentInput.trim() || !authUser}
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>
                </div>

                {/* Comment list */}
                <div className="space-y-5">
                  {comments.length === 0 ? (
                    <p className="text-center text-sm text-white/40 py-4">No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c._id || c.id} className="flex gap-3">
                        <Avatar user={c.user} size="sm" ring={false} className="shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-[#561C24] dark:text-cream">{c.user?.name || 'Deleted User'}</span>
                            <span className="text-xs text-[#561C24]/45 dark:text-beige-warm/45">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-[#561C24]/80 dark:text-beige-warm/80 leading-relaxed">{c.text}</p>
                          
                          {/* Nested Replies */}
                          {c.replies?.map(r => (
                            <div key={r._id || r.id} className="flex gap-2 mt-3 ml-4">
                              <Avatar user={r.user} size="xxs" ring={false} className="shrink-0" />
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-xs text-[#561C24] dark:text-cream">{r.user?.name}</span>
                                  <span className="text-[10px] text-[#561C24]/45">
                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Just now'}
                                  </span>
                                </div>
                                <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75">{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar — creator info */}
            <div className="space-y-4">
              {/* Creator card */}
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-sm text-[#561C24]/65 dark:text-beige-warm/65 uppercase tracking-wider mb-4">Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Link to={`/profile?id=${project.creator._id || project.creator.id}`} className="shrink-0">
                    <Avatar user={project.creator} size="lg" />
                  </Link>
                  <div>
                    <Link to={`/profile?id=${project.creator._id || project.creator.id}`} className="hover:underline flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[#561C24] dark:text-cream leading-snug">{project.creator.name}</span>
                      {project.creator.verified && <CheckCircle size={14} className="text-[#561C24]" />}
                      {project.creator.isPro && <ProBadge size="sm" />}
                    </Link>
                    <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">@{project.creator.username}</span>
                  </div>
                </div>
                <p className="text-xs text-[#561C24]/75 dark:text-beige-warm/75 leading-relaxed mb-4">{project.creator.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.creator.skills && project.creator.skills.slice(0, 4).map(s => (
                    <span key={s} className="tech-tag text-[10px]">{s}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="bg-[#561C24]/05 rounded-xl p-2">
                    <p className="font-extrabold text-sm text-[#561C24] dark:text-cream">
                      {creatorFollowers.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#561C24]/55">Followers</p>
                  </div>
                  <div className="bg-[#561C24]/05 rounded-xl p-2">
                    <p className="font-extrabold text-sm text-[#561C24] dark:text-cream">{creatorProjects}</p>
                    <p className="text-[10px] text-[#561C24]/55">Projects</p>
                  </div>
                </div>
                
                {project.creator._id !== authUser?._id && project.creator.id !== authUser?.id && (
                  <motion.button
                    id="project-follow-creator-btn"
                    onClick={handleFollow}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                      following ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream border border-[#561C24]/20' : 'bg-maroon-gradient text-cream-light shadow-maroon'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {following ? '✓ Following' : '+ Follow Creator'}
                  </motion.button>
                )}
              </div>

              {/* More from creator */}
              <div className="glass rounded-3xl p-5">
                <h3 className="font-bold text-sm text-[#561C24]/65 uppercase tracking-wider mb-4">More Projects</h3>
                <div className="space-y-3">
                  {moreProjects.map(p => (
                    <Link key={p._id || p.id} to={`/project/${p._id || p.id}`}>
                      <div className="flex gap-3 p-2 rounded-xl hover:bg-[#561C24]/05 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: getGradient(p) }} />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[#561C24] dark:text-cream truncate">{p.title}</p>
                          <p className="text-[10px] text-[#561C24]/55 mt-0.5 flex items-center gap-1">
                            <Heart size={8} /> {fmt(p.likes?.length || 0)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {moreProjects.length === 0 && (
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
