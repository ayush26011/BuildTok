import { useState, useCallback, useRef } from 'react';

/**
 * Returns mouse-reactive 3D tilt transform values for a card element.
 * Usage: const { tiltRef, tiltStyle, onMouseMove, onMouseLeave } = use3DTilt();
 */
export function use3DTilt({ maxTilt = 12, scale = 1.03, glare = true } = {}) {
  const tiltRef = useRef(null);
  const [style, setStyle] = useState({});

  const onMouseMove = useCallback((e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      boxShadow: `
        ${rotateY * 2}px ${-rotateX * 2}px 40px rgba(86,28,36,0.25),
        0 20px 60px rgba(86,28,36,0.15)
      `,
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      ...(glare ? { '--glare-x': `${glareX}%`, '--glare-y': `${glareY}%` } : {}),
    });
  }, [maxTilt, scale, glare]);

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
      boxShadow: '',
      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
    });
  }, []);

  return { tiltRef, tiltStyle: style, onMouseMove, onMouseLeave };
}
