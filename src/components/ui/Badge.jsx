export default function Badge({ label, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#561C24]/10 text-[#561C24] border border-[#561C24]/15',
    verified: 'bg-[#561C24] text-cream-light',
    achievement: 'bg-gradient-to-r from-[#561C24] to-[#8B3A45] text-cream-light badge-glow',
    tech: 'tech-tag',
    category: 'bg-beige-warm/40 text-[#561C24] border border-beige-warm/60',
    new: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    trending: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {variant === 'verified' && <span>✓</span>}
      {label}
    </span>
  );
}
