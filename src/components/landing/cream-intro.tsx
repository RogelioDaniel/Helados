'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  type CSSProperties,
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
import {
  type CreamRecipe,
  type CreamSession,
  getOrCreateCreamSession,
} from './cream-recipes';

const CreamIntroScene = dynamic(() => import('./cream-intro-scene'), {
  ssr: false,
  loading: () => null,
});

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type IntroPhase = 'loading' | 'entering' | 'covered' | 'leaving' | 'done';
type CreamIntroVariant = 'intro' | 'navigation';
export type CreamNavigationDirection = 'down' | 'up';

type CreamIntroProps = {
  /**
   * The complete introduction holds the cream long enough for the first
   * render. Navigation only needs the final, lifting gesture: it covers the
   * destination for a beat and immediately starts the same reveal shader.
   */
  variant?: CreamIntroVariant;
  /** Keeps the short navigation curtain in the palette of the active scoop. */
  recipe?: CreamRecipe;
  /**
   * Preserves spatial continuity: travelling down enters from the bottom and
   * exits through the top; travelling up performs the inverse gesture.
   */
  direction?: CreamNavigationDirection;
  onComplete?: (session: CreamSession) => void;
  /** Runs only once the destination is fully covered, before the cream lifts. */
  onRevealStart?: (session: CreamSession) => void;
};

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
const NAVIGATION_ENTER_MS = 860;
const NAVIGATION_EXIT_MS = 1280;
const NAVIGATION_HARD_DEADLINE_MS = 3600;

function waitForImage(image: HTMLImageElement | null) {
  if (!image) return Promise.resolve();
  return image.decode?.().catch(() => undefined) ?? Promise.resolve();
}

function toCssRgb(color: CreamRecipe['base']) {
  return `rgb(${color.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

type BootstrapCanvas = HTMLCanvasElement & {
  __creamPrepaint?: { dispose: () => void };
};

function disposeBootstrapCanvas() {
  const canvas = document.getElementById(CREAM_INTRO_CANVAS_ID) as BootstrapCanvas | null;
  canvas?.__creamPrepaint?.dispose();
  if (canvas) delete canvas.__creamPrepaint;
}

export function CreamIntro({
  variant = 'intro',
  recipe,
  direction = 'down',
  onComplete,
  onRevealStart,
}: CreamIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>(() =>
    variant === 'navigation' ? 'entering' : 'loading',
  );
  const [allowWebgl, setAllowWebgl] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const webglReadyRef = useRef(false);
  const leavingRef = useRef(false);
  const registerWebglReadyRef = useRef<() => void>(() => undefined);
  const registerWebglFailureRef = useRef<() => void>(() => undefined);
  const completeNotifiedRef = useRef(false);
  const revealNotifiedRef = useRef(false);
  const onRevealStartRef = useRef(onRevealStart);
  const recipeStyle = recipe
    ? ({
        '--cream-base': toCssRgb(recipe.base),
        '--cream-light': toCssRgb(recipe.light),
        '--cream-ribbon-a': toCssRgb(recipe.ribbonA),
        '--cream-ribbon-b': toCssRgb(recipe.ribbonB),
      } as CSSProperties)
    : undefined;

  useEffect(() => {
    onRevealStartRef.current = onRevealStart;
  }, [onRevealStart]);

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
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;

    if (motionQuery.matches || saveData) {
      const skipFrame = window.requestAnimationFrame(() => setPhase('done'));
      return () => window.cancelAnimationFrame(skipFrame);
    }

    const enableFrame = window.requestAnimationFrame(() => setAllowWebgl(true));

    const root = document.documentElement;
    let disposed = false;
    let leaving = false;
    let leavePrepared = false;
    let fallbackMinimumReady = false;
    let shaderResidencyReady = false;
    let fallbackMode = false;
    let pageReady = false;
    let exitTimer = 0;
    let shaderResidencyTimer = 0;
    let fallbackMinimumTimer = 0;
    let webglAcquisitionTimer = 0;
    let hardDeadline = 0;
    let navigationEnterFrame = 0;
    let navigationCoverTimer = 0;
    let leaveCommitFrame = 0;
    let cleanupResources = () => undefined;

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
      cleanupResources();
    };

    const commitLeave = () => {
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
      exitTimer = window.setTimeout(
        finish,
        variant === 'navigation' ? NAVIGATION_EXIT_MS : EXIT_DURATION_MS,
      );
    };

    const notifyCovered = () => {
      if (disposed || revealNotifiedRef.current) return;
      revealNotifiedRef.current = true;
      onRevealStartRef.current?.(getOrCreateCreamSession());
    };

    const prepareLeave = () => {
      if (disposed || leaving || leavePrepared) return;
      leavePrepared = true;

      // Apply the random first flavor (or position the requested section)
      // while the viewport is still completely covered. Waiting one paint
      // prevents the former fresa -> random flavor flash during the reveal.
      notifyCovered();
      leaveCommitFrame = window.requestAnimationFrame(commitLeave);
    };

    const checkReadiness = () => {
      if (!pageReady) return;
      if (webglReadyRef.current && shaderResidencyReady) prepareLeave();
      if (fallbackMode && fallbackMinimumReady) prepareLeave();
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

    if (variant === 'navigation') {
      // Start off-canvas. The following frame lets CSS interpolate the cream
      // into a fully covered viewport before any scroll position changes.
      navigationEnterFrame = window.requestAnimationFrame(() => {
        if (disposed) return;
        setPhase('covered');
        navigationCoverTimer = window.setTimeout(() => {
          notifyCovered();
          prepareLeave();
        }, NAVIGATION_ENTER_MS);
      });
    } else {
      // The initial curtain already covers the viewport. Resolve the random
      // flavor now, during its residency, so catalogue entrance animations
      // have settled long before the first pixel of the hero is revealed.
      notifyCovered();
      fallbackMinimumTimer = window.setTimeout(() => {
        fallbackMinimumReady = true;
        checkReadiness();
      }, FALLBACK_MINIMUM_MS);
    }

    let acquisitionDeferrals = 0;
    const verifyWebglAcquisition = () => {
      if (disposed || leaving || webglReadyRef.current) return;
      const canvas = document.getElementById(CREAM_INTRO_CANVAS_ID) as BootstrapCanvas | null;
      if (canvas?.__creamPrepaint && acquisitionDeferrals < 3) {
        acquisitionDeferrals += 1;
        webglAcquisitionTimer = window.setTimeout(verifyWebglAcquisition, 700);
        return;
      }
      disposeBootstrapCanvas();
      setCanvasFailed(true);
      setAllowWebgl(false);
      registerWebglFailure();
    };
    webglAcquisitionTimer = window.setTimeout(verifyWebglAcquisition, WEBGL_ACQUISITION_MS);

    hardDeadline = window.setTimeout(
      prepareLeave,
      variant === 'navigation' ? NAVIGATION_HARD_DEADLINE_MS : HARD_DEADLINE_MS,
    );

    let resolveWindowLoad: (() => void) | null = null;
    const handleWindowLoad = () => resolveWindowLoad?.();
    if (variant === 'intro') {
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
    }

    let hiddenFinishTimer = 0;
    const handleMotionChange = () => {
      if (motionQuery.matches) finish();
    };
    const handleVisibility = () => {
      window.clearTimeout(hiddenFinishTimer);
      if (!document.hidden) return;

      // Some mobile browsers briefly toggle visibility while promoting the
      // WebGL canvas. Give that hand-off a beat before treating it as a real
      // tab change, otherwise a navigation curtain can disappear mid-pour.
      hiddenFinishTimer = window.setTimeout(() => {
        if (document.hidden) finish();
      }, 260);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibility);

    cleanupResources = () => {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(enableFrame);
      window.cancelAnimationFrame(navigationEnterFrame);
      window.cancelAnimationFrame(leaveCommitFrame);
      window.clearTimeout(fallbackMinimumTimer);
      window.clearTimeout(navigationCoverTimer);
      window.clearTimeout(webglAcquisitionTimer);
      window.clearTimeout(shaderResidencyTimer);
      window.clearTimeout(hardDeadline);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hiddenFinishTimer);
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('load', handleWindowLoad);
      registerWebglReadyRef.current = () => undefined;
      registerWebglFailureRef.current = () => undefined;
      disposeBootstrapCanvas();
      restorePage();
    };
    return cleanupResources;
  }, [variant]);

  useEffect(() => {
    if (phase !== 'done' || completeNotifiedRef.current) return;
    completeNotifiedRef.current = true;
    onComplete?.(getOrCreateCreamSession());
  }, [onComplete, phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`cream-intro cream-intro--${phase} cream-intro--${variant} ${webglReady ? 'cream-intro--webgl' : ''}`}
      style={recipeStyle}
      data-navigation-direction={variant === 'navigation' ? direction : undefined}
      aria-hidden="true"
    >
      <script
        id="cream-intro-prepaint"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: creamBootstrapScript }}
      />
      <CreamIntroPoster />
      <div className="cream-intro-flat-fallback" />
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
            recipe={recipe}
            onFirstFrame={handleFirstFrame}
            onFailure={handleSceneFailure}
          />
        </CreamSceneBoundary>
      ) : null}

      {variant === 'intro' ? (
        <div className="cream-intro-copy">
          <p>Casa artesanal · Desde 1962</p>
          <p className="font-display cream-intro-wordmark">Helado Nube</p>
          <span>Preparando la primera cucharada</span>
        </div>
      ) : null}
    </div>
  );
}
