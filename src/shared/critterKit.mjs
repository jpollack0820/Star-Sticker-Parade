// Shared chibi-critter body builders, used by both:
// - scripts/generate-character-glbs.mjs (Node, bakes these into GLB files)
// - src/main.ts (browser, live procedural fallback if a GLB fails to load)
//
// Keeping this in one place means a design tweak only has to happen once —
// previously the same shapes were hand-duplicated in both places and could
// (and did) drift out of sync.
import * as THREE from 'three';

const matCache = new Map();

function mat(color, roughness = 0.82) {
  const key = `${color}-${roughness}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness }));
  }
  return matCache.get(key);
}

function add(group, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function sphere(group, color, position, radius, scale = [1, 1, 1], roughness) {
  return add(group, new THREE.SphereGeometry(radius, 28, 20), mat(color, roughness), position, scale);
}

function capsule(group, color, position, radius, length, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  return add(group, new THREE.CapsuleGeometry(radius, length, 10, 22), mat(color), position, scale, rotation);
}

function cone(group, color, position, radius, height, rotation = [0, 0, 0], scale = [1, 1, 1]) {
  return add(group, new THREE.ConeGeometry(radius, height, 18), mat(color), position, scale, rotation);
}

function cylinder(group, color, position, radiusTop, radiusBottom, height, rotation = [0, 0, 0]) {
  return add(group, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 18), mat(color), position, [1, 1, 1], rotation);
}

function addFace(group, y, z, scale, options = {}) {
  const muzzle = options.muzzle ?? 0xffead7;
  const nose = options.nose ?? 0x332226;
  sphere(group, muzzle, [0, y - 0.035 * scale, z], 0.115 * scale, [1.28, 0.78, 0.36]);
  sphere(group, nose, [0, y - 0.02 * scale, z - 0.083 * scale], 0.032 * scale, [1.2, 0.75, 0.55]);
  for (const side of [-1, 1]) {
    sphere(group, 0x1d1720, [side * 0.095 * scale, y + 0.078 * scale, z - 0.045 * scale], 0.035 * scale, [1, 1, 0.85], 0.55);
    sphere(group, 0xffffff, [side * 0.086 * scale, y + 0.089 * scale, z - 0.074 * scale], 0.009 * scale, [1, 1, 1], 0.4);
    sphere(group, 0xf2a3b7, [side * 0.16 * scale, y - 0.055 * scale, z - 0.055 * scale], 0.026 * scale, [1.55, 0.7, 0.28]);
  }
}

function addEars(group, color, y, spread, kind = 'point') {
  if (kind === 'round') {
    sphere(group, color, [-spread, y, 0], 0.15);
    sphere(group, color, [spread, y, 0], 0.15);
    return;
  }
  cone(group, color, [-spread, y, 0], 0.12, 0.34, [0, 0, 0.34]);
  cone(group, color, [spread, y, 0], 0.12, 0.34, [0, 0, -0.34]);
}

function addBunnyEars(group, color) {
  capsule(group, color, [-0.13, 1.28, 0], 0.055, 0.38, [0.8, 1.05, 0.72], [0, 0, 0.18]);
  capsule(group, color, [0.13, 1.28, 0], 0.055, 0.38, [0.8, 1.05, 0.72], [0, 0, -0.18]);
  capsule(group, 0xf6a6c8, [-0.13, 1.28, -0.025], 0.023, 0.27, [0.8, 1, 0.5], [0, 0, 0.18]);
  capsule(group, 0xf6a6c8, [0.13, 1.28, -0.025], 0.023, 0.27, [0.8, 1, 0.5], [0, 0, -0.18]);
}

function addAntlers(group) {
  const antlerColor = 0xf3dcb0;
  for (const side of [-1, 1]) {
    // Main beam, angled up and outward from the crown.
    cylinder(group, antlerColor, [side * 0.15, 1.8, 0], 0.024, 0.03, 0.36, [0.1, 0, side * 0.22]);
    // Two branching tines near the top.
    cylinder(group, antlerColor, [side * 0.27, 1.98, -0.03], 0.015, 0.02, 0.2, [0, 0, side * -0.85]);
    cylinder(group, antlerColor, [side * 0.1, 1.94, 0.03], 0.014, 0.019, 0.17, [0, 0, side * 0.8]);
    // Rounded tips so the silhouette reads soft/cute rather than spiky.
    sphere(group, antlerColor, [side * 0.34, 2.06, -0.05], 0.024);
    sphere(group, antlerColor, [side * 0.14, 2.01, 0.06], 0.022);
  }
}

function addDressAccent(group) {
  // A small rounded collar at the neckline plus a heart charm, replacing the
  // oversized plain circle that used to read like a bullseye on the chest.
  sphere(group, 0xf7f1ff, [0, 1.02, -0.36], 0.16, [1.5, 0.55, 0.3]);
  const heart = new THREE.Shape();
  const s = 0.075;
  heart.moveTo(0, -0.7 * s);
  heart.bezierCurveTo(-1.3 * s, -0.05 * s, -1.15 * s, 1.0 * s, -0.45 * s, 1.05 * s);
  heart.bezierCurveTo(-0.1 * s, 1.1 * s, 0, 0.7 * s, 0, 0.5 * s);
  heart.bezierCurveTo(0, 0.7 * s, 0.1 * s, 1.1 * s, 0.45 * s, 1.05 * s);
  heart.bezierCurveTo(1.15 * s, 1.0 * s, 1.3 * s, -0.05 * s, 0, -0.7 * s);
  const heartMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(heart, 16),
    new THREE.MeshStandardMaterial({ color: 0xf6a6c8, roughness: 0.7, side: THREE.DoubleSide }),
  );
  heartMesh.position.set(0, 0.92, -0.395);
  heartMesh.rotation.y = Math.PI;
  heartMesh.castShadow = true;
  group.add(heartMesh);
}

function addFootPair(group, color, y = 0.04) {
  sphere(group, color, [-0.16, y, -0.06], 0.075, [1.35, 0.48, 1.05]);
  sphere(group, color, [0.16, y, -0.06], 0.075, [1.35, 0.48, 1.05]);
}

export function makeMissMalia() {
  const group = new THREE.Group();
  // Her silhouette needs to read as a teacher from the normal isometric camera:
  // a soft dress, visible sleeves, and a larger, warmer face before the player
  // gets close enough to read the tiny details.
  capsule(group, 0xa990df, [0, 0.72, 0], 0.39, 0.76, [1.04, 1.04, 0.98]);
  cone(group, 0x8d70c8, [0, 0.34, 0.035], 0.43, 0.42, [Math.PI, 0, 0], [1, 1, 0.9]);
  capsule(group, 0xa990df, [-0.37, 0.8, -0.01], 0.075, 0.28, [0.8, 1, 0.8], [0, 0, 0.18]);
  capsule(group, 0xa990df, [0.37, 0.8, -0.01], 0.075, 0.28, [0.8, 1, 0.8], [0, 0, -0.18]);
  addDressAccent(group);
  sphere(group, 0xc99f78, [0, 1.42, 0], 0.43, [1.04, 1.07, 0.98]);
  addFace(group, 1.42, -0.39, 1.38, { muzzle: 0xf2d5bd, nose: 0x4d3028 });
  addEars(group, 0xc99f78, 1.73, 0.255);
  cone(group, 0xf1b7ce, [-0.255, 1.73, -0.035], 0.055, 0.17, [0, 0, 0.34]);
  cone(group, 0xf1b7ce, [0.255, 1.73, -0.035], 0.055, 0.17, [0, 0, -0.34]);
  addAntlers(group);
  addFootPair(group, 0x6d4b3c);
  sphere(group, 0xf6d4ec, [-0.34, 0.68, -0.1], 0.075, [0.68, 1.12, 0.62]);
  sphere(group, 0xf6d4ec, [0.34, 0.68, -0.1], 0.075, [0.68, 1.12, 0.62]);
  sphere(group, 0xf5d36d, [0.29, 1.7, -0.33], 0.055, [1.25, 1.25, 0.38], 0.58);
  return group;
}

export function makeJoshy() {
  const group = new THREE.Group();
  sphere(group, 0x8f6b52, [0, 0.72, 0], 0.42, [1, 1.22, 0.85]);
  sphere(group, 0xf3dfba, [-0.105, 0.88, -0.28], 0.18, [1.05, 1.06, 0.18]);
  sphere(group, 0xf3dfba, [0.105, 0.88, -0.28], 0.18, [1.05, 1.06, 0.18]);
  sphere(group, 0x1d1720, [-0.1, 0.91, -0.37], 0.042);
  sphere(group, 0x1d1720, [0.1, 0.91, -0.37], 0.042);
  cone(group, 0xf1b451, [0, 0.8, -0.42], 0.045, 0.12, [Math.PI / 2, 0, 0]);
  cone(group, 0x8f6b52, [-0.2, 1.14, 0], 0.1, 0.24, [0, 0, 0.48]);
  cone(group, 0x8f6b52, [0.2, 1.14, 0], 0.1, 0.24, [0, 0, -0.48]);
  sphere(group, 0x73513f, [-0.35, 0.68, -0.02], 0.16, [0.28, 1.15, 0.8]);
  sphere(group, 0x73513f, [0.35, 0.68, -0.02], 0.16, [0.28, 1.15, 0.8]);
  addFootPair(group, 0xf1b451, 0.18);
  return group;
}

export function makeStudent(kind, color) {
  const group = new THREE.Group();
  capsule(group, color, [0, 0.5, 0], 0.29, 0.44, [1, 1.05, 0.92]);
  sphere(group, 0xfff8ef, [0, 0.5, -0.27], 0.16, [0.92, 1.14, 0.18]);
  sphere(group, color, [0, 1.0, 0], 0.33, [1.02, 1.05, 0.97]);
  addFace(group, 1.0, -0.3, 1, { muzzle: kind === 'fox' ? 0xffe3b5 : 0xfff2df });
  addFootPair(group, color, 0.04);

  if (kind === 'bunny') addBunnyEars(group, color);
  if (kind === 'bear') addEars(group, color, 1.18, 0.23, 'round');
  if (kind === 'turtle') {
    // A wide, tall, contrasting-color dome behind the shoulders so the shell
    // silhouette peeks out on both sides and above the head from the front,
    // instead of hiding fully behind the body like the old narrow shell did.
    sphere(group, 0x3f7a4a, [0, 0.6, 0.18], 0.38, [1.25, 0.7, 1.05]);
    sphere(group, 0x6fae74, [0, 0.78, 0.15], 0.09, [1, 0.5, 0.9]);
    sphere(group, 0x6fae74, [-0.16, 0.7, 0.2], 0.075, [1, 0.5, 0.85]);
    sphere(group, 0x6fae74, [0.16, 0.7, 0.2], 0.075, [1, 0.5, 0.85]);
    sphere(group, 0x6fae74, [-0.26, 0.55, 0.22], 0.06, [1, 0.5, 0.8]);
    sphere(group, 0x6fae74, [0.26, 0.55, 0.22], 0.06, [1, 0.5, 0.8]);
  }
  if (kind === 'duckling') {
    cone(group, 0xff9f43, [0, 0.95, -0.38], 0.075, 0.18, [Math.PI / 2, 0, 0]);
    sphere(group, 0xffefaa, [-0.28, 0.54, -0.05], 0.12, [0.32, 1, 0.74]);
    sphere(group, 0xffefaa, [0.28, 0.54, -0.05], 0.12, [0.32, 1, 0.74]);
  }
  if (kind === 'fox') {
    addEars(group, color, 1.23, 0.2);
    cone(group, color, [0, 0.44, 0.48], 0.18, 0.82, [Math.PI / 2.6, 0, 0]);
    sphere(group, 0xfff2df, [0, 0.2, 0.78], 0.13, [0.9, 0.9, 1.25]);
  }
  return group;
}

export function makeDog(config) {
  // An upright sitting puppy, front-facing like every other character in the
  // cast (the previous version was a side-profile-only quadruped: from the
  // game's fixed front/isometric camera it showed one ear and a tail point
  // with no visible face at all).
  const group = new THREE.Group();
  const fluffy = config.fluffy ?? false;
  const bodyR = fluffy ? 0.27 : 0.24;
  const headY = fluffy ? 0.72 : 0.68;
  const headR = fluffy ? 0.25 : 0.22;

  capsule(group, config.body, [0, 0.3, 0], bodyR, fluffy ? 0.32 : 0.28, [1.04, 1, 1]);
  sphere(group, config.chest, [0, 0.3, -bodyR * 0.82], 0.15, [0.9, 1.1, 0.22]);
  sphere(group, config.head ?? config.body, [0, headY, 0], headR, [1, 0.96, 0.94]);
  addFace(group, headY, -headR * 0.82, fluffy ? 0.82 : 0.74, { muzzle: config.chest, nose: 0x2a1713 });

  // Floppy ears framing both sides of the face.
  capsule(group, config.ear ?? config.body, [-headR * 0.9, headY + 0.06, 0], 0.06, 0.22, [0.9, 1, 0.55], [0, 0, 0.55]);
  capsule(group, config.ear ?? config.body, [headR * 0.9, headY + 0.06, 0], 0.06, 0.22, [0.9, 1, 0.55], [0, 0, -0.55]);

  if (fluffy) {
    // Neck ruff for the fluffier breeds (Aussie/Sheltie), sitting just under the chin.
    sphere(group, config.chest, [0, headY - 0.22, -0.02], 0.19, [1.05, 0.72, 0.8]);
  }

  // Tail peeking out from behind.
  cone(group, config.tail ?? config.body, [0, 0.3, bodyR * 0.85], 0.08, fluffy ? 0.3 : 0.2, [Math.PI / 2.3, 0, 0]);

  // Front paws.
  sphere(group, config.leg ?? config.body, [-bodyR * 0.5, 0.05, -bodyR * 0.55], 0.07, [1, 0.55, 1.05]);
  sphere(group, config.leg ?? config.body, [bodyR * 0.5, 0.05, -bodyR * 0.55], 0.07, [1, 0.55, 1.05]);

  if (config.spots) {
    config.spots.forEach(([x, y, z, color, sx, sy]) => {
      sphere(group, color, [x, y, z], 0.065, [sx, sy, 0.55]);
    });
  }
  return group;
}
