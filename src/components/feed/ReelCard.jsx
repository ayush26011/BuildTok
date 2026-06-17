import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Play } from 'lucide-react';
import ReelActions from './ReelActions';
import Avatar from '../ui/Avatar';
import ProBadge from '../ui/ProBadge';

function CommentPanel({ project, onClose }) {
  const [text, setText] = useState('');
  const mockComments = [
    { user: { avatarInitials: 'AK', name: 'Aryan K.', id: 'u1' }, text: 'This is absolutely insane! The UI is so smooth 🔥', time: '2m' },
    { user: { avatarInitials: 'PS', name: 'Priya S.', id: 'u2' }, text: 'How did you build the streaming logic? Open to collaborating!', time: '5m' },
    { user: { avatarInitials: 'ZH', name: 'Zaid H.', id: 'u3' }, text: 'Starred on GitHub. This is exactly what I needed!', time: '12m' },
    { user: { avatarInitials: 'SC', name: 'Sofia C.', id: 'u4' }, text: 'Perfect execution. Love the tech stack choices 💯', time: '20m' },
  ];

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
        <h3 className="font-bold text-white text-base">{project.comments.toLocaleString()} Comments</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {mockComments.map((c, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-maroon-gradient flex items-center justify-center text-cream-light text-xs font-bold shrink-0">
              {c.user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-white">{c.user.name}</span>
                <span className="text-[10px] text-white/40">{c.time} ago</span>
              </div>
              <p className="text-sm text-white/80">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
        />
        <motion.button
          className="px-4 py-2 rounded-xl bg-maroon-gradient text-cream-light text-sm font-bold"
          whileTap={{ scale: 0.95 }}
          onClick={() => setText('')}
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
  const progressRef = useRef(null);

  useEffect(() => {
    if (!isActive) { setPlaying(false); return; }
    setPlaying(true);
    setProgress(0);
  }, [isActive]);

  useEffect(() => {
    if (!playing) return;
    const start = Date.now() - progress * 300;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 30000;
      if (elapsed >= 1) { setProgress(1); clearInterval(interval); }
      else setProgress(elapsed);
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Video / Project showcase */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ background: project.gradient }}
        onClick={() => setPlaying(p => !p)}
      >
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
              {project.tech.map((t, i) => (
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

        {/* Play/Pause overlay */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20"
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/15">
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
        <Link to="/profile" className="flex items-center gap-3 mb-3 group">
          <div className="w-10 h-10 rounded-full bg-maroon-gradient flex items-center justify-center text-cream-light text-sm font-bold border-2 border-white/30">
            {project.creator.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm group-hover:underline">{project.creator.name}</span>
              {project.creator.verified && <CheckCircle size={12} className="text-white/80" fill="rgba(255,255,255,0.2)" />}
              {project.creator.isPro && <ProBadge size="xs" />}
            </div>
            <span className="text-white/60 text-xs">{project.creator.username}</span>
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
