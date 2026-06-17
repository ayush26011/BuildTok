import { motion } from 'framer-motion';

export default function Avatar({ user, size = 'md', ring = true, className = '' }) {
  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-3xl',
  };
  const ringPad = { xs: 'p-[1.5px]', sm: 'p-[1.5px]', md: 'p-[2px]', lg: 'p-[2px]', xl: 'p-[3px]', '2xl': 'p-[3px]' };

  const initials = user?.avatarInitials || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const colors = [
    'from-[#561C24] to-[#8B3A45]',
    'from-[#1a1a2e] to-[#16213e]',
    'from-[#093028] to-[#237a57]',
    'from-[#1d2671] to-[#c33764]',
    'from-[#0f0c29] to-[#302b63]',
  ];
  const colorIdx = (user?.id || '').charCodeAt(1) % colors.length;

  return (
    <motion.div
      className={`rounded-full shrink-0 ${ring ? `avatar-ring ${ringPad[size]}` : ''} ${className}`}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-cream-light`}
      >
        {initials}
      </div>
    </motion.div>
  );
}
