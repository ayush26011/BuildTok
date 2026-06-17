import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GitBranch, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pageVariants, fadeUpVariants, staggerContainerVariants } from '../utils/animations';
import ParticleBackground from '../components/particles/ParticleBackground';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/feed');
    } catch {
      setError('Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = ['Join 142K+ builders', 'Showcase your projects', 'Connect with creators', 'Get real opportunities'];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex"
    >
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-maroon-gradient">
        <ParticleBackground count={25} className="opacity-30" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Zap size={20} className="text-cream-light" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-2xl text-cream-light">BuildTok</span>
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="font-display font-extrabold text-5xl xl:text-6xl text-cream-light leading-tight mb-4">
                Welcome
                <br />
                Back,
                <br />
                <span className="text-beige-warm">Builder.</span>
              </h1>
              <p className="text-beige-warm/80 text-lg max-w-sm">
                The world is waiting to see what you're building.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((b, i) => (
                <motion.div
                  key={b}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                    <CheckCircle size={13} className="text-cream-light" />
                  </div>
                  <span className="text-beige-warm/85 text-sm font-medium">{b}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-beige-warm/50 text-xs">
            © 2025 BuildTok. Empowering 142K+ creators worldwide.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8 bg-ambient">
        <motion.div
          className="w-full max-w-md"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeUpVariants} custom={0} className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-maroon-gradient flex items-center justify-center">
              <Zap size={16} className="text-cream-light" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl text-[#561C24]">BuildTok</span>
          </motion.div>

          <motion.div variants={fadeUpVariants} custom={0} className="mb-8">
            <h2 className="font-display font-extrabold text-4xl text-[#561C24] dark:text-cream mb-2">Sign In</h2>
            <p className="text-[#561C24]/65 dark:text-beige-warm/65">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#561C24] dark:text-cream underline underline-offset-2">
                Create one free
              </Link>
            </p>
          </motion.div>

          {/* Social auth */}
          <motion.div variants={fadeUpVariants} custom={1} className="mb-6">
            <motion.button
              id="github-login-btn"
              className="w-full btn-ghost flex items-center justify-center gap-3 !py-3.5"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => { login('demo@buildtok.dev', 'demo'); navigate('/feed'); }}
            >
              <GitBranch size={18} />
              Continue with GitHub
            </motion.button>
          </motion.div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#561C24]/15 dark:border-beige-warm/15" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream dark:bg-cream px-3 text-xs text-[#561C24]/50 dark:text-beige-warm/50 font-medium">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <motion.form variants={fadeUpVariants} custom={2} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#561C24]/80 dark:text-beige-warm/80 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-premium"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#561C24]/80 dark:text-beige-warm/80">Password</label>
                <a href="#" className="text-xs font-medium text-[#561C24]/60 hover:text-[#561C24] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561C24]/50 hover:text-[#561C24] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                className="text-red-600 text-sm font-medium flex items-center gap-2"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-1 h-1 rounded-full bg-red-600 inline-block" />
                {error}
              </motion.p>
            )}

            <motion.button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-4 text-base"
              whileHover={!loading ? { scale: 1.02, y: -1 } : undefined}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </motion.button>
          </motion.form>

          <motion.p variants={fadeUpVariants} custom={3} className="mt-6 text-center text-xs text-[#561C24]/50 dark:text-beige-warm/50">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-[#561C24]">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-[#561C24]">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
