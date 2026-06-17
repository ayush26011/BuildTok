import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GitBranch, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { pageVariants, fadeUpVariants, staggerContainerVariants } from '../utils/animations';
import ParticleBackground from '../components/particles/ParticleBackground';

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains special character', pass: /[!@#$%^&*]/.test(password) },
  ];
  const strength = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  const labels = ['Weak', 'Good', 'Strong'];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
            i < strength ? colors[strength - 1] : 'bg-[#561C24]/15'
          }`} />
        ))}
      </div>
      {password && (
        <div className="space-y-1">
          {checks.map(({ label, pass }) => (
            <div key={label} className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${
              pass ? 'text-emerald-600' : 'text-[#561C24]/50'
            }`}>
              <CheckCircle size={10} className={pass ? 'text-emerald-600' : 'text-[#561C24]/30'} />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 2-step form

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.username) { setError('Fill in your name and username.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Fill in email and password.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.username, form.email, form.password);
      navigate('/feed');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex"
    >
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-maroon-gradient">
        <ParticleBackground count={25} className="opacity-25" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Zap size={20} className="text-cream-light" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-2xl text-cream-light">BuildTok</span>
          </Link>

          <div>
            <h1 className="font-display font-extrabold text-5xl xl:text-6xl text-cream-light leading-tight mb-6">
              Start Your
              <br />
              Builder
              <br />
              <span className="text-beige-warm">Journey.</span>
            </h1>
            <p className="text-beige-warm/75 text-lg max-w-sm mb-8">
              Free forever. No credit card. Join 142,000+ creators in 90+ countries.
            </p>

            {/* Animated stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Creators', value: '142K+' },
                { label: 'Projects', value: '890K+' },
                { label: 'Views/month', value: '2.4B+' },
                { label: 'Countries', value: '90+' },
              ].map(({ label, value }) => (
                <div key={label} className="glass-dark rounded-2xl p-4">
                  <p className="text-2xl font-extrabold text-cream-light">{value}</p>
                  <p className="text-xs text-beige-warm/60 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-beige-warm/50 text-xs">© 2025 BuildTok, Inc.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8 bg-ambient">
        <motion.div
          className="w-full max-w-md"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUpVariants} custom={0} className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display font-extrabold text-4xl text-[#561C24] dark:text-cream">
                {step === 1 ? 'Create Account' : 'Set Credentials'}
              </h2>
            </div>
            <p className="text-[#561C24]/65 dark:text-beige-warm/65">
              Already have one?{' '}
              <Link to="/login" className="font-bold text-[#561C24] dark:text-cream underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div variants={fadeUpVariants} custom={1} className="flex items-center gap-3 mb-7">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  s <= step ? 'bg-maroon-gradient text-cream-light shadow-maroon' : 'bg-[#561C24]/10 text-[#561C24]/50'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-xs font-medium transition-colors ${s <= step ? 'text-[#561C24]' : 'text-[#561C24]/40'}`}>
                  {s === 1 ? 'Your Identity' : 'Login Details'}
                </span>
                {s < 2 && <div className="flex-1 h-px bg-[#561C24]/15 w-8 mx-1" />}
              </div>
            ))}
          </motion.div>

          {/* GitHub */}
          <motion.div variants={fadeUpVariants} custom={2} className="mb-5">
            <motion.button
              id="github-register-btn"
              className="w-full btn-ghost flex items-center justify-center gap-3 !py-3.5"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              onClick={() => { register('GitHub User', 'github_user', 'github@buildtok.dev', 'password'); navigate('/feed'); }}
            >
              <GitBranch size={18} />
              Continue with GitHub
            </motion.button>
          </motion.div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#561C24]/15" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream dark:bg-cream px-3 text-xs text-[#561C24]/50 font-medium">or use email</span>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <motion.form
              variants={fadeUpVariants}
              custom={3}
              onSubmit={handleNext}
              className="space-y-4"
              key="step1"
            >
              <div>
                <label className="block text-sm font-semibold text-[#561C24]/80 mb-1.5">Full Name</label>
                <input
                  id="register-name"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Aryan Kapoor"
                  className="input-premium"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#561C24]/80 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#561C24]/50 text-sm">@</span>
                  <input
                    id="register-username"
                    value={form.username}
                    onChange={update('username')}
                    placeholder="aryanbuilds"
                    className="input-premium pl-8"
                    autoComplete="username"
                  />
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <motion.button
                id="register-next-btn"
                type="submit"
                className="w-full btn-primary !py-4 text-base"
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              >
                Continue <ArrowRight size={18} />
              </motion.button>
            </motion.form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <motion.form
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
              key="step2"
            >
              <div>
                <label className="block text-sm font-semibold text-[#561C24]/80 mb-1.5">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="input-premium"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#561C24]/80 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Create a strong password"
                    className="input-premium pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#561C24]/50 hover:text-[#561C24]"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn-ghost !py-4 text-sm"
                >
                  ← Back
                </button>
                <motion.button
                  id="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-2 btn-primary !py-4 text-base flex-1"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <>Create Account <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          <motion.p variants={fadeUpVariants} custom={4} className="mt-5 text-center text-xs text-[#561C24]/50">
            By creating an account you agree to our{' '}
            <a href="#" className="underline">Terms</a> &{' '}
            <a href="#" className="underline">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
