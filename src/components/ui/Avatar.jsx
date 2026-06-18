import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Avatar({ user, size = 'md', ring = true, className = '' }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.avatar]);

  const sizes = {
    xxs: 'w-6 h-6 text-[8px]',
    xs: 'w-7 h-7 text-[10px]',
    xsm: 'w-8 h-8 text-[11px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    xmd: 'w-14 h-14 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };
  const ringPad = {
    xxs: 'p-[1px]',
    xs: 'p-[1.5px]',
    xsm: 'p-[1.5px]',
    sm: 'p-[1.5px]',
    md: 'p-[2px]',
    xmd: 'p-[2px]',
    lg: 'p-[2px]',
    xl: 'p-[3px]',
    '2xl': 'p-[3px]',
  };

  const initials = user?.avatarInitials || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const colors = [
    'from-[#561C24] to-[#8B3A45]',
    'from-[#1a1a2e] to-[#16213e]',
    'from-[#093028] to-[#237a57]',
    'from-[#1d2671] to-[#c33764]',
    'from-[#0f0c29] to-[#302b63]',
  ];
  const colorIdx = (user?.id || user?._id || '0').toString().charCodeAt(0) % colors.length || 0;

  const avatarUrl = !imageError && (typeof user?.avatar === 'string'
    ? user.avatar
    : (user?.avatar?.url || null));

  return (
    <motion.div
      className={`rounded-full shrink-0 ${ring ? `avatar-ring ${ringPad[size]}` : ''} ${className}`}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-cream-light overflow-hidden`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || 'Avatar'}
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          initials
        )}
      </div>
    </motion.div>
  );
}

