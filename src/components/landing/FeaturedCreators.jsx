import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';
import { mockUsers } from '../../data/mockData';
import { staggerContainerVariants, fadeUpVariants, scaleInVariants } from '../../utils/animations';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

function CreatorCard({ user, index }) {
  const [following, setFollowing] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;

  return (
    <motion.div
      ref={ref}
      variants={scaleInVariants}
      custom={index}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      <motion.div
        className="glass rounded-3xl p-5 text-center relative overflow-hidden group"
        whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(86,28,36,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div className="flex justify-end mb-3">
          <Badge label={user.badge} variant="achievement" />
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-3">
          <Avatar user={user} size="xl" />
        </div>

        {/* Info */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-display font-bold text-base text-[#561C24] dark:text-cream">{user.name}</h3>
            {user.verified && <CheckCircle size={14} className="text-[#561C24] fill-[#561C24]/20" />}
          </div>
          <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 font-medium">{user.username}</p>
          <p className="text-xs text-[#561C24]/70 dark:text-beige-warm/70 line-clamp-2 mt-2 px-2">{user.bio}</p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {user.skills.slice(0, 3).map(skill => (
            <span key={skill} className="tech-tag text-[10px]">{skill}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-4 py-3 border-y border-white/10">
          {[
            { label: 'Projects', value: user.projects },
            { label: 'Followers', value: fmt(user.followers) },
            { label: 'Likes', value: fmt(user.totalLikes) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-extrabold text-sm text-[#561C24] dark:text-cream">{value}</p>
              <p className="text-[10px] text-[#561C24]/55 dark:text-beige-warm/55">{label}</p>
            </div>
          ))}
        </div>

        {/* Follow button */}
        <motion.button
          onClick={() => setFollowing(f => !f)}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            following
              ? 'bg-[#561C24]/10 text-[#561C24] dark:text-cream border border-[#561C24]/20'
              : 'bg-maroon-gradient text-cream-light shadow-maroon'
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {following ? '✓ Following' : '+ Follow'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturedCreators() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'var(--cream-light)' }}>
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#561C24]/20 to-transparent" />

      <div className="max-w-[1400px] mx-auto" ref={ref}>
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUpVariants} custom={0} className="text-sm font-bold text-[#561C24]/60 uppercase tracking-widest mb-3">
            Top Builders
          </motion.p>
          <motion.h2 variants={fadeUpVariants} custom={1} className="font-display font-extrabold text-5xl text-[#561C24] dark:text-cream mb-4">
            Featured Creators
          </motion.h2>
          <motion.p variants={fadeUpVariants} custom={2} className="text-lg text-[#561C24]/70 dark:text-beige-warm/70 max-w-xl mx-auto">
            Meet the builders shaping the future of technology, one project at a time.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {mockUsers.map((user, i) => (
            <CreatorCard key={user.id} user={user} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
