import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Avatar from '../ui/Avatar';

const getGradient = (p) => {
  if (p.gradient) return p.gradient;
  const gradients = [
    'linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A45 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    'linear-gradient(135deg, #1d2671 0%, #c33764 100%)',
    'linear-gradient(135deg, #093028 0%, #237a57 100%)',
    'linear-gradient(135deg, #2c1654 0%, #7928ca 50%, #ff0080 100%)',
  ];
  const id = p._id || p.id || '1';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function ProjectShareCard({ project }) {
  if (!project) return null;

  const tech = project.techStack || project.tech || [];

  return (
    <Link to={`/project/${project._id || project.id}`} className="block w-full max-w-[240px] mt-2 group select-none">
      <div className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors bg-white/5">
        {/* Banner preview */}
        <div className="h-24 relative bg-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: getGradient(project) }} />
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors z-0" />
          
          <div className="relative z-10 w-8 h-8 rounded-full glass flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
            <Play size={14} fill="white" />
          </div>

          <span className="absolute top-2 right-2 text-[8px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full select-none z-10">
            {project.category}
          </span>
        </div>

        {/* Info detail */}
        <div className="p-3 text-left">
          <p className="font-bold text-xs text-[#561C24] dark:text-cream truncate leading-tight mb-1">
            {project.title}
          </p>

          <div className="flex items-center gap-2 mb-2 min-w-0">
            {project.creator && (
              <>
                <Avatar user={project.creator} size="xxs" ring={false} />
                <span className="text-[10px] text-[#561C24]/60 dark:text-beige-warm/60 truncate leading-none">
                  @{project.creator.username}
                </span>
              </>
            )}
          </div>

          {tech.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {tech.slice(0, 2).map((t) => (
                <span key={t} className="tech-tag text-[8px] py-0.5 px-1.5 leading-none">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="w-full py-1.5 rounded-xl bg-maroon-gradient text-cream-light text-[9px] font-bold text-center group-hover:opacity-95 transition-opacity select-none shadow-sm flex items-center justify-center gap-1">
            View Project
          </div>
        </div>
      </div>
    </Link>
  );
}
