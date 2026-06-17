import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, ExternalLink, GitBranch, TrendingUp } from 'lucide-react';
import { mockProjects } from '../../data/mockData';
import { use3DTilt } from '../../hooks/use3DTilt';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { staggerContainerVariants, fadeUpVariants } from '../../utils/animations';

function ProjectCard({ project, index }) {
  const { tiltRef, tiltStyle, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 8, scale: 1.02 });
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      custom={index}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="perspective-container"
    >
      <div
        ref={tiltRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="glass rounded-3xl overflow-hidden cursor-pointer tilt-card group"
        style={tiltStyle}
      >
        {/* Video preview area */}
        <div
          className="relative h-48 flex flex-col justify-between p-4"
          style={{ background: project.gradient }}
        >
          {/* Trending badge */}
          {project.trending && (
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-bold">
                <TrendingUp size={10} />
                Trending
              </span>
              <span className="px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
                {project.category}
              </span>
            </div>
          )}
          <div className="mt-auto">
            {/* Tech stack preview */}
            <div className="flex flex-wrap gap-1">
              {project.tech.slice(0, 3).map(t => (
                <span key={t} className="text-[10px] font-bold text-white/80 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
              {project.tech.length > 3 && (
                <span className="text-[10px] font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  +{project.tech.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Play icon overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
          >
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent ml-1" />
            </div>
          </motion.div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-base text-[#561C24] dark:text-cream leading-tight">{project.title}</h3>
              <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 mt-0.5 line-clamp-2">{project.description}</p>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center justify-between">
            <Link to={`/profile`} className="flex items-center gap-2 group/creator">
              <Avatar user={project.creator} size="xs" />
              <div>
                <p className="text-xs font-semibold text-[#561C24] dark:text-cream group-hover/creator:underline">{project.creator.name}</p>
                {project.creator.verified && (
                  <span className="text-[9px] text-[#561C24]/60">✓ Verified</span>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  className="text-[#561C24]/50 hover:text-[#561C24] transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <GitBranch size={14} />
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer"
                  className="text-[#561C24]/50 hover:text-[#561C24] transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1 border-t border-white/10">
            {[
              { icon: Heart, count: project.likes, active: project.likedByUser },
              { icon: MessageCircle, count: project.comments },
              { icon: Bookmark, count: project.saves, active: project.savedByUser },
            ].map(({ icon: Icon, count, active }, i) => (
              <button key={i} className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                active ? 'text-[#561C24]' : 'text-[#561C24]/50 hover:text-[#561C24]'
              }`}>
                <Icon size={14} fill={active ? 'currentColor' : 'none'} />
                {fmt(count)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TrendingProjects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 px-6 bg-ambient relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto" ref={ref}>
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <motion.p variants={fadeUpVariants} custom={0} className="text-sm font-bold text-[#561C24]/60 dark:text-beige-warm/60 uppercase tracking-widest mb-2">
              Trending Now
            </motion.p>
            <motion.h2 variants={fadeUpVariants} custom={1} className="font-display font-extrabold text-5xl text-[#561C24] dark:text-cream">
              Hot Projects
            </motion.h2>
            <motion.p variants={fadeUpVariants} custom={2} className="text-[#561C24]/70 dark:text-beige-warm/70 mt-2 text-lg">
              The most-viewed builds this week
            </motion.p>
          </div>
          <motion.div variants={fadeUpVariants} custom={3}>
            <Link to="/explore">
              <button className="btn-ghost text-sm px-6 py-3">
                View all →
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {mockProjects.filter(p => p.trending).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
