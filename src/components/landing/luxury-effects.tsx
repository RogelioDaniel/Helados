'use client';

import { useEffect } from 'react';

export function LuxuryEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const flavorRows = Array.from(document.querySelectorAll<HTMLElement>('[data-flavor-row]'));
    const meltSection = document.querySelector<HTMLElement>('.melting-section');
    const tastingViewport = window.matchMedia('(max-width: 767px)').matches
      || window.matchMedia('(hover: none), (pointer: coarse)').matches;
    root.classList.add('luxury-motion-ready');

    if (reducedMotion) {
      revealElements.forEach((element) => element.setAttribute('data-revealed', 'true'));
      meltSection?.setAttribute('data-melt-revealed', 'true');
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

    const tastingObserver = reducedMotion || !tastingViewport
      ? null
      : new IntersectionObserver(
          (entries) => {
            const centeredRow = entries.find((entry) => entry.isIntersecting)?.target as HTMLElement | undefined;
            if (!centeredRow) return;
            flavorRows.forEach((row) => row.removeAttribute('data-tasting'));
            centeredRow.setAttribute('data-tasting', 'true');
          },
          { threshold: 0.08, rootMargin: '-38% 0px -38% 0px' },
        );
    flavorRows.forEach((row) => tastingObserver?.observe(row));

    const meltObserver = reducedMotion || !meltSection
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            meltSection.setAttribute('data-melt-revealed', 'true');
            meltObserver?.disconnect();
          },
          { threshold: 0.24 },
        );
    if (meltSection) meltObserver?.observe(meltSection);

    return () => {
      observer?.disconnect();
      tastingObserver?.disconnect();
      meltObserver?.disconnect();
      flavorRows.forEach((row) => row.removeAttribute('data-tasting'));
      meltSection?.removeAttribute('data-melt-revealed');
      root.classList.remove('luxury-motion-ready');
    };
  }, []);

  return null;
}
