'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export function LuxuryEffects() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.2,
  });

  useEffect(() => {
    const root = document.documentElement;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    root.classList.add('luxury-motion-ready');

    if (reducedMotion) {
      revealElements.forEach((element) => element.setAttribute('data-revealed', 'true'));
    }

    const observer = reducedMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              (entry.target as HTMLElement).setAttribute('data-revealed', 'true');
              observer?.unobserve(entry.target);
            });
          },
          { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
        );
    revealElements.forEach((element) => observer?.observe(element));

    const hero = document.querySelector<HTMLElement>('[data-hero-stage]');
    const flavorRows = Array.from(document.querySelectorAll<HTMLElement>('[data-flavor-row]'));
    const cleanups: Array<() => void> = [];

    if (hero && !reducedMotion) {
      const handleMove = (event: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        hero.style.setProperty('--hero-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
        hero.style.setProperty('--hero-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
      };
      hero.addEventListener('pointermove', handleMove, { passive: true });
      cleanups.push(() => hero.removeEventListener('pointermove', handleMove));
    }

    flavorRows.forEach((row) => {
      const handleMove = (event: PointerEvent) => {
        const bounds = row.getBoundingClientRect();
        row.style.setProperty('--flavor-x', `${event.clientX - bounds.left}px`);
        row.style.setProperty('--flavor-y', `${event.clientY - bounds.top}px`);
      };
      row.addEventListener('pointermove', handleMove, { passive: true });
      cleanups.push(() => row.removeEventListener('pointermove', handleMove));
    });

    return () => {
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      root.classList.remove('luxury-motion-ready');
    };
  }, [reducedMotion]);

  return (
    <motion.div
      className="luxury-scroll-progress"
      style={{ scaleX: reducedMotion ? scrollYProgress : progress }}
      aria-hidden="true"
    />
  );
}
