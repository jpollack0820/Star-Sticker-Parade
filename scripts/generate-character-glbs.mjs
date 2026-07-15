import { mkdir, writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { makeMissMalia, makeJoshy, makeStudent, makeDog } from '../src/shared/critterKit.mjs';

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
      [-0.16, 0.84, -0.12, 0x3a3944, 1.1, 0.9],
      [0.19, 0.36, -0.2, 0x6c6875, 1.2, 0.9],
      [-0.2, 0.2, -0.16, 0xb57a42, 1, 0.8],
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
