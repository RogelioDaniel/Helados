'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { CreamRecipe, CreamSession, Rgb } from './cream-recipes';
import {
  creamScrollTideFragmentShader,
  creamScrollTideVertexShader,
} from './cream-scroll-tide-shaders';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type CreamScrollTideProps = {
  session: CreamSession;
  /**
   * The hero catalogue can change the house flavour without recreating the
   * WebGL scene. The shader interpolates toward this recipe in place.
   */
  themeRecipe?: CreamRecipe;
  suspended?: boolean;
};

type DropletSlot = {
  active: boolean;
  x: number;
  age: number;
  duration: number;
  radius: number;
  strength: number;
};

const DROP_COUNT = 4;
const MIN_FILL = 0.06;
const MAX_FILL = 1;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function lerpColor(vector: THREE.Vector3, target: Rgb, amount: number) {
  vector.x += (target[0] - vector.x) * amount;
  vector.y += (target[1] - vector.y) * amount;
  vector.z += (target[2] - vector.z) * amount;
}

export default function CreamScrollTide({
  session,
  themeRecipe,
  suspended = false,
}: CreamScrollTideProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suspendedRef = useRef(suspended);
  const wakeRef = useRef<() => void>(() => undefined);
  const visualRecipeRef = useRef<CreamRecipe>(themeRecipe ?? session.recipe);
  const [motionReduced, setMotionReduced] = useState<boolean | null>(null);

  useEffect(() => {
    suspendedRef.current = suspended;
    wakeRef.current();
  }, [suspended]);

  useEffect(() => {
    visualRecipeRef.current = themeRecipe ?? session.recipe;
    wakeRef.current();
  }, [session.recipe, themeRecipe]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setMotionReduced(motionQuery.matches);
    syncMotionPreference();
    motionQuery.addEventListener('change', syncMotionPreference);
    return () => motionQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    if (!host || !canvas || !header || motionReduced !== false || saveData) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let frame = 0;
    let disposed = false;
    let pageVisible = !document.hidden;
    let failed = false;
    let scrollDirty = true;
    let active = false;
    let lastFrameTime = performance.now();
    let lastPaintTime = 0;
    let lastScrollY = Math.max(0, window.scrollY);
    let pendingDelta = 0;
    const initialTravel = Math.max(window.innerHeight * 2.2, 1_200);
    const initialHeaderRect = header.getBoundingClientRect();
    const initiallyActive = initialHeaderRect.top <= 0.5 && lastScrollY > 2;
    let targetFill = initiallyActive
      ? clamp(MIN_FILL + lastScrollY / initialTravel, MIN_FILL, MAX_FILL)
      : MIN_FILL;
    let fill = initiallyActive ? targetFill : 0;
    let speedTarget = 0;
    let speed = 0;
    let directionTarget = 0;
    let direction = 0;
    let opacity = 0;
    let creamTime = 0;
    let renderWidth = 0;
    let renderHeight = 0;
    let renderDpr = 0;
    let downwardTravel = 0;
    let lastDropletSpawn = Number.NEGATIVE_INFINITY;
    let nextDropletDistance = 720;

    const initialVisualRecipe = visualRecipeRef.current;
    const random = createSeededRandom(session.dropletSeed);
    const dropletSlots: DropletSlot[] = Array.from(
      { length: DROP_COUNT },
      () => ({
        active: false,
        x: 0,
        age: 0,
        duration: 1,
        radius: 0,
        strength: 0,
      }),
    );
    const dropletUniforms = Array.from(
      { length: DROP_COUNT },
      () => new THREE.Vector4(0, 0, 0, 0),
    );

    const chooseNextDropletDistance = () => {
      const mobile = (renderWidth || window.innerWidth) < 768;
      nextDropletDistance = mobile
        ? 680 + random() * 360
        : 520 + random() * 360;
    };
    const getDropletCooldown = () =>
      (renderWidth || window.innerWidth) < 768 ? 1_250 : 950;
    chooseNextDropletDistance();

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const updateDroplets = (deltaTime: number) => {
      for (let index = 0; index < DROP_COUNT; index += 1) {
        const slot = dropletSlots[index];
        const uniform = dropletUniforms[index];
        if (!slot.active) {
          uniform.set(0, 0, 0, 0);
          continue;
        }

        slot.age += deltaTime;
        const progress = slot.age / slot.duration;
        if (progress >= 1) {
          slot.active = false;
          uniform.set(0, 0, 0, 0);
          continue;
        }
        uniform.set(slot.x, progress, slot.radius, slot.strength);
      }
    };

    const spawnDroplet = (now: number) => {
      const slotIndex = dropletSlots.findIndex((slot) => !slot.active);
      if (slotIndex < 0) return false;

      const slot = dropletSlots[slotIndex];
      slot.active = true;
      slot.x = 0.07 + random() * 0.86;
      slot.age = 0;
      slot.duration = 0.9 + random() * 0.55;
      slot.radius = 0.018 + random() * 0.013;
      slot.strength = 0.72 + random() * 0.28;
      dropletUniforms[slotIndex].set(slot.x, 0, slot.radius, 0);
      lastDropletSpawn = now;
      chooseNextDropletDistance();
      return true;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderCurrentFrame = () => {
      if (!renderer || !material) return;
      material.uniforms.uTime.value = creamTime;
      material.uniforms.uFill.value = fill;
      material.uniforms.uSpeed.value = speed;
      material.uniforms.uDirection.value = direction;
      material.uniforms.uOpacity.value = opacity;
      renderer.render(scene, camera);
    };

    const blendVisualRecipe = (deltaTime: number) => {
      if (!material) return;
      const target = visualRecipeRef.current;
      const colorEase = 1 - Math.exp(-4.8 * deltaTime);
      const detailEase = 1 - Math.exp(-5.8 * deltaTime);
      lerpColor(material.uniforms.uBaseColor.value, target.base, colorEase);
      lerpColor(material.uniforms.uLightColor.value, target.light, colorEase);
      lerpColor(material.uniforms.uRibbonAColor.value, target.ribbonA, colorEase);
      lerpColor(material.uniforms.uRibbonBColor.value, target.ribbonB, colorEase);
      material.uniforms.uRibbonWeights.value.x += (target.ribbonWeights[0] - material.uniforms.uRibbonWeights.value.x) * detailEase;
      material.uniforms.uRibbonWeights.value.y += (target.ribbonWeights[1] - material.uniforms.uRibbonWeights.value.y) * detailEase;
      material.uniforms.uRidge.value += (target.ridge - material.uniforms.uRidge.value) * detailEase;
      material.uniforms.uGloss.value += (target.gloss - material.uniforms.uGloss.value) * detailEase;
      material.uniforms.uFlowRate.value += (target.flowRate - material.uniforms.uFlowRate.value) * detailEase;
      material.uniforms.uFlowStrength.value += (target.flowStrength - material.uniforms.uFlowStrength.value) * detailEase;
    };

    const resize = () => {
      if (!renderer || !material) return;
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      const dprCap = width < 768 ? 1 : 1.25;
      const pixelBudget = width < 768 ? 420_000 : 820_000;
      const budgetDpr = Math.sqrt(pixelBudget / Math.max(width * height, 1));
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap, budgetDpr);
      if (width === renderWidth && height === renderHeight && dpr === renderDpr) return;
      renderWidth = width;
      renderHeight = height;
      renderDpr = dpr;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      material.uniforms.uAspect.value = width / height;
      scrollDirty = true;
      renderCurrentFrame();
    };

    const updateScrollState = () => {
      const headerRect = header.getBoundingClientRect();
      const nextActive = headerRect.top <= 0.5 && lastScrollY > 2;
      host.style.top = `${Math.max(0, Math.round(headerRect.bottom - 1))}px`;

      if (nextActive) {
        const travel = Math.max(window.innerHeight * 2.2, 1_200);
        const response = pendingDelta < 0 ? 1.25 : 1;
        targetFill = clamp(
          targetFill + (pendingDelta * response) / travel,
          MIN_FILL,
          MAX_FILL,
        );
      } else {
        targetFill = MIN_FILL;
      }

      active = nextActive;
      pendingDelta = 0;
      scrollDirty = false;
    };

    const render = (now: number) => {
      frame = 0;
      if (disposed || failed || !renderer || !material || !pageVisible) return;

      const fps = renderWidth < 768 ? 24 : 30;
      if (lastPaintTime && now - lastPaintTime < 1000 / fps) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.06);
      lastFrameTime = now;
      lastPaintTime = now;

      if (scrollDirty) updateScrollState();

      speedTarget *= Math.exp(-4.4 * deltaTime);
      directionTarget *= Math.exp(-4.0 * deltaTime);
      const fillRate = targetFill >= fill ? 4 : 6;
      const fillEase = 1 - Math.exp(-fillRate * deltaTime);
      const speedEase = 1 - Math.exp(-10 * deltaTime);
      const directionEase = 1 - Math.exp(-7 * deltaTime);
      const opacityTarget = active && !suspendedRef.current ? 1 : 0;

      fill += (targetFill - fill) * fillEase;
      speed += (speedTarget - speed) * speedEase;
      direction += (directionTarget - direction) * directionEase;
      opacity += (opacityTarget - opacity) * (1 - Math.exp(-11 * deltaTime));
      creamTime += deltaTime;
      blendVisualRecipe(deltaTime);
      updateDroplets(deltaTime);
      renderCurrentFrame();

      if (
        (suspendedRef.current && opacity < 0.002) ||
        (!active && opacity < 0.002 && Math.abs(fill - MIN_FILL) < 0.002)
      ) {
        opacity = 0;
        renderCurrentFrame();
        return;
      }
      frame = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (frame || disposed || failed || !pageVisible) return;
      lastFrameTime = performance.now();
      lastPaintTime = 0;
      frame = window.requestAnimationFrame(render);
    };
    wakeRef.current = start;

    const handleScroll = () => {
      const nextScrollY = Math.max(0, window.scrollY);
      const delta = clamp(nextScrollY - lastScrollY, -160, 160);
      lastScrollY = nextScrollY;
      pendingDelta = clamp(pendingDelta + delta, -240, 240);

      if (delta > 0.25) {
        downwardTravel = clamp(downwardTravel + delta, 0, 1_200);
        const now = performance.now();
        const reachedDistance = nextDropletDistance;
        if (
          downwardTravel >= reachedDistance &&
          now - lastDropletSpawn >= getDropletCooldown() &&
          spawnDroplet(now)
        ) {
          downwardTravel = Math.max(0, downwardTravel - reachedDistance);
        }
      } else if (delta < -0.25) {
        downwardTravel = Math.max(0, downwardTravel + delta * 0.8);
      }

      if (Math.abs(delta) > 0.25) {
        speedTarget = Math.max(speedTarget, clamp(Math.abs(delta) / 96, 0, 1));
        directionTarget = Math.sign(delta);
      }
      scrollDirty = true;
      start();
    };

    const handleResize = () => {
      resize();
      start();
    };

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        lastScrollY = Math.max(0, window.scrollY);
        scrollDirty = true;
        start();
      } else {
        stop();
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      failed = true;
      stop();
      host.hidden = true;
    };

    const handleContextRestored = () => {
      if (disposed) return;
      failed = false;
      host.hidden = false;
      lastScrollY = Math.max(0, window.scrollY);
      scrollDirty = true;
      resize();
      start();
    };

    const removeListeners = () => {
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power',
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader: creamScrollTideVertexShader,
        fragmentShader: creamScrollTideFragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          uTime: { value: 0 },
          uFill: { value: 0 },
          uSpeed: { value: 0 },
          uDirection: { value: 0 },
          uAspect: { value: 1 },
          uOpacity: { value: 0 },
          uBaseColor: { value: new THREE.Vector3(...initialVisualRecipe.base) },
          uLightColor: { value: new THREE.Vector3(...initialVisualRecipe.light) },
          uRibbonAColor: { value: new THREE.Vector3(...initialVisualRecipe.ribbonA) },
          uRibbonBColor: { value: new THREE.Vector3(...initialVisualRecipe.ribbonB) },
          uRibbonWeights: {
            value: new THREE.Vector2(...initialVisualRecipe.ribbonWeights),
          },
          uRidge: { value: initialVisualRecipe.ridge },
          uGloss: { value: initialVisualRecipe.gloss },
          uFlowRate: { value: initialVisualRecipe.flowRate },
          uFlowStrength: { value: initialVisualRecipe.flowStrength },
          uMaterialSeed: { value: session.materialPhase },
          uDropletSeed: { value: session.dropletSeed / 0xffffffff },
          uDrops: { value: dropletUniforms },
        },
      });
      scene.add(new THREE.Mesh(geometry, material));

      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(host);
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      window.visualViewport?.addEventListener('resize', handleResize, { passive: true });
      document.addEventListener('visibilitychange', handleVisibility);
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
      resize();
      start();

      return () => {
        disposed = true;
        wakeRef.current = () => undefined;
        stop();
        removeListeners();
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch {
      failed = true;
      wakeRef.current = () => undefined;
      host.hidden = true;
      removeListeners();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
    }
  }, [motionReduced, session]);

  return (
    <div ref={hostRef} className="cream-scroll-tide" aria-hidden="true">
      <canvas ref={canvasRef} className="cream-scroll-tide__canvas" />
    </div>
  );
}
