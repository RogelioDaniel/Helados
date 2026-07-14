'use client';

import { useEffect } from 'react';

export function LuxuryEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    return () => {
      observer?.disconnect();
      root.classList.remove('luxury-motion-ready');
    };
  }, []);

  return null;
}
