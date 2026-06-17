import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, GitBranch, ExternalLink, Zap } from 'lucide-react';
import { fadeUpVariants, staggerContainerVariants, scaleInVariants } from '../../utils/animations';
import ParticleBackground from '../particles/ParticleBackground';
import { mockProjects } from '../../data/mockData';
import Avatar from '../ui/Avatar';

// Floating project preview cards in the hero
function FloatingCard({ project, style, delay = 0 }) {
  return (
    <motion.div
      className="absolute glass rounded-2xl p-3 shadow-float w-48"
      style={style}
      animate={{
        y: [0, -12, 0],
        rotate: [style.rotate || 0, (style.rotate || 0) + 2, style.rotate || 0],
      }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div
        className="h-24 rounded-xl mb-2 flex items-end p-2"
        style={{ background: project.gradient }}
      >
        <div className="flex flex-wrap gap-1">
          {project.tech.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] font-bold text-white/80 bg-white/15 px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Avatar user={project.creator} size="xs" ring={false} />
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#561C24] dark:text-cream truncate">{project.title}</p>
          <p className="text-[9px] text-[#561C24]/60 dark:text-beige-warm/60 truncate">{project.creator.username}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const featured = mockProjects.filter(p => p.featured).slice(0, 4);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-ambient">
      <ParticleBackground count={30} />

      {/* Ambient gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#561C24]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-beige-warm/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text content */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Pill badge */}
            <motion.div variants={fadeUpVariants} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#561C24]/15 text-sm font-semibold text-[#561C24] dark:text-cream">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                142,000+ builders worldwide
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUpVariants} custom={1}>
              <h1 className="font-display font-extrabold text-6xl md:text-7xl xl:text-8xl leading-none tracking-tight text-[#561C24] dark:text-cream">
                Show What
                <br />
                <span className="text-gradient">You Build.</span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeUpVariants}
              custom={2}
              className="text-xl md:text-2xl text-[#561C24]/70 dark:text-beige-warm/80 max-w-lg leading-relaxed font-medium"
            >
              The social platform where creators showcase projects through short-form videos. Discover, connect, and inspire.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUpVariants} custom={3} className="flex flex-wrap gap-4">
              <Link to="/register">
                <motion.button
                  id="hero-start-building"
                  className="btn-primary text-base px-8 py-4 gap-2"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap size={18} fill="currentColor" />
                  Start Building
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link to="/feed">
                <motion.button
                  id="hero-explore-projects"
                  className="btn-ghost text-base px-8 py-4 gap-2"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Play size={16} fill="currentColor" />
                  Explore Projects
                </motion.button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUpVariants} custom={4} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-cream bg-maroon-gradient flex items-center justify-center text-cream-light text-xs font-bold"
                  >
                    {['AK', 'PS', 'ZH', 'SC', 'MW'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-500 text-sm">★</span>
                  ))}
                </div>
                <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 font-medium">
                  Loved by 50K+ creators
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — 3D floating project cards */}
          <div className="relative h-[500px] hidden lg:block">
            {featured[0] && (
              <FloatingCard
                project={featured[0]}
                style={{ top: '5%', left: '15%', rotate: -6 }}
                delay={0}
              />
            )}
            {featured[1] && (
              <FloatingCard
                project={featured[1]}
                style={{ top: '20%', right: '5%', rotate: 5 }}
                delay={1.2}
              />
            )}
            {featured[2] && (
              <FloatingCard
                project={featured[2]}
                style={{ bottom: '15%', left: '5%', rotate: 4 }}
                delay={0.7}
              />
            )}
            {featured[3] && (
              <FloatingCard
                project={featured[3]}
                style={{ bottom: '5%', right: '20%', rotate: -4 }}
                delay={1.8}
              />
            )}

            {/* Center glow */}
            <motion.div
              className="absolute inset-0 m-auto w-48 h-48 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(86,28,36,0.15) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Stats floating */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-2xl px-6 py-4 text-center shadow-float"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-3xl font-extrabold text-gradient">890K+</p>
              <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 font-semibold mt-0.5">Projects Shared</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs text-[#561C24]/50 dark:text-beige-warm/50 font-medium">Scroll to explore</span>
        <div className="w-5 h-8 rounded-full border border-[#561C24]/25 flex items-start justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-[#561C24]/50"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
