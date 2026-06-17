import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const posRef = useRef({ x: -999, y: -999 });
  const animRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (glow) {
        glow.style.left = `${posRef.current.x}px`;
        glow.style.top = `${posRef.current.y}px`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow hidden lg:block"
      style={{ left: -999, top: -999 }}
    />
  );
}
