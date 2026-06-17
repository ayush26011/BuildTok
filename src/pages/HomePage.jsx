import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Shuffle } from 'lucide-react';
import { mockProjects } from '../data/mockData';
import ReelCard from '../components/feed/ReelCard';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { pageVariants } from '../utils/animations';

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's') goNext();
      if (e.key === 'ArrowUp' || e.key === 'w') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex]);

  // Touch swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startY = 0;
    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext(); else goPrev();
      }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeIndex]);

  // Wheel scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      if (e.deltaY > 0) goNext(); else goPrev();
      setTimeout(() => { isScrollingRef.current = false; }, 800);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

  const goNext = () => setActiveIndex(i => Math.min(i + 1, mockProjects.length - 1));
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0));

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-screen overflow-hidden"
    >
      <Sidebar />

      {/* Main reel container */}
      <div
        ref={containerRef}
        className="flex-1 lg:ml-60 relative overflow-hidden bg-black"
        style={{ height: '100vh' }}
      >
        {/* Reel items */}
        <div
          className="h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateY(-${activeIndex * 100}%)` }}
        >
          {mockProjects.map((project, i) => (
            <div key={project.id} className="h-screen w-full relative">
              <ReelCard project={project} isActive={i === activeIndex} />
            </div>
          ))}
        </div>

        {/* Navigation arrows (desktop) */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
          <motion.button
            className="w-10 h-10 rounded-full glass-dark flex items-center justify-center"
            onClick={goPrev}
            disabled={activeIndex === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ opacity: activeIndex === 0 ? 0.3 : 1 }}
            id="reel-prev-btn"
          >
            <ChevronUp size={18} className="text-white" />
          </motion.button>
          <motion.button
            className="w-10 h-10 rounded-full glass-dark flex items-center justify-center"
            onClick={goNext}
            disabled={activeIndex === mockProjects.length - 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ opacity: activeIndex === mockProjects.length - 1 ? 0.3 : 1 }}
            id="reel-next-btn"
          >
            <ChevronDown size={18} className="text-white" />
          </motion.button>
        </div>

        {/* Progress dots */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2">
          {mockProjects.map((_, i) => (
            <motion.button
              key={i}
              className="w-1.5 rounded-full bg-white/40 cursor-pointer"
              animate={{
                height: i === activeIndex ? 24 : 6,
                backgroundColor: i === activeIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveIndex(i)}
              id={`reel-dot-${i}`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute top-6 right-6 z-20 hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="glass-dark rounded-full px-4 py-2 text-white/80 text-xs font-bold"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {activeIndex + 1} / {mockProjects.length}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {activeIndex === 0 && (
            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 lg:bottom-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="flex flex-col items-center gap-1.5 text-white/60"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] font-semibold">Scroll to discover</span>
                <ChevronDown size={16} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </motion.div>
  );
}
