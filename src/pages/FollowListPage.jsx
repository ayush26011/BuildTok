import { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import Avatar from '../components/ui/Avatar';
import ProBadge from '../components/ui/ProBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { pageVariants, fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../utils/animations';

export default function FollowListPage({ type }) {
  const { user: currentUser, setUser: setCurrentUser, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [list, setList] = useState([]);

  const targetId = searchParams.get('id') || currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await userService.getUserById(targetId);
        if (active && res.success) {
          setProfileUser(res.data);
          const populatedList = type === 'followers' ? (res.data.followers || []) : (res.data.following || []);
          setList(populatedList);
        }
      } catch (err) {
        console.error(`Failed to load ${type}:`, err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchList();
    return () => { active = false; };
  }, [targetId, type]);

  const handleFollowToggle = async (userItem) => {
    if (!currentUser) {
      alert('Please log in to follow creators.');
      return;
    }
    const targetUserId = userItem._id || userItem.id;
    try {
      const res = await userService.followUser(targetUserId);
      if (res.success) {
        // Sync context following array
        const updatedFollowing = res.following
          ? [...(currentUser.following || []), targetUserId]
          : (currentUser.following || []).filter(id => (id._id || id) !== targetUserId);
        setCurrentUser({ ...currentUser, following: updatedFollowing });
      }
    } catch (err) {
      console.error('Follow toggle failed:', err);
    }
  };

  const isFollowingUser = (userItem) => {
    if (!currentUser) return false;
    const targetUserId = userItem._id || userItem.id;
    return currentUser.following?.some(f => (f._id || f) === targetUserId);
  };

  const getMutualCount = (listedUser) => {
    if (!currentUser || !listedUser) return 0;
    const currentFollowingIds = (currentUser.following || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    const listedFollowerIds = (listedUser.followers || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    const intersect = currentFollowingIds.filter(id => listedFollowerIds.includes(id));
    return intersect.length;
  };

  const followsYou = (listedUser) => {
    if (!currentUser || !listedUser) return false;
    const currentId = currentUser._id || currentUser.id;
    const listedFollowingIds = (listedUser.following || []).map(f => typeof f === 'string' ? f : f._id || f.id);
    return listedFollowingIds.includes(currentId);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-ambient items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#561C24]/30 border-t-[#561C24] animate-spin" />
      </div>
    );
  }

  if (!targetId) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 pt-20 px-6 max-w-xl mx-auto flex flex-col justify-center">
          <SkeletonLoader type="profile" />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-ambient">
        <Sidebar />
        <div className="flex-1 lg:ml-60 flex flex-col items-center justify-center p-6 gap-3">
          <p className="text-white/60">Creator not found</p>
          <Link to="/" className="text-[#561C24] font-semibold underline">Back to Feed</Link>
        </div>
      </div>
    );
  }

  const titleText = type === 'followers' ? 'Followers' : 'Following';

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
        <div className="max-w-xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to={`/profile?id=${profileUser._id || profileUser.id}`} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} className="text-[#561C24] dark:text-cream" />
            </Link>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-[#561C24] dark:text-cream">
                {titleText}
              </h1>
              <p className="text-xs text-[#561C24]/65 dark:text-beige-warm/65">
                {profileUser.name} (@{profileUser.username})
              </p>
            </div>
          </div>

          {/* List content */}
          <div className="glass rounded-3xl p-6 min-h-[300px]">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <Users className="text-[#561C24]/30 w-12 h-12" />
                <p className="text-sm font-semibold text-[#561C24]/50 dark:text-beige-warm/50">
                  No {type} yet.
                </p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {list.map((u, i) => {
                  const isSelf = currentUser?._id === u._id || currentUser?.id === u._id || currentUser?.id === u.id;
                  const followingThis = isFollowingUser(u);
                  const showFollowBack = followsYou(u) && !followingThis && !isSelf;
                  const mutualsCount = getMutualCount(u);

                  return (
                    <motion.div
                      key={u._id || u.id}
                      variants={scaleInVariants}
                      custom={i}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#561C24]/04 border border-[#561C24]/05 hover:bg-[#561C24]/08 transition-colors"
                    >
                      <Link to={`/profile?id=${u._id || u.id}`} className="flex items-center gap-3 min-w-0">
                        <Avatar user={u} size="md" ring={false} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-[#561C24] dark:text-cream truncate max-w-[150px]">
                              {u.name}
                            </span>
                            {u.verified && <CheckCircle size={13} className="text-[#561C24] shrink-0" />}
                            {u.isPro && <ProBadge size="xs" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">
                              @{u.username}
                            </span>
                            {showFollowBack && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#561C24]/10 text-[#561C24] dark:text-cream font-bold">
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
                      </Link>

                      {!isSelf && currentUser && (u._id || u.id) && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/messages?recipientId=${u._id || u.id}`} className="shrink-0">
                            <button className="p-2 rounded-full glass hover:bg-[#561C24]/10 text-[#561C24] dark:text-cream transition-colors" title="Message">
                              <MessageCircle size={13} />
                            </button>
                          </Link>
                          <motion.button
                            onClick={() => handleFollowToggle(u)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                              followingThis
                                ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream hover:bg-[#561C24]/15'
                                : 'bg-maroon-gradient text-cream-light hover:opacity-90'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {followingThis ? 'Following' : showFollowBack ? 'Follow Back' : 'Follow'}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
