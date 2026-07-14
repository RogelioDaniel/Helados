'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

function createTrace(radius: number, phase: number, color: number, opacity: number) {
  const points = Array.from({ length: 108 }, (_, index) => {
    const angle = (index / 108) * Math.PI * 2;
    const imperfectRadius =
      radius + Math.sin(angle * 3 + phase) * 0.045 + Math.sin(angle * 7 - phase) * 0.016;
    return new THREE.Vector3(
      Math.cos(angle) * imperfectRadius,
      Math.sin(angle) * imperfectRadius * 0.67,
      Math.sin(angle * 2 + phase) * 0.09,
    );
  });
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
  const geometry = new THREE.TubeGeometry(curve, 144, 0.009, 5, true);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    if (motionQuery.matches || saveData) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 40);
    camera.position.set(0, 0, 8);

    const traceGroup = new THREE.Group();
    scene.add(traceGroup);

    const traces = [
      createTrace(1.72, 0.2, 0x8e2f3f, 0.46),
      createTrace(1.35, 1.7, 0xf4ead9, 0.38),
      createTrace(1.02, 2.8, 0x789170, 0.4),
    ];
    traces.forEach((trace, index) => {
      trace.rotation.x = -0.18 + index * 0.11;
      trace.rotation.y = 0.22 - index * 0.09;
      traceGroup.add(trace);
    });

    const beadGeometry = new THREE.SphereGeometry(0.06, 20, 14);
    const beadMaterials = [
      new THREE.MeshPhysicalMaterial({ color: 0xf6ead5, roughness: 0.38, clearcoat: 0.35 }),
      new THREE.MeshPhysicalMaterial({ color: 0x9b3b50, roughness: 0.42, clearcoat: 0.25 }),
      new THREE.MeshPhysicalMaterial({ color: 0x8da17e, roughness: 0.44, clearcoat: 0.2 }),
    ];
    const beads = beadMaterials.map((material) => {
      const bead = new THREE.Mesh(beadGeometry, material);
      traceGroup.add(bead);
      return bead;
    });

    const particleCount = host.clientWidth < 720 ? 180 : 360;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.9 + Math.random() * 1.3;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 0.62;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf6e6cf,
      size: 0.016,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    traceGroup.add(particles);

    scene.add(new THREE.HemisphereLight(0xfff4df, 0x4a1f29, 1.7));
    const keyLight = new THREE.DirectionalLight(0xffead1, 2.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    let visible = true;
    let pageVisible = !document.hidden;
    let frame = 0;
    let firstFrame = true;

    const positionBeads = (elapsed: number) => {
      beads.forEach((bead, index) => {
        const angle = elapsed * (0.24 + index * 0.035) + index * 2.1;
        const radius = 1.08 + index * 0.26;
        bead.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.67,
          Math.sin(angle * 1.7) * 0.18,
        );
      });
    };

    const renderFrame = (time = 0) => {
      frame = 0;
      if (!visible || !pageVisible || motionQuery.matches) return;

      const elapsed = time * 0.001;
      pointer.lerp(target, 0.045);
      traceGroup.rotation.x += (pointer.y * 0.13 - traceGroup.rotation.x) * 0.045;
      traceGroup.rotation.y += (pointer.x * 0.18 - traceGroup.rotation.y) * 0.045;
      traces.forEach((trace, index) => {
        trace.rotation.z = elapsed * (index % 2 === 0 ? 0.035 : -0.028) + index * 0.14;
      });
      particles.rotation.z = elapsed * -0.018;
      positionBeads(elapsed);
      renderer.render(scene, camera);

      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
      frame = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (!frame && visible && pageVisible && !motionQuery.matches) {
        frame = window.requestAnimationFrame(renderFrame);
      }
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const compact = width < 720;
      traceGroup.position.set(compact ? 0.7 : 1.9, compact ? -0.55 : 0.55, 0);
      traceGroup.scale.setScalar(compact ? 0.62 : 0.76);
      renderer.render(scene, camera);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      target.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      );
    };

    const handlePointerLeave = () => target.set(0, 0);
    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    const handleMotionChange = () => {
      if (motionQuery.matches) stop();
      else start();
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(host);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    host.addEventListener('pointermove', handlePointerMove, { passive: true });
    host.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', handleMotionChange);

    resize();
    positionBeads(0);
    start();

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', handleMotionChange);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-scene-canvas ${ready ? 'hero-scene-canvas-ready' : ''}`}
    />
  );
}
