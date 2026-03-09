"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
 * 寒江独钓 — Solitary Angler on a Winter River
 *
 * Concept: The painting is 90% emptiness. The emptiness IS the painting.
 * Implementation: ~100k particles. Most are nearly invisible, drifting
 * like fog/water/silence. A tiny cluster forms the boat, the figure,
 * the fishing rod. As you move closer, even these dissolve.
 *
 * Inspired by spite (Jaume Sanchez) — FBO ping-pong particle simulation,
 * curl noise driven motion, GPU-computed positions.
 */

// ---- Curl Noise GLSL ----
const CURL_NOISE_GLSL = `
// Simplex 3D noise (Stefan Gustavson)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curlNoise(vec3 p, float t) {
  float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  
  float n1, n2;
  vec3 curl;
  
  n1 = snoise(p + dy + vec3(0., 0., t));
  n2 = snoise(p - dy + vec3(0., 0., t));
  curl.x = (n1 - n2) / (2.0 * e);
  
  n1 = snoise(p + dz + vec3(0., 0., t));
  n2 = snoise(p - dz + vec3(0., 0., t));
  curl.x -= (n1 - n2) / (2.0 * e);
  
  n1 = snoise(p + dz + vec3(0., 0., t));
  n2 = snoise(p - dz + vec3(0., 0., t));
  curl.y = (n1 - n2) / (2.0 * e);
  
  n1 = snoise(p + dx + vec3(0., 0., t));
  n2 = snoise(p - dx + vec3(0., 0., t));
  curl.y -= (n1 - n2) / (2.0 * e);
  
  n1 = snoise(p + dx + vec3(0., 0., t));
  n2 = snoise(p - dx + vec3(0., 0., t));
  curl.z = (n1 - n2) / (2.0 * e);
  
  n1 = snoise(p + dy + vec3(0., 0., t));
  n2 = snoise(p - dy + vec3(0., 0., t));
  curl.z -= (n1 - n2) / (2.0 * e);
  
  return curl;
}
`;

// ---- Simulation Shader (FBO ping-pong) ----
const SIM_FRAG = `
precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_originTex;
uniform float u_time;
uniform float u_dt;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_curlStrength;
uniform float u_returnStrength;
uniform float u_dissipation;
uniform vec2 u_mouse;
uniform float u_mouseInfluence;

varying vec2 vUv;

${CURL_NOISE_GLSL}

void main() {
  vec4 pos = texture2D(u_positionTex, vUv);
  vec4 origin = texture2D(u_originTex, vUv);
  
  vec3 p = pos.xyz;
  float life = pos.w;
  float role = origin.w; // 0 = void particle, 1 = form particle
  
  // Curl noise — the breath of the void
  float t = u_time * u_noiseSpeed;
  vec3 curl = curlNoise(p * u_noiseScale, t);
  
  // Void particles: drift freely, very slow
  // Form particles: drift less, pulled back to origin
  float curlAmt = mix(u_curlStrength, u_curlStrength * 0.3, role);
  p += curl * curlAmt * u_dt;
  
  // Return force — form particles want to go home
  vec3 toOrigin = origin.xyz - p;
  float dist = length(toOrigin);
  float returnForce = role * u_returnStrength * smoothstep(0.0, 0.5, dist);
  p += normalize(toOrigin + 0.0001) * returnForce * u_dt;
  
  // Mouse repulsion — proximity dissolves form
  vec3 mousePos3 = vec3(u_mouse, 0.0);
  vec3 toMouse = p - mousePos3;
  float mouseDist = length(toMouse);
  float repel = u_mouseInfluence * smoothstep(0.5, 0.0, mouseDist);
  p += normalize(toMouse + 0.0001) * repel * u_dt;
  
  // Gentle gravity toward center (prevents drift-away)
  p *= (1.0 - 0.001 * u_dt);
  
  // Life cycle — void particles slowly fade and reset
  life -= u_dt * u_dissipation * (1.0 - role * 0.8);
  if (life < 0.0) {
    p = origin.xyz + curl * 0.02;
    life = 1.0;
  }
  
  gl_FragColor = vec4(p, life);
}
`;

const SIM_VERT = `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// ---- Render Shader (particles as points) ----
const RENDER_VERT = `
precision highp float;

uniform sampler2D u_positionTex;
uniform sampler2D u_originTex;
uniform float u_pointSize;
uniform float u_aspect;
uniform float u_time;

attribute vec2 a_uv;

varying float v_life;
varying float v_role;
varying vec3 v_color;

void main() {
  vec4 pos = texture2D(u_positionTex, a_uv);
  vec4 origin = texture2D(u_originTex, a_uv);
  
  v_life = pos.w;
  v_role = origin.w;
  
  // Color: ink tones — from near-white void to dark ink strokes
  float ink = v_role;
  // Void: warm paper white with very slight variation
  vec3 paperColor = vec3(0.92, 0.90, 0.86);
  // Ink: dark but warm, like real Chinese ink
  vec3 inkColor = vec3(0.12, 0.11, 0.10);
  // Water ripple particles: slightly blue-grey
  vec3 waterColor = vec3(0.65, 0.68, 0.70);
  
  // Mix based on role (stored as 0-1 continuous, not binary)
  v_color = mix(paperColor, inkColor, smoothstep(0.3, 0.8, ink));
  v_color = mix(v_color, waterColor, smoothstep(0.15, 0.25, ink) * (1.0 - smoothstep(0.25, 0.35, ink)));
  
  // Position — map to screen space
  vec3 p = pos.xyz;
  vec2 screenPos = vec2(p.x / u_aspect, p.y);
  
  gl_Position = vec4(screenPos * 2.0, p.z, 1.0);
  
  // Point size: form particles slightly larger, void particles tiny
  float sizeMult = mix(0.6, 1.8, smoothstep(0.3, 0.8, ink));
  // Life fade
  float lifeFade = smoothstep(0.0, 0.2, v_life);
  gl_PointSize = u_pointSize * sizeMult * lifeFade;
}
`;

const RENDER_FRAG = `
precision highp float;

varying float v_life;
varying float v_role;
varying vec3 v_color;

void main() {
  // Soft circle
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  
  // Soft edge
  float alpha = smoothstep(0.25, 0.1, d);
  
  // Life-based fade
  alpha *= smoothstep(0.0, 0.3, v_life);
  
  // Void particles are very transparent; form particles are opaque
  float baseAlpha = mix(0.02, 0.7, smoothstep(0.3, 0.8, v_role));
  alpha *= baseAlpha;
  
  gl_FragColor = vec4(v_color, alpha);
}
`;

// ---- Particle Layout: Define the "painting" ----
function createParticleData(size: number): { positions: Float32Array; origins: Float32Array } {
  const count = size * size;
  const positions = new Float32Array(count * 4);
  const origins = new Float32Array(count * 4);
  
  for (let i = 0; i < count; i++) {
    const i4 = i * 4;
    
    // Determine role: most particles are void (空)
    // Only ~5% are "form" particles (the boat, figure, rod, ripples)
    let role = 0; // void
    let x = (Math.random() - 0.5) * 1.6;
    let y = (Math.random() - 0.5) * 1.6;
    let z = (Math.random() - 0.5) * 0.02;
    
    const r = Math.random();
    
    if (r < 0.008) {
      // THE BOAT — a thin curved stroke, bottom center-left
      const t = Math.random();
      const boatX = -0.05 + (t - 0.5) * 0.18;
      const boatY = -0.12 + Math.pow(Math.abs(t - 0.5) * 2, 2) * -0.02;
      x = boatX + (Math.random() - 0.5) * 0.008;
      y = boatY + (Math.random() - 0.5) * 0.005;
      z = (Math.random() - 0.5) * 0.005;
      role = 0.9 + Math.random() * 0.1;
    } else if (r < 0.014) {
      // THE FIGURE — hunched, sitting on the boat
      const figX = -0.04;
      const figY = -0.08;
      // Body — compact oval
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.025;
      x = figX + Math.cos(angle) * rad * 0.6;
      y = figY + Math.sin(angle) * rad * 1.2 + 0.01;
      z = (Math.random() - 0.5) * 0.005;
      role = 0.7 + Math.random() * 0.3;
    } else if (r < 0.017) {
      // THE HEAD — small dark dot
      x = -0.04 + (Math.random() - 0.5) * 0.012;
      y = -0.055 + (Math.random() - 0.5) * 0.012;
      z = (Math.random() - 0.5) * 0.003;
      role = 0.85 + Math.random() * 0.15;
    } else if (r < 0.022) {
      // FISHING ROD — diagonal line
      const t = Math.random();
      x = -0.035 + t * 0.12;
      y = -0.06 + t * 0.08;
      // Slight curve (rod bends)
      y += Math.sin(t * Math.PI) * 0.01;
      x += (Math.random() - 0.5) * 0.003;
      y += (Math.random() - 0.5) * 0.003;
      z = (Math.random() - 0.5) * 0.003;
      role = 0.5 + Math.random() * 0.3;
    } else if (r < 0.026) {
      // FISHING LINE — thin, hanging down from rod tip
      const t = Math.random();
      x = 0.085 + Math.sin(t * Math.PI * 0.5) * 0.008;
      y = 0.02 - t * 0.08;
      x += (Math.random() - 0.5) * 0.002;
      y += (Math.random() - 0.5) * 0.002;
      z = (Math.random() - 0.5) * 0.002;
      role = 0.4 + Math.random() * 0.2;
    } else if (r < 0.045) {
      // WATER RIPPLES — concentric arcs around the boat
      const ringIdx = Math.floor(Math.random() * 6);
      const ringR = 0.04 + ringIdx * 0.025;
      const angle = (Math.random() - 0.5) * Math.PI * 0.8; // partial arcs
      x = -0.05 + Math.cos(angle) * ringR;
      y = -0.15 + Math.sin(angle) * ringR * 0.25; // flattened — perspective
      x += (Math.random() - 0.5) * 0.005;
      y += (Math.random() - 0.5) * 0.003;
      z = (Math.random() - 0.5) * 0.003;
      role = 0.2 + Math.random() * 0.15; // light ink — barely visible ripples
    } else {
      // VOID — the vast emptiness that IS the painting
      // Not uniform random — slight bias toward center, like silk texture
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.pow(Math.random(), 0.7) * 0.8;
      x = Math.cos(angle) * rad;
      y = Math.sin(angle) * rad;
      z = (Math.random() - 0.5) * 0.02;
      role = Math.random() * 0.08; // near-zero: almost invisible
    }
    
    // Set positions and origins
    origins[i4] = x;
    origins[i4 + 1] = y;
    origins[i4 + 2] = z;
    origins[i4 + 3] = role;
    
    // Start positions: scattered (particles will assemble)
    const scatter = 1.5;
    positions[i4] = x + (Math.random() - 0.5) * scatter * (1 - role);
    positions[i4 + 1] = y + (Math.random() - 0.5) * scatter * (1 - role);
    positions[i4 + 2] = z + (Math.random() - 0.5) * 0.05;
    positions[i4 + 3] = Math.random(); // life
  }
  
  return { positions, origins };
}

// ---- Seal stamp component ----
function SealStamp() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" style={{ position: "absolute", bottom: "2.5rem", right: "2.5rem", opacity: 0.15 }}>
      <rect x="2" y="2" width="32" height="32" fill="none" stroke="#8B2500" strokeWidth="1.5" rx="1" />
      <text x="18" y="22" textAnchor="middle" fill="#8B2500" fontSize="12" fontFamily="serif" fontWeight="bold">余</text>
    </svg>
  );
}

// ---- Main Component ----
export default function AfterimageV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- Setup ----
    const SIM_SIZE = 256; // 256x256 = 65536 particles
    const PARTICLE_COUNT = SIM_SIZE * SIM_SIZE;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0.94, 0.92, 0.88), 1); // Warm paper
    container.appendChild(renderer.domElement);

    // Check float texture support
    const ext = renderer.getContext().getExtension("OES_texture_float");
    const ext2 = renderer.getContext().getExtension("OES_texture_float_linear");
    if (!ext) {
      console.warn("Float textures not supported");
    }

    // ---- Create particle data ----
    const { positions, origins } = createParticleData(SIM_SIZE);

    // ---- FBO Ping-Pong Setup ----
    function createDataTexture(data: Float32Array, size: number): THREE.DataTexture {
      const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      return tex;
    }

    const originTex = createDataTexture(origins, SIM_SIZE);
    const positionTex = createDataTexture(positions, SIM_SIZE);

    // Render targets for ping-pong
    const rtOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    const rt0 = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, rtOptions);
    const rt1 = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, rtOptions);
    const targets = [rt0, rt1];
    let currentTarget = 0;

    // ---- Simulation Scene (FBO) ----
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simGeo = new THREE.PlaneGeometry(2, 2);
    const simMat = new THREE.RawShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        u_positionTex: { value: positionTex },
        u_originTex: { value: originTex },
        u_time: { value: 0 },
        u_dt: { value: 0.016 },
        u_noiseScale: { value: 1.2 },
        u_noiseSpeed: { value: 0.08 },
        u_curlStrength: { value: 0.015 },
        u_returnStrength: { value: 0.8 },
        u_dissipation: { value: 0.05 },
        u_mouse: { value: new THREE.Vector2(999, 999) },
        u_mouseInfluence: { value: 0.3 },
      },
    });
    const simQuad = new THREE.Mesh(simGeo, simMat);
    simScene.add(simQuad);

    // Initialize: render initial positions into rt0
    renderer.setRenderTarget(rt0);
    // We need a passthrough shader to copy positionTex into rt0
    const copyMat = new THREE.RawShaderMaterial({
      vertexShader: SIM_VERT,
      fragmentShader: `
        precision highp float;
        uniform sampler2D u_tex;
        varying vec2 vUv;
        void main() { gl_FragColor = texture2D(u_tex, vUv); }
      `,
      uniforms: { u_tex: { value: positionTex } },
    });
    simQuad.material = copyMat;
    renderer.render(simScene, simCamera);
    simQuad.material = simMat;
    renderer.setRenderTarget(null);

    // ---- Particle Render Scene ----
    const renderScene = new THREE.Scene();
    const renderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Particle UVs — each particle reads its position from the FBO
    const uvs = new Float32Array(PARTICLE_COUNT * 2);
    for (let j = 0; j < SIM_SIZE; j++) {
      for (let i = 0; i < SIM_SIZE; i++) {
        const idx = (j * SIM_SIZE + i) * 2;
        uvs[idx] = (i + 0.5) / SIM_SIZE;
        uvs[idx + 1] = (j + 0.5) / SIM_SIZE;
      }
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("a_uv", new THREE.Float32BufferAttribute(uvs, 2));

    const particleMat = new THREE.RawShaderMaterial({
      vertexShader: RENDER_VERT,
      fragmentShader: RENDER_FRAG,
      uniforms: {
        u_positionTex: { value: null },
        u_originTex: { value: originTex },
        u_pointSize: { value: 2.0 },
        u_aspect: { value: window.innerWidth / window.innerHeight },
        u_time: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    renderScene.add(particles);

    // ---- Mouse tracking ----
    const mouse = new THREE.Vector2(999, 999);
    const targetMouse = new THREE.Vector2(999, 999);

    function onMouseMove(e: MouseEvent) {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * (window.innerWidth / window.innerHeight);
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5);
    }
    function onMouseLeave() {
      targetMouse.set(999, 999);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * (window.innerWidth / window.innerHeight);
        targetMouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5);
      }
    }
    function onTouchEnd() {
      targetMouse.set(999, 999);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // ---- Animation Loop ----
    let time = 0;
    let prevTime = performance.now();
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05); // Cap dt
      prevTime = now;
      time += dt;

      // Smooth mouse
      mouse.lerp(targetMouse, 0.05);

      // ---- Simulation step (FBO ping-pong) ----
      const readTarget = targets[currentTarget];
      const writeTarget = targets[1 - currentTarget];

      simMat.uniforms.u_positionTex.value = readTarget.texture;
      simMat.uniforms.u_time.value = time;
      simMat.uniforms.u_dt.value = dt;
      simMat.uniforms.u_mouse.value = mouse;

      // Gradually increase return strength (particles assemble)
      const assembleProgress = Math.min(time / 8, 1); // 8 seconds to fully assemble
      simMat.uniforms.u_returnStrength.value = 0.2 + assembleProgress * 1.2;
      simMat.uniforms.u_curlStrength.value = 0.025 - assembleProgress * 0.012;

      renderer.setRenderTarget(writeTarget);
      renderer.render(simScene, simCamera);
      renderer.setRenderTarget(null);

      currentTarget = 1 - currentTarget;

      // ---- Render particles ----
      particleMat.uniforms.u_positionTex.value = writeTarget.texture;
      particleMat.uniforms.u_time.value = time;

      renderer.render(renderScene, renderCamera);
    }

    // Start
    setTimeout(() => setLoaded(true), 200);
    animate();

    // ---- Resize ----
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      particleMat.uniforms.u_aspect.value = w / h;
    }
    window.addEventListener("resize", onResize);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      rt0.dispose();
      rt1.dispose();
      originTex.dispose();
      positionTex.dispose();
      particleGeo.dispose();
      simGeo.dispose();
      simMat.dispose();
      copyMat.dispose();
      particleMat.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f0ebe0",
        position: "relative",
        cursor: "none",
      }}
    >
      {/* Title — minimal, like a museum plaque */}
      <div
        style={{
          position: "absolute",
          top: "2.5rem",
          left: "2.5rem",
          zIndex: 10,
          opacity: loaded ? 0.25 : 0,
          transition: "opacity 3s ease 2s",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.75rem",
            fontWeight: 300,
            color: "#2a2520",
            letterSpacing: "0.3em",
            margin: 0,
          }}
        >
          寒江独钓
        </h1>
        <p
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5rem",
            color: "#2a2520",
            letterSpacing: "0.15em",
            marginTop: "4px",
            opacity: 0.5,
          }}
        >
          Ma Yuan, c. 1195
        </p>
      </div>

      {/* Interpretation — bottom, appears late */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "2.5rem",
          maxWidth: "min(70vw, 420px)",
          zIndex: 10,
          opacity: loaded ? 0.2 : 0,
          transition: "opacity 4s ease 6s",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "0.75rem",
            fontWeight: 300,
            color: "#2a2520",
            lineHeight: 2.4,
            letterSpacing: "0.05em",
          }}
        >
          你需要多少笔才能让一个生命成立？答案是：比你以为的少得多。
        </p>
      </div>

      <SealStamp />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400&family=Noto+Serif+SC:wght@300;400&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
