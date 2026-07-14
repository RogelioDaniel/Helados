'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

const CreamIntroScene = dynamic(() => import('./cream-intro-scene'), {
  ssr: false,
  loading: () => null,
});

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type IntroPhase = 'loading' | 'leaving' | 'done';

class CreamSceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const INTRO_SESSION_KEY = 'helado-nube-cream-intro-v1';

function waitForImage(image: HTMLImageElement | null) {
  if (!image) return Promise.resolve();
  return image.decode?.().catch(() => undefined) ?? Promise.resolve();
}

export function CreamIntro() {
  const [phase, setPhase] = useState<IntroPhase>('loading');
  const [allowWebgl, setAllowWebgl] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  const handleFirstFrame = useCallback(() => setWebglReady(true), []);
  const handleSceneFailure = useCallback(() => setAllowWebgl(false), []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    let alreadySeen = false;
    try {
      alreadySeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'seen';
    } catch {
      alreadySeen = false;
    }

    if (motionQuery.matches || saveData || alreadySeen) {
      const skipFrame = window.requestAnimationFrame(() => setPhase('done'));
      return () => window.cancelAnimationFrame(skipFrame);
    }

    const enableFrame = window.requestAnimationFrame(() => setAllowWebgl(true));

    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    let disposed = false;
    let leaving = false;
    let minimumReady = false;
    let pageReady = false;
    let exitTimer = 0;

    root.classList.add('cream-intro-active');
    document.body.style.overflow = 'hidden';

    const restorePage = () => {
      root.classList.remove('cream-intro-active');
      document.body.style.overflow = previousOverflow;
    };

    const leave = () => {
      if (disposed || leaving) return;
      leaving = true;
      restorePage();
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, 'seen');
      } catch {
        // Storage may be unavailable; the hard deadline still guarantees the exit.
      }
      setPhase('leaving');
      exitTimer = window.setTimeout(() => setPhase('done'), 980);
    };

    const checkReadiness = () => {
      if (minimumReady && pageReady) leave();
    };

    const minimumTimer = window.setTimeout(() => {
      minimumReady = true;
      checkReadiness();
    }, 780);

    const hardDeadline = window.setTimeout(leave, 2600);

    let resolveWindowLoad: (() => void) | null = null;
    const handleWindowLoad = () => resolveWindowLoad?.();
    const loadPromise = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          resolveWindowLoad = resolve;
          window.addEventListener('load', handleWindowLoad, { once: true });
        });
    const fontsPromise = document.fonts?.ready ?? Promise.resolve();
    const heroPromise = waitForImage(document.querySelector<HTMLImageElement>('[data-hero-image]'));

    Promise.allSettled([loadPromise, fontsPromise, heroPromise]).then(() => {
      if (disposed) return;
      pageReady = true;
      checkReadiness();
    });

    const handleMotionChange = () => {
      if (motionQuery.matches) leave();
    };
    const handleVisibility = () => {
      if (document.hidden) leave();
    };

    motionQuery.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(enableFrame);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(hardDeadline);
      window.clearTimeout(exitTimer);
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('load', handleWindowLoad);
      restorePage();
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`cream-intro cream-intro--${phase} ${webglReady ? 'cream-intro--webgl' : ''}`}
      aria-hidden="true"
    >
      <div className="cream-intro-fallback" />

      {allowWebgl ? (
        <CreamSceneBoundary onFailure={handleSceneFailure}>
          <CreamIntroScene
            leaving={phase === 'leaving'}
            onFirstFrame={handleFirstFrame}
            onFailure={handleSceneFailure}
          />
        </CreamSceneBoundary>
      ) : null}

      <div className="cream-intro-copy">
        <p>Casa artesanal · Desde 1962</p>
        <p className="font-display cream-intro-wordmark">Helado Nube</p>
        <span>Preparando la primera cucharada</span>
      </div>
    </div>
  );
}
