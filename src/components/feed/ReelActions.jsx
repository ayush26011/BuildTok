import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, GitBranch, ExternalLink, UserPlus, MoreHorizontal, Play, Pause } from 'lucide-react';
import { heartVariants } from '../../utils/animations';

export default function ReelActions({ project, onComment }) {
  const [liked, setLiked] = useState(project.likedByUser);
  const [saved, setSaved] = useState(project.savedByUser);
  const [following, setFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(project.likes);
  const [playing, setPlaying] = useState(true);
  const [shared, setShared] = useState(false);

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const actions = [
    {
      id: 'like-btn',
      icon: Heart,
      count: fmt(likeCount),
      active: liked,
      onClick: handleLike,
      label: 'Like',
      variant: heartVariants,
      animate: liked ? 'liked' : 'unliked',
      color: liked ? '#E53E3E' : undefined,
    },
    {
      id: 'comment-btn',
      icon: MessageCircle,
      count: fmt(project.comments),
      onClick: onComment,
      label: 'Comment',
    },
    {
      id: 'save-btn',
      icon: Bookmark,
      count: fmt(project.saves),
      active: saved,
      onClick: () => setSaved(s => !s),
      label: 'Save',
    },
    {
      id: 'share-btn',
      icon: Share2,
      count: shared ? '✓' : fmt(project.shares),
      onClick: handleShare,
      label: 'Share',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Follow creator */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          id="follow-creator-btn"
          className="w-12 h-12 rounded-full glass-dark border-2 border-white/30 flex items-center justify-center relative"
          onClick={() => setFollowing(f => !f)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
        >
          <UserPlus size={18} className="text-white" />
          <AnimatePresence>
            {!following && (
              <motion.div
                className="absolute -bottom-1.5 w-5 h-5 rounded-full bg-[#561C24] flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <span className="text-white text-xs font-bold leading-none">+</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <span className="text-white/80 text-[10px] font-semibold">
          {following ? 'Following' : 'Follow'}
        </span>
      </div>

      {/* Action buttons */}
      {actions.map(({ id, icon: Icon, count, active, onClick, label, variant, animate: anim, color }) => (
        <div key={id} className="flex flex-col items-center gap-1">
          <motion.button
            id={id}
            className="w-12 h-12 rounded-full glass-dark flex items-center justify-center"
            onClick={onClick}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
            variants={variant}
            animate={anim}
          >
            <Icon
              size={22}
              className="transition-colors"
              style={{ color: active ? (color || '#E8D8C4') : 'rgba(255,255,255,0.85)' }}
              fill={active ? (color || 'currentColor') : 'none'}
            />
          </motion.button>
          <span className="text-white/80 text-[10px] font-bold">{count}</span>
        </div>
      ))}

      {/* External links */}
      <div className="flex flex-col items-center gap-3 pt-2 border-t border-white/10 w-full">
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" id="reel-github-link">
            <motion.button
              className="w-10 h-10 rounded-full glass-dark flex items-center justify-center"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              title="GitHub"
            >
              <GitBranch size={16} className="text-white/85" />
            </motion.button>
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noopener noreferrer" id="reel-demo-link">
            <motion.button
              className="w-10 h-10 rounded-full glass-dark flex items-center justify-center"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              title="Live Demo"
            >
              <ExternalLink size={16} className="text-white/85" />
            </motion.button>
          </a>
        )}
      </div>
    </div>
  );
}
