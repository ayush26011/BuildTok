import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, GitBranch, ExternalLink, UserPlus } from 'lucide-react';
import { heartVariants } from '../../utils/animations';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';

export default function ReelActions({ project, onComment }) {
  const { user: currentUser, setUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (project) {
      const isLiked = currentUser
        ? (project.likes?.includes(currentUser._id || currentUser.id) || project.likedByUser)
        : false;
      const isSaved = currentUser
        ? (project.saves?.includes(currentUser._id || currentUser.id) || project.savedByUser)
        : false;
      const isFollowing = currentUser
        ? currentUser.following?.some(f => (f._id || f) === (project.creator?._id || project.creator?.id))
        : false;

      setLiked(!!isLiked);
      setSaved(!!isSaved);
      setFollowing(!!isFollowing);
      setLikeCount(project.likes?.length || project.likesCount || 0);
      setSaveCount(project.saves?.length || project.savesCount || 0);
    }
  }, [project, currentUser]);

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n;

  const handleLike = async () => {
    if (!currentUser) {
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
    if (!currentUser) {
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
    if (!currentUser) {
      alert('Please log in to follow creators.');
      return;
    }
    const creatorId = project.creator?._id || project.creator?.id;
    if (creatorId === (currentUser._id || currentUser.id)) {
      alert('You cannot follow yourself.');
      return;
    }
    try {
      const res = await userService.followUser(creatorId);
      if (res.success) {
        setFollowing(res.following);
        const updatedFollowing = res.following
          ? [...(currentUser.following || []), creatorId]
          : (currentUser.following || []).filter(id => (id._id || id) !== creatorId);
        setUser({ ...currentUser, following: updatedFollowing });
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
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
      count: fmt(project.commentsCount || project.comments || 0),
      onClick: onComment,
      label: 'Comment',
    },
    {
      id: 'save-btn',
      icon: Bookmark,
      count: fmt(saveCount),
      active: saved,
      onClick: handleSave,
      label: 'Save',
    },
    {
      id: 'share-btn',
      icon: Share2,
      count: shared ? '✓' : fmt(project.shares || 0),
      onClick: handleShare,
      label: 'Share',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Follow creator */}
      {project.creator?._id !== currentUser?._id && project.creator?.id !== currentUser?.id && (
        <div className="flex flex-col items-center gap-1">
          <motion.button
            id="follow-creator-btn"
            className="w-12 h-12 rounded-full glass-dark border-2 border-white/30 flex items-center justify-center relative"
            onClick={handleFollow}
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
      )}

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
        {project.githubLink && (
          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" id="reel-github-link">
            <motion.button
              className="w-10 h-10 rounded-full glass-dark flex items-center justify-center"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              title="GitHub"
            >
              <GitBranch size={16} className="text-white/85" />
            </motion.button>
          </a>
        )}
        {project.liveDemoLink && (
          <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" id="reel-demo-link">
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
