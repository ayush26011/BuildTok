import { motion } from 'framer-motion';
import { buttonTapVariants } from '../../utils/animations';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  loading = false,
  icon,
  iconRight,
  id,
}) {
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-primary !bg-gradient-to-r !from-red-700 !to-red-600',
    outline: 'border-2 border-[#561C24] text-[#561C24] bg-transparent font-semibold rounded-full transition-all hover:bg-[#561C24]/8',
  };

  const sizes = {
    sm: '!py-1.5 !px-4 !text-sm',
    md: '!py-3 !px-7',
    lg: '!py-4 !px-9 !text-base',
    xl: '!py-5 !px-12 !text-lg',
    icon: '!p-3 !rounded-full aspect-square',
  };

  return (
    <motion.button
      id={id}
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      variants={buttonTapVariants}
      whileTap="tap"
      whileHover={!disabled ? { scale: 1.02 } : undefined}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}
