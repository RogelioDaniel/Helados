'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  creamFragmentShader,
  creamVertexShader,
} from './cream-shader-source';
import {
  type CreamRecipe,
  type CreamSession,
  getOrCreateCreamSession,
} from './cream-recipes';

export type CreamIntroSceneMode = 'residence' | 'cover' | 'reveal';
export type CreamIntroSceneDirection = 'down' | 'up';

type CreamIntroSceneProps = {
  canvasId: string;
  /**
   * residence: the cream sits fully covering the viewport (the loading hold).
   * cover: the cream pours in, animating uReveal from 1 -> 0.
   * reveal: the cream lifts out, animating uReveal from 0 -> 1 (the loading
   * "recoge" gesture), reused for both the intro exit and the navigation exit.
   */
  mode: CreamIntroSceneMode;
  /** down lifts toward the top (matches the loading); up mirrors vertically. */
  direction?: CreamIntroSceneDirection;
  recipe?: CreamRecipe;
  onFirstFrame: () => void;
  onFailure: () => void;
};

type CreamPrepaint = {
  context: WebGL2RenderingContext;
  stop: () => {
    timeSeconds: number;
    wasAnimating: boolean;
    session: CreamSession;
  };
  dispose: () => void;
};

type CreamCanvas = HTMLCanvasElement & {
  __creamPrepaint?: CreamPrepaint;
};

const REVEAL_DURATION_SECONDS = 1.68;
const COVER_DURATION_SECONDS = 0.82;

function smootherStep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

export default function CreamIntroScene({
  canvasId,
  mode,
  direction = 'down',
  recipe,
  onFirstFrame,
  onFailure,
}: CreamIntroSceneProps) {
  const modeRef = useRef<CreamIntroSceneMode>(mode);
  const directionRef = useRef<CreamIntroSceneDirection>(direction);
  const coverElapsedRef = useRef(0);
  const revealElapsedRef = useRef(0);
  const startRenderingRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    modeRef.current = mode;
    directionRef.current = direction;
    // A new animating mode starts from its natural origin, so reset both
    // clocks; the inactive one is simply ignored by the render loop.
    coverElapsedRef.current = 0;
    revealElapsedRef.current = 0;
    startRenderingRef.current();
  }, [mode, direction]);

  useEffect(() => {
    const canvas = document.getElementById(canvasId) as CreamCanvas | null;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const contextAttributes: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    };
    const prepaint = canvas.__creamPrepaint;
    const handoff = prepaint?.stop();
    const session = handoff?.session ?? getOrCreateCreamSession();
    const activeRecipe = recipe ?? session.recipe;
    const context = prepaint?.context ?? canvas.getContext('webgl2', contextAttributes);

    if (!context) {
      onFailure();
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let frame = 0;
    let disposed = false;
    let pageVisible = !document.hidden;
    let lastFrame = performance.now();
    let creamTime = handoff?.timeSeconds ?? 0;
    const initialMode = modeRef.current;
    let reveal =
      initialMode === 'cover' ? 1 : initialMode === 'reveal' ? 0 : 0;
    let renderWidth = 0;
    let renderHeight = 0;
    let renderDpr = 0;
    const ambientMotionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: context as unknown as WebGLRenderingContext,
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power',
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      });
      renderer.resetState();
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader: creamVertexShader,
        fragmentShader: creamFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: reveal },
          uEdgeDir: { value: directionRef.current === 'up' ? -1 : 1 },
          uAspect: { value: 1 },
          uBaseColor: { value: new THREE.Vector3(...activeRecipe.base) },
          uLightColor: { value: new THREE.Vector3(...activeRecipe.light) },
          uRibbonAColor: { value: new THREE.Vector3(...activeRecipe.ribbonA) },
          uRibbonBColor: { value: new THREE.Vector3(...activeRecipe.ribbonB) },
          uRibbonWeights: { value: new THREE.Vector2(...activeRecipe.ribbonWeights) },
          uRidge: { value: activeRecipe.ridge },
          uGloss: { value: activeRecipe.gloss },
          uFlowRate: { value: activeRecipe.flowRate },
          uFlowStrength: { value: activeRecipe.flowStrength },
          uMaterialSeed: { value: session.materialPhase },
          uDropletSeed: { value: session.dropletSeed / 0xffffffff },
        },
      });

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      scene.add(new THREE.Mesh(geometry, material));

      const renderCurrentFrame = () => {
        if (!renderer || !material) return;
        material.uniforms.uTime.value = creamTime;
        material.uniforms.uReveal.value = reveal;
        material.uniforms.uEdgeDir.value = directionRef.current === 'up' ? -1 : 1;
        renderer.render(scene, camera);
      };

      const resize = () => {
        if (!renderer || !material) return;
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const dprCap = width < 768 ? 1 : 1.35;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        if (width === renderWidth && height === renderHeight && dpr === renderDpr) return;
        renderWidth = width;
        renderHeight = height;
        renderDpr = dpr;
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        material.uniforms.uAspect.value = width / height;
        renderCurrentFrame();
      };

      const render = (now: number) => {
        frame = 0;
        if (disposed || !renderer || !material || !pageVisible) return;

        const currentMode = modeRef.current;
        const animating = currentMode !== 'residence';
        const delta = Math.min((now - lastFrame) / 1000, 0.08);
        // Residence holds a gentle ambient churn at a reduced framerate; the
        // cover/reveal gestures run at the full cadence so the creamy edge
        // stays smooth while it travels.
        if (!animating) {
          const residenceFps = renderWidth < 768 ? 24 : 30;
          if (now - lastFrame < 1000 / residenceFps) {
            frame = window.requestAnimationFrame(render);
            return;
          }
        }

        lastFrame = now;
        creamTime += delta * 1.15;

        if (currentMode === 'cover') {
          coverElapsedRef.current = Math.min(
            COVER_DURATION_SECONDS,
            coverElapsedRef.current + delta,
          );
          const progress = coverElapsedRef.current / COVER_DURATION_SECONDS;
          reveal = 1 - smootherStep(progress);
        } else if (currentMode === 'reveal') {
          revealElapsedRef.current = Math.min(
            REVEAL_DURATION_SECONDS,
            revealElapsedRef.current + delta,
          );
          const progress = revealElapsedRef.current / REVEAL_DURATION_SECONDS;
          reveal = smootherStep(progress);
        } else {
          reveal = 0;
        }

        renderCurrentFrame();
        frame = window.requestAnimationFrame(render);
      };

      const start = () => {
        const wantsMotion =
          ambientMotionQuery.matches || modeRef.current !== 'residence';
        if (!frame && !disposed && pageVisible && wantsMotion) {
          lastFrame = performance.now();
          frame = window.requestAnimationFrame(render);
        }
      };

      const handleVisibility = () => {
        pageVisible = !document.hidden;
        if (pageVisible) start();
        else stop();
      };

      const handleMotionPreference = () => {
        if (ambientMotionQuery.matches || modeRef.current !== 'residence') start();
        else stop();
      };

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        stop();
        onFailure();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      document.addEventListener('visibilitychange', handleVisibility);
      ambientMotionQuery.addEventListener('change', handleMotionPreference);
      canvas.addEventListener('webglcontextlost', handleContextLost);
      startRenderingRef.current = start;
      resize();
      onFirstFrame();
      prepaint?.dispose();
      delete canvas.__creamPrepaint;
      start();

      return () => {
        disposed = true;
        startRenderingRef.current = () => undefined;
        stop();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibility);
        ambientMotionQuery.removeEventListener('change', handleMotionPreference);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch {
      disposed = true;
      stop();
      prepaint?.dispose();
      delete canvas.__creamPrepaint;
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      onFailure();
    }
  }, [canvasId, onFailure, onFirstFrame, recipe]);

  return null;
}
