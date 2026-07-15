'use client';

import { useEffect } from 'react';

export function LuxuryEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const flavorRows = Array.from(document.querySelectorAll<HTMLElement>('[data-flavor-row]'));
    const historyCreamWipe = document.querySelector<HTMLElement>('[data-cream-wipe]');
    const processSteps = Array.from(document.querySelectorAll<HTMLElement>('[data-process-step]'));
    const meltSection = document.querySelector<HTMLElement>('.melting-section');
    const tastingViewport = window.matchMedia('(max-width: 767px)').matches
      || window.matchMedia('(hover: none), (pointer: coarse)').matches;
    root.classList.add('luxury-motion-ready');

    if (reducedMotion) {
      revealElements.forEach((element) => element.setAttribute('data-revealed', 'true'));
      historyCreamWipe?.setAttribute('data-cream-revealed', 'true');
      processSteps.forEach((step) => step.setAttribute('data-churned', 'true'));
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

    const historyObserver = reducedMotion || !historyCreamWipe
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            historyCreamWipe.setAttribute('data-cream-revealed', 'true');
            historyObserver?.disconnect();
          },
          { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
        );
    if (historyCreamWipe) historyObserver?.observe(historyCreamWipe);

    const processObserver = reducedMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              (entry.target as HTMLElement).setAttribute('data-churned', 'true');
              processObserver?.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: '-24% 0px -30% 0px' },
        );
    processSteps.forEach((step) => processObserver?.observe(step));

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
      historyObserver?.disconnect();
      processObserver?.disconnect();
      tastingObserver?.disconnect();
      meltObserver?.disconnect();
      flavorRows.forEach((row) => row.removeAttribute('data-tasting'));
      historyCreamWipe?.removeAttribute('data-cream-revealed');
      processSteps.forEach((step) => step.removeAttribute('data-churned'));
      meltSection?.removeAttribute('data-melt-revealed');
      root.classList.remove('luxury-motion-ready');
    };
  }, []);

  return null;
}
