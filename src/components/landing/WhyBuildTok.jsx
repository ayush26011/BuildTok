import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { WHY_BUILDTOK } from '../../data/mockData';
import { staggerContainerVariants, fadeUpVariants } from '../../utils/animations';

export default function WhyBuildTok() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 px-6 bg-ambient relative overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #561C24 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUpVariants} custom={0} className="text-sm font-bold text-[#561C24]/60 uppercase tracking-widest mb-3">
            Why BuildTok
          </motion.p>
          <motion.h2 variants={fadeUpVariants} custom={1} className="font-display font-extrabold text-5xl text-[#561C24] dark:text-cream mb-4">
            Built for Creators,
            <br />
            <span className="text-gradient">Not Followers.</span>
          </motion.h2>
          <motion.p variants={fadeUpVariants} custom={2} className="text-lg text-[#561C24]/70 dark:text-beige-warm/70 max-w-lg mx-auto">
            Every decision we make is in service of the people who create. Not engagement metrics.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_BUILDTOK.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUpVariants}
              custom={i}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <motion.div
                className="glass rounded-3xl p-7 h-full group relative overflow-hidden"
                whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(86,28,36,0.05) 0%, transparent 100%)' }}
                />

                {/* Icon */}
                <motion.div
                  className="text-4xl mb-5 inline-block"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {item.icon}
                </motion.div>

                <h3 className="font-display font-bold text-xl text-[#561C24] dark:text-cream mb-3">
                  {item.title}
                </h3>
                <p className="text-[#561C24]/70 dark:text-beige-warm/70 leading-relaxed">
                  {item.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-[#561C24]/20 to-transparent
                  scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
