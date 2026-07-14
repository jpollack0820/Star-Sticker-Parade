import { readFile, stat } from 'node:fs/promises';

const modelDir = new URL('../public/models/', import.meta.url);
const requiredModels = [
  'miss-malia.glb',
  'joshy.glb',
  'pip-bunny.glb',
  'bram-bear.glb',
  'tilly-turtle.glb',
  'lumi-duckling.glb',
  'roo-fox.glb',
  'muffin.glb',
  'may.glb',
  'phoebe.glb',
  'zoe.glb',
  'kenney-cube-pets/animal-bunny.glb',
  'kenney-cube-pets/animal-chick.glb',
  'kenney-cube-pets/animal-fox.glb',
  'kenney-cube-pets/animal-polar.glb',
];

const maxModelBytes = 1_500_000;
let totalBytes = 0;
const failures = [];

for (const fileName of requiredModels) {
  const fileUrl = new URL(fileName, modelDir);
  try {
    const info = await stat(fileUrl);
    const buffer = await readFile(fileUrl);
    totalBytes += info.size;

    const magic = buffer.subarray(0, 4).toString('utf8');
    const version = buffer.readUInt32LE(4);
    const declaredLength = buffer.readUInt32LE(8);

    if (magic !== 'glTF') failures.push(`${fileName}: invalid GLB magic`);
    if (version !== 2) failures.push(`${fileName}: expected glTF 2, got ${version}`);
    if (declaredLength !== info.size) failures.push(`${fileName}: declared length ${declaredLength} does not match ${info.size}`);
    if (info.size > maxModelBytes) failures.push(`${fileName}: ${info.size} bytes is larger than the ${maxModelBytes} byte starter budget`);

    console.log(`${fileName.padEnd(18)} ${(info.size / 1024).toFixed(1).padStart(7)} KB`);
  } catch (error) {
    failures.push(`${fileName}: missing or unreadable (${error.message})`);
  }
}

console.log(`total models       ${(totalBytes / 1024).toFixed(1).padStart(7)} KB`);

if (failures.length > 0) {
  console.error('\nModel QA failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('\nModel QA passed.');
