import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const browserPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const outDir = new URL('../qa/', import.meta.url);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, ...(browserPath ? { executablePath: browserPath } : {}) });
const errors = [];

// Holds a movement key until the interact prompt mentions `needle`, or maxMs elapses.
// Fixed-duration holds are unreliable because headless rendering speed varies a lot
// across machines/CI (frame count per held second is not constant), so we poll actual
// game state instead of guessing a duration.
async function moveUntil(page, key, needle, { maxMs = 15000, stepMs = 100 } = {}) {
  await page.keyboard.down(key);
  const start = Date.now();
  let met = false;
  while (Date.now() - start < maxMs) {
    await page.waitForTimeout(stepMs);
    met = await page.evaluate(
      (text) => document.querySelector('#interactPrompt')?.textContent?.includes(text) ?? false,
      needle,
    );
    if (met) break;
  }
  await page.keyboard.up(key);
  return met;
}

async function checkViewport(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) errors.push(`${name} console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`${name} pageerror: ${err.message}`));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const screenshot = await page.screenshot({ fullPage: true });
  await writeFile(new URL(`${name}.png`, outDir), screenshot);
  const state = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      hasCanvas: Boolean(canvas),
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      objective: document.querySelector('#objective')?.textContent,
      stickers: document.querySelector('#stickerBar')?.textContent,
      text: document.body.innerText.slice(0, 500),
    };
  });
  await page.close();
  return state;
}

const desktop = await checkViewport('desktop', 1440, 900);
const mobile = await checkViewport('mobile', 390, 844);

const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
page.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type())) errors.push(`main console ${msg.type()}: ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`main pageerror: ${err.message}`));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const reachedCharmSpot = await moveUntil(page, 'KeyW', 'center charm');
if (!reachedCharmSpot) errors.push('Failed to walk into range of the center charm spot');
await page.keyboard.press('KeyE');
await page.waitForTimeout(300);
const afterInteract = await page.evaluate(() => ({
  dialogVisible: !document.querySelector('#dialog')?.classList.contains('hidden'),
  dialogText: document.querySelector('#dialogText')?.textContent,
  prompt: document.querySelector('#interactPrompt')?.textContent,
}));
await page.getByRole('button', { name: 'Star' }).click();
await page.getByRole('button', { name: 'Continue' }).click();

const reachedPip = await moveUntil(page, 'KeyA', 'Pip:');
if (!reachedPip) errors.push('Failed to walk into range of Pip');
await page.keyboard.press('KeyE');
await page.waitForTimeout(200);
await page.getByRole('button', { name: 'Help' }).click();
for (const word of ['I', 'can', 'say', 'my', 'whole', 'line', 'this', 'time']) {
  await page.getByRole('button', { name: word, exact: true }).click();
}
const miniDoneEnabled = await page.getByRole('button', { name: 'Add class star' }).isEnabled();
await page.getByRole('button', { name: 'Add class star' }).click();
await page.waitForTimeout(1200);
const afterMini = await page.evaluate(() => ({
  dialogVisible: !document.querySelector('#dialog')?.classList.contains('hidden'),
  dialogText: document.querySelector('#dialogText')?.textContent,
  objective: document.querySelector('#objective')?.textContent,
  stickersHtml: document.querySelector('#stickerBar')?.innerHTML,
}));
await page.close();

const paradePage = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
paradePage.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type())) errors.push(`parade console ${msg.type()}: ${msg.text()}`);
});
paradePage.on('pageerror', (err) => errors.push(`parade pageerror: ${err.message}`));
await paradePage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await paradePage.evaluate(() => {
  localStorage.setItem('star-sticker-parade-save-v1', JSON.stringify({
    completed: ['bunny', 'bear', 'turtle', 'duckling', 'fox'],
    chosenCharm: 'heart',
    endingUnlocked: false,
    discoveredEggs: [],
    phoneSeen: true,
  }));
});
await paradePage.reload({ waitUntil: 'networkidle' });
await paradePage.waitForTimeout(600);
const reachedParadeStart = await moveUntil(paradePage, 'KeyS', 'start the parade');
if (!reachedParadeStart) errors.push('Failed to walk into range of the parade start spot');
await paradePage.keyboard.press('KeyE');
await paradePage.waitForTimeout(500);
await paradePage.getByRole('button', { name: 'Walk around' }).click();
await paradePage.waitForTimeout(400);
await writeFile(new URL('parade.png', outDir), await paradePage.screenshot({ fullPage: true }));
const paradeReady = await paradePage.evaluate(() => ({
  objective: document.querySelector('#objective')?.textContent,
  endingVisible: !document.querySelector('#endingOverlay')?.classList.contains('hidden'),
  endingText: document.querySelector('#endingOverlay')?.textContent?.slice(0, 200),
}));
await paradePage.close();

await browser.close();

console.log(JSON.stringify({ desktop, mobile, afterInteract, miniDoneEnabled, afterMini, paradeReady, errors }, null, 2));

// Console noise (GPU driver perf notices, a blocked external font fetch under some
// network policies) isn't a game regression, so only fail the run on the concrete
// gameplay assertions actually walked above.
const functionalFailures = [
  !reachedCharmSpot && 'did not reach the center charm spot',
  !reachedPip && 'did not reach Pip',
  !miniDoneEnabled && "Pip's mini-game did not enable Finish helping",
  !reachedParadeStart && 'did not reach the parade start spot',
].filter(Boolean);
if (functionalFailures.length > 0) {
  console.error('\nSmoke test failed:', functionalFailures.join('; '));
  process.exitCode = 1;
}
