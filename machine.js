/* =========================================================
   Alternatefact Studios — Scroll-linked 3D Machinery
   Steam engine (top) → Clockwork (middle) → Assembly (bottom)
   ========================================================= */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('machineCanvas');
if (!canvas) console.warn('Machine canvas missing.');

const isMobile = window.matchMedia('(max-width: 900px)').matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

// Env map for brass reflections
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 20);

// Lights — warm brass rim + violet accent
const key = new THREE.DirectionalLight(0xffe7c2, 2.2);
key.position.set(6, 8, 8);
scene.add(key);

const violet = new THREE.PointLight(0x7c3aed, 24, 40, 2);
violet.position.set(-6, 2, 4);
scene.add(violet);

const copper = new THREE.PointLight(0xc1652a, 18, 30, 2);
copper.position.set(4, -3, 5);
scene.add(copper);

scene.add(new THREE.AmbientLight(0xf2ece0, 0.35));

// =========================================================
// MATERIALS
// =========================================================
const brassMat = new THREE.MeshPhysicalMaterial({
  color: 0xc59245,
  metalness: 1.0,
  roughness: 0.28,
  clearcoat: 0.4,
  clearcoatRoughness: 0.4,
  envMapIntensity: 1.1,
});
const brassDarkMat = new THREE.MeshPhysicalMaterial({
  color: 0x8a5e21,
  metalness: 1.0,
  roughness: 0.4,
  envMapIntensity: 0.9,
});
const copperMat = new THREE.MeshPhysicalMaterial({
  color: 0xb85a25,
  metalness: 1.0,
  roughness: 0.35,
  envMapIntensity: 1.0,
});
const ironMat = new THREE.MeshPhysicalMaterial({
  color: 0x2b241f,
  metalness: 0.85,
  roughness: 0.55,
  envMapIntensity: 0.6,
});
const glassAccent = new THREE.MeshPhysicalMaterial({
  color: 0x7c3aed,
  metalness: 0.2,
  roughness: 0.15,
  transmission: 0.6,
  thickness: 0.4,
  emissive: 0x5b21b6,
  emissiveIntensity: 0.35,
});

// =========================================================
// GEAR GEOMETRY (custom teeth)
// =========================================================
function gearGeometry(radius, teeth, toothDepth, thickness, holeRadius = 0) {
  const shape = new THREE.Shape();
  const rIn = radius;
  const rOut = radius + toothDepth;
  const step = (Math.PI * 2) / (teeth * 2);
  const half = step / 2;
  for (let i = 0; i < teeth * 2; i++) {
    const a1 = i * step;
    const a2 = a1 + half * 0.55;
    const a3 = a1 + step - half * 0.55;
    const a4 = a1 + step;
    const r1 = i % 2 === 0 ? rOut : rIn;
    if (i === 0) shape.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
    shape.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
    shape.lineTo(Math.cos(a3) * r1, Math.sin(a3) * r1);
    shape.lineTo(Math.cos(a4) * (i % 2 === 0 ? rIn : rOut), Math.sin(a4) * (i % 2 === 0 ? rIn : rOut));
  }
  if (holeRadius > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.15,
    bevelSize: thickness * 0.12,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.center();
  return geo;
}

// helper: brass gear group with cross spokes
function makeGear({ r = 1, teeth = 20, depth = 0.18, thickness = 0.35, hole = 0.18, mat = brassMat, spokes = true }) {
  const g = new THREE.Group();
  const gear = new THREE.Mesh(gearGeometry(r, teeth, depth, thickness, hole), mat);
  g.add(gear);
  if (spokes) {
    const spokeGeo = new THREE.BoxGeometry(r * 1.7, thickness * 0.35, thickness * 0.9);
    const s1 = new THREE.Mesh(spokeGeo, brassDarkMat);
    const s2 = new THREE.Mesh(spokeGeo, brassDarkMat);
    s2.rotation.z = Math.PI / 2;
    g.add(s1, s2);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(hole * 1.6, hole * 1.6, thickness * 1.1, 24),
      brassDarkMat
    );
    hub.rotation.x = Math.PI / 2;
    g.add(hub);
  }
  return g;
}

// =========================================================
// MODULE 1 — STEAM ENGINE
// =========================================================
const engine = new THREE.Group();
scene.add(engine);
// Offset engine to upper-right so hero title (bottom-left) reads clean
engine.position.set(3.5, 2.2, 0);
engine.scale.setScalar(0.95);

// Base plate
const base = new THREE.Mesh(
  new THREE.BoxGeometry(9, 0.35, 3),
  ironMat
);
base.position.y = -2.4;
engine.add(base);

// Flywheel (big brass wheel)
const flywheel = makeGear({ r: 1.9, teeth: 40, depth: 0.15, thickness: 0.5, hole: 0.25, mat: brassMat, spokes: true });
flywheel.position.set(2.6, -0.4, 0);
engine.add(flywheel);

// Small idler gear meshed to flywheel
const idler = makeGear({ r: 0.7, teeth: 18, depth: 0.12, thickness: 0.4, hole: 0.14, mat: copperMat });
idler.position.set(0.35, -0.4, 0);
engine.add(idler);

// Crank arm (offset on flywheel)
const crankPin = new THREE.Group();
flywheel.add(crankPin);
crankPin.position.set(1.4, 0, 0.4);
const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), brassDarkMat);
pinMesh.rotation.x = Math.PI / 2;
crankPin.add(pinMesh);

// Connecting rod + piston (updated each frame)
const rodMat = brassDarkMat;
const rod = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 0.22), rodMat);
engine.add(rod);

const piston = new THREE.Group();
engine.add(piston);
const pistonBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.75, 32), copperMat);
pistonBody.rotation.z = Math.PI / 2;
piston.add(pistonBody);

// Steam cylinder housing
const cylinder = new THREE.Group();
engine.add(cylinder);
const cylBody = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.6, 32, 1, false), brassDarkMat);
cylBody.rotation.z = Math.PI / 2;
cylinder.add(cylBody);
const cylCap1 = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.08, 12, 32), brassMat);
cylCap1.rotation.y = Math.PI / 2;
cylCap1.position.x = 0.75;
cylinder.add(cylCap1);
const cylCap2 = cylCap1.clone(); cylCap2.position.x = -0.75; cylinder.add(cylCap2);
cylinder.position.set(-2.4, -0.4, 0);

// Chimney with valve
const chimney = new THREE.Group();
engine.add(chimney);
const chimneyPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.6, 24), brassMat);
chimneyPipe.position.y = 0.8;
chimney.add(chimneyPipe);
const chimneyBell = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 0.4, 24), brassMat);
chimneyBell.position.y = 1.7;
chimney.add(chimneyBell);
chimney.position.set(-3.4, -0.6, 0);

// Purple pressure gauge (accent)
const gauge = new THREE.Mesh(
  new THREE.CylinderGeometry(0.32, 0.32, 0.14, 32),
  glassAccent
);
gauge.rotation.x = Math.PI / 2;
gauge.position.set(-1.4, 0.6, 0.5);
engine.add(gauge);
const gaugeRim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 12, 32), brassMat);
gaugeRim.position.copy(gauge.position);
engine.add(gaugeRim);

// Steam particles (simple point sprites via canvas)
const steamGeo = new THREE.BufferGeometry();
const STEAM_COUNT = isMobile ? 40 : 90;
const steamPos = new Float32Array(STEAM_COUNT * 3);
const steamSeed = new Float32Array(STEAM_COUNT);
for (let i = 0; i < STEAM_COUNT; i++) {
  steamPos[i * 3] = -3.4 + (Math.random() - 0.5) * 0.3;
  steamPos[i * 3 + 1] = 1.9 + Math.random() * 2.5;
  steamPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  steamSeed[i] = Math.random();
}
steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
steamGeo.setAttribute('seed', new THREE.BufferAttribute(steamSeed, 1));

function steamTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,240,220,0.9)');
  grad.addColorStop(0.5, 'rgba(255,225,180,0.35)');
  grad.addColorStop(1, 'rgba(255,220,170,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const steamMat = new THREE.PointsMaterial({
  size: 1.1,
  map: steamTexture(),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  opacity: 0.6,
});
const steam = new THREE.Points(steamGeo, steamMat);
engine.add(steam);

// =========================================================
// MODULE 2 — CLOCKWORK
// =========================================================
const clockwork = new THREE.Group();
scene.add(clockwork);
clockwork.position.set(-3.5, -13, 0); // placed below-left; camera dollies down
clockwork.scale.setScalar(0.85);

// Backplate — decorative brass disc
const backplate = new THREE.Mesh(
  new THREE.CylinderGeometry(4.4, 4.4, 0.15, 64),
  brassDarkMat
);
backplate.rotation.x = Math.PI / 2;
backplate.position.z = -0.6;
clockwork.add(backplate);
const backplateRim = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.12, 16, 64), brassMat);
clockwork.add(backplateRim);

// Interlocking gears
const gCenter = makeGear({ r: 1.4, teeth: 32, depth: 0.14, thickness: 0.32, hole: 0.22, mat: brassMat });
gCenter.position.set(0, 0, 0);
clockwork.add(gCenter);

const gTop = makeGear({ r: 0.85, teeth: 22, depth: 0.12, thickness: 0.28, hole: 0.16, mat: copperMat });
gTop.position.set(-0.15, 2.45, 0);
clockwork.add(gTop);

const gRight = makeGear({ r: 1.0, teeth: 24, depth: 0.12, thickness: 0.28, hole: 0.18, mat: brassMat });
gRight.position.set(2.6, 0.2, 0);
clockwork.add(gRight);

const gLeft = makeGear({ r: 0.6, teeth: 16, depth: 0.1, thickness: 0.24, hole: 0.12, mat: copperMat });
gLeft.position.set(-2.2, -0.4, 0);
clockwork.add(gLeft);

const gBottom = makeGear({ r: 0.9, teeth: 22, depth: 0.12, thickness: 0.26, hole: 0.16, mat: brassMat });
gBottom.position.set(1.1, -2.4, 0);
clockwork.add(gBottom);

// Escapement wheel (fine teeth) + pallet
const escape = makeGear({ r: 0.55, teeth: 30, depth: 0.08, thickness: 0.16, hole: 0.08, mat: copperMat, spokes: false });
escape.position.set(-2.4, 2.0, 0.15);
clockwork.add(escape);

// Pendulum
const pendulum = new THREE.Group();
clockwork.add(pendulum);
pendulum.position.set(0, 1.9, 0.5);
const pendRod = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.08), brassMat);
pendRod.position.y = -1.9;
pendulum.add(pendRod);
const pendBob = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 32), copperMat);
pendBob.rotation.x = Math.PI / 2;
pendBob.position.y = -3.7;
pendulum.add(pendBob);
const pendBobRim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 32), brassMat);
pendBobRim.position.y = -3.7;
pendulum.add(pendBobRim);

// Roman numerals ring (just tick marks — simpler)
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  const tick = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.28, 0.05),
    brassMat
  );
  tick.position.set(Math.sin(a) * 3.8, Math.cos(a) * 3.8, -0.4);
  tick.rotation.z = -a;
  clockwork.add(tick);
}

// Central jewel
const jewel = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.22, 0),
  glassAccent
);
jewel.position.set(0, 0, 0.35);
clockwork.add(jewel);

// =========================================================
// MODULE 3 — ASSEMBLY (bottom, both together / abstract)
// =========================================================
const assembly = new THREE.Group();
scene.add(assembly);
assembly.position.set(2.5, -26, 0);
assembly.scale.setScalar(0.75);

// Floating gears cluster
const floaters = [];
const layout = [
  { r: 1.6, teeth: 34, x: -3, y: 0.5, z: 0, mat: brassMat },
  { r: 1.0, teeth: 22, x: -0.6, y: 1.6, z: 0.2, mat: copperMat },
  { r: 0.7, teeth: 20, x: -1.1, y: -1.2, z: -0.1, mat: brassMat },
  { r: 1.3, teeth: 28, x: 2.4, y: -0.2, z: 0, mat: copperMat },
  { r: 0.9, teeth: 22, x: 3.9, y: 1.5, z: -0.2, mat: brassMat },
  { r: 0.55, teeth: 16, x: 2.0, y: -2.4, z: 0.1, mat: copperMat },
];
layout.forEach((L, i) => {
  const g = makeGear({ r: L.r, teeth: L.teeth, depth: 0.14, thickness: 0.32, hole: 0.16, mat: L.mat });
  g.position.set(L.x, L.y, L.z);
  g.userData.dir = i % 2 === 0 ? 1 : -1;
  g.userData.speed = 0.4 + Math.random() * 0.8;
  assembly.add(g);
  floaters.push(g);
});

// Pipe crossing (a single copper pipe)
const pipeCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5, -2, -0.5),
  new THREE.Vector3(-2, 2.5, 0),
  new THREE.Vector3(1.5, -1, 0.4),
  new THREE.Vector3(5, 2, -0.5),
]);
const pipe = new THREE.Mesh(
  new THREE.TubeGeometry(pipeCurve, 80, 0.14, 16, false),
  copperMat
);
assembly.add(pipe);

// Rivets along pipe
for (let i = 0; i < 12; i++) {
  const t = i / 11;
  const p = pipeCurve.getPoint(t);
  const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), brassMat);
  rivet.position.copy(p);
  assembly.add(rivet);
}

// =========================================================
// SCROLL DRIVER
// =========================================================
let scrollProgress = 0; // 0..1 across full page
window.__machineSetProgress = (p) => { scrollProgress = Math.max(0, Math.min(1, p)); };

// Camera / group positioning based on scroll
function updateComposition(t) {
  // t is elapsed
  // Segment layout: 0-0.33 hero+manifesto (engine), 0.33-0.66 work (clockwork), 0.66-1 approach+cta (assembly)
  const p = scrollProgress;

  // Camera dollies vertically down through modules
  const targetY = -p * 26; // total span matches assembly bottom
  camera.position.y += (targetY - camera.position.y) * 0.08;

  // Camera Z pulls back slightly in the middle
  const zTarget = 20 + Math.sin(p * Math.PI) * 3.5;
  camera.position.z += (zTarget - camera.position.z) * 0.06;

  // Camera x sway (subtle)
  const xTarget = Math.sin(p * Math.PI * 2) * 0.6;
  camera.position.x += (xTarget - camera.position.x) * 0.05;

  camera.lookAt(0, camera.position.y, 0);

  // ---- Engine motion ----
  const engineSpin = t * 0.8 + p * 12;
  flywheel.rotation.z = -engineSpin;
  idler.rotation.z = engineSpin * (1.9 / 0.7);

  // Piston / rod driven by flywheel angle
  const crankRadius = 1.4;
  const rodLen = 3.2;
  const crankAngle = -engineSpin;
  const crankX = 2.6 + Math.cos(crankAngle) * crankRadius;
  const crankY = -0.4 + Math.sin(crankAngle) * crankRadius;
  // piston slides horizontally at y = -0.4
  const pistonX = crankX - Math.sqrt(Math.max(0, rodLen * rodLen - (crankY - (-0.4)) * (crankY - (-0.4))));
  piston.position.set(pistonX - 0.5, -0.4, 0);
  // rod
  const rodMidX = (crankX + pistonX) / 2;
  const rodMidY = (crankY + (-0.4)) / 2;
  rod.position.set(rodMidX, rodMidY, 0);
  rod.rotation.z = Math.atan2(crankY - (-0.4), crankX - pistonX);

  // Gauge needle wobble (subtle) via emissive intensity
  glassAccent.emissiveIntensity = 0.25 + Math.abs(Math.sin(t * 3 + p * 6)) * 0.6;

  // Steam
  const steamPositions = steam.geometry.attributes.position.array;
  const seeds = steam.geometry.attributes.seed.array;
  for (let i = 0; i < STEAM_COUNT; i++) {
    const s = seeds[i];
    let y = steamPositions[i * 3 + 1];
    y += 0.008 + s * 0.012;
    if (y > 5.5) {
      y = 1.9;
      steamPositions[i * 3] = -3.4 + (Math.random() - 0.5) * 0.25;
    }
    steamPositions[i * 3 + 1] = y;
    steamPositions[i * 3] += Math.sin(t * 0.7 + s * 6) * 0.005;
  }
  steam.geometry.attributes.position.needsUpdate = true;
  steamMat.opacity = 0.35 + Math.sin(t * 2) * 0.1;

  // ---- Clockwork motion ----
  // Gear speeds tuned to visually mesh
  gCenter.rotation.z = t * 0.5 + p * 6;
  gTop.rotation.z = -t * 0.5 * (1.4 / 0.85) - p * 6 * (1.4 / 0.85);
  gRight.rotation.z = -t * 0.5 * (1.4 / 1.0) - p * 6 * (1.4 / 1.0);
  gLeft.rotation.z = -t * 0.5 * (1.4 / 0.6) - p * 6 * (1.4 / 0.6);
  gBottom.rotation.z = -t * 0.5 * (1.4 / 0.9) - p * 6 * (1.4 / 0.9);
  escape.rotation.z = t * 2.0 + p * 20;

  // Pendulum swing
  pendulum.rotation.z = Math.sin(t * 1.8) * 0.35;

  // Backplate slow drift
  backplate.rotation.z = t * 0.05;

  // ---- Assembly motion ----
  floaters.forEach((g, i) => {
    g.rotation.z += 0.005 * g.userData.dir * g.userData.speed;
    g.position.y += Math.sin(t * 0.7 + i) * 0.0015;
  });
  assembly.rotation.z = Math.sin(t * 0.15) * 0.03;

  // Global tilt for depth
  const tilt = Math.sin(p * Math.PI) * 0.08;
  engine.rotation.x = -0.15 + tilt * 0.4;
  clockwork.rotation.x = -0.05 + tilt * 0.4;
  assembly.rotation.x = -0.1 + tilt * 0.4;

  // Slight y drift of modules for parallax
  engine.position.z = -Math.sin(p * Math.PI) * 1.5;
  clockwork.position.z = Math.sin(p * Math.PI) * 1.5;
}

// =========================================================
// RENDER LOOP
// =========================================================
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  updateComposition(t);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// =========================================================
// RESIZE
// =========================================================
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
});
