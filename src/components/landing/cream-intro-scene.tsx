'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  creamFragmentShader,
  creamVertexShader,
} from './cream-shader-source';

type CreamIntroSceneProps = {
  canvasId: string;
  leaving: boolean;
  onFirstFrame: () => void;
  onFailure: () => void;
};

type CreamPrepaint = {
  context: WebGL2RenderingContext;
  stop: () => { timeSeconds: number; wasAnimating: boolean };
  dispose: () => void;
};

type CreamCanvas = HTMLCanvasElement & {
  __creamPrepaint?: CreamPrepaint;
};

const REVEAL_DURATION_SECONDS = 1.68;

function smootherStep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

export default function CreamIntroScene({
  canvasId,
  leaving,
  onFirstFrame,
  onFailure,
}: CreamIntroSceneProps) {
  const leavingRef = useRef(leaving);
  const startRenderingRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    leavingRef.current = leaving;
    if (leaving) startRenderingRef.current();
  }, [leaving]);

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
      preserveDrawingBuffer: true,
      powerPreference: 'low-power',
    };
    const prepaint = canvas.__creamPrepaint;
    const handoff = prepaint?.stop();
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
    let revealElapsed = 0;
    let reveal = leavingRef.current ? 1 : 0;
    let renderWidth = 0;
    let renderHeight = 0;
    let renderDpr = 0;
    const desktopMotionQuery = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');

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
        preserveDrawingBuffer: true,
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
          uAspect: { value: 1 },
        },
      });

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      scene.add(new THREE.Mesh(geometry, material));

      const renderCurrentFrame = () => {
        if (!renderer || !material) return;
        material.uniforms.uTime.value = creamTime;
        material.uniforms.uReveal.value = reveal;
        renderer.render(scene, camera);
      };

      const resize = () => {
        if (!renderer || !material) return;
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const dprCap = width < 768 ? 1.1 : 1.35;
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

        const delta = Math.min((now - lastFrame) / 1000, 0.08);
        if (!leavingRef.current && now - lastFrame < 1000 / 30) {
          frame = window.requestAnimationFrame(render);
          return;
        }

        lastFrame = now;
        creamTime += delta;
        if (leavingRef.current) {
          revealElapsed = Math.min(REVEAL_DURATION_SECONDS, revealElapsed + delta);
          const progress = revealElapsed / REVEAL_DURATION_SECONDS;
          reveal = smootherStep(progress);
        }
        renderCurrentFrame();

        if (!(leavingRef.current && reveal >= 1)) {
          frame = window.requestAnimationFrame(render);
        }
      };

      const start = () => {
        if (!frame && !disposed && pageVisible && (desktopMotionQuery.matches || leavingRef.current)) {
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
        if (desktopMotionQuery.matches || leavingRef.current) start();
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
      desktopMotionQuery.addEventListener('change', handleMotionPreference);
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
        desktopMotionQuery.removeEventListener('change', handleMotionPreference);
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
  }, [canvasId, onFailure, onFirstFrame]);

  return null;
}
