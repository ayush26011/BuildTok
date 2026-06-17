// ProBadge — Shows a blue verification tick for BuildTok Pro users
// Usage: <ProBadge size="sm" /> or <ProBadge size="md" />

export default function ProBadge({ size = 'sm', className = '' }) {
  const sizes = {
    xs: 'w-3 h-3 text-[7px]',
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-5 h-5 text-[11px]',
    lg: 'w-6 h-6 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 text-white font-bold shrink-0 shadow-sm ${sizes[size]} ${className}`}
      title="BuildTok Pro — Verified Creator"
      aria-label="Verified Pro creator"
    >
      ✓
    </span>
  );
}
