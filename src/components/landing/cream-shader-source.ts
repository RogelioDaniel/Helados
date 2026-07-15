export const creamVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const creamFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uReveal;
  uniform float uAspect;
  uniform vec3 uBaseColor;
  uniform vec3 uLightColor;
  uniform vec3 uRibbonAColor;
  uniform vec3 uRibbonBColor;
  uniform vec2 uRibbonWeights;
  uniform float uRidge;
  uniform float uGloss;
  uniform float uFlowRate;
  uniform float uFlowStrength;
  uniform float uMaterialSeed;
  uniform float uDropletSeed;
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
    float materialTime = uTime * uFlowRate;
    vec2 seedOffset = vec2(
      fract(uMaterialSeed * 0.754877),
      fract(uMaterialSeed * 0.569841)
    ) * 4.0;
    float flowGate = smoothstep(0.0, 0.72, materialTime);
    vec2 flow = vec2(
      sin(p.y * 2.7 + materialTime * 0.34) - sin(p.y * 2.7),
      cos(p.x * 2.2 - materialTime * 0.27) - cos(p.x * 2.2)
    ) * (uFlowStrength * flowGate);
    vec2 knead = vec2(
      sin(p.y * 4.1 - materialTime * 0.19) - sin(p.y * 4.1),
      sin(p.x * 3.3 + materialTime * 0.17) - sin(p.x * 3.3)
    ) * (uFlowStrength * 0.46 * flowGate);
    float churn = fbm((p + seedOffset + flow + knead) * vec2(2.2, 3.4));
    float foldMotion =
      (sin(p.y * 1.9 + materialTime * 0.27) - sin(p.y * 1.9)) * 0.22
      + (cos(p.x * 2.6 - materialTime * 0.18) - cos(p.x * 2.6)) * 0.085;
    float folds = sin(
      (p.x + seedOffset.x) * 6.4
      + (p.y + seedOffset.y) * 2.7
      + churn * 4.8
      + foldMotion
    );
    float softFold = folds * 0.5 + 0.5;

    float berryRibbon = smoothstep(0.62, 0.93, softFold + (churn - 0.5) * 0.32);
    float greenRibbon = smoothstep(0.70, 0.96, (1.0 - softFold) + (churn - 0.5) * 0.24);
    float ridge = pow(1.0 - abs(folds), 8.0);
    float gloss = (
      pow(abs(folds), 12.0) * 0.72
      + smoothstep(0.72, 0.98, churn) * 0.42
    ) * uGloss;

    vec3 color = mix(uBaseColor, uLightColor, 0.28 + churn * 0.24);
    color = mix(color, uRibbonAColor, berryRibbon * uRibbonWeights.x);
    color = mix(color, uRibbonBColor, greenRibbon * uRibbonWeights.y);
    color *= 1.0 - ridge * uRidge;
    color += vec3(gloss);
    color += (noise(uv * 120.0 + seedOffset * 13.0) - 0.5) * 0.012;

    float revealEdge = uReveal * 1.32 - 0.16;
    float edgeNoise = (
      noise(vec2(
        uv.x * 4.8 + uDropletSeed * 9.0,
        materialTime * 0.15 + uReveal * 1.6
      )) - 0.5
    ) * 0.088;
    float dripWindow = smoothstep(0.08, 0.28, uReveal) * (1.0 - smoothstep(0.76, 0.98, uReveal));
    float dripA = mix(0.13, 0.27, hash(vec2(uDropletSeed, 1.17)));
    float dripB = mix(0.43, 0.61, hash(vec2(uDropletSeed, 2.83)));
    float dripC = mix(0.73, 0.88, hash(vec2(uDropletSeed, 4.41)));
    float dripPulse = 0.9 + sin(materialTime * 0.92 + uDropletSeed * 6.2831) * 0.1;
    float drips = (
      bell(uv.x, dripA, 0.055) * 0.105 +
      bell(uv.x, dripB, 0.08) * 0.058 +
      bell(uv.x, dripC, 0.045) * 0.087
    ) * dripWindow * dripPulse;
    float creamLip = uv.y + edgeNoise + drips;
    float alpha = smoothstep(revealEdge - 0.038, revealEdge + 0.038, creamLip);
    float edgeLight = exp(-abs(creamLip - revealEdge) * 48.0) * dripWindow;
    color += edgeLight * vec3(0.085, 0.065, 0.045);

    gl_FragColor = vec4(color, alpha);
  }
`;

export const creamBootstrapVertexShader = /* glsl */ `#version 300 es
  precision highp float;
  out vec2 vUv;

  void main() {
    vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    vUv = position;
    gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
  }
`;

const bootstrapFragmentBody = creamFragmentShader
  .replace('varying vec2 vUv;', 'in vec2 vUv;\nout vec4 fragColor;')
  .replace(
    'gl_FragColor = vec4(color, alpha);',
    'fragColor = vec4(color, alpha);',
  );

export const creamBootstrapFragmentShader = /* glsl */ `#version 300 es
${bootstrapFragmentBody}`;
