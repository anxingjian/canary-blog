"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/*
 * 构成第八号 — Composition VIII (Kandinsky, 1923)
 * 
 * A symphony rendered in geometry.
 * Each shape is an instrument, each motion a musical phrase.
 * The whole scene breathes with polyrhythmic timing.
 *
 * Circles = sustained brass/strings (slow pulse, warm)
 * Triangles = percussion (sharp attacks, angular jitter)
 * Lines = woodwind melodies (sweeping arcs)
 * Small spheres = pizzicato (quick flickers)
 * Rings = resonance (expanding, fading)
 */

// ---- Musical timing helpers ----
function pulse(t: number, freq: number, phase: number = 0): number {
  return Math.sin(t * freq * Math.PI * 2 + phase) * 0.5 + 0.5;
}
function attack(t: number, freq: number, phase: number = 0, sharpness: number = 4): number {
  const s = Math.sin(t * freq * Math.PI * 2 + phase);
  return Math.pow(Math.max(0, s), sharpness);
}
function breathe(t: number, period: number, phase: number = 0): number {
  return (Math.sin(t / period * Math.PI * 2 + phase) + 1) * 0.5;
}

// ---- Palette ----
const C = {
  deepBlue: new THREE.Color(0x1a1a6a),
  warmRed: new THREE.Color(0xc43030),
  golden: new THREE.Color(0xe8b830),
  teal: new THREE.Color(0x2a8a9a),
  violet: new THREE.Color(0x7a3a9a),
  black: new THREE.Color(0x1a1a1a),
  orange: new THREE.Color(0xd87030),
  cream: new THREE.Color(0xf0e8d0),
  bg: new THREE.Color(0xE8E0D0),
};

const COLORS = [C.deepBlue, C.warmRed, C.golden, C.teal, C.violet, C.orange];

interface GeoElement {
  mesh: THREE.Mesh | THREE.Line;
  type: "sphere" | "tetra" | "line" | "ring" | "dot" | "cone" | "box";
  basePos: THREE.Vector3;
  baseScale: number;
  phase: number;
  freq: number;
  rhythmGroup: number; // 0-3, elements in same group pulse together
  orbitRadius: number;
  orbitSpeed: number;
  rotAxis: THREE.Vector3;
  rotSpeed: number;
}

export default function KandinskyParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetMouseRef = useRef(new THREE.Vector2(0, 0));

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetMouseRef.current.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
  }, []);
  const onMouseLeave = useCallback(() => {
    targetMouseRef.current.set(0, 0);
  }, []);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length) {
      targetMouseRef.current.set(
        (e.touches[0].clientX / window.innerWidth) * 2 - 1,
        -(e.touches[0].clientY / window.innerHeight) * 2 + 1
      );
    }
  }, []);
  const onTouchEnd = useCallback(() => {
    targetMouseRef.current.set(0, 0);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(C.bg);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ---- Scene ----
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(C.bg, 8, 25);

    // ---- Camera — slight perspective for depth ----
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    // ---- Lights — warm, directional, like stage lighting ----
    const ambientLight = new THREE.AmbientLight(0xf0e8d0, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0e0f0, 0.5);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe0c0, 0.35);
    rimLight.position.set(0, -3, 5);
    scene.add(rimLight);

    // ---- Environment map for reflections ----
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xf0e8d0);
    // Add colored lights to env for interesting reflections
    const envLight1 = new THREE.PointLight(0x4060ff, 3, 20);
    envLight1.position.set(5, 5, 5);
    envScene.add(envLight1);
    const envLight2 = new THREE.PointLight(0xff6040, 3, 20);
    envLight2.position.set(-5, -3, 3);
    envScene.add(envLight2);
    const envLight3 = new THREE.PointLight(0xf0e8d0, 4, 20);
    envLight3.position.set(0, 8, -5);
    envScene.add(envLight3);
    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
    scene.environment = envMap;
    pmrem.dispose();

    // ---- Materials ----
    function makeMat(color: THREE.Color, opts: Partial<{
      metalness: number; roughness: number; transparent: boolean;
      opacity: number; emissive: THREE.Color; emissiveIntensity: number;
    }> = {}): THREE.MeshStandardMaterial {
      return new THREE.MeshStandardMaterial({
        color,
        metalness: opts.metalness ?? 0.3,
        roughness: opts.roughness ?? 0.4,
        transparent: opts.transparent ?? false,
        opacity: opts.opacity ?? 1,
        emissive: opts.emissive ?? color,
        emissiveIntensity: opts.emissiveIntensity ?? 0.05,
        side: THREE.DoubleSide,
      });
    }

    // ---- Geometries (shared, instanced via clone) ----
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const icoGeo = new THREE.IcosahedronGeometry(1, 0); // sharp facets
    const tetraGeo = new THREE.TetrahedronGeometry(1, 0);
    const octaGeo = new THREE.OctahedronGeometry(1, 0);
    const torusGeo = new THREE.TorusGeometry(1, 0.08, 16, 48);
    const coneGeo = new THREE.ConeGeometry(1, 2, 3); // triangular cone
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const cylGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);

    const elements: GeoElement[] = [];

    // Helper to add element
    function addElement(
      geo: THREE.BufferGeometry, color: THREE.Color,
      pos: THREE.Vector3, scale: number, type: GeoElement["type"],
      rhythmGroup: number, matOpts?: Parameters<typeof makeMat>[1]
    ) {
      const mat = makeMat(color, matOpts);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);

      elements.push({
        mesh, type,
        basePos: pos.clone(),
        baseScale: scale,
        phase: Math.random() * Math.PI * 2,
        freq: 0.2 + Math.random() * 0.5,
        rhythmGroup,
        orbitRadius: 0.05 + Math.random() * 0.15,
        orbitSpeed: 0.3 + Math.random() * 0.4,
        rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        rotSpeed: (Math.random() - 0.5) * 0.5,
      });
    }

    // ---- SECTION 1: Large spheres / circles — the brass section ----
    // Big blue sphere — the anchor
    addElement(sphereGeo, C.deepBlue, new THREE.Vector3(-1.5, 1.2, -1), 0.8, "sphere", 0,
      { metalness: 0.8, roughness: 0.15, emissiveIntensity: 0.08 });
    // Warm red sphere
    addElement(sphereGeo, C.warmRed, new THREE.Vector3(2, -0.5, -0.5), 0.5, "sphere", 0,
      { metalness: 0.6, roughness: 0.25 });
    // Teal sphere — translucent glass
    addElement(sphereGeo, C.teal, new THREE.Vector3(0.5, 2, -1.5), 0.6, "sphere", 0,
      { metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.6 });
    // Golden sphere — polished brass
    addElement(icoGeo, C.golden, new THREE.Vector3(-0.8, -1.8, -0.8), 0.45, "sphere", 0,
      { metalness: 0.9, roughness: 0.1, emissiveIntensity: 0.12 });
    // Small accent spheres
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = 2.5 + Math.random() * 1;
      addElement(sphereGeo, COLORS[i % COLORS.length],
        new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -1 + Math.random() * 2),
        0.12 + Math.random() * 0.15, "dot", 0,
        { metalness: 0.6, roughness: 0.2 });
    }

    // ---- SECTION 2: Triangles / tetrahedra — percussion ----
    for (let i = 0; i < 12; i++) {
      const spread = 3.5;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * 2 - 0.5
      );
      const geo = i < 4 ? tetraGeo : i < 8 ? octaGeo : coneGeo;
      const color = i < 3 ? C.warmRed : i < 6 ? C.golden : i < 9 ? C.violet : C.orange;
      addElement(geo, color, pos, 0.2 + Math.random() * 0.25, "tetra", 1,
        { metalness: 0.3, roughness: 0.5 });
    }

    // ---- SECTION 3: Lines — melodic woodwinds ----
    for (let i = 0; i < 15; i++) {
      const length = 1 + Math.random() * 2.5;
      const lineGeo = new THREE.CylinderGeometry(0.02 + Math.random() * 0.02, 0.01, length, 6);
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2
      );
      const color = i < 5 ? C.black : COLORS[i % COLORS.length];
      addElement(lineGeo, color, pos, 1, "line", 2,
        { metalness: 0.1, roughness: 0.7, emissiveIntensity: 0.02 });
    }

    // ---- SECTION 4: Rings / tori — resonance, overtones ----
    for (let i = 0; i < 6; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1.5
      );
      const color = i < 2 ? C.deepBlue : i < 4 ? C.teal : C.violet;
      addElement(torusGeo, color, pos, 0.3 + Math.random() * 0.4, "ring", 3,
        { metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0.6 });
    }

    // ---- SECTION 5: Boxes — Bauhaus grid, structure ----
    for (let i = 0; i < 8; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 3.5,
        -1 + Math.random() * 1.5
      );
      addElement(boxGeo, i < 3 ? C.black : COLORS[i % COLORS.length],
        pos, 0.1 + Math.random() * 0.2, "box", 1,
        { metalness: 0.2, roughness: 0.6 });
    }

    // ---- Concentric ring arcs — the iconic circles in the painting ----
    const ringCenters = [
      { x: -1.8, y: 0.8, z: -0.5, r: 1.2, color: C.deepBlue, width: 0.04 },
      { x: -1.8, y: 0.8, z: -0.5, r: 0.8, color: C.warmRed, width: 0.03 },
      { x: 1.5, y: -1, z: -0.3, r: 0.7, color: C.teal, width: 0.035 },
    ];
    for (const rc of ringCenters) {
      const ringG = new THREE.TorusGeometry(rc.r, rc.width, 12, 64);
      const mat = makeMat(rc.color, { metalness: 0.4, roughness: 0.3, transparent: true, opacity: 0.5 });
      const mesh = new THREE.Mesh(ringG, mat);
      mesh.position.set(rc.x, rc.y, rc.z);
      mesh.rotation.x = Math.PI * 0.5 + (Math.random() - 0.5) * 0.3;
      mesh.rotation.z = (Math.random() - 0.5) * 0.2;
      scene.add(mesh);
      elements.push({
        mesh, type: "ring",
        basePos: new THREE.Vector3(rc.x, rc.y, rc.z),
        baseScale: 1,
        phase: Math.random() * Math.PI * 2,
        freq: 0.15,
        rhythmGroup: 3,
        orbitRadius: 0.02,
        orbitSpeed: 0.1,
        rotAxis: new THREE.Vector3(0, 0, 1),
        rotSpeed: 0.05 + Math.random() * 0.05,
      });
    }

    // ---- Diagonal cross-lines — Kandinsky's compositional scaffolding ----
    const crossLineGeo = new THREE.CylinderGeometry(0.015, 0.015, 10, 4);
    for (let i = 0; i < 3; i++) {
      const mat = makeMat(C.black, { metalness: 0.1, roughness: 0.8, transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(crossLineGeo, mat);
      mesh.position.set(0, 0, -2);
      mesh.rotation.z = Math.PI / 6 + i * Math.PI / 4 + (Math.random() - 0.5) * 0.2;
      scene.add(mesh);
      elements.push({
        mesh, type: "line",
        basePos: new THREE.Vector3(0, 0, -2),
        baseScale: 1,
        phase: i * 2, freq: 0.05, rhythmGroup: 2,
        orbitRadius: 0, orbitSpeed: 0,
        rotAxis: new THREE.Vector3(0, 0, 1),
        rotSpeed: 0.01 * (i % 2 === 0 ? 1 : -1),
      });
    }

    // ---- Watercolor wash background planes ----
    const washColors = [
      { color: 0x3a5a9a, x: -2.5, y: 1.5, z: -3, scale: 4, opacity: 0.06, rot: 0.3 },
      { color: 0xc04030, x: 2, y: -1.5, z: -3.5, scale: 3.5, opacity: 0.05, rot: -0.4 },
      { color: 0xe8b830, x: 0.5, y: 0, z: -4, scale: 5, opacity: 0.04, rot: 0.1 },
      { color: 0x2a8a7a, x: -1, y: -2, z: -3.2, scale: 3, opacity: 0.05, rot: 0.6 },
      { color: 0x7a3a9a, x: 1.8, y: 2, z: -3.8, scale: 2.5, opacity: 0.04, rot: -0.2 },
    ];
    const washGeo = new THREE.PlaneGeometry(1, 1);
    for (const w of washColors) {
      const washMat = new THREE.MeshBasicMaterial({
        color: w.color,
        transparent: true,
        opacity: w.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const washMesh = new THREE.Mesh(washGeo, washMat);
      washMesh.position.set(w.x, w.y, w.z);
      washMesh.scale.setScalar(w.scale);
      washMesh.rotation.z = w.rot;
      scene.add(washMesh);
    }

    // ---- Animation ----
    let time = 0;
    let prevTime = performance.now();
    let raf = 0;

    // Musical tempo: ~72 BPM = 1.2 Hz
    const BPM = 72;
    const beatFreq = BPM / 60;

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      time += dt;

      // Smooth mouse
      const m = mouseRef.current;
      const tm = targetMouseRef.current;
      m.lerp(tm, 0.03);

      // Camera subtle sway — like audience head movement
      camera.position.x = Math.sin(time * 0.1) * 0.3 + m.x * 0.5;
      camera.position.y = Math.cos(time * 0.07) * 0.2 + m.y * 0.3;
      camera.lookAt(0, 0, 0);

      // Beat pulse — global
      const beat = pulse(time, beatFreq);
      const halfBeat = pulse(time, beatFreq * 2);
      const triplet = pulse(time, beatFreq * 3);

      // Section-specific rhythms
      const rhythms = [
        breathe(time, 3.5, 0),           // 0: brass — slow swell
        attack(time, beatFreq, 0, 6),     // 1: percussion — sharp attacks on beat
        breathe(time, 5, Math.PI * 0.5),  // 2: woodwinds — longer phrases
        breathe(time, 7, Math.PI),        // 3: resonance — very slow
      ];

      for (const el of elements) {
        const r = rhythms[el.rhythmGroup];
        const mesh = el.mesh;

        // Position: orbit + rhythm displacement
        const orbitAngle = time * el.orbitSpeed + el.phase;
        let px = el.basePos.x + Math.cos(orbitAngle) * el.orbitRadius;
        let py = el.basePos.y + Math.sin(orbitAngle) * el.orbitRadius;
        let pz = el.basePos.z;

        // Rhythm-driven displacement — smooth eased curves
        if (el.type === "tetra" || el.type === "box" || el.type === "cone") {
          // Percussion: gentle float up on beat, ease out
          const pop = attack(time, beatFreq, el.phase, 4);
          const eased = pop * pop * (3 - 2 * pop); // smoothstep
          py += eased * 0.06;
          pz += eased * 0.1;
        } else if (el.type === "sphere" || el.type === "dot") {
          // Brass: slow figure-8 drift
          const swell = breathe(time, 4 + el.phase * 0.3, el.phase);
          px += Math.cos(el.phase + time * 0.15) * swell * 0.03;
          py += Math.sin(el.phase * 1.3 + time * 0.12) * swell * 0.03;
        }

        mesh.position.set(px, py, pz);

        // Scale: rhythmic breathing
        let scaleMultiplier = 1;
        if (el.type === "sphere") {
          scaleMultiplier = 1 + breathe(time, 2.5, el.phase) * 0.08;
        } else if (el.type === "tetra" || el.type === "box") {
          scaleMultiplier = 1 + attack(time, beatFreq, el.phase, 6) * 0.2;
        } else if (el.type === "ring") {
          scaleMultiplier = 1 + breathe(time, 4, el.phase) * 0.06;
        } else if (el.type === "dot") {
          // Pizzicato: quick flicker
          scaleMultiplier = 0.8 + attack(time, beatFreq * 2, el.phase, 3) * 0.5;
        }
        mesh.scale.setScalar(el.baseScale * scaleMultiplier);

        // Rotation: continuous + rhythm modulation
        const q = new THREE.Quaternion();
        let rotAmount = el.rotSpeed * dt;
        if (el.type === "tetra") {
          // Percussion: jitter on beat
          rotAmount += attack(time, beatFreq, el.phase, 8) * 2 * dt;
        }
        q.setFromAxisAngle(el.rotAxis, rotAmount);
        mesh.quaternion.premultiply(q);

        // Emissive pulse — glow on beat
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          const glowIntensity = el.type === "tetra" || el.type === "box"
            ? 0.02 + attack(time, beatFreq, el.phase, 4) * 0.2
            : 0.03 + breathe(time, 3, el.phase) * 0.08;
          mat.emissiveIntensity = glowIntensity;
        }

        // Transparency pulse for rings
        if (el.type === "ring" && mat.transparent) {
          mat.opacity = 0.3 + breathe(time, 5, el.phase) * 0.4;
        }
      }

      // Light intensity follows the music
      keyLight.intensity = 1.0 + beat * 0.3;
      fillLight.intensity = 0.3 + halfBeat * 0.15;

      renderer.render(scene, camera);
    }

    animate();

    // ---- Resize ----
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      container.removeChild(renderer.domElement);
    };
  }, [onMouseMove, onMouseLeave, onTouchMove, onTouchEnd]);

  return <div ref={containerRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}
