'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type CreamIntroSceneProps = {
  leaving: boolean;
  onFirstFrame: () => void;
  onFailure: () => void;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uReveal;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value;
  }

  float bell(float x, float center, float width) {
    float d = (x - center) / width;
    return exp(-d * d);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * uAspect + 0.5, uv.y);
    float drift = uTime * 0.045;
    float churn = fbm(p * vec2(2.2, 3.4) + vec2(drift, -drift * 0.7));
    float folds = sin(p.x * 6.4 + p.y * 2.7 + churn * 4.8 - uTime * 0.16);
    float softFold = folds * 0.5 + 0.5;

    vec3 vanilla = vec3(0.953, 0.894, 0.788);
    vec3 milk = vec3(1.0, 0.976, 0.918);
    vec3 strawberry = vec3(0.674, 0.224, 0.302);
    vec3 pistachio = vec3(0.416, 0.522, 0.365);

    float berryRibbon = smoothstep(0.62, 0.93, softFold + (churn - 0.5) * 0.32);
    float greenRibbon = smoothstep(0.70, 0.96, (1.0 - softFold) + (churn - 0.5) * 0.24);
    float ridge = pow(1.0 - abs(folds), 8.0);
    float gloss = pow(abs(folds), 12.0) * 0.08 + smoothstep(0.72, 0.98, churn) * 0.05;

    vec3 color = mix(vanilla, milk, 0.28 + churn * 0.24);
    color = mix(color, strawberry, berryRibbon * 0.31);
    color = mix(color, pistachio, greenRibbon * 0.18);
    color *= 1.0 - ridge * 0.11;
    color += vec3(gloss);
    color += (noise(uv * 120.0) - 0.5) * 0.012;

    float revealEdge = uReveal * 1.32 - 0.16;
    float edgeNoise = (noise(vec2(uv.x * 4.8, uTime * 0.08)) - 0.5) * 0.075;
    float dripWindow = smoothstep(0.08, 0.28, uReveal) * (1.0 - smoothstep(0.76, 0.98, uReveal));
    float drips = (
      bell(uv.x, 0.19, 0.055) * 0.095 +
      bell(uv.x, 0.54, 0.08) * 0.052 +
      bell(uv.x, 0.81, 0.045) * 0.078
    ) * dripWindow;
    float creamLip = uv.y + edgeNoise + drips;
    float alpha = smoothstep(revealEdge - 0.038, revealEdge + 0.038, creamLip);
    float edgeLight = exp(-abs(creamLip - revealEdge) * 48.0) * dripWindow;
    color += edgeLight * vec3(0.085, 0.065, 0.045);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function CreamIntroScene({
  leaving,
  onFirstFrame,
  onFailure,
}: CreamIntroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavingRef = useRef(leaving);

  useEffect(() => {
    leavingRef.current = leaving;
  }, [leaving]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let frame = 0;
    let disposed = false;
    let pageVisible = !document.hidden;
    let firstFrame = true;
    let lastFrame = performance.now();
    let elapsed = 0;
    let reveal = leavingRef.current ? 1 : 0;

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
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
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
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

      const resize = () => {
        if (!renderer || !material) return;
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const dprCap = width < 768 ? 1.1 : 1.35;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
        renderer.setSize(width, height, false);
        material.uniforms.uAspect.value = width / height;
      };

      const render = (now: number) => {
        frame = 0;
        if (disposed || !renderer || !material || !pageVisible) return;

        const delta = Math.min((now - lastFrame) / 1000, 0.08);
        if (now - lastFrame < 1000 / 30) {
          frame = window.requestAnimationFrame(render);
          return;
        }

        lastFrame = now;
        elapsed += delta;
        if (leavingRef.current) reveal = Math.min(1, reveal + delta * 1.16);
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uReveal.value = reveal;
        renderer.render(scene, camera);

        if (firstFrame) {
          firstFrame = false;
          onFirstFrame();
        }

        if (!(leavingRef.current && reveal >= 1)) {
          frame = window.requestAnimationFrame(render);
        }
      };

      const start = () => {
        if (!frame && !disposed && pageVisible) {
          lastFrame = performance.now();
          frame = window.requestAnimationFrame(render);
        }
      };

      const handleVisibility = () => {
        pageVisible = !document.hidden;
        if (pageVisible) start();
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
      canvas.addEventListener('webglcontextlost', handleContextLost);
      resize();
      start();

      return () => {
        disposed = true;
        stop();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibility);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
      };
    } catch {
      disposed = true;
      stop();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      onFailure();
    }
  }, [onFailure, onFirstFrame]);

  return <canvas ref={canvasRef} className="cream-intro-canvas" />;
}
