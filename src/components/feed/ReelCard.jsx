import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Play } from 'lucide-react';
import ReelActions from './ReelActions';
import Avatar from '../ui/Avatar';
import ProBadge from '../ui/ProBadge';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';

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

function CommentPanel({ project, onClose }) {
  const { user: currentUser } = useAuth();
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await projectService.getComments(project._id || project.id);
      if (res.success) {
        setComments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [project]);

  const handlePost = async () => {
    if (!text.trim()) return;
    if (!currentUser) {
      alert('Please log in to add a comment.');
      return;
    }
    try {
      const res = await projectService.addComment(project._id || project.id, text);
      if (res.success && res.data) {
        setComments(prev => [res.data, ...prev]);
        setText('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
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

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col glass-dark rounded-3xl overflow-hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="font-bold text-white text-base">{(comments.length).toLocaleString()} Comments</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-white/10 rounded" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-white/40 py-8 text-sm">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((c) => (
            <div key={c._id || c.id} className="flex gap-3">
              <Avatar user={c.user} size="xsm" ring={false} className="shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-white">{c.user?.name || 'Deleted User'}</span>
                  <span className="text-[10px] text-white/40">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-sm text-white/80">{c.text}</p>
                
                {/* Nested Replies */}
                {c.replies?.length > 0 && (
                  <div className="mt-3 pl-4 border-l border-white/10 space-y-3">
                    {c.replies.map((reply) => (
                      <div key={reply._id || reply.id} className="flex gap-2.5">
                        <Avatar user={reply.user} size="xxs" ring={false} className="shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold text-white/95">{reply.user?.name}</span>
                            <span className="text-[9px] text-white/45">
                              {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-xs text-white/75">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={currentUser ? "Add a comment..." : "Log in to comment"}
          disabled={!currentUser}
          className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/30 disabled:opacity-50"
        />
        <motion.button
          className="px-4 py-2 rounded-xl bg-maroon-gradient text-cream-light text-sm font-bold disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={!text.trim() || !currentUser}
        >
          Post
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ReelCard({ project, isActive }) {
  const [showComments, setShowComments] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const videoSrc = typeof project.videoUrl === 'string' ? project.videoUrl : project.videoUrl?.url;
  const hasVideo = !!videoSrc;

  // Manage video play/pause when state updates
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch(err => {
        console.error("Video play failed:", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  // Manage card activation from the reel component list
  useEffect(() => {
    if (!isActive) {
      setPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      return;
    }
    setPlaying(true);
    setProgress(0);

    // Register view once per session per project
    const projectId = project._id || project.id;
    if (projectId) {
      const viewKey = `viewed_${projectId}`;
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, 'true');
        projectService.registerView(projectId).catch(err => {
          console.error("❌ Failed to register view:", err);
        });
      }
    }
  }, [isActive, project]);

  // Fallback dummy timer for gradient cards (non-video projects)
  useEffect(() => {
    if (hasVideo || !playing) return;
    const start = Date.now() - progress * 30000;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 30000;
      if (elapsed >= 1) {
        setProgress(0); // Reset / Loop
      } else {
        setProgress(elapsed);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playing, hasVideo]);

  const handleTimeUpdate = () => {
    if (hasVideo && videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration) {
        setProgress(current / duration);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Video / Project showcase */}
      <div
        className="absolute inset-0 cursor-pointer bg-black"
        onClick={() => setPlaying(p => !p)}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onError={(e) => console.error("❌ Error loading video for project:", project.title, e)}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: getGradient(project) }}>
            {/* Animated pattern overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
            />

            {/* Tech stack visualization */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: playing ? 1 : 0.7 }}
            >
              <div className="text-center space-y-6 px-8">
                <motion.div
                  className="text-8xl opacity-30"
                  animate={{ rotate: playing ? 360 : 0, scale: [1, 1.05, 1] }}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
                >
                  {project.category === 'AI' ? '🧠' :
                   project.category === 'Design' ? '🎨' :
                   project.category === 'Mobile' ? '📱' :
                   project.category === 'Robotics' ? '🤖' :
                   project.category === 'Blockchain' ? '⛓️' : '💻'}
                </motion.div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(project.techStack || project.tech || []).map((t, i) => (
                    <motion.span
                      key={t}
                      className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-bold"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Play/Pause overlay */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play size={32} className="text-white ml-2" fill="currentColor" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/15 z-10">
          <motion.div
            className="h-full bg-white/80"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
        {/* Creator */}
        <Link to={`/profile?id=${project.creator?._id || project.creator?.id}`} className="flex items-center gap-3 mb-3 group">
          <Avatar user={project.creator} size="sm" ring={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm group-hover:underline">{project.creator?.name}</span>
              {project.creator?.verified && <CheckCircle size={12} className="text-white/80" fill="rgba(255,255,255,0.2)" />}
              {project.creator?.isPro && <ProBadge size="xs" />}
            </div>
            <span className="text-white/60 text-xs">@{project.creator?.username}</span>
          </div>
        </Link>

        {/* Title & description */}
        <h2 className="font-display font-extrabold text-xl text-white mb-1.5">{project.title}</h2>
        <p className="text-white/75 text-sm leading-relaxed mb-3 line-clamp-2">{project.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/85 text-xs font-semibold">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div className="absolute right-3 bottom-20 z-10">
        <ReelActions project={project} onComment={() => setShowComments(true)} />
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <CommentPanel project={project} onClose={() => setShowComments(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
