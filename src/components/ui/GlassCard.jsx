import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  variant = 'default',
  onClick,
  style = {},
}) {
  const baseClass = {
    default: 'glass rounded-3xl',
    strong: 'glass-strong rounded-3xl',
    dark: 'glass-dark rounded-3xl',
    maroon: 'glass-maroon rounded-3xl',
  }[variant] || 'glass rounded-3xl';

  return (
    <motion.div
      className={`${baseClass} ${className} relative overflow-hidden`}
      onClick={onClick}
      whileHover={hover ? { y: -4, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } } : undefined}
      style={style}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
      {children}
    </motion.div>
  );
}
