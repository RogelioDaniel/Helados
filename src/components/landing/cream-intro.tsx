'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { creamBootstrapScript } from './cream-bootstrap-script';
import { CREAM_INTRO_CANVAS_ID } from './cream-canvas-id';
import { CreamIntroPoster } from './cream-intro-poster';

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

const FALLBACK_MINIMUM_MS = 2200;
const SHADER_RESIDENCY_MS = 2200;
const WEBGL_ACQUISITION_MS = 2400;
const EXIT_DURATION_MS = 1780;
const HARD_DEADLINE_MS = 5000;

function waitForImage(image: HTMLImageElement | null) {
  if (!image) return Promise.resolve();
  return image.decode?.().catch(() => undefined) ?? Promise.resolve();
}

type BootstrapCanvas = HTMLCanvasElement & {
  __creamPrepaint?: { dispose: () => void };
};

function disposeBootstrapCanvas() {
  const canvas = document.getElementById(CREAM_INTRO_CANVAS_ID) as BootstrapCanvas | null;
  canvas?.__creamPrepaint?.dispose();
  if (canvas) delete canvas.__creamPrepaint;
}

export function CreamIntro() {
  const [phase, setPhase] = useState<IntroPhase>('loading');
  const [allowWebgl, setAllowWebgl] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const webglReadyRef = useRef(false);
  const leavingRef = useRef(false);
  const registerWebglReadyRef = useRef<() => void>(() => undefined);
  const registerWebglFailureRef = useRef<() => void>(() => undefined);

  const handleFirstFrame = useCallback(() => {
    if (leavingRef.current) return;
    webglReadyRef.current = true;
    setCanvasFailed(false);
    setWebglReady(true);
    registerWebglReadyRef.current();
  }, []);
  const handleSceneFailure = useCallback(() => {
    webglReadyRef.current = false;
    disposeBootstrapCanvas();
    setCanvasFailed(true);
    setWebglReady(false);
    setAllowWebgl(false);
    registerWebglFailureRef.current();
  }, []);

  useEffect(() => {
    leavingRef.current = false;
    webglReadyRef.current = false;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileFallback = window.matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)').matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;

    if (motionQuery.matches || saveData) {
      const skipFrame = window.requestAnimationFrame(() => setPhase('done'));
      return () => window.cancelAnimationFrame(skipFrame);
    }

    const enableFrame = mobileFallback
      ? 0
      : window.requestAnimationFrame(() => setAllowWebgl(true));

    const root = document.documentElement;
    let disposed = false;
    let leaving = false;
    let fallbackMinimumReady = false;
    let shaderResidencyReady = false;
    let fallbackMode = mobileFallback;
    let pageReady = false;
    let exitTimer = 0;
    let shaderResidencyTimer = 0;

    root.classList.add('cream-intro-active');

    const restorePage = () => {
      root.classList.remove('cream-intro-active');
      root.classList.remove('cream-intro-revealing');
    };

    const finish = () => {
      if (disposed) return;
      leaving = true;
      leavingRef.current = true;
      restorePage();
      setPhase('done');
    };

    const leave = () => {
      if (disposed || leaving) return;
      leaving = true;
      leavingRef.current = true;
      if (!webglReadyRef.current) {
        disposeBootstrapCanvas();
        setCanvasFailed(true);
        setAllowWebgl(false);
      }
      root.classList.add('cream-intro-revealing');
      setPhase('leaving');
      exitTimer = window.setTimeout(finish, EXIT_DURATION_MS);
    };

    const checkReadiness = () => {
      if (!pageReady) return;
      if (webglReadyRef.current && shaderResidencyReady) leave();
      if (fallbackMode && fallbackMinimumReady) leave();
    };

    const registerWebglReady = () => {
      if (disposed || leaving) return;
      fallbackMode = false;
      shaderResidencyReady = false;
      window.clearTimeout(shaderResidencyTimer);
      shaderResidencyTimer = window.setTimeout(() => {
        shaderResidencyReady = true;
        checkReadiness();
      }, SHADER_RESIDENCY_MS);
    };

    const registerWebglFailure = () => {
      if (disposed || leaving || webglReadyRef.current) return;
      fallbackMode = true;
      shaderResidencyReady = false;
      window.clearTimeout(shaderResidencyTimer);
      checkReadiness();
    };

    registerWebglReadyRef.current = registerWebglReady;
    registerWebglFailureRef.current = registerWebglFailure;

    const fallbackMinimumTimer = window.setTimeout(() => {
      fallbackMinimumReady = true;
      checkReadiness();
    }, FALLBACK_MINIMUM_MS);

    const webglAcquisitionTimer = mobileFallback
      ? 0
      : window.setTimeout(() => {
          if (webglReadyRef.current) return;
          disposeBootstrapCanvas();
          setCanvasFailed(true);
          setAllowWebgl(false);
          registerWebglFailure();
        }, WEBGL_ACQUISITION_MS);

    const hardDeadline = window.setTimeout(leave, HARD_DEADLINE_MS);

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
      if (motionQuery.matches) finish();
    };
    const handleVisibility = () => {
      if (document.hidden) finish();
    };

    motionQuery.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(enableFrame);
      window.clearTimeout(fallbackMinimumTimer);
      window.clearTimeout(webglAcquisitionTimer);
      window.clearTimeout(shaderResidencyTimer);
      window.clearTimeout(hardDeadline);
      window.clearTimeout(exitTimer);
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('load', handleWindowLoad);
      registerWebglReadyRef.current = () => undefined;
      registerWebglFailureRef.current = () => undefined;
      disposeBootstrapCanvas();
      restorePage();
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`cream-intro cream-intro--${phase} ${webglReady ? 'cream-intro--webgl' : ''}`}
      aria-hidden="true"
    >
      <script
        id="cream-intro-prepaint"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: creamBootstrapScript }}
      />
      <CreamIntroPoster />
      <div className="cream-intro-mobile-cream" aria-hidden="true">
        <span className="mobile-cream-stroke mobile-cream-stroke--berry-left" />
        <span className="mobile-cream-stroke mobile-cream-stroke--vanilla-center" />
        <span className="mobile-cream-stroke mobile-cream-stroke--berry-right" />
        <span className="mobile-cream-stroke mobile-cream-stroke--fold-top" />
        <span className="mobile-cream-stroke mobile-cream-stroke--fold-bottom" />
      </div>
      <canvas
        id={CREAM_INTRO_CANVAS_ID}
        suppressHydrationWarning
        className={`cream-intro-canvas ${canvasFailed ? 'cream-intro-canvas--failed' : ''}`}
      />

      {allowWebgl ? (
        <CreamSceneBoundary onFailure={handleSceneFailure}>
          <CreamIntroScene
            canvasId={CREAM_INTRO_CANVAS_ID}
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
