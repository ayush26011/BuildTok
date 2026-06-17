import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Plus, Link, GitBranch, FileVideo, Tag, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { pageVariants, fadeUpVariants } from '../utils/animations';

const STEPS = ['Project Info', 'Tech Stack', 'Links & Media', 'Review'];

const POPULAR_TECH = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go',
  'Swift', 'Flutter', 'Vue', 'Node.js', 'GraphQL', 'PostgreSQL', 'MongoDB',
  'Docker', 'AWS', 'Figma', 'Three.js', 'TailwindCSS', 'Solidity', 'TensorFlow',
];

function DropZone({ onFile, file, uploading, progress }) {
  const inputRef = useRef(null);

  return (
    <div
      className="border-2 border-dashed border-[#561C24]/25 rounded-3xl p-10 text-center cursor-pointer hover:border-[#561C24]/50 hover:bg-[#561C24]/03 transition-all duration-300"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,.gif,.mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
        id="video-upload-input"
      />

      {file ? (
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#561C24]/10 flex items-center justify-center mx-auto">
            <FileVideo size={28} className="text-[#561C24]" />
          </div>
          <p className="font-bold text-[#561C24] dark:text-cream">{file.name}</p>
          <p className="text-xs text-[#561C24]/60">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          {uploading && (
            <div className="w-full bg-[#561C24]/10 rounded-full h-2 mt-3">
              <motion.div
                className="bg-maroon-gradient h-2 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          {progress === 100 && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
              <CheckCircle size={16} /> Upload complete
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div
            className="w-20 h-20 rounded-3xl bg-[#561C24]/08 flex items-center justify-center mx-auto"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Upload size={32} className="text-[#561C24]/60" />
          </motion.div>
          <div>
            <p className="font-bold text-base text-[#561C24] dark:text-cream mb-1">
              Drop your project demo here
            </p>
            <p className="text-sm text-[#561C24]/60 dark:text-beige-warm/60">
              MP4, MOV, WebM, GIF up to 200MB
            </p>
          </div>
          <button className="btn-ghost !py-2 !px-6 !text-sm">Browse files</button>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', tech: [], github: '', demo: '', category: 'Web Development', file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [techInput, setTechInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const addTech = (tech) => {
    if (form.tech.includes(tech) || form.tech.length >= 8) return;
    setForm(f => ({ ...f, tech: [...f.tech, tech] }));
  };

  const removeTech = (tech) => setForm(f => ({ ...f, tech: f.tech.filter(t => t !== tech) }));

  const handleFile = (file) => {
    update('file')(file);
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) { clearInterval(interval); setUploading(false); return 100; }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
  };

  const canNext = () => {
    if (step === 0) return form.title.length > 0 && form.description.length > 0;
    if (step === 1) return form.tech.length > 0;
    if (step === 2) return true;
    return true;
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-ambient items-center justify-center p-8">
        <motion.div
          className="glass rounded-4xl p-12 text-center max-w-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            className="text-7xl mb-6"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            🚀
          </motion.div>
          <h2 className="font-display font-extrabold text-3xl text-[#561C24] dark:text-cream mb-3">
            Project Published!
          </h2>
          <p className="text-[#561C24]/70 dark:text-beige-warm/70 mb-6">
            <span className="font-bold">{form.title}</span> is now live on BuildTok. The world can see what you built!
          </p>
          <div className="flex gap-3">
            <a href="/feed" className="flex-1 btn-primary text-sm py-3 text-center">View on Feed</a>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', description: '', tech: [], github: '', demo: '', category: 'Web Development', file: null }); }}
              className="flex-1 btn-ghost text-sm py-3">
              Upload Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen bg-ambient"
    >
      <Sidebar />

      <div className="flex-1 lg:ml-60 pt-16 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-4xl text-[#561C24] dark:text-cream mb-1">
              Upload Project
            </h1>
            <p className="text-[#561C24]/65 dark:text-beige-warm/65">
              Share your build with 142K+ creators
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                      i < step ? 'bg-maroon-gradient text-cream-light' :
                      i === step ? 'bg-maroon-gradient text-cream-light shadow-maroon' :
                      'bg-[#561C24]/10 text-[#561C24]/50'
                    }`}
                    animate={{ scale: i === step ? 1.1 : 1 }}
                  >
                    {i < step ? '✓' : i + 1}
                  </motion.div>
                  <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                    i <= step ? 'text-[#561C24] dark:text-cream' : 'text-[#561C24]/40'
                  }`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-all duration-500 ${
                    i < step ? 'bg-[#561C24]/50' : 'bg-[#561C24]/15'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="glass rounded-4xl p-6 sm:p-8 space-y-6"
            >
              {/* Step 0 — Project Info */}
              {step === 0 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="project-title"
                      value={form.title}
                      onChange={(e) => update('title')(e.target.value)}
                      placeholder="e.g. NeuroChat AI Assistant"
                      className="input-premium"
                      maxLength={80}
                    />
                    <p className="text-xs text-[#561C24]/45 mt-1 text-right">{form.title.length}/80</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="project-description"
                      value={form.description}
                      onChange={(e) => update('description')(e.target.value)}
                      placeholder="Describe your project — what it does, why you built it, what makes it special..."
                      className="input-premium resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-[#561C24]/45 mt-1 text-right">{form.description.length}/500</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-2">Category</label>
                    <select
                      id="project-category"
                      value={form.category}
                      onChange={(e) => update('category')(e.target.value)}
                      className="input-premium"
                    >
                      {['AI / ML', 'Web Development', 'Mobile Apps', 'Robotics', 'Design', 'Blockchain', 'Cyber Security', 'Other'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Step 1 — Tech Stack */}
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-3">
                      Technologies Used <span className="text-[#561C24]/45 font-normal">(up to 8)</span>
                    </label>

                    {/* Selected */}
                    {form.tech.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#561C24]/04 rounded-2xl">
                        {form.tech.map(t => (
                          <motion.span
                            key={t}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maroon-gradient text-cream-light text-xs font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            {t}
                            <button onClick={() => removeTech(t)} className="hover:opacity-70 transition-opacity">
                              <X size={10} />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {/* Custom input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        id="tech-input"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && techInput.trim()) { addTech(techInput.trim()); setTechInput(''); } }}
                        placeholder="Type a technology and press Enter..."
                        className="input-premium flex-1"
                      />
                      <button
                        onClick={() => { if (techInput.trim()) { addTech(techInput.trim()); setTechInput(''); } }}
                        className="btn-primary !py-3 !px-5"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Popular suggestions */}
                    <div>
                      <p className="text-xs font-semibold text-[#561C24]/60 dark:text-beige-warm/60 mb-2">Popular technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_TECH.filter(t => !form.tech.includes(t)).map(t => (
                          <motion.button
                            key={t}
                            onClick={() => addTech(t)}
                            className="tech-tag cursor-pointer hover:bg-[#561C24]/20 transition-colors"
                            whileTap={{ scale: 0.95 }}
                          >
                            + {t}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 — Links & Media */}
              {step === 2 && (
                <>
                  <DropZone
                    onFile={handleFile}
                    file={form.file}
                    uploading={uploading}
                    progress={uploadProgress}
                  />
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-2 flex items-center gap-2">
                        <GitBranch size={15} /> GitHub Repository
                      </label>
                      <input
                        id="project-github"
                        value={form.github}
                        onChange={(e) => update('github')(e.target.value)}
                        placeholder="https://github.com/username/project"
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#561C24]/80 dark:text-beige-warm/80 mb-2 flex items-center gap-2">
                        <Link size={15} /> Live Demo URL
                      </label>
                      <input
                        id="project-demo"
                        value={form.demo}
                        onChange={(e) => update('demo')(e.target.value)}
                        placeholder="https://myproject.vercel.app"
                        className="input-premium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="font-bold text-lg text-[#561C24] dark:text-cream">Review your project</h3>
                  {[
                    { label: 'Title', value: form.title || '—' },
                    { label: 'Category', value: form.category },
                    { label: 'Description', value: form.description || '—', multiline: true },
                    { label: 'Tech Stack', value: form.tech.length > 0 ? form.tech.join(', ') : '—' },
                    { label: 'GitHub', value: form.github || '—' },
                    { label: 'Demo URL', value: form.demo || '—' },
                    { label: 'Video', value: form.file?.name || 'Not uploaded' },
                  ].map(({ label, value, multiline }) => (
                    <div key={label} className="flex gap-4 py-3 border-b border-white/10 last:border-0">
                      <span className="text-sm font-bold text-[#561C24]/60 dark:text-beige-warm/60 w-28 shrink-0">{label}</span>
                      <span className={`text-sm text-[#561C24] dark:text-cream ${multiline ? '' : 'truncate'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <motion.button
                onClick={() => setStep(s => s - 1)}
                className="btn-ghost flex items-center gap-2"
                whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft size={16} /> Back
              </motion.button>
            )}
            <motion.button
              id="upload-next-btn"
              onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleSubmit()}
              disabled={!canNext()}
              className={`flex-1 btn-primary flex items-center justify-center gap-2 ${!canNext() ? 'opacity-50' : ''}`}
              whileHover={canNext() ? { scale: 1.02, y: -1 } : undefined}
              whileTap={{ scale: 0.98 }}
            >
              {step < STEPS.length - 1 ? (
                <>Continue <ArrowRight size={16} /></>
              ) : (
                <>🚀 Publish Project</>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
