"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * GPU paint-splatter.
 *
 * Each "splat" is a bucket of paint thrown at the screen. We pre-generate every
 * droplet's launch direction/speed/color/birth-time on the CPU once, upload them
 * as buffer attributes, and animate everything on the GPU from a single `uTime`
 * uniform. No per-frame CPU work besides advancing the clock, so it stays smooth
 * even with tens of thousands of droplets.
 *
 * All the knobs live in DEFAULTS below and are overridable via props.
 */
export const DEFAULTS = {
  startDelay: 1.0, // seconds of dark screen before the first bucket lands
  splatCount: 7, // number of paint buckets
  dropletsPerSplat: 1600, // droplets per bucket
  stagger: 0.16, // seconds between successive buckets
  burstForce: 9.0, // base outward speed of droplets
  spread: 7.0, // how far across the view buckets are scattered
  gravity: 1.6, // subtle downward drift after the burst
  damping: 3.2, // how quickly droplets decelerate and settle
  pointScale: 90.0, // overall droplet size multiplier
  // Neon "spray paint" palette (kept in sync with the CSS/Tailwind tokens).
  colors: ["#ff2d95", "#9d4edd", "#3a86ff", "#ff5e1a", "#aaff00"],
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uGravity;
  uniform float uDamping;
  uniform float uPointScale;

  attribute vec3 aVelocity;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aBirth;

  varying vec3 vColor;
  varying float vFade;

  void main() {
    vColor = aColor;
    float age = uTime - aBirth;

    if (age < 0.0) {
      // Not launched yet — park it offscreen and hide it.
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vFade = 0.0;
      return;
    }

    // Damped outward travel: fast burst that eases to a stop (settles).
    vec3 displacement = aVelocity * (1.0 - exp(-uDamping * age)) / uDamping;
    displacement.y -= 0.5 * uGravity * age * age; // gentle gravity

    vec3 pos = position + displacement;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Grow in quickly, then hold. Slight long-tail fade so it "dries".
    float grow = clamp(age / 0.12, 0.0, 1.0);
    float settle = 1.0 - smoothstep(4.0, 9.0, age) * 0.35;
    vFade = grow * settle;

    gl_PointSize = aSize * uPointScale * grow * (1.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vFade;

  void main() {
    // Soft circular droplet with a hot neon core (additive-friendly).
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float edge = smoothstep(0.5, 0.12, d);
    float core = smoothstep(0.5, 0.0, d);
    vec3 col = vColor * (0.55 + 0.9 * core);

    gl_FragColor = vec4(col, edge * vFade);
  }
`;

function Splatter({ config, reducedMotion }) {
  const matRef = useRef();
  const startRef = useRef(null);

  const { geometry, uniforms } = useMemo(() => {
    const {
      splatCount,
      dropletsPerSplat,
      stagger,
      startDelay,
      burstForce,
      spread,
      colors,
    } = config;

    const total = splatCount * dropletsPerSplat;
    const positions = new Float32Array(total * 3);
    const velocities = new Float32Array(total * 3);
    const colorArr = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const births = new Float32Array(total);

    const palette = colors.map((c) => new THREE.Color(c));

    let i = 0;
    for (let s = 0; s < splatCount; s++) {
      // Each bucket: a launch origin scattered across the view, a single color,
      // and a moment it lands.
      const ox = (Math.random() - 0.5) * spread * 2;
      const oy = (Math.random() - 0.5) * spread;
      const oz = (Math.random() - 0.5) * 2;
      const birth = startDelay + s * stagger + Math.random() * 0.05;
      const color = palette[s % palette.length];

      for (let d = 0; d < dropletsPerSplat; d++) {
        const i3 = i * 3;
        positions[i3] = ox;
        positions[i3 + 1] = oy;
        positions[i3 + 2] = oz;

        // Radial burst, biased to the view plane (small z spread).
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = burstForce * (0.25 + Math.pow(Math.random(), 0.5));
        velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
        velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
        velocities[i3 + 2] = Math.cos(phi) * speed * 0.25;

        // Slight per-droplet color variation around the bucket's hue.
        colorArr[i3] = color.r;
        colorArr[i3 + 1] = color.g;
        colorArr[i3 + 2] = color.b;

        // Mostly small droplets, a few big blobs.
        sizes[i] = 0.6 + Math.pow(Math.random(), 3) * 4.0;
        births[i] = birth;
        i++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colorArr, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aBirth", new THREE.BufferAttribute(births, 1));

    const uni = {
      uTime: { value: 0 },
      uGravity: { value: config.gravity },
      uDamping: { value: config.damping },
      uPointScale: { value: config.pointScale },
    };

    return { geometry: geo, uniforms: uni };
  }, [config]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;

    if (reducedMotion) {
      // Jump straight to the settled state — no burst animation.
      matRef.current.uniforms.uTime.value =
        config.startDelay + config.splatCount * config.stagger + 6.0;
      return;
    }

    if (startRef.current === null) startRef.current = clock.elapsedTime;
    matRef.current.uniforms.uTime.value = clock.elapsedTime - startRef.current;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function PaintSplatScene({ reducedMotion = false, ...overrides }) {
  const config = useMemo(() => ({ ...DEFAULTS, ...overrides }), [overrides]);

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 14], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Splatter config={config} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
