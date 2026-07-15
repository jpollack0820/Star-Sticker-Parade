import './styles.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makeMissMalia, makeJoshy, makeStudent as makeStudentBody, makeDog as makeDogBody } from './shared/critterKit.mjs';

type StudentId = 'bunny' | 'bear' | 'turtle' | 'duckling' | 'fox';
type CharmChoice = 'star' | 'heart' | 'moon' | 'butterfly';
type InteractionKind = 'student' | 'easterEgg' | 'endingNpc' | 'choiceSpot';
type ModelAssetKey = 'missMalia' | 'joshy' | StudentId | 'muffin' | 'may' | 'phoebe' | 'zoe';
type CharacterMotionKind = 'player' | 'student' | 'owl' | 'dog';

interface SaveData {
  completed: StudentId[];
  chosenCharm: CharmChoice | null;
  endingUnlocked: boolean;
  discoveredEggs: string[];
  phoneSeen: boolean;
}

interface Student {
  id: StudentId;
  name: string;
  species: string;
  color: number;
  position: THREE.Vector3;
  intro: string;
  minigameTitle: string;
  minigamePrompt: string;
  charm: string;
  endingLine: string;
}

interface Interaction {
  id: string;
  kind: InteractionKind;
  label: string;
  position: THREE.Vector3;
  radius: number;
  onInteract: () => void;
}

interface DogConfig {
  id: string;
  name: string;
  position: THREE.Vector3;
  body: number;
  chest: number;
  accent: number;
  pattern: 'merle' | 'brown' | 'sable' | 'tricolor';
  spots?: [number, number, number, number, number, number][];
  line: string;
}

interface ModelAttachOptions {
  scale: number;
  yOffset?: number;
  rotationY?: number;
}

interface CharacterMotion {
  root: THREE.Group;
  kind: CharacterMotionKind;
  phase: number;
  baseY: number;
}

const SAVE_KEY = 'star-sticker-parade-save-v1';
const modelUrl = (fileName: string) => `${import.meta.env.BASE_URL}models/${fileName}`;
// All characters share the same generated chibi-critter style (see
// scripts/generate-character-glbs.mjs). The Kenney Cube Pets pack used to
// stand in for four of the students, but its blocky voxel look clashed with
// everyone else's soft rounded style, so every character now uses the same
// generator instead.
const MODEL_ASSETS: Record<ModelAssetKey, string> = {
  missMalia: modelUrl('miss-malia.glb'),
  joshy: modelUrl('joshy.glb'),
  bunny: modelUrl('pip-bunny.glb'),
  bear: modelUrl('bram-bear.glb'),
  turtle: modelUrl('tilly-turtle.glb'),
  duckling: modelUrl('lumi-duckling.glb'),
  fox: modelUrl('roo-fox.glb'),
  muffin: modelUrl('muffin.glb'),
  may: modelUrl('may.glb'),
  phoebe: modelUrl('phoebe.glb'),
  zoe: modelUrl('zoe.glb'),
};
const defaultSave: SaveData = {
  completed: [],
  chosenCharm: null,
  endingUnlocked: false,
  discoveredEggs: [],
  phoneSeen: false,
};

const students: Student[] = [
  {
    id: 'bunny',
    name: 'Pip',
    species: 'Bunny',
    color: 0xf8e7ff,
    position: new THREE.Vector3(-4.6, 0, -2.3),
    intro: 'Can you wait while I try again? I know it, I just get mixed up.',
    minigameTitle: 'Practice The Parade Words',
    minigamePrompt: 'Build Pip\'s sentence from the mixed-up word tiles.',
    charm: 'lavender yarn heart',
    endingLine: 'You wait for me when I need more time. I like that.',
  },
  {
    id: 'bear',
    name: 'Bram',
    species: 'Little Bear',
    color: 0xb88762,
    position: new THREE.Vector3(-2.1, 0, 2.9),
    intro: 'I tried three times. The yarn keeps getting stuck, and I am not starting over.',
    minigameTitle: 'Untangle The Yarn',
    minigamePrompt: 'Pull the strands that are free. Some strands are pinned under others.',
    charm: 'lopsided crochet star',
    endingLine: "I made this. It is not a big deal. But... don't lose it, okay?",
  },
  {
    id: 'turtle',
    name: 'Tilly',
    species: 'Turtle',
    color: 0x87b889,
    position: new THREE.Vector3(1.9, 0, 2.7),
    intro: 'I made spots for every charm, but I keep checking them again.',
    minigameTitle: 'Sort The Charms',
    minigamePrompt: 'Fill the practice banner by matching the color pattern.',
    charm: 'green button-flower',
    endingLine: 'You help everybody. So I wanted to help you too.',
  },
  {
    id: 'duckling',
    name: 'Lumi',
    species: 'Duckling',
    color: 0xffdf79,
    position: new THREE.Vector3(4.3, 0, -2.1),
    intro: 'The lights keep floating away. I think they forgot we need them.',
    minigameTitle: 'Catch Sparkle Lights',
    minigamePrompt: 'Catch the warm sparkles for the lantern. Leave the sleepy blue ones alone.',
    charm: 'tiny sparkle moon',
    endingLine: 'You make school feel happy. Like even the lights want to stay.',
  },
  {
    id: 'fox',
    name: 'Roo',
    species: 'Fox',
    color: 0xd9823b,
    position: new THREE.Vector3(4.8, 0, 2.5),
    intro: "I know where the letters go. Mostly. You can stand there in case I don't.",
    minigameTitle: 'Place Letter Stickers',
    minigamePrompt: 'Use the mixed-up stickers to spell the banner words.',
    charm: 'orange-gold letter patch',
    endingLine: 'I was gonna say thank you later. But everybody is saying it now, so... thank you.',
  },
];

const easterEggs = [
  { id: 'hibiscus', label: 'Hibiscus sticker', text: 'A little hibiscus sticker is tucked by the window. It smells like sunshine.', x: -5.7, z: -4.2 },
  { id: 'owl-doodle', label: 'Tiny owl doodle', text: 'A tiny owl doodle says: "saving the best sparkle for last."', x: 5.6, z: -4.5 },
  { id: 'nelson', label: 'Nelson nameplate', text: 'The desk nameplate reads: Miss Nelson. Someone added a lavender star.', x: -0.2, z: -4.7 },
  { id: 'grow-note', label: 'Hidden note', text: 'A folded note says: "Miss Malia helps things grow."', x: -5.8, z: 4.3 },
  { id: 'crochet-heart', label: 'Crochet heart', text: 'A soft crochet heart is hiding in the reading rug fringe.', x: 0.3, z: 4.4 },
];

const dogs: DogConfig[] = [
  {
    id: 'muffin',
    name: 'Muffin',
    position: new THREE.Vector3(4.85, 0, 1.65),
    body: 0xd8dbe3,
    chest: 0xf8f4ee,
    accent: 0xb57a42,
    pattern: 'merle',
    spots: [
      [-0.16, 0.84, -0.12, 0x3a3944, 1.1, 0.9],
      [0.19, 0.36, -0.2, 0x6c6875, 1.2, 0.9],
      [-0.2, 0.2, -0.16, 0xb57a42, 1, 0.8],
    ],
    line: 'Muffin sits very tall, like she knows the parade is important.',
  },
  {
    id: 'may',
    name: 'May',
    position: new THREE.Vector3(3.9, 0, 2.15),
    body: 0x5b3528,
    chest: 0xf2eee8,
    accent: 0x3b241e,
    pattern: 'brown',
    line: 'May does a happy little wiggle and waits for pets.',
  },
  {
    id: 'phoebe',
    name: 'Phoebe',
    position: new THREE.Vector3(-3.9, 0, 2.15),
    body: 0xc98b55,
    chest: 0xfff6ed,
    accent: 0x9b6439,
    pattern: 'sable',
    line: 'Phoebe has a fluffy chest and the proudest parade face.',
  },
  {
    id: 'zoe',
    name: 'Zoe',
    position: new THREE.Vector3(-4.95, 0, 1.65),
    body: 0x222126,
    chest: 0xf6f0e9,
    accent: 0x111115,
    pattern: 'tricolor',
    line: 'Zoe gives one polite tail wag, then asks for more pets with her eyes.',
  },
];

let save = loadSave();
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let player: THREE.Group;
let roomGroup: THREE.Group;
let paradeGroup: THREE.Group;
let owl: THREE.Group;
let bannerGroup: THREE.Group;
let garlandGroup: THREE.Group;
let sparkleGroup: THREE.Group;
let interactPrompt: HTMLElement;
let objective: HTMLElement;
let stickerBar: HTMLElement;
let dialog: HTMLElement;
let dialogName: HTMLElement;
let dialogText: HTMLElement;
let dialogActions: HTMLElement;
let phone: HTMLElement;
let miniGame: HTMLElement;
let endingOverlay: HTMLElement;
let sceneFade: HTMLElement;
let dogGroups: THREE.Group[] = [];
const gltfLoader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pointerWorld = new THREE.Vector3();
let moveTarget: THREE.Vector3 | null = null;

const keys = new Set<string>();
const interactions: Interaction[] = [];
const studentModels = new Map<StudentId, THREE.Group>();
const characterMotions: CharacterMotion[] = [];
const animationMixers: THREE.AnimationMixer[] = [];
const clock = new THREE.Clock();
let nearest: Interaction | null = null;
let activeModal = false;
let paradeMode = false;
let lastPlayerPos = new THREE.Vector3();
let playerIsMoving = false;

interface CameraCue {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

interface CameraCinematic {
  start: number;
  duration: number;
  from: CameraCue;
  to: CameraCue;
  onDone: () => void;
}

let cinematic: CameraCinematic | null = null;

init();
animate();

function init() {
  createDom();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2e9ff);
  scene.fog = new THREE.Fog(0xf2e9ff, 17, 31);

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  document.querySelector<HTMLDivElement>('#app')!.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('pointerdown', onPointerMoveRequest);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9078a8, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(5, 9, 4);
  sun.castShadow = true;
  scene.add(sun);

  buildRoom();
  buildParadeCourtyard();
  player = createDoe();
  player.position.set(0, 0, 0.8);
  player.rotation.y = Math.PI;
  scene.add(player);
  lastPlayerPos.copy(player.position);

  students.forEach((student) => {
    const model = createStudent(student);
    model.position.copy(student.position);
    // Face is local -Z; yaw π turns them to face into the room (+Z), which is
    // what the old lookAt(z + 1) intended but got backwards.
    model.rotation.set(0, Math.PI, 0);
    studentModels.set(student.id, model);
    scene.add(model);
    interactions.push({
      id: student.id,
      kind: 'student',
      label: save.completed.includes(student.id) ? `${student.name}: chat` : `${student.name}: help`,
      position: student.position,
      radius: 1.25,
      onInteract: () => talkToStudent(student),
    });
  });

  buildEasterEggs();
  buildChoiceSpot();
  buildParadeSpot();
  buildEndingCast();
  updateObjective();
  updateGarland();
  if (save.endingUnlocked) {
    enterParadeScene();
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
}

function createDom() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div class="hud">
        <div id="objective" class="objective"></div>
        <div id="stickerBar" class="stickers"></div>
      </div>
      <div id="interactPrompt" class="prompt hidden"></div>
      <div id="dialog" class="dialog hidden" role="dialog" aria-live="polite">
        <div id="dialogName" class="dialog-name"></div>
        <div id="dialogText" class="dialog-text"></div>
        <div id="dialogActions" class="dialog-actions"></div>
      </div>
      <div id="phone" class="phone hidden">
        <div class="phone-top">New message</div>
        <div class="phone-from">Joshy ❤️</div>
        <div class="phone-body">Hey Malia. Hope your day's been gentle. I know how much heart you give your kids. I see it too.</div>
        <button>Put phone away</button>
      </div>
      <div id="miniGame" class="mini hidden"></div>
      <div id="endingOverlay" class="ending hidden"></div>
      <div id="sceneFade" class="scene-fade"></div>
      <button id="resetSave" class="reset">Reset</button>
    `,
  );
  interactPrompt = document.querySelector('#interactPrompt')!;
  objective = document.querySelector('#objective')!;
  stickerBar = document.querySelector('#stickerBar')!;
  dialog = document.querySelector('#dialog')!;
  dialogName = document.querySelector('#dialogName')!;
  dialogText = document.querySelector('#dialogText')!;
  dialogActions = document.querySelector('#dialogActions')!;
  phone = document.querySelector('#phone')!;
  miniGame = document.querySelector('#miniGame')!;
  endingOverlay = document.querySelector('#endingOverlay')!;
  sceneFade = document.querySelector('#sceneFade')!;
  phone.querySelector('button')!.addEventListener('click', () => hidePhone());
  interactPrompt.addEventListener('click', () => {
    if (nearest && !activeModal) nearest.onInteract();
  });
  document.querySelector('#resetSave')!.addEventListener('click', () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  });
}

function buildRoom() {
  roomGroup = new THREE.Group();
  scene.add(roomGroup);
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(13, 0.25, 10),
    new THREE.MeshStandardMaterial({ color: 0xdcc9ff, roughness: 0.86 }),
  );
  floor.receiveShadow = true;
  floor.position.y = -0.13;
  addRoomObject(floor);
  addFloorDetails();

  addWall(0, 5.1, 13.2, 0.25);
  addWall(0, -5.1, 13.2, 0.25);
  addWall(-6.6, 0, 0.25, 10.2);
  addWall(6.6, 0, 0.25, 10.2);
  addWindow(-4.4, -4.86);
  addWindow(4.4, -4.86);
  addShelf(-5.95, -1.75);
  addShelf(5.95, -1.95);
  addWallDecorations();

  addRug(0, 3.7, 3.4, 1.7, 0xc8f0d2);
  addRug(-4.2, -3.3, 2.3, 1.4, 0xf7c4dd);
  addTable(-4.5, -1.0, 0xf2d6a2);
  addCraftScatter(-4.5, -1.0);
  addTable(4.4, 1.0, 0xf2d6a2);
  addCraftScatter(4.4, 1.0);
  addTable(2.0, -3.1, 0xd5f0ff);
  addCraftScatter(2.0, -3.1);
  addCubbies(-5.8, 1.0);
  addBoard(0, -4.92, 'KINDNESS  COURAGE  PATIENCE  CREATIVITY');
  addTeacherDesk(-0.2, -4.2);
  addCrochetCorner(-5.1, 3.5);
  addHibiscusPlants();
  bannerGroup = new THREE.Group();
  bannerGroup.position.set(0, 1.75, -4.78);
  roomGroup.add(bannerGroup);
  garlandGroup = new THREE.Group();
  garlandGroup.position.set(0, 1.05, -4.68);
  roomGroup.add(garlandGroup);
  sparkleGroup = new THREE.Group();
  scene.add(sparkleGroup);
}

function addRoomObject(object: THREE.Object3D) {
  roomGroup.add(object);
}

function addWall(x: number, z: number, w: number, d: number) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, 1.7, d),
    new THREE.MeshStandardMaterial({ color: 0xf9f1ff, roughness: 0.9 }),
  );
  wall.position.set(x, 0.73, z);
  wall.receiveShadow = true;
  addRoomObject(wall);
}

function addFloorDetails() {
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xcab9e1, transparent: true, opacity: 0.3 });
  for (let x = -5.4; x <= 5.4; x += 1.2) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 9.2), lineMat);
    line.position.set(x, 0.011, 0);
    addRoomObject(line);
  }
  for (let z = -4.2; z <= 4.2; z += 1.2) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.012, 0.018), lineMat);
    line.position.set(0, 0.012, z);
    addRoomObject(line);
  }
}

function addWindow(x: number, z: number) {
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.82, 0.05), new THREE.MeshStandardMaterial({ color: 0xcfe9ff, roughness: 0.35 }));
  glass.position.set(x, 1.2, z);
  addRoomObject(glass);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xfffbf5, roughness: 0.7 });
  const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.08), frameMat);
  vertical.position.set(x, 1.2, z - 0.035);
  const horizontal = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.07, 0.08), frameMat);
  horizontal.position.set(x, 1.2, z - 0.04);
  addRoomObject(vertical);
  addRoomObject(horizontal);
}

function addShelf(x: number, z: number) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.6), new THREE.MeshStandardMaterial({ color: 0xd1a36f, roughness: 0.82 }));
  shelf.position.set(x, 1.05, z);
  addRoomObject(shelf);
  [0xf7a6ce, 0xffe58f, 0xb9e6c5].forEach((color, index) => {
    const bin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.34), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    bin.position.set(x, 1.25, z - 0.48 + index * 0.48);
    addRoomObject(bin);
  });
}

function addWallDecorations() {
  addPoster(-2.55, -4.86, 0xf7a6ce, 'kind');
  addPoster(2.65, -4.86, 0xffe58f, 'brave');
  addPoster(-6.42, -3.05, 0xb9e6c5, 'grow');
  addPoster(6.42, 2.75, 0xd7cbff, 'make');
  addPaperChain(-1.55, -4.86, 7, 0);
  addPaperChain(1.65, 4.86, 8, Math.PI);
  addShapeCards(-5.95, 3.0, Math.PI / 2);
  addShapeCards(5.95, -3.2, -Math.PI / 2);
  addCalendar(0.95, -4.86);
}

function addPoster(x: number, z: number, color: number, label: string) {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.72, 0.05), new THREE.MeshStandardMaterial({ color, roughness: 0.82 }));
  panel.position.set(x, 1.24, z);
  addRoomObject(panel);
  addTextSprite(label, new THREE.Vector3(x, 1.27, z - 0.045), 0.12, '#5b4370', roomGroup);
}

function addPaperChain(x: number, z: number, count: number, rotationY: number) {
  const colors = [0xf06ea9, 0xffdc6a, 0x9fd8c3, 0xbca7ff];
  for (let i = 0; i < count; i++) {
    const link = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.022, 8, 18),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.65 }),
    );
    link.position.set(x + (i - count / 2) * 0.42, 1.64 + Math.sin(i * 0.9) * 0.05, z);
    link.rotation.set(Math.PI / 2, rotationY, i * 0.4);
    addRoomObject(link);
  }
}

function addShapeCards(x: number, z: number, rotationY: number) {
  const colors = [0xffe58f, 0xf7a6ce, 0x9fd8c3];
  colors.forEach((color, index) => {
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.38), new THREE.MeshStandardMaterial({ color: 0xfffbf5, roughness: 0.82 }));
    card.position.set(x, 0.95 + index * 0.42, z);
    card.rotation.y = rotationY;
    addRoomObject(card);
    const shape = new THREE.Mesh(
      index === 0 ? new THREE.CircleGeometry(0.11, 18) : index === 1 ? new THREE.ShapeGeometry(makeHeartShape(0.11), 16) : new THREE.OctahedronGeometry(0.12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide }),
    );
    shape.position.set(x + (rotationY > 0 ? 0.04 : -0.04), 0.95 + index * 0.42, z);
    shape.rotation.y = rotationY;
    addRoomObject(shape);
  });
}

function addCalendar(x: number, z: number) {
  const page = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.64, 0.04), new THREE.MeshStandardMaterial({ color: 0xfffbf5, roughness: 0.86 }));
  page.position.set(x, 1.2, z);
  addRoomObject(page);
  addTextSprite('today', new THREE.Vector3(x, 1.28, z - 0.045), 0.11, '#7b5f95', roomGroup);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const dot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.035), new THREE.MeshStandardMaterial({ color: col % 2 ? 0xf7a6ce : 0xb9e6c5 }));
      dot.position.set(x - 0.26 + col * 0.17, 1.05 - row * 0.1, z - 0.045);
      addRoomObject(dot);
    }
  }
}

function addRug(x: number, z: number, w: number, d: number, color: number) {
  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.05, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
  );
  rug.position.set(x, 0.02, z);
  addRoomObject(rug);
}

function addTable(x: number, z: number, color: number) {
  const table = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.16, 1.1), new THREE.MeshStandardMaterial({ color }));
  top.position.y = 0.55;
  table.add(top);
  for (const sx of [-0.75, 0.75]) {
    for (const sz of [-0.35, 0.35]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55), new THREE.MeshStandardMaterial({ color: 0x9b6f4c }));
      leg.position.set(sx, 0.26, sz);
      table.add(leg);
    }
  }
  table.position.set(x, 0, z);
  addRoomObject(table);
}

function addCraftScatter(x: number, z: number) {
  const colors = [0xbca7ff, 0xf7a6ce, 0xffe58f, 0x9fd8c3];
  colors.forEach((color, index) => {
    const item = new THREE.Mesh(
      index % 2 === 0 ? new THREE.SphereGeometry(0.09, 12, 8) : new THREE.BoxGeometry(0.22, 0.035, 0.12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.74 }),
    );
    item.position.set(x - 0.48 + index * 0.3, 0.66 + index * 0.006, z + (index % 2 ? 0.22 : -0.18));
    item.rotation.y = index * 0.7;
    addRoomObject(item);
  });
}

function addCubbies(x: number, z: number) {
  for (let i = 0; i < 4; i++) {
    const cubby = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.45),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xf8d0f0 : 0xd7cbff }),
    );
    cubby.position.set(x, 0.35 + (i % 2) * 0.58, z + Math.floor(i / 2) * 0.52);
    addRoomObject(cubby);
  }
}

function addBoard(x: number, z: number, text: string) {
  const board = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 0.08), new THREE.MeshStandardMaterial({ color: 0xa788c7 }));
  board.position.set(x, 1.1, z);
  addRoomObject(board);
  addTextSprite(text, new THREE.Vector3(x, 1.25, z - 0.06), 0.18, '#fff7da', roomGroup);
}

function addTeacherDesk(x: number, z: number) {
  addTable(x, z, 0xf5d4b8);
  addTextSprite('Nelson', new THREE.Vector3(x, 1.0, z - 0.58), 0.22, '#5f497a', roomGroup);
}

function addCrochetCorner(x: number, z: number) {
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xc59562 }));
  basket.position.set(x, 0.23, z);
  addRoomObject(basket);
  ['#bca7ff', '#f6a6c8', '#fff0a8'].forEach((color, index) => {
    const yarn = new THREE.Mesh(new THREE.SphereGeometry(0.18), new THREE.MeshStandardMaterial({ color }));
    yarn.position.set(x - 0.23 + index * 0.22, 0.56, z);
    addRoomObject(yarn);
  });
}

function addHibiscusPlants() {
  [
    [-5.7, -4.55],
    [5.7, -4.55],
    [-5.8, 4.5],
  ].forEach(([x, z]) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.32, 12), new THREE.MeshStandardMaterial({ color: 0xa86b5e }));
    pot.position.set(x, 0.16, z);
    addRoomObject(pot);
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshStandardMaterial({ color: 0xf06ea9 }));
      petal.position.set(x + Math.cos(i) * 0.18, 0.5 + Math.sin(i * 2) * 0.03, z + Math.sin(i) * 0.18);
      addRoomObject(petal);
    }
  });
}

function buildParadeCourtyard() {
  paradeGroup = new THREE.Group();
  paradeGroup.visible = false;
  scene.add(paradeGroup);

  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(15, 0.25, 11),
    new THREE.MeshStandardMaterial({ color: 0xc9efd0, roughness: 0.92 }),
  );
  grass.position.y = -0.14;
  paradeGroup.add(grass);

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.05, 10.5),
    new THREE.MeshStandardMaterial({ color: 0xf6d6ee, roughness: 0.9 }),
  );
  path.position.set(0, 0.02, 0.2);
  paradeGroup.add(path);

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.38, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xd4b3ea, roughness: 0.82 }),
  );
  stage.position.set(0, 0.16, -3.85);
  paradeGroup.add(stage);

  const archMat = new THREE.MeshStandardMaterial({ color: 0x9f79c8, roughness: 0.72 });
  for (const x of [-3.25, 3.25]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 12), archMat);
    post.position.set(x, 1.05, -3.95);
    paradeGroup.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.12, 0.14), archMat);
  rail.position.set(0, 2.08, -3.95);
  paradeGroup.add(rail);

  for (let i = 0; i < 9; i++) {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 10),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffe58f : 0xf7a6ce, emissive: i % 2 ? 0xffcc55 : 0xee6ea9, emissiveIntensity: 0.35 }),
    );
    lantern.position.set(-3.2 + i * 0.8, 1.75 + Math.sin(i) * 0.1, -4.08);
    paradeGroup.add(lantern);
  }

  for (let i = 0; i < 18; i++) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      new THREE.MeshStandardMaterial({ color: i % 3 === 0 ? 0xf06ea9 : i % 3 === 1 ? 0xffe58f : 0xffffff }),
    );
    flower.position.set(-6.4 + Math.random() * 12.8, 0.05, -4.6 + Math.random() * 8.7);
    paradeGroup.add(flower);
  }

  // Chunky trees and bushes ringing the clearing so the courtyard reads as a
  // park, not an empty green slab. Kept clear of the path, stage, and the
  // character/dog spots.
  const treeSpots: [number, number, number][] = [
    [-6.4, -4.3, 1.15],
    [6.4, -4.1, 1.0],
    [-6.7, 0.4, 0.9],
    [6.7, 0.7, 1.2],
    [-5.9, 4.2, 1.05],
    [6.0, 4.3, 0.95],
  ];
  treeSpots.forEach(([x, z, s]) => addParadeTree(x, z, s));
  const bushSpots: [number, number][] = [
    [-5.1, -3.5],
    [5.2, -3.3],
    [-6.3, 2.4],
    [6.3, 2.6],
    [-3.6, 4.7],
    [3.8, 4.8],
  ];
  bushSpots.forEach(([x, z]) => addParadeBush(x, z));

  addTextSprite('Star Sticker Parade', new THREE.Vector3(0, 2.36, -4.1), 0.22, '#5f497a', paradeGroup);
}

function addParadeTree(x: number, z: number, treeScale: number) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0xa4795a, roughness: 0.88 }));
  trunk.position.y = 0.35;
  tree.add(trunk);
  const greens = [0x9fd8a4, 0x7fc48b, 0x8fce9a];
  [
    [0, 1.05, 0.62],
    [-0.3, 0.82, 0.4],
    [0.32, 0.86, 0.42],
    [0, 1.5, 0.42],
  ].forEach(([ox, oy, r], index) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), new THREE.MeshStandardMaterial({ color: greens[index % greens.length], roughness: 0.85 }));
    puff.position.set(ox, oy, 0);
    tree.add(puff);
  });
  tree.scale.setScalar(treeScale);
  tree.position.set(x, 0, z);
  tree.rotation.y = Math.random() * Math.PI * 2;
  paradeGroup.add(tree);
}

function addParadeBush(x: number, z: number) {
  const bush = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), new THREE.MeshStandardMaterial({ color: 0x8fce9a, roughness: 0.88 }));
  body.scale.set(1.3, 0.72, 1.1);
  body.position.y = 0.2;
  bush.add(body);
  [0xf06ea9, 0xffe58f, 0xffffff].forEach((color, index) => {
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    bloom.position.set(-0.24 + index * 0.24, 0.42, 0.08 - (index % 2) * 0.16);
    bush.add(bloom);
  });
  bush.position.set(x, 0, z);
  bush.rotation.y = Math.random() * Math.PI * 2;
  paradeGroup.add(bush);
}

function createDoe() {
  const group = makeMissMalia();
  addGroundShadow(group, 0.88, 0.52);
  addTextSprite('Miss Malia', new THREE.Vector3(0, 2.05, 0), 0.18, '#5f497a', group);
  attachOptionalModel(group, 'missMalia', { scale: 0.92 });
  registerCharacterMotion(group, 'player');
  return group;
}

function createStudent(student: Student) {
  const group = makeStudentBody(student.id, student.color);
  addGroundShadow(group, 0.62, 0.42);
  addTextSprite(student.name, new THREE.Vector3(0, 1.55, 0), 0.16, '#5f497a', group);
  attachOptionalModel(group, student.id, getStudentModelOptions(student.id));
  registerCharacterMotion(group, 'student');
  return group;
}

function getStudentModelOptions(id: StudentId): ModelAttachOptions {
  // All five now come from the same generator at the same internal scale, so
  // they share one attach scale (previously these were tuned much smaller to
  // match the imported Kenney models' different native scale).
  const options: Record<StudentId, ModelAttachOptions> = {
    bunny: { scale: 0.78 },
    bear: { scale: 0.78 },
    turtle: { scale: 0.78 },
    duckling: { scale: 0.78 },
    fox: { scale: 0.78 },
  };
  return options[id];
}

function createOwl() {
  const group = makeJoshy();
  addGroundShadow(group, 0.58, 0.42);
  addTextSprite('Joshy ❤️', new THREE.Vector3(0, 1.56, 0), 0.2, '#5f497a', group);
  attachOptionalModel(group, 'joshy', { scale: 0.8 });
  registerCharacterMotion(group, 'owl');
  return group;
}

function createDog(config: DogConfig) {
  const fluffy = config.pattern !== 'brown';
  const group = makeDogBody({
    body: config.body,
    chest: config.chest,
    ear: config.accent,
    fluffy,
    spots: config.spots,
  });
  addGroundShadow(group, fluffy ? 0.62 : 0.56, 0.4);
  addTextSprite(config.name, new THREE.Vector3(0, 1.12, 0), 0.13, '#5f497a', group);
  attachOptionalModel(group, config.id as ModelAssetKey, { scale: 1 });
  registerCharacterMotion(group, 'dog');
  return group;
}

function addGroundShadow(group: THREE.Group, width: number, depth: number) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 24),
    new THREE.MeshBasicMaterial({ color: 0x6e557d, transparent: true, opacity: 0.16, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(width, depth, 1);
  shadow.position.y = 0.012;
  group.add(shadow);
}

function attachOptionalModel(root: THREE.Group, key: ModelAssetKey, options: ModelAttachOptions) {
  const url = MODEL_ASSETS[key];
  void loadOptionalModel(root, url, options);
}

async function loadOptionalModel(root: THREE.Group, url: string, options: ModelAttachOptions) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return;
  } catch {
    return;
  }

  gltfLoader.load(
    url,
    (gltf) => {
      hideFallbackMeshes(root);
      const model = gltf.scene;
      model.name = `loaded-${url.split('/').pop() || 'model'}`;
      model.position.y = options.yOffset ?? 0;
      model.rotation.y = options.rotationY ?? 0;
      model.scale.setScalar(options.scale);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
        }
      });
      playDefaultAnimation(model, gltf.animations);
      root.add(model);
    },
    undefined,
    () => {
      // Missing or invalid model files should never break the playable fallback.
    },
  );
}

function playDefaultAnimation(model: THREE.Object3D, clips: THREE.AnimationClip[]) {
  if (clips.length === 0) return;
  const clip = clips.find((item) => item.name.toLowerCase() === 'idle') ?? clips[0];
  const mixer = new THREE.AnimationMixer(model);
  const action = mixer.clipAction(clip);
  action.enabled = true;
  action.play();
  animationMixers.push(mixer);
}

function hideFallbackMeshes(root: THREE.Group) {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.visible = false;
    }
  });
}

function registerCharacterMotion(root: THREE.Group, kind: CharacterMotionKind) {
  characterMotions.push({
    root,
    kind,
    phase: Math.random() * Math.PI * 2,
    baseY: root.position.y,
  });
}

function addTextSprite(text: string, position: THREE.Vector3, size = 0.2, color = '#5f497a', parent: THREE.Object3D = scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '900 38px Nunito, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 250, 255, 0.96)';
  roundRect(ctx, 26, 28, 460, 70, 28);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64, 440);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.copy(position);
  sprite.scale.set(size * 5.8, size * 1.45, 1);
  parent.add(sprite);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeHeartShape(size: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.7 * size);
  shape.bezierCurveTo(-1.3 * size, -0.05 * size, -1.15 * size, 1.0 * size, -0.45 * size, 1.05 * size);
  shape.bezierCurveTo(-0.1 * size, 1.1 * size, 0, 0.7 * size, 0, 0.5 * size);
  shape.bezierCurveTo(0, 0.7 * size, 0.1 * size, 1.1 * size, 0.45 * size, 1.05 * size);
  shape.bezierCurveTo(1.15 * size, 1.0 * size, 1.3 * size, -0.05 * size, 0, -0.7 * size);
  return shape;
}

function buildEasterEggs() {
  easterEggs.forEach((egg) => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffd86b, emissive: 0xffc24d, emissiveIntensity: 0.4 }));
    marker.position.set(egg.x, 0.22, egg.z);
    addRoomObject(marker);
    interactions.push({
      id: egg.id,
      kind: 'easterEgg',
      label: save.discoveredEggs.includes(egg.id) ? egg.label : `find ${egg.label}`,
      position: new THREE.Vector3(egg.x, 0, egg.z),
      radius: 0.9,
      onInteract: () => {
        if (!save.discoveredEggs.includes(egg.id)) {
          save.discoveredEggs.push(egg.id);
          saveGame();
          updateObjective();
        }
        showDialog(egg.label, egg.text, [{ label: 'Aww', action: closeDialog }]);
      },
    });
  });
}

function buildChoiceSpot() {
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.7), new THREE.MeshStandardMaterial({ color: 0xf5d4e7 }));
  stand.position.set(0, 0.35, -2.1);
  addRoomObject(stand);
  addTextSprite('center charm', new THREE.Vector3(0, 0.85, -2.1), 0.15, '#7c579d', roomGroup);
  interactions.push({
    id: 'center-charm',
    kind: 'choiceSpot',
    label: save.chosenCharm ? `center charm: ${save.chosenCharm}` : 'choose center charm',
    position: new THREE.Vector3(0, 0, -2.1),
    radius: 1.1,
    onInteract: () => chooseCharm(),
  });
}

function buildParadeSpot() {
  interactions.push({
    id: 'parade-start',
    kind: 'choiceSpot',
    label: 'start the parade',
    position: new THREE.Vector3(0, 0, 3.65),
    radius: 1.6,
    onInteract: () => {
      if (save.completed.length === students.length && save.chosenCharm && !save.endingUnlocked) {
        startEnding();
      }
    },
  });
}

function buildEndingCast() {
  owl = createOwl();
  owl.position.set(-1.3, 0, -3.45);
  owl.visible = save.endingUnlocked;
  scene.add(owl);
  interactions.push({
    id: 'owl',
    kind: 'endingNpc',
    label: 'talk to Joshy ❤️',
    position: owl.position,
    radius: 1.1,
    onInteract: () => talkToOwl(),
  });
  dogGroups = dogs.map((dog) => {
    const model = createDog(dog);
    model.position.copy(dog.position);
    model.visible = save.endingUnlocked;
    scene.add(model);
    interactions.push({
      id: dog.id,
      kind: 'endingNpc',
      label: `pet ${dog.name}`,
      position: dog.position,
      radius: 0.95,
      onInteract: () => showDialog(dog.name, dog.line, [{ label: 'Pet', action: () => dogPetMoment(dog.name) }]),
    });
    return model;
  });
}

function talkToStudent(student: Student) {
  if (save.endingUnlocked) {
    showDialog(`${student.name} the ${student.species}`, student.endingLine, [{ label: 'Thank you', action: closeDialog }]);
    return;
  }
  if (save.completed.includes(student.id)) {
    showDialog(`${student.name} the ${student.species}`, `I'm still working on my ${student.charm}. No peeking.`, [{ label: 'Okay', action: closeDialog }]);
    return;
  }
  showDialog(`${student.name} the ${student.species}`, student.intro, [
    {
      label: 'Help',
      action: () => {
        closeDialog();
        openMiniGame(student);
      },
    },
  ]);
}

function chooseCharm() {
  if (save.chosenCharm) {
    showDialog('Center Charm', `You picked a ${save.chosenCharm}. The kids nod like this is very important.`, [{ label: 'Okay', action: closeDialog }]);
    return;
  }
  showDialog('Center Charm', 'One little shape for the middle of the garland. The rest is still a secret.', [
    { label: 'Star', action: () => setCharm('star') },
    { label: 'Heart', action: () => setCharm('heart') },
    { label: 'Moon', action: () => setCharm('moon') },
    { label: 'Butterfly', action: () => setCharm('butterfly') },
  ]);
}

function setCharm(charm: CharmChoice) {
  save.chosenCharm = charm;
  saveGame();
  updateObjective();
  updateGarland();
  closeDialog();
  showDialog('Center Charm', `The ${charm} charm goes in a tiny box. Somebody whispers, "perfect."`, [{ label: 'Continue', action: closeDialog }]);
}

function openMiniGame(student: Student) {
  activeModal = true;
  miniGame.classList.remove('hidden');
  miniGame.innerHTML = `
    <div class="mini-card">
      <div class="mini-kicker">${student.species} task</div>
      <h2>${student.minigameTitle}</h2>
      <p>${student.minigamePrompt}</p>
      <div class="mini-play ${student.id}">
        ${miniMarkup(student.id)}
      </div>
      <div id="miniStatus" class="mini-status">Take your time.</div>
      <button id="finishMini" disabled>Finish helping</button>
    </div>
  `;
  miniGame.querySelector('#finishMini')!.addEventListener('click', () => completeStudent(student));
  wireMiniGame(student.id);
}

// Pip's practice line for the parade. All eight words are in the tray along
// with two decoys; every word is distinct so tile lookups stay unambiguous.
const PIP_SENTENCE = ['I', 'can', 'say', 'my', 'whole', 'line', 'this', 'time'];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function miniMarkup(id: StudentId) {
  if (id === 'bunny') {
    // An 8-word scramble plus two decoys, so it plays like a small anagram:
    // work out the sentence from the pile, not just permute four words.
    const tiles = shuffle([...PIP_SENTENCE, 'quiet', 'maybe']);
    return `
      <div class="sentence-board" aria-label="sentence blanks">
        ${PIP_SENTENCE.map((_, index) => `<span class="blank-word" data-blank="${index}"></span>`).join('')}
      </div>
      <div class="tile-tray">
        ${tiles.map((word) => `<button class="word-tile" data-word="${word}">${word}</button>`).join('')}
      </div>
    `;
  }
  if (id === 'bear') {
    return `
      <div class="yarn-board">
        <svg viewBox="0 0 420 210" aria-label="tangled yarn puzzle">
          <!-- Draw order encodes the physical stacking: SVG paints later
               elements on top, so the strand with nothing pinning it
               (lavender) is drawn last / lies visibly on top, and each pull
               exposes the next strand up. The correct order is readable by
               looking at which strand crosses over the others. -->
          <path data-line="knot" d="M102 44 C126 86 132 128 104 168 M316 44 C292 86 286 128 314 168" />
          <path data-line="rose" d="M210 12 C160 55 264 92 200 132 S142 176 210 202" />
          <path data-line="pink" d="M54 78 C120 134 176 154 240 88 S316 72 370 138" />
          <path data-line="teal" d="M34 162 C96 92 150 188 230 142 S320 72 388 170" />
          <path data-line="gold" d="M28 115 C95 160 158 40 230 110 S330 165 392 112" />
          <path data-line="lavender" d="M25 45 C110 20 165 92 230 62 S340 22 392 58" />
        </svg>
        <button class="pull-tab tab-lavender" data-strand="lavender">Pull lavender</button>
        <button class="pull-tab tab-gold" data-strand="gold">Pull gold</button>
        <button class="pull-tab tab-teal" data-strand="teal">Pull teal</button>
        <button class="pull-tab tab-pink" data-strand="pink">Pull pink</button>
        <button class="pull-tab tab-rose" data-strand="rose">Pull rose</button>
        <button class="pull-tab tab-knot" data-strand="knot">Loosen knot</button>
      </div>
      <div class="rule-strip">Pull whichever strand lies on top of the pile. Three wrong pulls and it all slips back.</div>
    `;
  }
  if (id === 'turtle') {
    // Four colors and six slots (up from three/five) so the pattern is big
    // enough that memorizing it is a real task, not a glance.
    const palette = ['green', 'lavender', 'gold', 'sky'];
    const pattern = Array.from({ length: 6 }, () => palette[Math.floor(Math.random() * palette.length)]);
    return `
      <div class="pattern-target" id="patternTarget">
        ${pattern.map((color) => `<span class="pattern-dot ${color}"></span>`).join('')}
      </div>
      <div class="pattern-slots">
        ${pattern.map((color, index) => `<button class="pattern-slot" data-color="${color}" data-slot="${index}" aria-label="pattern slot ${index + 1}"></button>`).join('')}
      </div>
      <div class="sort-row">
        ${palette.map((color) => `<button class="sort-charm ${color}" data-color="${color}">${color}</button>`).join('')}
      </div>
      <button class="peek-btn" id="peekBtn" type="button">Peek once more</button>
    `;
  }
  if (id === 'duckling') {
    return `
      <div class="lantern-catch">
        ${Array.from({ length: 12 }, (_, index) => {
          const good = ![2, 7, 10].includes(index);
          return `<button class="sparkle-dot dormant dot-${index} ${good ? 'warm' : 'sleepy'}" data-good="${good ? 'yes' : 'no'}" aria-label="${good ? 'warm' : 'sleepy'} sparkle ${index + 1}"></button>`;
        }).join('')}
        <div class="lantern-core"></div>
      </div>
    `;
  }
  return `
    <div class="letter-board">
      ${'THANKYOU'.split('').map((_, index) => `<span class="letter-slot" data-letter-slot="${index}"></span>`).join('')}
    </div>
    <div class="tile-tray">
      ${'THANKYOU'.split('').map((letter) => `<button class="letter-sticker" data-letter="${letter}">${letter}</button>`).join('')}
    </div>
    <button class="peek-btn" id="peekBtn" type="button">Peek once more</button>
  `;
}

function wireMiniGame(id: StudentId) {
  const finishButton = miniGame.querySelector<HTMLButtonElement>('#finishMini')!;
  const status = miniGame.querySelector<HTMLElement>('#miniStatus')!;
  const complete = (message: string) => {
    status.textContent = message;
    finishButton.disabled = false;
    finishButton.textContent = 'Add class star';
  };

  if (id === 'bunny') {
    const target = PIP_SENTENCE;
    let progress = 0;
    status.textContent = "Ten tiles, eight belong. Piece together Pip's practice line.";
    miniGame.querySelectorAll<HTMLButtonElement>('.word-tile').forEach((button) => {
      button.addEventListener('click', () => {
        const word = button.dataset.word || '';
        if (!target.includes(word)) {
          button.classList.add('wiggle');
          status.textContent = "That word isn't part of the sentence.";
          setTimeout(() => button.classList.remove('wiggle'), 260);
          return;
        }
        if (word !== target[progress]) {
          button.classList.add('wiggle');
          status.textContent = 'That one belongs, but not yet — try a different word first.';
          setTimeout(() => button.classList.remove('wiggle'), 260);
          return;
        }
        const blank = miniGame.querySelector<HTMLElement>(`.blank-word[data-blank="${progress}"]`)!;
        blank.textContent = button.textContent || '';
        blank.classList.add('filled');
        button.classList.add('picked');
        button.disabled = true;
        progress += 1;
        status.textContent = `${progress}/${target.length} words placed.`;
        if (progress === target.length) complete('Pip gets through the whole sentence.');
      });
    });
    return;
  }

  if (id === 'bear') {
    const rules: Record<string, { label: string; after: string[] }> = {
      lavender: { label: 'Lavender', after: [] },
      gold: { label: 'Gold', after: ['lavender'] },
      teal: { label: 'Teal', after: ['lavender'] },
      pink: { label: 'Pink', after: ['gold', 'teal'] },
      rose: { label: 'Rose', after: ['pink'] },
      knot: { label: 'Knot', after: ['rose'] },
    };
    const total = Object.keys(rules).length;
    const pulled = new Set<string>();
    let wrongPulls = 0;
    const tabs = Array.from(miniGame.querySelectorAll<HTMLButtonElement>('.pull-tab'));
    status.textContent = 'Look at the tangle — one strand is lying on top of everything.';

    // Three wrong pulls and the whole tangle snaps back — matching Bram's
    // "I tried three times" temper, this gives the puzzle real stakes without
    // being a hard fail: you just have to start the strand order over.
    const resetTangle = () => {
      pulled.clear();
      wrongPulls = 0;
      tabs.forEach((tab) => {
        tab.disabled = false;
        tab.classList.remove('picked');
      });
      miniGame.querySelectorAll('.yarn-board path').forEach((path) => path.classList.remove('pulled'));
      status.textContent = 'The whole tangle slips back. Start the strand order again.';
    };

    tabs.forEach((button) => {
      button.addEventListener('click', () => {
        const strand = button.dataset.strand || '';
        const missing = rules[strand].after.filter((needed) => !pulled.has(needed));
        if (missing.length > 0) {
          button.classList.add('wiggle');
          wrongPulls += 1;
          if (wrongPulls >= 3) {
            setTimeout(resetTangle, 280);
          } else {
            status.textContent = `${rules[strand].label} is still pinned under ${missing.map((item) => rules[item].label.toLowerCase()).join(' and ')}.`;
          }
          setTimeout(() => button.classList.remove('wiggle'), 260);
          return;
        }
        pulled.add(strand);
        button.disabled = true;
        button.classList.add('picked');
        miniGame.querySelector(`[data-line="${strand}"]`)?.classList.add('pulled');
        status.textContent = `${pulled.size}/${total} strands cleared.`;
        if (pulled.size === total) complete('Bram stares at the yarn like that was always the plan.');
      });
    });
    return;
  }

  if (id === 'turtle') {
    let selected = '';
    let matched = 0;
    let peeksLeft = 1;
    const target = miniGame.querySelector<HTMLElement>('#patternTarget')!;
    const slots = Array.from(miniGame.querySelectorAll<HTMLButtonElement>('.pattern-slot'));
    const colorButtons = Array.from(miniGame.querySelectorAll<HTMLButtonElement>('.sort-charm'));
    const peekBtn = miniGame.querySelector<HTMLButtonElement>('#peekBtn')!;
    const total = slots.length;

    colorButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selected = button.dataset.color || '';
        colorButtons.forEach((item) => item.classList.remove('selected'));
        button.classList.add('selected');
        status.textContent = `Now place ${selected}.`;
      });
    });
    colorButtons[0]?.classList.add('selected');
    selected = colorButtons[0]?.dataset.color || '';

    slots.forEach((button) => button.disabled = true);
    peekBtn.disabled = true;
    status.textContent = 'Study the banner pattern...';

    setTimeout(() => {
      target.classList.add('hidden-pattern');
      slots.forEach((button) => button.disabled = false);
      peekBtn.disabled = false;
      status.textContent = 'Pick a color, then place it from memory.';
    }, 2600);

    peekBtn.addEventListener('click', () => {
      if (peeksLeft <= 0 || peekBtn.disabled) return;
      peeksLeft -= 1;
      peekBtn.disabled = true;
      peekBtn.textContent = 'No peeks left';
      target.classList.remove('hidden-pattern');
      slots.forEach((button) => { if (!button.disabled) button.disabled = true; });
      status.textContent = 'Take another look...';
      setTimeout(() => {
        target.classList.add('hidden-pattern');
        slots.forEach((button) => { if (!button.classList.contains('picked')) button.disabled = false; });
        status.textContent = 'Back to memory — place the next one.';
      }, 1500);
    });

    slots.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.color !== selected) {
          button.classList.add('wiggle');
          status.textContent = 'That slot wants a different color.';
          setTimeout(() => button.classList.remove('wiggle'), 260);
          return;
        }
        button.classList.add('picked', selected);
        button.disabled = true;
        matched += 1;
        status.textContent = `${matched}/${total} banner spots filled.`;
        if (matched === total) {
          peekBtn.disabled = true;
          complete('Tilly checks it once and finally nods.');
        }
      });
    });
    return;
  }

  if (id === 'fox') {
    // Roo "mostly" knows where the letters go — so this is a memory game, not
    // a read-and-click one: watch the correct order once, then the tiles
    // shuffle positions and go blank, and you tap them back in order from
    // memory. A single limited peek keeps it fair rather than punishing.
    const target = 'THANKYOU'.split('');
    let progress = 0;
    let peeksLeft = 1;
    const tiles = Array.from(miniGame.querySelectorAll<HTMLButtonElement>('.letter-sticker'));
    const peekBtn = miniGame.querySelector<HTMLButtonElement>('#peekBtn')!;

    const mask = () => tiles.forEach((tile) => tile.classList.add('masked'));
    const reveal = () => tiles.forEach((tile) => tile.classList.remove('masked'));
    const shuffleTilePositions = () => {
      tiles.forEach((tile) => {
        tile.style.order = String(Math.floor(Math.random() * 100));
      });
    };
    const lockTiles = () => tiles.forEach((tile) => {
      if (!tile.classList.contains('picked')) tile.disabled = true;
    });
    const unlockTiles = () => tiles.forEach((tile) => {
      if (!tile.classList.contains('picked')) tile.disabled = false;
    });

    status.textContent = 'Watch where each letter sticker goes...';
    lockTiles();
    peekBtn.disabled = true;

    setTimeout(() => {
      shuffleTilePositions();
      mask();
      unlockTiles();
      peekBtn.disabled = false;
      status.textContent = 'Now tap them in order, from memory.';
    }, 2400);

    peekBtn.addEventListener('click', () => {
      if (peeksLeft <= 0 || peekBtn.disabled) return;
      peeksLeft -= 1;
      peekBtn.disabled = true;
      peekBtn.textContent = 'No peeks left';
      reveal();
      lockTiles();
      status.textContent = 'Take another look...';
      setTimeout(() => {
        mask();
        unlockTiles();
        status.textContent = 'Back to memory — tap the next one.';
      }, 1400);
    });

    tiles.forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.letter !== target[progress]) {
          button.classList.remove('masked');
          button.classList.add('wiggle');
          status.textContent = 'Not that one — try to remember.';
          setTimeout(() => {
            button.classList.add('masked');
            button.classList.remove('wiggle');
          }, 500);
          return;
        }
        const slot = miniGame.querySelector<HTMLElement>(`.letter-slot[data-letter-slot="${progress}"]`)!;
        slot.textContent = button.textContent || '';
        slot.classList.add('filled');
        button.classList.add('picked');
        button.classList.remove('masked');
        button.disabled = true;
        progress += 1;
        status.textContent = `${progress}/8 letters placed.`;
        if (progress === target.length) {
          peekBtn.disabled = true;
          complete('Roo pretends not to be relieved.');
        }
      });
    });
    return;
  }

  // Sparkles drift between dormant (dim, unclickable) and active (bright,
  // clickable) in randomized waves instead of sitting still and always
  // catchable — matching "the lights keep floating away" and giving the
  // catch real timing/attention pressure instead of an untimed click-sort.
  let caught = 0;
  const total = 9;
  const dots = Array.from(miniGame.querySelectorAll<HTMLButtonElement>('.sparkle-dot'));
  const activeTimers = new Map<HTMLButtonElement, ReturnType<typeof setTimeout>>();
  status.textContent = 'Catch 9 warm sparkles as they drift bright. Leave the sleepy blue ones be.';

  const activateWave = () => {
    const dormant = dots.filter((dot) => dot.classList.contains('dormant'));
    shuffle(dormant)
      .slice(0, Math.min(2, dormant.length))
      .forEach((dot) => {
        dot.classList.remove('dormant');
        dot.classList.add('active');
        activeTimers.set(
          dot,
          setTimeout(() => {
            dot.classList.remove('active');
            dot.classList.add('dormant');
            activeTimers.delete(dot);
          }, 950),
        );
      });
  };

  const waveInterval = setInterval(activateWave, 750);
  activateWave();

  dots.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.good !== 'yes') {
        button.classList.add('wiggle');
        status.textContent = 'That one is sleepy — let it drift.';
        setTimeout(() => button.classList.remove('wiggle'), 260);
        return;
      }
      const timer = activeTimers.get(button);
      if (timer) {
        clearTimeout(timer);
        activeTimers.delete(button);
      }
      button.classList.remove('dormant', 'active');
      button.classList.add('picked');
      button.disabled = true;
      caught += 1;
      status.textContent = `${caught}/${total} warm sparkles in the lantern.`;
      if (caught === total) {
        clearInterval(waveInterval);
        activeTimers.forEach((t) => clearTimeout(t));
        complete('The lantern is glowing softly.');
      }
    });
  });
}

function completeStudent(student: Student) {
  miniGame.classList.add('hidden');
  miniGame.innerHTML = '';
  activeModal = false;
  animateClassStar(() => {
    save.completed.push(student.id);
    saveGame();
    updateObjective();
    updateGarland();
    interactions.find((interaction) => interaction.id === student.id)!.label = `${student.name}: chat`;
    showDialog('Class Star', `A star pops onto the chart. ${student.name} hides a ${student.charm} behind their back.`, [
      {
        label: 'Continue',
        action: () => {
          closeDialog();
          maybeShowPhone();
          maybeUnlockEnding();
        },
      },
    ]);
  });
}

function maybeShowPhone() {
  if (!save.phoneSeen && save.completed.length >= 2) {
    save.phoneSeen = true;
    saveGame();
    activeModal = true;
    phone.classList.remove('hidden');
  }
}

function hidePhone() {
  phone.classList.add('hidden');
  activeModal = false;
}

function maybeUnlockEnding() {
  if (save.completed.length === students.length && save.chosenCharm && !save.endingUnlocked) {
    showDialog('Parade Time', 'The classroom gets quiet. Then somebody opens the back door, and you hear music outside.', [
      { label: 'Start parade', action: startEnding },
    ]);
  }
}

function startEnding() {
  save.endingUnlocked = true;
  saveGame();
  closeDialog();
  activeModal = true;
  fadeScene(true, () => {
    enterParadeScene();
    fadeScene(false, () => playParadeRevealCamera());
  });
}

// Fades the scene-covering DOM overlay to hide the instant classroom/courtyard
// visibility swap, matching the .scene-fade CSS transition duration.
function fadeScene(toOpaque: boolean, onDone: () => void) {
  sceneFade.classList.toggle('opaque', toOpaque);
  setTimeout(onDone, 500);
}

function playParadeRevealCamera() {
  const finalPos = new THREE.Vector3(player.position.x, 6.15, player.position.z + 6.65);
  const finalLook = new THREE.Vector3(player.position.x, 0.62, player.position.z - 2.55);
  const cues: CameraCue[] = [
    { pos: new THREE.Vector3(7.6, 3.6, -1.5), look: new THREE.Vector3(-2, 1.3, -3.9) },
    { pos: new THREE.Vector3(-7.6, 3.6, -1.2), look: new THREE.Vector3(2, 1.3, -3.9) },
    { pos: finalPos, look: finalLook },
  ];
  camera.position.copy(cues[0].pos);
  camera.lookAt(cues[0].look);
  playCameraSequence(cues, 1700, () => {
    activeModal = false;
    showEndingOverlay();
  });
}

function enterParadeScene() {
  paradeMode = true;
  scene.background = new THREE.Color(0xeff9ef);
  scene.fog = new THREE.Fog(0xeff9ef, 18, 34);
  roomGroup.visible = false;
  paradeGroup.visible = true;
  paradeGroup.add(bannerGroup);
  paradeGroup.add(garlandGroup);
  // Hang the cloth banner just under the arch rail (rail y=2.08, z=-3.95).
  bannerGroup.position.set(0, 1.3, -3.88);
  garlandGroup.position.set(0, 0.72, -3.8);
  stageParadeCharacters();
  owl.visible = true;
  dogGroups.forEach((dog) => {
    dog.visible = true;
  });
  updateObjective();
  updateGarland();
}

function showEndingOverlay() {
  activeModal = true;
  endingOverlay.classList.remove('hidden');
  endingOverlay.innerHTML = `
    <div class="ending-card">
      <div class="mini-kicker">Later, in the courtyard</div>
      <div class="banner-title">Thank you for all the hard work you do, Miss Malia.</div>
      <div class="banner-sub">The class made a crochet keepsake garland together.</div>
      <button id="endContinue">Walk around</button>
    </div>
  `;
  endingOverlay.querySelector('#endContinue')!.addEventListener('click', () => {
    endingOverlay.classList.add('hidden');
    activeModal = false;
  });
}

function stageParadeCharacters() {
  const positions: Record<StudentId, [number, number]> = {
    bunny: [-4.55, -1.45],
    bear: [-2.3, 0.85],
    turtle: [2.25, 0.85],
    duckling: [4.45, -1.45],
    fox: [4.1, 1.75],
  };
  students.forEach((student) => {
    const [x, z] = positions[student.id];
    student.position.set(x, 0, z);
    const model = studentModels.get(student.id);
    if (model) {
      model.position.copy(student.position);
      // Explicit yaw only — lookAt() can express a turn as (π, yaw, π), and
      // updateCharacterMotion stomps rotation.z every frame, which left the
      // kids upside down (invisible pancakes in the grass) at the parade.
      // Face is local -Z; aim it at Miss Malia's spot on the path.
      const toPlayer = new THREE.Vector3(0, 0, 2.95).sub(student.position);
      model.rotation.set(0, Math.atan2(-toPlayer.x, -toPlayer.z), 0);
    }
  });
  player.position.set(0, 0, 2.95);
  player.rotation.y = Math.PI;
  owl.position.set(-1.05, 0, -2.7);
  dogs.forEach((dog, index) => {
    const placed: [number, number][] = [[-4.05, 1.95], [-3.05, 2.48], [3.05, 2.48], [4.05, 1.95]];
    const [x, z] = placed[index];
    dog.position.set(x, 0, z);
    const model = dogGroups[index];
    if (model) {
      model.position.copy(dog.position);
      model.rotation.y = x < 0 ? Math.PI : 0;
    }
  });
}

function talkToOwl() {
  if (!save.endingUnlocked) return;
  showDialog('Joshy ❤️', 'They wanted to say thank you. I did too. You give so much of yourself, and I love you for that.', [
    { label: 'Hug', action: () => owlMoment('hug') },
    { label: 'Kiss', action: () => owlMoment('kiss') },
  ]);
}

function owlMoment(kind: 'hug' | 'kiss') {
  closeDialog();
  makeHearts(kind === 'kiss' ? 9 : 5);
  showDialog('Joshy ❤️', kind === 'kiss' ? 'I love you, Malia.' : 'Always on your team, Malia.', [{ label: 'Aww', action: closeDialog }]);
}

function dogPetMoment(name: string) {
  closeDialog();
  makeHearts(3);
  showDialog(name, `${name} accepts the pet like it was part of the parade plan.`, [{ label: 'Good dog', action: closeDialog }]);
}

function animateClassStar(onDone: () => void) {
  activeModal = true;
  const star = document.createElement('div');
  star.className = 'star-flight';
  star.textContent = '★';
  document.body.appendChild(star);
  setTimeout(() => {
    star.classList.add('to-chart');
  }, 40);
  setTimeout(() => {
    star.remove();
    activeModal = false;
    onDone();
  }, 920);
}

function showDialog(name: string, text: string, actions: { label: string; action: () => void }[]) {
  activeModal = true;
  dialog.classList.remove('hidden');
  dialogName.textContent = name;
  dialogText.textContent = text;
  dialogActions.innerHTML = '';
  actions.forEach((action) => {
    const button = document.createElement('button');
    button.textContent = action.label;
    button.addEventListener('click', action.action);
    dialogActions.appendChild(button);
  });
}

function closeDialog() {
  dialog.classList.add('hidden');
  dialogActions.innerHTML = '';
  activeModal = false;
}

function updateObjective() {
  if (save.endingUnlocked) {
    objective.textContent = 'Parade surprise complete. Talk to everyone.';
  } else if (save.completed.length === students.length && save.chosenCharm) {
    objective.textContent = 'The class is ready. Go to the reading rug to start the parade.';
  } else if (!save.chosenCharm) {
    objective.textContent = 'Choose one center charm, then help the students. Tap the floor or use WASD.';
  } else {
    objective.textContent = `Help the class: ${save.completed.length}/5 class stars. Tap the floor or use WASD.`;
  }
  // Fill stars left-to-right by how many tasks are done, not by which student
  // finished (finishing the 2nd student in the roster used to light star #2).
  stickerBar.innerHTML = students
    .map((_, index) => `<span class="${index < save.completed.length ? 'done' : ''}">★</span>`)
    .join('');
}

function makeClothBanner() {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Cream fabric with a scalloped bottom edge, drawn as one filled path so
  // the transparent texture reads as hanging cloth rather than a UI box.
  const scallops = 9;
  const scallopR = canvas.width / (scallops * 2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height - scallopR);
  for (let i = scallops - 1; i >= 0; i--) {
    ctx.arc((i * 2 + 1) * scallopR, canvas.height - scallopR, scallopR, 0, Math.PI);
  }
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = '#fff6e8';
  ctx.fill();

  // Stitch border.
  ctx.strokeStyle = '#d9a8c8';
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 12]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#674a91';
  ctx.font = '900 58px Nunito, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Thank you for all the hard work', canvas.width / 2, 92, 940);
  ctx.fillText('you do, Miss Malia.', canvas.width / 2, 168, 940);

  const texture = new THREE.CanvasTexture(canvas);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 1.44),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.9, side: THREE.DoubleSide }),
  );
  group.add(cloth);

  // Little ties up to the arch rail.
  const tieMat = new THREE.MeshStandardMaterial({ color: 0xd9a8c8, roughness: 0.8 });
  [-2.3, 2.3].forEach((x) => {
    const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), tieMat);
    tie.position.set(x, 0.85, 0);
    tie.rotation.z = x < 0 ? -0.18 : 0.18;
    group.add(tie);
  });
  return group;
}

function updateGarland() {
  bannerGroup.clear();
  garlandGroup.clear();
  if (save.endingUnlocked) {
    bannerGroup.add(makeClothBanner());
  } else {
    addTextSprite('Star Sticker Parade', new THREE.Vector3(0, 0, 0), 0.18, '#674a91', bannerGroup);
  }
  const charms = [...save.completed];
  charms.forEach((id, index) => {
    const student = students.find((item) => item.id === id)!;
    const charm = new THREE.Mesh(new THREE.TorusKnotGeometry(0.1, 0.035, 40, 8), new THREE.MeshStandardMaterial({ color: student.color, roughness: 0.7 }));
    charm.position.set(-1.6 + index * 0.55, 0, 0);
    garlandGroup.add(charm);
  });
  if (save.chosenCharm) {
    const center = createCharmMesh(save.chosenCharm);
    center.position.set(0, -0.38, 0);
    garlandGroup.add(center);
  }
}

function createCharmMesh(charm: CharmChoice) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffd86b, roughness: 0.55, emissive: 0x6d4ca8, emissiveIntensity: 0.1, side: THREE.DoubleSide });
  if (charm === 'heart') {
    return new THREE.Mesh(new THREE.ShapeGeometry(makeHeartShape(0.2), 24), mat);
  }
  if (charm === 'moon') {
    const moon = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 12, 32, Math.PI * 1.5), mat);
    moon.rotation.z = 0.6;
    return moon;
  }
  if (charm === 'butterfly') {
    const group = new THREE.Group();
    [-1, 1].forEach((side) => {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.12), mat);
      wing.scale.set(0.75, 1.2, 0.25);
      wing.position.x = side * 0.1;
      group.add(wing);
    });
    return group;
  }
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 0.2 : 0.085;
    const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) star.moveTo(x, y);
    else star.lineTo(x, y);
  }
  star.closePath();
  return new THREE.Mesh(new THREE.ShapeGeometry(star, 24), mat);
}

function makeHearts(count: number) {
  for (let i = 0; i < count; i++) {
    const heart = createCharmMesh('heart');
    heart.position.set(-1.3 + Math.random() * 0.9, 1.1 + Math.random() * 0.6, -3.4 + Math.random() * 0.5);
    sparkleGroup.add(heart);
    setTimeout(() => sparkleGroup.remove(heart), 2200);
  }
}

function onKeyDown(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  keys.add(key);
  if ((key === 'e' || key === 'enter') && nearest && !activeModal) {
    nearest.onInteract();
  }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    moveTarget = null;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);
  updateModelAnimations(dt);
  updatePlayer(dt);
  updateCharacterMotion(dt);
  updateCamera();
  updateInteractions();
  updateSparkles();
  renderer.render(scene, camera);
}

function updateModelAnimations(dt: number) {
  animationMixers.forEach((mixer) => mixer.update(dt));
}

function updatePlayer(dt: number) {
  if (activeModal) {
    playerIsMoving = false;
    return;
  }
  const move = new THREE.Vector3();
  if (keys.has('w') || keys.has('arrowup')) move.z -= 1;
  if (keys.has('s') || keys.has('arrowdown')) move.z += 1;
  if (keys.has('a') || keys.has('arrowleft')) move.x -= 1;
  if (keys.has('d') || keys.has('arrowright')) move.x += 1;
  if (move.lengthSq() === 0 && moveTarget) {
    const toTarget = moveTarget.clone().sub(player.position);
    toTarget.y = 0;
    if (toTarget.length() > 0.14) move.copy(toTarget.normalize());
    else moveTarget = null;
  }
  playerIsMoving = move.lengthSq() > 0;
  if (playerIsMoving) {
    move.normalize();
    player.position.addScaledVector(move, dt * 3.3);
    player.position.x = THREE.MathUtils.clamp(player.position.x, -5.7, 5.7);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -4.35, 4.55);
    // Character faces local -Z, so aim -Z along the travel direction
    // (atan2(move.x, move.z) alone points the BACK of the head forward).
    player.rotation.y = Math.atan2(-move.x, -move.z);
  }
}

function onPointerMoveRequest(event: PointerEvent) {
  if (activeModal) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(groundPlane, pointerWorld)) {
    moveTarget = pointerWorld.clone();
    moveTarget.x = THREE.MathUtils.clamp(moveTarget.x, -5.7, 5.7);
    moveTarget.z = THREE.MathUtils.clamp(moveTarget.z, -4.35, 4.55);
  }
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function updateCamera() {
  if (cinematic) {
    const elapsed = performance.now() - cinematic.start;
    const t = easeInOutCubic(THREE.MathUtils.clamp(elapsed / cinematic.duration, 0, 1));
    camera.position.lerpVectors(cinematic.from.pos, cinematic.to.pos, t);
    const look = cinematic.from.look.clone().lerp(cinematic.to.look, t);
    camera.lookAt(look);
    if (elapsed >= cinematic.duration) {
      const onDone = cinematic.onDone;
      cinematic = null;
      onDone();
    }
    return;
  }
  const target = new THREE.Vector3(player.position.x, paradeMode ? 6.15 : 5.8, player.position.z + (paradeMode ? 6.65 : 6.2));
  camera.position.lerp(target, 0.08);
  camera.lookAt(player.position.x, 0.62, player.position.z - (paradeMode ? 2.55 : 1.05));
}

// Plays a chain of camera keyframes back to back, ending exactly at the normal
// player-follow pose so control hands off to updateCamera without a visible pop.
function playCameraSequence(cues: CameraCue[], segmentMs: number, onComplete: () => void) {
  let index = 0;
  const next = () => {
    if (index >= cues.length - 1) {
      onComplete();
      return;
    }
    cinematic = {
      start: performance.now(),
      duration: segmentMs,
      from: cues[index],
      to: cues[index + 1],
      onDone: () => {
        index += 1;
        next();
      },
    };
  };
  next();
}

function updateInteractions() {
  let candidate: Interaction | null = null;
  let nearestDistance = Infinity;
  for (const interaction of interactions) {
    if (interaction.kind === 'endingNpc' && !save.endingUnlocked) continue;
    if (interaction.id === 'parade-start' && (save.endingUnlocked || !save.chosenCharm || save.completed.length < students.length)) continue;
    const distance = player.position.distanceTo(interaction.position);
    if (distance < interaction.radius && distance < nearestDistance) {
      candidate = interaction;
      nearestDistance = distance;
    }
  }
  nearest = candidate;
  if (candidate && !activeModal) {
    interactPrompt.textContent = `E / Enter: ${candidate.label}`;
    interactPrompt.classList.remove('hidden');
  } else {
    interactPrompt.classList.add('hidden');
  }
}

function updateSparkles() {
  const t = performance.now() * 0.001;
  bannerGroup.position.y = (paradeMode ? 1.3 : 1.75) + Math.sin(t * 1.4) * 0.03;
  garlandGroup.rotation.z = Math.sin(t * 1.2) * 0.02;
  sparkleGroup.children.forEach((child, index) => {
    child.position.y += 0.006;
    child.rotation.y += 0.025 + index * 0.002;
  });
  if (player.position.distanceTo(lastPlayerPos) > 0.6) {
    lastPlayerPos.copy(player.position);
    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe8a3 }));
    sparkle.position.copy(player.position).add(new THREE.Vector3((Math.random() - 0.5) * 0.45, 0.1, (Math.random() - 0.5) * 0.45));
    sparkleGroup.add(sparkle);
    setTimeout(() => sparkleGroup.remove(sparkle), 900);
  }
}

function updateCharacterMotion(dt: number) {
  characterMotions.forEach((motion, index) => {
    if (!motion.root.visible) return;
    // None of the loaded GLBs ship a real walk-cycle clip for the player (the
    // generated Miss Malia model has no skeleton or animations at all), so a
    // brisker procedural hop stands in for "walking" instead of a static idle bob.
    // Phase is accumulated by dt (not derived from elapsed wall-clock time) so
    // switching speed when playerIsMoving toggles never causes a phase jump/twitch.
    const walking = motion.kind === 'player' && playerIsMoving;
    const speed = walking ? 7.4 : motion.kind === 'dog' ? 2.1 : motion.kind === 'owl' ? 1.45 : 1.25;
    const amplitude = walking ? 0.05 : motion.kind === 'dog' && save.endingUnlocked ? 0.035 : 0.022;
    motion.phase += dt * speed;
    const phase = motion.phase + index * 0.13;
    motion.root.position.y = motion.baseY + (walking ? Math.abs(Math.sin(phase)) : Math.sin(phase)) * amplitude;
    motion.root.rotation.z = walking ? Math.sin(phase * 0.5) * 0.05 : Math.sin(phase * 0.72) * (motion.kind === 'dog' ? 0.035 : 0.018);
    const breathe = 1 + Math.sin(phase * (walking ? 0.5 : 0.92)) * (walking ? 0.02 : motion.kind === 'dog' ? 0.018 : 0.012);
    motion.root.scale.setScalar(breathe);
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadSave(): SaveData {
  try {
    return { ...defaultSave, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') };
  } catch {
    return { ...defaultSave };
  }
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
