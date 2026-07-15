import {
  creamBootstrapFragmentShader,
  creamBootstrapVertexShader,
} from './cream-shader-source';
import { CREAM_INTRO_CANVAS_ID } from './cream-canvas-id';

const canvasId = JSON.stringify(CREAM_INTRO_CANVAS_ID);
const vertexSource = JSON.stringify(creamBootstrapVertexShader);
const fragmentSource = JSON.stringify(creamBootstrapFragmentShader);

export const creamBootstrapScript = `(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection?.saveData === true;
  if (reduceMotion || saveData) return;

  const root = document.documentElement;
  root.classList.add('cream-intro-active');
  window.setTimeout(() => {
    const intro = document.querySelector('.cream-intro');
    if (!intro || getComputedStyle(intro).visibility === 'hidden') {
      root.classList.remove('cream-intro-active');
    }
  }, 7400);

  let complete = false;

  const boot = () => {
    if (complete) return true;
    const canvas = document.getElementById(${canvasId});
    const host = canvas?.parentElement;
    if (!canvas || !host) return false;
    complete = true;

    let gl;
    let program;
    let vertex;
    let fragment;
    let vao;
    let resizeObserver;
    let frame = 0;
    let disposed = false;
    let pageVisible = !document.hidden;
    let lastFrame = performance.now();
    let creamTime = 0;
    let handleVisibility = () => undefined;
    let handleMotionPreference = () => undefined;
    const ambientMotionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');

    const stopAnimation = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const stop = () => {
      stopAnimation();
      resizeObserver?.disconnect();
      return {
        timeSeconds: creamTime,
        wasAnimating: ambientMotionQuery.matches,
      };
    };

    const release = () => {
      if (disposed) return;
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      ambientMotionQuery.removeEventListener('change', handleMotionPreference);
      if (vao) gl?.deleteVertexArray(vao);
      if (program) gl?.deleteProgram(program);
      if (vertex) gl?.deleteShader(vertex);
      if (fragment) gl?.deleteShader(fragment);
    };

    try {
      canvas.__creamPrepaint?.dispose?.();
      gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power',
      });
      if (!gl) return true;

      const compile = (type, source) => {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('Shader unavailable');
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          const info = gl.getShaderInfoLog(shader) || 'Unknown shader error';
          gl.deleteShader(shader);
          throw new Error(info);
        }
        return shader;
      };

      vertex = compile(gl.VERTEX_SHADER, ${vertexSource});
      fragment = compile(gl.FRAGMENT_SHADER, ${fragmentSource});
      program = gl.createProgram();
      if (!program) throw new Error('Program unavailable');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program link failed');
      }

      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.useProgram(program);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);

      const timeLocation = gl.getUniformLocation(program, 'uTime');
      const revealLocation = gl.getUniformLocation(program, 'uReveal');
      const aspectLocation = gl.getUniformLocation(program, 'uAspect');
      const draw = (time = creamTime) => {
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        const dprCap = width < 768 ? 1 : 1.35;
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        const pixelWidth = Math.max(1, Math.floor(width * dpr));
        const pixelHeight = Math.max(1, Math.floor(height * dpr));
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
        }
        gl.viewport(0, 0, pixelWidth, pixelHeight);
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.uniform1f(timeLocation, time);
        gl.uniform1f(revealLocation, 0);
        gl.uniform1f(aspectLocation, width / height);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const render = (now) => {
        frame = 0;
        if (disposed || !pageVisible || !ambientMotionQuery.matches) return;
        const fps = host.clientWidth < 768 ? 24 : 30;
        if (now - lastFrame < 1000 / fps) {
          frame = window.requestAnimationFrame(render);
          return;
        }
        const delta = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;
        creamTime += delta;
        draw(creamTime);
        frame = window.requestAnimationFrame(render);
      };

      const start = () => {
        if (frame || disposed || !pageVisible || !ambientMotionQuery.matches) return;
        lastFrame = performance.now();
        frame = window.requestAnimationFrame(render);
      };

      handleVisibility = () => {
        pageVisible = !document.hidden;
        if (pageVisible) start();
        else stopAnimation();
      };

      handleMotionPreference = () => {
        if (ambientMotionQuery.matches) start();
        else stopAnimation();
      };

      draw(0);
      resizeObserver = new ResizeObserver(() => draw(creamTime));
      resizeObserver.observe(host);
      document.addEventListener('visibilitychange', handleVisibility);
      ambientMotionQuery.addEventListener('change', handleMotionPreference);
      canvas.__creamPrepaint = {
        context: gl,
        stop,
        dispose: release,
      };
      start();
    } catch {
      release();
    }
    return true;
  };

  if (boot()) return;

  const observer = new MutationObserver(() => {
    if (boot()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', () => {
    boot();
    observer.disconnect();
  }, { once: true });
})();`;
