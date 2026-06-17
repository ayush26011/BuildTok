import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Upload, User, TrendingUp } from 'lucide-react';

const NAV = [
  { icon: Home, label: 'Feed', to: '/feed', id: 'bottom-nav-feed' },
  { icon: Compass, label: 'Explore', to: '/explore', id: 'bottom-nav-explore' },
  { icon: Upload, label: 'Upload', to: '/upload', id: 'bottom-nav-upload', special: true },
  { icon: TrendingUp, label: 'Trending', to: '/trending', id: 'bottom-nav-trending' },
  { icon: User, label: 'Profile', to: '/profile', id: 'bottom-nav-profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV.map(({ icon: Icon, label, to, id, special }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} id={id} className="flex-1">
              <motion.div
                className="flex flex-col items-center gap-0.5 py-1 relative"
                whileTap={{ scale: 0.9 }}
              >
                {special ? (
                  <div className="w-12 h-12 rounded-2xl bg-maroon-gradient flex items-center justify-center shadow-maroon -mt-6">
                    <Icon size={20} className="text-cream-light" />
                  </div>
                ) : (
                  <>
                    <motion.div
                      animate={{ scale: active ? 1.15 : 1, y: active ? -2 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon
                        size={22}
                        className={active ? 'text-[#561C24]' : 'text-[#561C24]/40 dark:text-beige-warm/40'}
                        fill={active ? 'currentColor' : 'none'}
                      />
                    </motion.div>
                    <span className={`text-[9px] font-semibold transition-colors ${
                      active ? 'text-[#561C24] dark:text-cream' : 'text-[#561C24]/40 dark:text-beige-warm/40'
                    }`}>
                      {label}
                    </span>
                    {active && (
                      <motion.div
                        className="absolute -top-1 w-1 h-1 rounded-full bg-[#561C24]"
                        layoutId="dot"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
