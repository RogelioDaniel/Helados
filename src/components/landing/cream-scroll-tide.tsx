'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  creamScrollTideFragmentShader,
  creamScrollTideVertexShader,
} from './cream-scroll-tide-shaders';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type CreamScrollTideProps = {
  suspended?: boolean;
};

const MIN_FILL = 0.055;
const MAX_FILL = 0.82;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function CreamScrollTide({ suspended = false }: CreamScrollTideProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const suspendedRef = useRef(suspended);
  const [motionReduced, setMotionReduced] = useState<boolean | null>(null);

  useEffect(() => {
    suspendedRef.current = suspended;
  }, [suspended]);

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
    const initialTravel = Math.max(window.innerHeight * 0.78, 460);
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

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const renderCurrentFrame = () => {
      if (!renderer || !material) return;
      material.uniforms.uTime.value = creamTime;
      material.uniforms.uFill.value = fill;
      material.uniforms.uSpeed.value = speed;
      material.uniforms.uDirection.value = direction;
      material.uniforms.uOpacity.value = opacity;
      renderer.render(scene, camera);
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
        const travel = Math.max(window.innerHeight * 0.78, 460);
        targetFill = clamp(targetFill + pendingDelta / travel, MIN_FILL, MAX_FILL);
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

      speedTarget *= Math.exp(-8 * deltaTime);
      directionTarget *= Math.exp(-7 * deltaTime);
      const fillEase = 1 - Math.exp(-8.5 * deltaTime);
      const speedEase = 1 - Math.exp(-13 * deltaTime);
      const directionEase = 1 - Math.exp(-9 * deltaTime);
      const opacityTarget = active && !suspendedRef.current ? 1 : 0;

      fill += (targetFill - fill) * fillEase;
      speed += (speedTarget - speed) * speedEase;
      direction += (directionTarget - direction) * directionEase;
      opacity += (opacityTarget - opacity) * (1 - Math.exp(-11 * deltaTime));
      creamTime += deltaTime * 0.72;
      renderCurrentFrame();

      if (!active && opacity < 0.002 && Math.abs(fill - MIN_FILL) < 0.002) {
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

    const handleScroll = () => {
      const nextScrollY = Math.max(0, window.scrollY);
      const delta = clamp(nextScrollY - lastScrollY, -160, 160);
      lastScrollY = nextScrollY;
      pendingDelta = clamp(pendingDelta + delta, -240, 240);
      if (Math.abs(delta) > 0.25) {
        speedTarget = Math.max(speedTarget, clamp(Math.abs(delta) / 92, 0, 1));
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

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

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
        },
      });
      scene.add(new THREE.Mesh(geometry, material));

      const resizeObserver = new ResizeObserver(handleResize);
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
        stop();
        resizeObserver.disconnect();
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch {
      failed = true;
      host.hidden = true;
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
    }
  }, [motionReduced]);

  return (
    <div ref={hostRef} className="cream-scroll-tide" aria-hidden="true">
      <canvas ref={canvasRef} className="cream-scroll-tide__canvas" />
    </div>
  );
}
