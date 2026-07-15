export const creamScrollTideVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const creamScrollTideFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFill;
  uniform float uSpeed;
  uniform float uDirection;
  uniform float uAspect;
  uniform float uOpacity;
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

  void main() {
    float depth = 1.0 - vUv.y;
    vec2 p = vec2((vUv.x - 0.5) * uAspect + 0.5, depth);

    vec2 localFold = vec2(
      sin(p.y * 3.1 + uTime * 0.22) - sin(p.y * 3.1),
      cos(p.x * 2.4 - uTime * 0.18) - cos(p.x * 2.4)
    ) * 0.028;
    float churn = fbm((p + localFold) * vec2(2.35, 4.0));
    float foldMotion = (sin(p.y * 2.2 + uTime * 0.17) - sin(p.y * 2.2)) * 0.16;
    float folds = sin(p.x * 7.1 + p.y * 3.0 + churn * 4.7 + foldMotion);
    float softFold = folds * 0.5 + 0.5;

    vec3 vanilla = vec3(0.953, 0.894, 0.788);
    vec3 milk = vec3(1.0, 0.976, 0.918);
    vec3 strawberry = vec3(0.674, 0.224, 0.302);
    vec3 pistachio = vec3(0.416, 0.522, 0.365);

    float berryRibbon = smoothstep(0.64, 0.94, softFold + (churn - 0.5) * 0.30);
    float greenRibbon = smoothstep(0.73, 0.97, (1.0 - softFold) + (churn - 0.5) * 0.22);
    float ridge = pow(1.0 - abs(folds), 8.0);
    float gloss = pow(abs(folds), 12.0) * 0.07 + smoothstep(0.74, 0.98, churn) * 0.045;

    vec3 color = mix(vanilla, milk, 0.30 + churn * 0.22);
    color = mix(color, strawberry, berryRibbon * 0.28);
    color = mix(color, pistachio, greenRibbon * 0.15);
    color *= 1.0 - ridge * 0.105;
    color += vec3(gloss);
    color += (noise(vUv * 108.0) - 0.5) * 0.009;

    float edgeMotion = 0.017 + uSpeed * 0.034;
    float lipNoise = (fbm(vec2(vUv.x * 5.2, uTime * 0.075)) - 0.5) * edgeMotion;
    float downward = max(uDirection, 0.0) * uSpeed * (
      bell(vUv.x, 0.18, 0.052) * 0.082 +
      bell(vUv.x, 0.51, 0.078) * 0.052 +
      bell(vUv.x, 0.82, 0.048) * 0.071
    );
    float upward = max(-uDirection, 0.0) * uSpeed * (
      bell(vUv.x, 0.31, 0.10) * 0.036 +
      bell(vUv.x, 0.70, 0.12) * 0.029
    );
    float edge = clamp(uFill + lipNoise + downward - upward, 0.0, 0.94);
    float alpha = (1.0 - smoothstep(edge - 0.026, edge + 0.034, depth)) * uOpacity;
    float edgeLight = exp(-abs(depth - edge) * 54.0) * uOpacity;
    color += edgeLight * vec3(0.07, 0.052, 0.038);

    gl_FragColor = vec4(color, alpha);
  }
`;
