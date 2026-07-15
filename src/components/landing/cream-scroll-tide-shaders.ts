export const creamScrollTideVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const creamScrollTideFragmentShader = /* glsl */ `
  precision highp float;

  #define TAU 6.28318530718
  #define DROP_COUNT 4

  uniform float uTime;
  uniform float uFill;
  uniform float uSpeed;
  uniform float uDirection;
  uniform float uAspect;
  uniform float uOpacity;
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
  uniform vec4 uDrops[DROP_COUNT];
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
    for (int i = 0; i < 4; i++) {
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

  float lipAt(float x) {
    float fill = smoothstep(0.0, 1.0, uFill);
    float seed = uDropletSeed * 91.73 + uMaterialSeed * 0.071;
    float phase = hash(vec2(seed, 6.17)) * TAU;
    float shapeGate = mix(0.35, 1.0, fill);
    float slowPulse = sin(uTime * 0.21 + phase);

    // The canvas remains tall enough for falling drops, while the attached
    // layer itself is deliberately shallow.
    float base = mix(0.045, 0.205, fill);
    float broad =
      sin(
        TAU * x * 1.12 + phase +
        sin(uTime * 0.18 + phase * 0.37) * 0.28
      ) * (0.031 + slowPulse * 0.005) +
      sin(
        TAU * x * 2.05 - phase * 0.63 +
        sin(uTime * 0.14 - phase * 0.29) * 0.34
      ) * (0.016 - slowPulse * 0.003);

    float c0 =
      0.12 + hash(vec2(seed, 1.13)) * 0.16 +
      sin(uTime * 0.16 + phase * 1.17) * 0.010;
    float c1 =
      0.38 + hash(vec2(seed, 2.71)) * 0.20 +
      sin(uTime * 0.13 - phase * 0.73) * 0.013;
    float c2 =
      0.70 + hash(vec2(seed, 4.93)) * 0.18 +
      sin(uTime * 0.19 + phase * 0.41) * 0.009;
    float lobes =
      bell(x, c0, 0.105) * (0.064 + slowPulse * 0.007) +
      bell(x, c1, 0.145) * (0.047 - slowPulse * 0.005) +
      bell(x, c2, 0.095) *
        (0.073 + sin(uTime * 0.17 - phase) * 0.007) -
      bell(x, mix(c0, c1, 0.52), 0.075) * 0.022;

    float knead =
      sin(
        TAU * x * 1.45 + phase +
        sin(uTime * 0.27 + phase * 0.23) * 0.42
      ) * 0.010 +
      sin(
        TAU * x * 3.10 - phase * 0.31 +
        sin(uTime * 0.20 - phase * 0.19) * 0.38
      ) * 0.006;
    float deposit = max(uDirection, 0.0) * uSpeed *
      bell(x, c2 + 0.03 * sin(uTime * 0.72 + phase), 0.075) * 0.045;
    float scrape = max(-uDirection, 0.0) * uSpeed *
      (bell(x, c0, 0.13) + bell(x, c1, 0.16)) * 0.025;

    return clamp(
      base + (broad + lobes) * shapeGate + knead + deposit - scrape,
      0.018,
      0.38
    );
  }

  void main() {
    float depth = 1.0 - vUv.y;
    vec2 materialPoint = vec2(
      (vUv.x - 0.5) * uAspect + 0.5,
      depth
    );
    float flowTime = uTime * uFlowRate;
    vec2 localFold = vec2(
      sin(materialPoint.y * 3.1 + flowTime * 0.31 + uMaterialSeed) -
        sin(materialPoint.y * 3.1 + uMaterialSeed),
      cos(materialPoint.x * 2.4 - flowTime * 0.25 - uMaterialSeed * 0.37) -
        cos(materialPoint.x * 2.4 - uMaterialSeed * 0.37)
    ) * uFlowStrength;
    float churn = fbm(
      (materialPoint + localFold) * vec2(2.25, 3.75) +
      vec2(uMaterialSeed * 0.17, uMaterialSeed * 0.11)
    );
    float foldMotion =
      (sin(materialPoint.y * 2.2 + flowTime * 0.24 + uMaterialSeed) -
        sin(materialPoint.y * 2.2 + uMaterialSeed)) * 0.17;
    float folds = sin(
      materialPoint.x * 6.8 +
      materialPoint.y * 3.0 +
      churn * 4.7 +
      foldMotion +
      uMaterialSeed * 0.19
    );
    float softFold = folds * 0.5 + 0.5;

    float ribbonA = smoothstep(
      0.63,
      0.94,
      softFold + (churn - 0.5) * 0.31
    );
    float ribbonB = smoothstep(
      0.71,
      0.97,
      (1.0 - softFold) + (churn - 0.5) * 0.23
    );
    float ridge = pow(1.0 - abs(folds), 8.0);
    float gloss =
      pow(abs(folds), 12.0) * 0.075 +
      smoothstep(0.73, 0.98, churn) * 0.048;

    vec3 color = mix(uBaseColor, uLightColor, 0.28 + churn * 0.24);
    color = mix(color, uRibbonAColor, ribbonA * uRibbonWeights.x);
    color = mix(color, uRibbonBColor, ribbonB * uRibbonWeights.y);
    color *= 1.0 - ridge * uRidge;
    color += uLightColor * gloss * uGloss;
    color += (noise(vUv * 112.0 + uMaterialSeed) - 0.5) * 0.009;

    float edge = lipAt(vUv.x);
    float bodyDistance = depth - edge;
    float bodyAA = max(fwidth(bodyDistance) * 1.35, 0.0025);
    float bodyMask = 1.0 - smoothstep(-bodyAA, bodyAA, bodyDistance);

    // CPU-owned slots let each drop finish its fall independently from the
    // short scroll-speed impulse. Their small neck and bulb form a teardrop,
    // but a fixed transparent gap keeps them detached from the lip.
    float dropMask = 0.0;
    for (int i = 0; i < DROP_COUNT; i++) {
      vec4 drop = uDrops[i];
      if (drop.w <= 0.001 || drop.z <= 0.0001) continue;
      float progress = clamp(drop.y, 0.0, 1.0);
      float radius = drop.z;
      float sourceEdge = lipAt(drop.x);
      float ry = radius * mix(1.65, 1.05, progress);
      float randomGap = hash(vec2(uDropletSeed, float(i) + 8.0));
      float gap = 0.014 + randomGap * 0.014;
      float fall = pow(progress, 1.7) * max(0.68, 0.88 - sourceEdge);
      float centerY = sourceEdge + gap + ry * 1.55 + fall;
      vec2 dropPoint = vec2(
        (vUv.x - drop.x) * uAspect,
        depth - centerY
      );

      float bulbDistance =
        (length(dropPoint / vec2(radius, ry)) - 1.0) * radius;
      float neckDistance = (
        length(
          (dropPoint + vec2(0.0, ry * 0.82)) /
          vec2(radius * 0.34, ry * 0.68)
        ) - 1.0
      ) * radius;
      float dropDistance = min(bulbDistance, neckDistance);
      float dropAA = max(fwidth(dropDistance) * 1.3, 0.0015);
      float life =
        smoothstep(0.02, 0.12, progress) *
        (1.0 - smoothstep(0.78, 1.0, progress)) *
        drop.w;
      float shape =
        (1.0 - smoothstep(-dropAA, dropAA, dropDistance)) * life;
      dropMask = max(dropMask, shape);
    }

    float alpha = max(bodyMask, dropMask) * uOpacity;
    float edgeLight = exp(-abs(bodyDistance) * 62.0) * bodyMask;
    color += uLightColor * edgeLight * 0.075;

    gl_FragColor = vec4(color, alpha);
  }
`;
