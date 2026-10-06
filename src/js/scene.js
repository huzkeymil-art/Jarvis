import * as THREE from 'three';

// A low-poly, Gorilla Tag-style forest at dusk. The camera drifts down a
// clearing between the trees while a glowing "lava monke" hops around up
// ahead. Two identical forest tiles leapfrog each other so the flight
// loops forever without a visible seam.

const INK = '#0b0d0a';
const TILE = 64; // depth of one forest tile
const PATH = 2.6; // half-width of the clearing the camera flies down
const SPEED = 1.5; // units per second

// Small seeded RNG so both tiles (and every visit) grow the same forest.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Nudge every corner of a mesh without tearing faces apart: vertices that
// share a position get the same offset.
function jitter(geo, amount, rand) {
  const pos = geo.attributes.position;
  const offsets = new Map();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)}|${pos.getY(i).toFixed(3)}|${pos.getZ(i).toFixed(3)}`;
    if (!offsets.has(key)) {
      offsets.set(key, [(rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount]);
    }
    const [x, y, z] = offsets.get(key);
    pos.setXYZ(i, pos.getX(i) + x, pos.getY(i) + y, pos.getZ(i) + z);
  }
  geo.computeVertexNormals();
  return geo;
}

function glowTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildTile(shared) {
  const rand = mulberry32(1337);
  const tile = new THREE.Group();

  // Ground: gentle bumps, hills rising away from the clearing. The bumps
  // vanish at both tile edges so neighbouring tiles meet cleanly.
  const ground = new THREE.PlaneGeometry(120, TILE, 40, 24);
  ground.rotateX(-Math.PI / 2);
  const gp = ground.attributes.position;
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i);
    const z = gp.getZ(i);
    const edge = Math.sin(((z + TILE / 2) / TILE) * Math.PI * 4);
    const bumps = Math.sin(x * 0.45) * 0.35 * edge;
    const hills = Math.max(0, Math.abs(x) - 16) * 0.22;
    gp.setY(i, bumps + hills - (Math.abs(x) < PATH ? 0.12 : 0));
  }
  ground.computeVertexNormals();
  const groundMesh = new THREE.Mesh(ground, shared.groundMat);
  groundMesh.position.z = -TILE / 2;
  tile.add(groundMesh);

  // Trees
  const trees = [];
  while (trees.length < 78) {
    const x = (rand() * 2 - 1) * 30;
    if (Math.abs(x) < PATH + 0.6 + rand() * 1.8) continue;
    trees.push({
      x,
      z: -rand() * TILE,
      h: 3.4 + rand() * 5.5,
      r: 1.3 + rand() * 1.5,
      thick: 0.7 + rand() * 0.9,
    });
  }

  const trunks = new THREE.InstancedMesh(shared.trunkGeo, shared.trunkMat, trees.length);
  const canopies = new THREE.InstancedMesh(shared.canopyGeo, shared.canopyMat, trees.length * 3);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const color = new THREE.Color();
  const greens = ['#2d4b25', '#375c2a', '#23391d', '#43702f', '#1d3019', '#4f7a2c'];

  let c = 0;
  trees.forEach((t, i) => {
    p.set(t.x, 0, t.z);
    q.setFromEuler(e.set((rand() - 0.5) * 0.08, rand() * Math.PI, (rand() - 0.5) * 0.08));
    s.set(t.thick, t.h, t.thick);
    trunks.setMatrixAt(i, m.compose(p, q, s));

    const blobs = 2 + Math.floor(rand() * 2);
    for (let b = 0; b < 3; b++, c++) {
      if (b >= blobs) {
        canopies.setMatrixAt(c, m.makeScale(0, 0, 0));
        canopies.setColorAt(c, color.set(greens[0]));
        continue;
      }
      const r = t.r * (1 - b * 0.24) * (0.85 + rand() * 0.3);
      p.set(t.x + (rand() - 0.5) * 1.4, t.h + b * r * 0.95 - 0.2, t.z + (rand() - 0.5) * 1.4);
      q.setFromEuler(e.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI));
      s.set(r, r * (0.78 + rand() * 0.3), r);
      canopies.setMatrixAt(c, m.compose(p, q, s));
      canopies.setColorAt(c, color.set(greens[Math.floor(rand() * greens.length)]));
    }
  });
  tile.add(trunks, canopies);

  // A few chunky rocks along the clearing
  const rocks = new THREE.InstancedMesh(shared.rockGeo, shared.rockMat, 26);
  for (let i = 0; i < 26; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    const r = 0.25 + rand() * 0.7;
    p.set(side * (PATH + 0.4 + rand() * 6), r * 0.3, -rand() * TILE);
    q.setFromEuler(e.set(rand() * 3, rand() * 3, rand() * 3));
    s.set(r, r * 0.7, r);
    rocks.setMatrixAt(i, m.compose(p, q, s));
  }
  tile.add(rocks);

  return tile;
}

export function createForest(canvas, { reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(INK);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(INK, 7, 48);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 140);
  const BASE = new THREE.Vector3(0, 2.3, 8);
  camera.position.copy(BASE);

  // Lighting: a low orange sun raking in from the left, cool fill from above.
  scene.add(new THREE.HemisphereLight('#9fc28c', '#0b0d0a', 1.1));
  const sun = new THREE.DirectionalLight('#ff8a4c', 3.2);
  sun.position.set(-10, 7, -4);
  scene.add(sun);
  const back = new THREE.DirectionalLight('#5f8f7a', 0.7);
  back.position.set(8, 5, 10);
  scene.add(back);

  const rand = mulberry32(7);
  const shared = {
    groundMat: new THREE.MeshStandardMaterial({ color: '#17230f', flatShading: true, roughness: 1 }),
    trunkGeo: new THREE.CylinderGeometry(0.2, 0.34, 1, 6, 1).translate(0, 0.5, 0),
    trunkMat: new THREE.MeshStandardMaterial({ color: '#3b2a1d', flatShading: true, roughness: 1 }),
    canopyGeo: jitter(new THREE.IcosahedronGeometry(1, 0), 0.32, rand),
    canopyMat: new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, roughness: 0.95 }),
    rockGeo: jitter(new THREE.DodecahedronGeometry(1, 0), 0.3, rand),
    rockMat: new THREE.MeshStandardMaterial({ color: '#4a4b42', flatShading: true, roughness: 1 }),
  };

  const world = new THREE.Group();
  const tileA = buildTile(shared);
  const tileB = buildTile(shared);
  tileB.position.z = -TILE;
  world.add(tileA, tileB);
  scene.add(world);

  // Dusk sun glowing through the far trees (fog turns them into silhouettes)
  const sunGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,170,110,1)', 'rgba(255,91,31,0.45)'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  sunGlow.scale.set(70, 70, 1);
  sunGlow.position.set(-4, 9, -75);
  sunGlow.renderOrder = -1;
  scene.add(sunGlow);

  // Lava monke: the tagger, hopping around up ahead
  const lava = new THREE.Group();
  const lavaMat = new THREE.MeshStandardMaterial({
    color: '#ff5b1f',
    emissive: '#ff4a10',
    emissiveIntensity: 2.2,
    flatShading: true,
  });
  const body = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.55, 1), 0.12, rand), lavaMat);
  const head = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.34, 0), 0.06, rand), lavaMat);
  head.position.set(0, 0.62, 0.08);
  const armGeo = new THREE.CylinderGeometry(0.09, 0.12, 1.1, 5).translate(0, -0.55, 0);
  const armL = new THREE.Mesh(armGeo, lavaMat);
  const armR = new THREE.Mesh(armGeo, lavaMat);
  armL.position.set(-0.45, 0.2, 0);
  armR.position.set(0.45, 0.2, 0);
  lava.add(body, head, armL, armR);
  const lavaLight = new THREE.PointLight('#ff6a2a', 30, 16, 2);
  lavaLight.position.y = 0.4;
  lava.add(lavaLight);
  const lavaGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,140,80,0.9)', 'rgba(255,91,31,0.25)'),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  lavaGlow.scale.set(4.2, 4.2, 1);
  lava.add(lavaGlow);
  scene.add(lava);

  // Fireflies
  const FLIES = 240;
  const flyPos = new Float32Array(FLIES * 3);
  const flyCol = new Float32Array(FLIES * 3);
  const flyPhase = new Float32Array(FLIES);
  const lime = new THREE.Color('#c6f432');
  const ember = new THREE.Color('#ff8a4c');
  for (let i = 0; i < FLIES; i++) {
    flyPos[i * 3] = (rand() * 2 - 1) * 16;
    flyPos[i * 3 + 1] = 0.4 + rand() * 8;
    flyPos[i * 3 + 2] = 10 - rand() * 56;
    flyPhase[i] = rand() * Math.PI * 2;
    const col = rand() < 0.7 ? lime : ember;
    flyCol.set([col.r, col.g, col.b], i * 3);
  }
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  flyGeo.setAttribute('color', new THREE.BufferAttribute(flyCol, 3));
  const flies = new THREE.Points(
    flyGeo,
    new THREE.PointsMaterial({
      size: 0.22,
      map: glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.35)'),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(flies);

  // --- state -------------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let progress = 0;
  let travelled = 0;
  let running = false;
  let visible = true;
  let raf = 0;
  const timer = new THREE.Timer();
  const look = new THREE.Vector3();

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 72 : 55;
    camera.updateProjectionMatrix();
    if (reduced) renderer.render(scene, camera);
  }

  function update(dt, t) {
    travelled = (travelled + SPEED * dt) % TILE;
    world.position.z = travelled;

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // Scroll "climbs" the camera up into the canopy
    const climb = progress * progress;
    camera.position.set(
      BASE.x + pointer.x * 1.4 + Math.sin(t * 0.3) * 0.25,
      BASE.y + climb * 7 + pointer.y * 0.5 + Math.sin(t * 0.8) * 0.05,
      BASE.z,
    );
    look.set(pointer.x * 2.2, 3 + climb * 5 - pointer.y * 0.8, -30);
    camera.lookAt(look);

    // Lava monke bounces in arcs, swinging its arms
    const hop = Math.abs(Math.sin(t * 2.4));
    lava.position.set(Math.sin(t * 0.45) * 5, 0.75 + hop * 1.3, -16 + Math.sin(t * 0.21) * 5);
    lava.rotation.y = Math.cos(t * 0.45) * 0.9;
    armL.rotation.x = -0.6 - hop * 1.6;
    armR.rotation.x = -0.6 - Math.abs(Math.sin(t * 2.4 + 1.2)) * 1.6;
    lavaLight.intensity = 26 + Math.sin(t * 9) * 4;

    // Fireflies drift with the forest and bob
    const arr = flyGeo.attributes.position.array;
    for (let i = 0; i < FLIES; i++) {
      const k = i * 3;
      arr[k + 2] += SPEED * dt;
      if (arr[k + 2] > 10) arr[k + 2] -= 56;
      arr[k + 1] += Math.sin(t * 1.3 + flyPhase[i]) * 0.004;
      arr[k] += Math.cos(t * 0.9 + flyPhase[i]) * 0.003;
    }
    flyGeo.attributes.position.needsUpdate = true;
  }

  function frame(timestamp) {
    raf = requestAnimationFrame(frame);
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.05);
    update(dt, timer.getElapsed());
    renderer.render(scene, camera);
  }

  function start() {
    if (running || reduced || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  if (reduced) {
    update(0, 2);
    renderer.render(scene, camera);
  } else {
    start();
  }

  return {
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    setProgress(p) {
      progress = p;
    },
    destroy() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
    },
  };
}
