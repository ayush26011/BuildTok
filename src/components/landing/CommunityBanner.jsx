import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { PLATFORM_STATS, SUCCESS_STORIES } from '../../data/mockData';
import { staggerContainerVariants, fadeUpVariants } from '../../utils/animations';
import Avatar from '../ui/Avatar';

function AnimatedCounter({ value, suffix = '', prefix = '', inView }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const isFloat = String(value).includes('.');
    const end = isFloat ? value * 10 : value;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { start = end; clearInterval(timer); }
      setDisplay(isFloat ? (start / 10).toFixed(1) : Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span className="font-extrabold text-4xl xl:text-5xl text-[#561C24] dark:text-cream">
      {prefix}{display}{suffix}
    </span>
  );
}

export default function CommunityBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      {/* Platform Stats */}
      <section className="py-20 px-6" style={{ background: 'var(--cream-dark)' }}>
        <div className="max-w-[1400px] mx-auto" ref={ref}>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {PLATFORM_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUpVariants}
                custom={i}
                className="text-center space-y-1"
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  inView={inView}
                />
                <p className="text-sm text-[#561C24]/65 dark:text-beige-warm/65 font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 px-6 bg-ambient relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-bold text-[#561C24]/60 uppercase tracking-widest mb-3">
              Success Stories
            </p>
            <h2 className="font-display font-extrabold text-5xl text-[#561C24] dark:text-cream mb-4">
              Real Results.
              <br />
              <span className="text-gradient">Real Impact.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {SUCCESS_STORIES.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.div
                  className="glass rounded-3xl p-6 h-full flex flex-col gap-4 group"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-3xl">"</div>
                  <p className="text-[#561C24]/80 dark:text-beige-warm/80 leading-relaxed flex-1 italic">
                    {story.story}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Avatar user={story.user} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-[#561C24] dark:text-cream">{story.user.name}</p>
                        <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60">{story.user.username}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#561C24] glass px-3 py-1.5 rounded-full">
                      {story.metric}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            className="relative glass-dark rounded-4xl p-12 md:p-16 overflow-hidden text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10">
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Zap className="inline text-cream-light" size={52} fill="currentColor" />
              </motion.div>
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-cream-light mb-4">
                Ready to Show the World
                <br />
                What You Build?
              </h2>
              <p className="text-beige-warm/80 text-lg mb-8 max-w-lg mx-auto">
                Join 142,000+ creators who are already changing the game. It's free, forever.
              </p>
              <Link to="/register">
                <motion.button
                  id="cta-join-now"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cream text-[#561C24] font-bold text-lg shadow-float hover:shadow-hover transition-shadow"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Join BuildTok Free
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
