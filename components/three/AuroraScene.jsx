"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// The aurora drifts slowly and is viewed through a heavy blur, so a low,
// capped framerate is imperceptible — and halves GPU load versus 60fps.
const TARGET_FPS = 30;

/*
 * Aurora backdrop.
 *
 * A single full-screen quad whose fragment shader paints flowing curtains of
 * neon light — northern-lights style — over a mostly-dark sky. Soft vertical
 * filaments sway and re-form over time, concentrated in a band and fading to
 * black above and below so there's plenty of negative space (and good text
 * contrast). Nothing falls; the whole field gently breathes and transforms.
 *
 * Everything animates on the GPU from a single `uTime` uniform. Knobs live in
 * DEFAULTS and are overridable via props.
 */
export const DEFAULTS = {
  speed: 0.5, // how fast the curtains shift/transform
  scale: 1.0, // horizontal frequency of the curtains (higher = more, thinner)
  intensity: 1.35, // overall brightness multiplier
  bandLow: 0.04, // bottom of the aurora band (0 = screen bottom)
  bandHigh: 0.95, // top of the aurora band (1 = screen top)
  startDelay: 0.0, // seconds of black before the aurora begins to bloom
  revealDuration: 4.0, // seconds for the bloom to fill the screen
  // Neon palette (kept in sync with the CSS/Tailwind tokens).
  // Order matters: low→high it reads lime → cobalt → purple → magenta, with
  // ember reserved as a rare warm flare.
  colors: ["#aaff00", "#3a86ff", "#9d4edd", "#ff2d95", "#ff5e1a"],
  // A static moment to render for reduced-motion users.
  reducedTime: 6.0,
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Full-screen quad: bypass the camera and emit clip-space directly.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform float uScale;
  uniform float uIntensity;
  uniform float uBandLow;
  uniform float uBandHigh;
  uniform float uReveal; // 0 → 1: aurora blooms out from a single point
  uniform vec3  uC0; // lime  (low)
  uniform vec3  uC1; // cobalt
  uniform vec3  uC2; // purple
  uniform vec3  uC3; // magenta (high)
  uniform vec3  uC4; // ember  (warm flare)

  // --- 2D simplex noise (Ashima Arts, public domain) -----------------------
  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p = p * 2.0 + 7.3;
      a *= 0.5;
    }
    return v;
  }

  // One aurora "strand": a thin luminous filament traced from a flow-warped
  // noise field, so it curves, leans and crosses other strands in any
  // direction rather than hanging straight down.
  float curtain(vec2 uv, float t, float seed, float freq){
    // Flowing 2D warp field. This bends the strands — diagonally, horizontally,
    // in loops — and animates over time so they writhe and intermingle. Two
    // incommensurate time drifts keep the motion from visibly looping.
    vec2 w = vec2(
      fbm(vec2(uv.x * 1.3 + seed,     uv.y * 1.0 - t * 0.18)),
      fbm(vec2(uv.x * 1.0 - t * 0.13, uv.y * 1.3 + seed * 1.7))
    );

    // Only a mild vertical stretch keeps an aurora feel; the warp dominates
    // the direction, so filaments wander instead of standing vertical.
    vec2 p = vec2(uv.x * freq, uv.y * freq * 0.65) + w * 2.2;

    float d = fbm(p + vec2(t * 0.12 + seed, -t * 0.05));
    d = d * 0.5 + 0.5;

    // Thin filaments = a narrow contour of the warped field.
    float band = smoothstep(0.52, 0.72, d) - smoothstep(0.72, 0.95, d);
    band = max(band, 0.0);

    // Fine striations that follow the warped flow (not strictly vertical).
    float striae = 0.6 + 0.4 * (fbm(p * 2.3 + w) * 0.5 + 0.5);

    // Large-scale gating: bright here, dark there, drifting — an irregular,
    // patchy aurora rather than a tiled pattern.
    float regional = fbm(vec2(uv.x * 0.5 - t * 0.03, uv.y * 0.4 + seed * 3.0)) * 0.5 + 0.5;

    return band * striae * (0.35 + 0.9 * regional);
  }

  // Smooth, cyclic weight centered on a hue position (wraps around the wheel).
  float hueBump(float x){
    x = fract(x + 0.5) - 0.5;       // wrap to [-0.5, 0.5]
    return smoothstep(0.4, 0.0, abs(x));
  }

  // Cyclic ramp across the 5 palette colors. No fixed start/end, no dynamic
  // array indexing — feed it a drifting value and the color keeps cycling.
  vec3 palette(float h){
    h = fract(h);
    float w0 = hueBump(h - 0.0);
    float w1 = hueBump(h - 0.2);
    float w2 = hueBump(h - 0.4);
    float w3 = hueBump(h - 0.6);
    float w4 = hueBump(h - 0.8);
    float sum = w0 + w1 + w2 + w3 + w4;
    return (uC0 * w0 + uC1 * w1 + uC2 * w2 + uC3 * w3 + uC4 * w4) / max(sum, 0.001);
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    // Aspect-correct x around center so curtains aren't stretched widescreen.
    vec2 uv = vec2((vUv.x - 0.5) * aspect + 0.5, vUv.y);
    float t = uTime;

    // Vertical envelope: aurora lives in a band, fades to black top & bottom.
    float env = smoothstep(uBandLow, uBandLow + 0.3, vUv.y)
              * (1.0 - smoothstep(uBandHigh - 0.45, uBandHigh, vUv.y));

    float s = uScale;
    float c0 = curtain(uv, t,  0.0, 3.0 * s);
    float c1 = curtain(uv, t, 12.3, 4.6 * s);
    float c2 = curtain(uv, t, 27.7, 6.4 * s);

    // Luminance = the ray / filament STRUCTURE. Sum the strand layers into one
    // brightness field; overlapping strands just get brighter, they don't fight
    // over color.
    float lum = c0 * 1.15 + c1 * 0.90 + c2 * 0.60;

    // Color = large, smoothly-varying ZONES. A single low-frequency field (much
    // coarser than the strands) sets the palette position, so a whole region
    // shares one coherent hue — distinct green / pink / purple zones that blend
    // softly at their edges, like a real aurora — instead of each strand
    // tinting separately and muddying where they cross. The field drifts in
    // space and time, so the zones keep shifting and re-coloring.
    float hue = fbm(vec2(uv.x * 0.55 + t * 0.04, uv.y * 0.35 - t * 0.03)) * 0.85
              + t * 0.04;

    vec3 col = palette(hue) * lum;

    col *= env * uIntensity;

    // Faint atmospheric ground-glow near the bottom of the band.
    col += uC0 * 0.05 * smoothstep(0.45, uBandLow, vUv.y) * env;

    // Soft tone-map so bright crests bloom instead of clipping harshly.
    col = col / (1.0 + col * 0.6);

    // Reveal: bloom outward from a single point (center of the band). A soft
    // expanding disc, plus an extra brightness lift right at the wavefront so
    // it reads as light spreading rather than a wipe.
    vec2 origin = vec2(0.5, mix(uBandLow, uBandHigh, 0.5));
    float dist = length(vec2((vUv.x - origin.x) * aspect, vUv.y - origin.y));
    float radius = uReveal * 1.5;
    float reveal = smoothstep(radius, radius - 0.45, dist);
    float crest = smoothstep(radius - 0.15, radius, dist) * (1.0 - smoothstep(radius, radius + 0.1, dist));
    col *= reveal;
    col += col * crest * 0.6 * (1.0 - uReveal);

    // Glow over the dark page: luminance drives opacity, troughs stay black.
    float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);

    gl_FragColor = vec4(col, a);
  }
`;

function Aurora({ config, reducedMotion, active }) {
  const matRef = useRef();
  const { size, viewport, invalidate } = useThree();
  // Wall-clock start, so animation time is continuous across pause/resume and
  // doesn't depend on R3F's clock (which stalls between on-demand renders).
  const startRef = useRef(null);

  const material = useMemo(() => {
    const c = config.colors.map((hex) => new THREE.Color(hex));
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uScale: { value: config.scale },
        uIntensity: { value: config.intensity },
        uBandLow: { value: config.bandLow },
        uBandHigh: { value: config.bandHigh },
        uReveal: { value: 0 },
        uC0: { value: c[0] },
        uC1: { value: c[1] },
        uC2: { value: c[2] },
        uC3: { value: c[3] },
        uC4: { value: c[4] },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
  }, [config]);

  const dpr = viewport.dpr || 1;

  // Uniform updates run on every rendered frame (driven on-demand below).
  useFrame(() => {
    const u = material.uniforms;
    // Keep the resolution uniform in sync (drives aspect correction).
    u.uResolution.value.set(size.width * dpr, size.height * dpr);

    if (reducedMotion) {
      // No motion, no bloom — show the settled aurora immediately.
      u.uTime.value = config.reducedTime;
      u.uReveal.value = 1;
      return;
    }
    if (startRef.current === null) startRef.current = performance.now();
    const elapsed = (performance.now() - startRef.current) / 1000;
    u.uTime.value = elapsed * config.speed;
    // Ease the bloom in over real seconds (independent of animation speed).
    const p = Math.min(
      Math.max((elapsed - config.startDelay) / config.revealDuration, 0),
      1
    );
    u.uReveal.value = p * p * (3 - 2 * p); // smoothstep ease
  });

  // Render driver. The Canvas is in `demand` mode, so nothing renders unless we
  // ask it to. This single loop does two jobs that together fix the global
  // stutter: (1) it only runs while the hero is on-screen (`active`), so we burn
  // zero GPU once the user scrolls past; (2) it throttles to TARGET_FPS so we
  // never pay for frames the slow, blurred aurora doesn't need.
  useEffect(() => {
    if (reducedMotion) {
      invalidate(); // paint the settled frame once, then stay idle
      return;
    }
    if (!active) return;

    let raf;
    let last = 0;
    const interval = 1000 / TARGET_FPS;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last >= interval) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, invalidate]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} ref={matRef} attach="material" />
    </mesh>
  );
}

export default function AuroraScene({
  reducedMotion = false,
  active = true,
  ...overrides
}) {
  const config = useMemo(() => ({ ...DEFAULTS, ...overrides }), [overrides]);

  return (
    <Canvas
      className="!absolute inset-0"
      // Render only when we explicitly ask (see the driver in <Aurora/>), never
      // on a free-running rAF loop.
      frameloop="demand"
      // A fullscreen quad has no geometry edges, so MSAA is wasted work. And the
      // 16px liquid-glass blur destroys any sub-pixel detail, so rendering above
      // dpr 1 pays 4× on retina for sharpness the user can never see.
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      dpr={1}
      // No camera work needed — the quad is drawn directly in clip space.
    >
      <Aurora config={config} reducedMotion={reducedMotion} active={active} />
    </Canvas>
  );
}
