import { mkdir, writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((buffer) => {
        this.result = buffer;
        this.onloadend?.();
      })
      .catch((error) => {
        this.error = error;
        this.onerror?.(error);
      });
  }
};

const outDir = new URL('../public/models/', import.meta.url);
const exporter = new GLTFExporter();

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
  for (const side of [-1, 1]) {
    cylinder(group, 0xf7e0ba, [side * 0.15, 1.72, 0], 0.018, 0.022, 0.28);
    cylinder(group, 0xf7e0ba, [side * 0.2, 1.81, 0], 0.014, 0.016, 0.15, [0, 0, side * -0.78]);
    cylinder(group, 0xf7e0ba, [side * 0.1, 1.79, 0], 0.012, 0.014, 0.12, [0, 0, side * 0.7]);
  }
}

function addFootPair(group, color, y = 0.04) {
  sphere(group, color, [-0.16, y, -0.06], 0.075, [1.35, 0.48, 1.05]);
  sphere(group, color, [0.16, y, -0.06], 0.075, [1.35, 0.48, 1.05]);
}

function makeMissMalia() {
  const group = new THREE.Group();
  capsule(group, 0xbca7ff, [0, 0.72, 0], 0.37, 0.78, [1, 1.05, 0.95]);
  sphere(group, 0xf7f1ff, [0, 0.78, -0.34], 0.22, [1.08, 1.35, 0.18]);
  sphere(group, 0xc99f78, [0, 1.38, 0], 0.4, [1, 1.04, 0.96]);
  addFace(group, 1.38, -0.36, 1.28, { muzzle: 0xf2d5bd, nose: 0x4d3028 });
  addEars(group, 0xc99f78, 1.67, 0.24);
  addAntlers(group);
  addFootPair(group, 0x6d4b3c);
  sphere(group, 0xf6d4ec, [-0.28, 0.86, -0.08], 0.07, [0.55, 1.25, 0.55]);
  sphere(group, 0xf6d4ec, [0.28, 0.86, -0.08], 0.07, [0.55, 1.25, 0.55]);
  return group;
}

function makeJoshy() {
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

function makeStudent(kind, color) {
  const group = new THREE.Group();
  capsule(group, color, [0, 0.5, 0], 0.29, 0.44, [1, 1.05, 0.92]);
  sphere(group, 0xfff8ef, [0, 0.5, -0.27], 0.16, [0.92, 1.14, 0.18]);
  sphere(group, color, [0, 1.0, 0], 0.33, [1.02, 1.05, 0.97]);
  addFace(group, 1.0, -0.3, 1, { muzzle: kind === 'fox' ? 0xffe3b5 : 0xfff2df });
  addFootPair(group, color, 0.04);

  if (kind === 'bunny') addBunnyEars(group, color);
  if (kind === 'bear') addEars(group, color, 1.18, 0.23, 'round');
  if (kind === 'turtle') {
    sphere(group, 0x5f9367, [0, 0.56, 0.16], 0.35, [1.08, 0.55, 0.85]);
    sphere(group, 0x8fcb92, [0, 0.72, 0.04], 0.08, [1.1, 0.32, 1.05]);
    sphere(group, 0x8fcb92, [-0.13, 0.69, 0.02], 0.06, [1, 0.28, 0.9]);
    sphere(group, 0x8fcb92, [0.13, 0.69, 0.02], 0.06, [1, 0.28, 0.9]);
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

function makeDog(config) {
  const group = new THREE.Group();
  const fluffy = config.fluffy ?? false;
  capsule(group, config.body, [0, 0.32, 0], fluffy ? 0.23 : 0.2, fluffy ? 0.58 : 0.5, [1, 1, 0.92], [0, 0, Math.PI / 2]);
  sphere(group, config.head ?? config.body, [-0.42, 0.42, 0], 0.22, [1.02, 1, 0.92]);
  sphere(group, config.chest, [-0.51, 0.36, -0.03], 0.1, [1.18, 0.85, 0.6]);
  sphere(group, 0x1e1412, [-0.61, 0.36, 0], 0.035, [0.8, 0.7, 1]);
  sphere(group, config.eye ?? 0x171317, [-0.54, 0.45, -0.08], 0.026);
  sphere(group, config.eye ?? 0x171317, [-0.54, 0.45, 0.08], 0.026);
  cone(group, config.ear ?? config.body, [-0.42, 0.63, -0.12], 0.085, 0.22, [-0.45, 0, 0.2]);
  cone(group, config.ear ?? config.body, [-0.42, 0.63, 0.12], 0.085, 0.22, [0.45, 0, 0.2]);
  cone(group, config.tail ?? config.body, [0.42, 0.38, 0], 0.085, fluffy ? 0.66 : 0.42, [0, 0, -Math.PI / 2.7]);
  sphere(group, config.chest, [-0.25, 0.34, -0.08], 0.15, [1.1, 1.24, 0.48]);
  for (const x of [-0.22, 0.22]) {
    sphere(group, config.leg ?? config.body, [x, 0.1, -0.13], 0.055, [0.75, 1.4, 0.8]);
    sphere(group, config.leg ?? config.body, [x, 0.1, 0.13], 0.055, [0.75, 1.4, 0.8]);
  }
  if (config.spots) {
    config.spots.forEach(([x, y, z, color, sx, sy]) => {
      sphere(group, color, [x, y, z], 0.065, [sx, sy, 0.62]);
    });
  }
  return group;
}

async function exportGlb(fileName, group) {
  const glb = await new Promise((resolve, reject) => {
    exporter.parse(group, resolve, reject, { binary: true, trs: false });
  });
  await writeFile(new URL(fileName, outDir), Buffer.from(glb));
}

await mkdir(outDir, { recursive: true });

const assets = {
  'miss-malia.glb': makeMissMalia(),
  'joshy.glb': makeJoshy(),
  'pip-bunny.glb': makeStudent('bunny', 0xf8e7ff),
  'bram-bear.glb': makeStudent('bear', 0xb88762),
  'tilly-turtle.glb': makeStudent('turtle', 0x87b889),
  'lumi-duckling.glb': makeStudent('duckling', 0xffdf79),
  'roo-fox.glb': makeStudent('fox', 0xd9823b),
  'muffin.glb': makeDog({
    body: 0xd8dbe3,
    head: 0xf8f4ee,
    chest: 0xf8f4ee,
    ear: 0xb57a42,
    tail: 0xd8dbe3,
    fluffy: true,
    spots: [
      [-0.08, 0.43, -0.16, 0x3a3944, 1.4, 0.72],
      [0.12, 0.36, 0.15, 0x6c6875, 1.2, 0.66],
      [-0.48, 0.51, -0.03, 0xb57a42, 1.2, 0.8],
    ],
  }),
  'may.glb': makeDog({
    body: 0x5b3528,
    chest: 0xf2eee8,
    ear: 0x3b241e,
    tail: 0x5b3528,
    leg: 0x5b3528,
  }),
  'phoebe.glb': makeDog({
    body: 0xc98b55,
    chest: 0xfff6ed,
    ear: 0x9b6439,
    tail: 0xc98b55,
    fluffy: true,
  }),
  'zoe.glb': makeDog({
    body: 0x222126,
    chest: 0xf6f0e9,
    ear: 0x111115,
    tail: 0x111115,
    fluffy: true,
  }),
};

for (const [fileName, group] of Object.entries(assets)) {
  await exportGlb(fileName, group);
  console.log(`wrote public/models/${fileName}`);
}
