'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const HeroScene = dynamic(() => import('./hero-scene'), {
  ssr: false,
  loading: () => null,
});

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function HeroSceneGate() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    if (reduceMotion || saveData) return;

    const idleWindow = window as IdleWindow;
    let idleHandle: number | undefined;
    let timer: number | undefined;

    const scheduleLoad = () => {
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(() => setEnabled(true), { timeout: 1200 });
      } else {
        timer = window.setTimeout(() => setEnabled(true), 360);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        scheduleLoad();
      },
      { rootMargin: '180px' },
    );

    if (hostRef.current) observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-scene-gate" aria-hidden="true">
      {enabled ? <HeroScene /> : null}
    </div>
  );
}
