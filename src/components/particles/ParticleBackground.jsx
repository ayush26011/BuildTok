import { useEffect, useRef, useState } from 'react';

export default function ParticleBackground({ count = 20, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: -(Math.random() * 0.6 + 0.2),
      opacity: Math.random() * 0.5 + 0.1,
      life: Math.random(),
    }));

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life += 0.003;
        if (p.life > 1) {
          p.life = 0;
          p.x = Math.random() * w;
          p.y = h + 10;
        }
        const alpha = Math.sin(p.life * Math.PI) * p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(86,28,36,${alpha})`;
        ctx.fill();
      });

      // Floating geometric shapes
      const t = Date.now() / 4000;
      const shapes = [
        { x: w * 0.1, y: h * 0.3, size: 60, rot: t },
        { x: w * 0.85, y: h * 0.2, size: 40, rot: -t * 1.3 },
        { x: w * 0.7, y: h * 0.75, size: 50, rot: t * 0.8 },
        { x: w * 0.25, y: h * 0.8, size: 35, rot: -t * 0.6 },
      ];
      shapes.forEach(({ x, y, size, rot }) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(86,28,36,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
