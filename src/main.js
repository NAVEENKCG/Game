import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// ── Scene ──────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue
scene.fog = new THREE.Fog(0x87CEEB, 80, 400);

// ── Renderer ───────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// ── Camera ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// ── LIGHTS — THIS IS WHY IT WAS DARK ──────────────────
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff5e0, 1.8);
sun.position.set(60, 120, 40);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 500;
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;
sun.shadow.bias = -0.0005;
scene.add(sun);

const hemi = new THREE.HemisphereLight(0x87CEEB, 0x444422, 0.5);
scene.add(hemi);

// ── Physics ────────────────────────────────────────────
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -20, 0) });
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 8;

// Ground physics body
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// ── Ground Mesh ────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(600, 600);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ── Road grid ──────────────────────────────────────────
function makeRoad(w, h, x, z) {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.01, z);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
// Horizontal roads
for (let i = -4; i <= 4; i++) makeRoad(500, 18, 0, i * 60);
// Vertical roads
for (let i = -4; i <= 4; i++) makeRoad(18, 500, i * 60, 0);

// ── Buildings ──────────────────────────────────────────
const buildingColors = [0x8899aa, 0xaa9977, 0xccccbb, 0x7788aa, 0x998877];

function makeBuilding(x, z, w, d, h) {
  // Body
  const geo = new THREE.BoxGeometry(w, h, d);

  // Procedural window texture
  const texSize = 256;
  const texCanvas = document.createElement('canvas');
  texCanvas.width = texSize; texCanvas.height = texSize;
  const ctx = texCanvas.getContext('2d');
  const col = buildingColors[Math.floor(Math.random() * buildingColors.length)];
  const r = (col >> 16) & 255, g = (col >> 8) & 255, b = col & 255;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, texSize, texSize);
  // Windows
  for (let row = 1; row < 8; row++) {
    for (let col2 = 1; col2 < 6; col2++) {
      const lit = Math.random() > 0.25;
      ctx.fillStyle = lit ? '#FFEE99' : '#223344';
      ctx.fillRect(col2 * 38, row * 28, 22, 16);
    }
  }
  const tex = new THREE.CanvasTexture(texCanvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, Math.ceil(h / 20));

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Physics
  const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)) });
  body.position.set(x, h / 2, z);
  world.addBody(body);
}

// Procedural city blocks
for (let bx = -4; bx <= 4; bx++) {
  for (let bz = -4; bz <= 4; bz++) {
    const cx = bx * 60, cz = bz * 60;
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const offX = (Math.random() - 0.5) * 30;
      const offZ = (Math.random() - 0.5) * 30;
      const w = 8 + Math.random() * 14;
      const d = 8 + Math.random() * 14;
      const h = 15 + Math.random() * 100;
      makeBuilding(cx + offX, cz + offZ, w, d, h);
    }
  }
}

// ── PLAYER ─────────────────────────────────────────────
// Visible capsule-style body
const playerGroup = new THREE.Group();

// Body
const bodyMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.4, 1.0, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0x1a6bbf }) // blue jacket
);
bodyMesh.position.y = 0.5;
bodyMesh.castShadow = true;
playerGroup.add(bodyMesh);

// Head
const headMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.28, 8, 8),
  new THREE.MeshStandardMaterial({ color: 0xffcc99 }) // skin tone
);
headMesh.position.y = 1.5;
headMesh.castShadow = true;
playerGroup.add(headMesh);

// Arms
[-0.55, 0.55].forEach(side => {
  const arm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, 0.6, 4, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a6bbf })
  );
  arm.position.set(side, 0.5, 0);
  arm.rotation.z = side > 0 ? 0.3 : -0.3;
  playerGroup.add(arm);
});

// Legs
[-0.2, 0.2].forEach(side => {
  const leg = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.15, 0.7, 4, 6),
    new THREE.MeshStandardMaterial({ color: 0x222255 }) // dark jeans
  );
  leg.position.set(side, -0.5, 0);
  playerGroup.add(leg);
});

playerGroup.position.set(0, 1.0, 0);
scene.add(playerGroup);

// Physics body for player
const playerBody = new CANNON.Body({
  mass: 80,
  shape: new CANNON.Cylinder(0.4, 0.4, 1.8, 8),
  linearDamping: 0.9,
  angularDamping: 1.0,
});
playerBody.position.set(0, 1.5, 5);
playerBody.fixedRotation = true;
world.addBody(playerBody);

// ── NPCs ───────────────────────────────────────────────
const npcColors = [0xff4444, 0x44ff44, 0xffaa00, 0xff44ff, 0x00ffff, 0xff8800];
const npcs = [];

function spawnNPC(x, z, color) {
  const g = new THREE.Group();

  const body2 = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 0.9, 4, 8),
    new THREE.MeshStandardMaterial({ color })
  );
  body2.position.y = 0.45;
  body2.castShadow = true;
  g.add(body2);

  const head2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffcc99 })
  );
  head2.position.y = 1.3;
  g.add(head2);

  g.position.set(x, 0.9, z);
  scene.add(g);

  npcs.push({
    mesh: g,
    waypoint: new THREE.Vector3(x + (Math.random() - 0.5) * 30, 0, z + (Math.random() - 0.5) * 30),
    speed: 1.5 + Math.random() * 1.5,
  });
}

// Spawn 20 NPCs around the city
for (let i = 0; i < 20; i++) {
  const angle = (i / 20) * Math.PI * 2;
  const dist = 15 + Math.random() * 60;
  spawnNPC(
    Math.cos(angle) * dist,
    Math.sin(angle) * dist,
    npcColors[i % npcColors.length]
  );
}

// ── Traffic Cars ───────────────────────────────────────
const cars = [];
function spawnCar(x, z) {
  const g = new THREE.Group();
  const carColor = new THREE.Color(Math.random(), Math.random(), Math.random());

  // Body
  const body3 = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 4),
    new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.3, metalness: 0.6 })
  );
  body3.position.y = 0.8;
  body3.castShadow = true;
  g.add(body3);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 2.2),
    new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.3 })
  );
  roof.position.set(0, 1.5, -0.3);
  g.add(roof);

  // Wheels ×4
  [[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx * 1.1, 0.35, wz);
    g.add(wheel);
  });

  // Windows
  const winMat = new THREE.MeshStandardMaterial({ color: 0x88bbff, transparent: true, opacity: 0.7 });
  const frontWin = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), winMat);
  frontWin.position.set(0, 1.45, -1.42);
  g.add(frontWin);

  g.position.set(x, 0, z);
  scene.add(g);

  cars.push({
    mesh: g,
    speed: 5 + Math.random() * 8,
    dir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
  });
}

for (let i = 0; i < 12; i++) {
  const roadX = (Math.floor(Math.random() * 9) - 4) * 60;
  const roadZ = (Math.random() - 0.5) * 240;
  spawnCar(roadX, roadZ);
}

// ── Input ──────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

let yaw = 0, pitch = 0.3;
let isPointerLocked = false;

canvas.addEventListener('click', () => canvas.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === canvas;
});
document.addEventListener('mousemove', e => {
  if (!isPointerLocked) return;
  yaw -= e.movementX * 0.002;
  pitch = Math.max(0.05, Math.min(0.9, pitch + e.movementY * 0.002));
});

// ── Camera arm (third-person) ──────────────────────────
const CAM_DIST = 7;
const CAM_HEIGHT = 3;

// ── HUD ────────────────────────────────────────────────
const hud = document.getElementById('hud');
hud.innerHTML = `
  <div id="health-bar"><span>❤️</span><div id="health-fill"></div></div>
  <div id="money-display">$0</div>
  <div id="speed-display">0 KM/H</div>
  <div id="wanted-display">⭐⭐⭐⭐⭐</div>
  <div id="crosshair">+</div>
  <div id="prompt"></div>
`;

let money = 500;
let health = 100;
let wantedStars = 0;

function updateHUD() {
  document.getElementById('health-fill').style.width = health + '%';
  document.getElementById('money-display').textContent = '$' + money.toLocaleString();
  const stars = '★'.repeat(wantedStars) + '☆'.repeat(5 - wantedStars);
  document.getElementById('wanted-display').textContent = stars;
}
updateHUD();

// ── Clock ──────────────────────────────────────────────
const clock = new THREE.Clock();
let physicsAccum = 0;
const FIXED_STEP = 1 / 60;

// ── Game Loop ──────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  physicsAccum += delta;

  // Fixed-step physics (performance fix)
  while (physicsAccum >= FIXED_STEP) {
    world.step(FIXED_STEP);
    physicsAccum -= FIXED_STEP;
  }

  // ── Player movement ──
  const speed = keys['ShiftLeft'] ? 10 : 5;
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const moveVel = new CANNON.Vec3(0, playerBody.velocity.y, 0);

  if (keys['KeyW']) { moveVel.x += forward.x * speed; moveVel.z += forward.z * speed; }
  if (keys['KeyS']) { moveVel.x -= forward.x * speed; moveVel.z -= forward.z * speed; }
  if (keys['KeyA']) { moveVel.x -= right.x * speed; moveVel.z -= right.z * speed; }
  if (keys['KeyD']) { moveVel.x += right.x * speed; moveVel.z += right.z * speed; }

  // Jump
  if (keys['Space'] && Math.abs(playerBody.velocity.y) < 0.5) {
    moveVel.y = 10;
  }

  playerBody.velocity.set(moveVel.x, moveVel.y, moveVel.z);

  // Sync player mesh to physics body
  playerGroup.position.copy(playerBody.position);
  playerGroup.position.y -= 0.9;
  playerGroup.rotation.y = yaw;

  // ── Third-person camera ──
  const px = playerBody.position.x;
  const py = playerBody.position.y;
  const pz = playerBody.position.z;

  const camX = px + Math.sin(yaw) * CAM_DIST * Math.cos(pitch);
  const camY = py + Math.sin(pitch) * CAM_DIST + CAM_HEIGHT;
  const camZ = pz + Math.cos(yaw) * CAM_DIST * Math.cos(pitch);

  camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
  camera.lookAt(px, py + 1.2, pz);

  // Sync sun to player (shadow follows player)
  sun.position.set(px + 60, 120, pz + 40);
  sun.target.position.set(px, 0, pz);
  sun.target.updateMatrixWorld();

  // ── NPC wander ──
  npcs.forEach(npc => {
    const dist = npc.mesh.position.distanceTo(npc.waypoint);
    if (dist < 2) {
      // New random waypoint
      npc.waypoint.set(
        (Math.random() - 0.5) * 220,
        0,
        (Math.random() - 0.5) * 220
      );
    }
    const dir = npc.waypoint.clone().sub(npc.mesh.position).normalize();
    npc.mesh.position.addScaledVector(dir, npc.speed * delta);
    npc.mesh.lookAt(npc.waypoint);

    // Bob while walking
    npc.mesh.children[0].position.y = 0.45 + Math.sin(Date.now() * 0.005 + npc.speed) * 0.05;
  });

  // ── Traffic cars ──
  cars.forEach(car => {
    car.mesh.position.addScaledVector(car.dir, car.speed * delta);
    car.mesh.lookAt(car.mesh.position.clone().add(car.dir));

    // Bounce off world edge
    if (Math.abs(car.mesh.position.x) > 250 || Math.abs(car.mesh.position.z) > 250) {
      car.dir.negate();
    }

    // Spin wheels
    car.mesh.children.slice(2, 6).forEach(w => w.rotation.x += car.speed * delta * 2);
  });

  // ── Proximity prompt ──
  let nearCar = false;
  cars.forEach(car => {
    if (car.mesh.position.distanceTo(playerGroup.position) < 4) nearCar = true;
  });
  document.getElementById('prompt').textContent = nearCar ? '🚗 Press F to enter vehicle' : '';

  renderer.render(scene, camera);
}

animate();

// ── Resize ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});