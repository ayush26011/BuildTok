import { motion } from 'framer-motion';
import { pageVariants } from '../utils/animations';
import Hero from '../components/landing/Hero';
import TrendingProjects from '../components/landing/TrendingProjects';
import FeaturedCreators from '../components/landing/FeaturedCreators';
import WhyBuildTok from '../components/landing/WhyBuildTok';
import CommunityBanner from '../components/landing/CommunityBanner';

// Footer
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#561C24]/10 bg-ambient">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-maroon-gradient flex items-center justify-center">
                <span className="text-cream-light text-xs font-bold">B</span>
              </div>
              <span className="font-display font-bold text-[#561C24] dark:text-cream">BuildTok</span>
            </div>
            <p className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 leading-relaxed">
              The social platform where creators showcase projects through short-form videos.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Feed', 'Explore', 'Upload', 'Trending'] },
            { title: 'Creators', links: ['Getting Started', 'Guidelines', 'Creator Fund', 'Analytics'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-bold text-sm text-[#561C24] dark:text-cream mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-xs text-[#561C24]/60 dark:text-beige-warm/60 hover:text-[#561C24] dark:hover:text-cream transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-[#561C24]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#561C24]/50 dark:text-beige-warm/50">
            © 2025 BuildTok, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" className="text-xs text-[#561C24]/50 hover:text-[#561C24] transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Hero />
      <TrendingProjects />
      <FeaturedCreators />
      <WhyBuildTok />
      <CommunityBanner />
      <Footer />
    </motion.div>
  );
}
