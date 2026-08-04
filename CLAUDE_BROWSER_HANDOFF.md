# Claude Browser Handoff: Star Sticker Parade

Use this as the project context if continuing the game in Claude Browser or another coding agent.

> **Current-state guardrail (2026-08-04):** Start on `codex/ssp-visual-proof` and
> read `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/WORK_PACKETS.md`, and
> `ASSET_UPGRADE_PLAN.md` before acting. This document keeps useful historical detail;
> if it conflicts with the current visual gate or asset state, those current files
> win. All active characters use generated chibi-critter GLBs, Kenney substitutions
> are inactive, and the classroom proof is implemented. Next is owner/manager review
> and one bounded follow-up surface, not piecemeal character replacement.

## Project

Project folder:

`C:\AI-Workspace\Projects\Star-Sticker-Parade`

Game title:

`The Star Sticker Parade`

Stack:

- Vite
- TypeScript
- Three.js
- DOM overlays for dialogue, HUD, phone, minigames, ending overlay
- Local save via `localStorage`
- Static-hosting-friendly Vite config with `base: './'`

Main files:

- `src/main.ts` - core game, Three.js scene, interactions, mini-games, save state, model loading
- `src/styles.css` - HUD, dialogue, minigame, ending, responsive CSS
- `scripts/visual-smoke.mjs` - Playwright browser smoke/visual QA
- `scripts/generate-character-glbs.mjs` - generates starter local GLB models
- `scripts/qa-model-assets.mjs` - validates required GLB model files
- `public/models/` - model slots and generated starter GLBs
- `public/models/kenney-cube-pets/` - imported Kenney animated GLB student models and texture
- `ASSET_UPGRADE_PLAN.md` - asset sourcing and replacement plan
- `CREDITS.md` - external asset credit/license note
- `vite.config.ts` - static-hosting configuration

Commands:

```bash
pnpm run dev
pnpm run generate:models
pnpm run qa:models
pnpm run build
node scripts/visual-smoke.mjs
```

Current dev server, when running:

`http://127.0.0.1:5173/`

## Creative Brief

Build a cozy third-person one-shot browser game gift for the user’s girlfriend, Malia Nelson.

Core fantasy:

Miss Malia is a doe teacher in a lavender magic elementary classroom. She helps five animal students with small puzzle-like tasks. The students are secretly preparing a thank-you parade and a crochet keepsake garland. At the end, the game transitions from the classroom to a courtyard parade reveal with students, dogs, and Joshy, the owl boyfriend character.

Tone:

- Cute
- Sincere
- Cozy
- Not overly cheesy
- Dialogue should sound like kindergarten/2nd-grade kids, but not babyish
- Avoid greeting-card phrasing

Important user preference:

The assistant should not blindly agree. Be honest when something is not good enough and make concrete improvements.

## Characters

Player:

- Miss Malia
- Doe teacher
- Lavender outfit
- Desk/nameplate can say `Nelson`

Owl boyfriend:

- Name label and dialogue name: `Joshy ❤️`
- Appears in one mid-game phone notification and at the ending
- Ending dialogue:
  `They wanted to say thank you. I did too. You give so much of yourself, and I love you for that.`
- Post-ending options: `[Hug] [Kiss]`
- Kiss triggers hearts and:
  `I love you, Malia.`

Students:

1. Pip the Bunny
   - Shy/careful
   - Task: sentence-building from mixed-up word tiles
   - Ending line: `You wait for me when I need more time. I like that.`

2. Bram the Little Bear
   - Grumpy big-feelings kid
   - Task: dependency-based yarn strand pull puzzle
   - Ending line: `I made this. It is not a big deal. But... don't lose it, okay?`

3. Tilly the Turtle
   - Organized helper
   - Task: match colors into a practice banner pattern
   - Ending line: `You help everybody. So I wanted to help you too.`

4. Lumi the Duckling
   - Dreamy/distracted
   - Task: catch warm sparkle lights, avoid sleepy blue ones
   - Ending line: `You make school feel happy. Like even the lights want to stay.`

5. Roo the Fox
   - Confident but secretly unsure
   - Task: spell `THANKYOU` from mixed-up letter stickers
   - Ending line: `I was gonna say thank you later. But everybody is saying it now, so... thank you.`

Dogs:

- Muffin: Australian shepherd, merle gray/white/tan
- May: brown terrier/pit mix with white chest
- Phoebe: Shetland sheepdog, brown/sable with white chest
- Zoe: Shetland sheepdog, black/white only, no tan
- Dogs appear after the parade only
- Dogs can be pet after the ending
- No collars

## Current Gameplay

Implemented:

- Third-person/isometric-ish movement with WASD/arrow keys or click/tap-to-move
- Interaction prompt with `E / Enter`
- Dialogue system
- Objective chip
- Star progress HUD
- Phone notification after enough tasks
- Center charm choice: `star`, `heart`, `moon`, `butterfly`
- Five student tasks/minigames
- Star pop animation after task completion
- Save state via `localStorage`
- Separate courtyard parade scene
- Thank-you banner:
  `Thank you for all the hard work you do, Miss Malia.`
- Crochet garland and center charm
- Post-ending walk-around, student/Joshy/dog interactions
- Reset button

Save key:

`star-sticker-parade-save-v1`

Save data includes:

- completed student task IDs
- chosen center charm
- ending unlocked
- discovered easter eggs
- phone seen

## Art And Asset State

The original characters were built procedurally from Three.js primitives. A GLB pipeline has now been added.

Runtime model loading:

- `GLTFLoader` is used in `src/main.ts`
- `MODEL_ASSETS` maps characters to GLB URLs
- Missing models fall back to procedural characters
- Loaded model meshes get shadows
- If a GLB has animations, the game plays the `idle` clip by default
- Subtle idle/breathing motion is also applied in the runtime

Generated starter GLBs in `public/models/`:

- `miss-malia.glb`
- `joshy.glb`
- `pip-bunny.glb`
- `bram-bear.glb`
- `tilly-turtle.glb`
- `lumi-duckling.glb`
- `roo-fox.glb`
- `muffin.glb`
- `may.glb`
- `phoebe.glb`
- `zoe.glb`

## Historical asset note (not active)

Kenney Cube Pets pack was downloaded into:

`external-assets/kenney-cube-pets/`

Selected GLBs copied into:

`public/models/kenney-cube-pets/`

Imported:

- `animal-bunny.glb`
- `animal-chick.glb`
- `animal-fox.glb`
- `animal-polar.glb`
- `Textures/colormap.png`

Kenney license:

- CC0
- Credit appreciated but not required
- See `CREDITS.md`

Current active model mapping (reconciled to `src/main.ts` on 2026-07-31):

- Every active character uses the generated chibi-critter GLB in `public/models/`.
- The previously tried Kenney Cube Pets substitution is not active. Its voxel look conflicted with the generated soft rounded cast, so the project returned to one consistent generated style.

Honest visual status:

This is better than pure procedural geometry and the pipeline is real, but the Kenney Cube Pets style is still not final Animal Crossing-level art. It is a useful free CC0 proof-of-pipeline and partial art upgrade. Final quality likely requires a more consistent paid/free stylized character pack, custom Blender work, or commissioned/purchased GLBs.

## Asset Upgrade Plan

Recommended external sources:

1. Quaternius
   - https://quaternius.com/
   - Likely best fit for stylized animal/character packs

2. Kenney Cube Pets
   - https://kenney.nl/assets/cube-pets
   - Already imported
   - CC0

3. itch.io 3D animal assets
   - https://itch.io/game-assets/tag-3d/tag-animals

4. Poly Pizza
   - https://poly.pizza/

Current visual-proof priority:

1. Build one complete representative classroom scene before adding or sourcing model tools.
2. Improve the entire cast together only if the proof identifies character quality as the remaining visual blocker.
3. Improve the courtyard/parade only after the classroom direction is established.

Replacement workflow:

1. Download/source a better model.
2. Export/convert to GLB if needed.
3. Put it in `public/models/`.
4. Update `MODEL_ASSETS` if the filename/path differs.
5. Tune scale/rotation in `src/main.ts`.
6. Run:

```bash
pnpm run qa:models
pnpm run build
node scripts/visual-smoke.mjs
```

## QA And Verification

Model QA:

`pnpm run qa:models`

Checks:

- required models exist
- GLB magic header
- glTF version 2
- declared file size matches actual file size
- starter size budget

Build:

`pnpm run build`

Browser smoke:

`node scripts/visual-smoke.mjs`

The browser smoke:

- checks desktop and mobile canvas boot
- selects center charm
- completes first minigame
- verifies task completion state/star HUD
- verifies parade state
- writes screenshots into `qa/`

Last known verification status:

- `pnpm run qa:models` passed
- `pnpm run build` passed
- `node scripts/visual-smoke.mjs` passed with no errors

## Known Issues / Improvement Targets

High priority:

- Improve final model style consistency
- Replace generated Miss Malia/Joshy with stronger character art
- Replace generated dogs with better dog models matching Muffin/May/Phoebe/Zoe
- Make parade reveal more cinematic
- Improve dialogue pass after visuals settle
- Consider more robust mobile controls

Medium priority:

- Add actual walk animations when moving
- Use Kenney/GLB `walk` clips when available
- Add small camera easing/cutscene movement during parade reveal
- Add more classroom props that do not clutter interaction readability
- Improve text sprite legibility and reduce overlap

Publishing:

- `vite.config.ts` uses `base: './'` for static hosting
- `dist/` is generated by `pnpm run build`
- Could publish through Sites or GitHub Pages later
- Do not publish before user approves current visual quality

## Direct Prompt For Claude Browser

You are continuing a local browser game project called `The Star Sticker Parade`. It is a Vite + TypeScript + Three.js cozy third-person one-shot game gift for the user's girlfriend, Malia Nelson. Read the project files carefully before changing code. Preserve the existing stack and structure unless there is a concrete reason not to.

The game lives in `star-sticker-parade`. Main file is `src/main.ts`; styles are in `src/styles.css`; GLB models are in `public/models`; smoke testing is in `scripts/visual-smoke.mjs`; model QA is in `scripts/qa-model-assets.mjs`.

Current goal: continue improving the game toward a polished cute Animal Crossing-inspired one-shot. Be honest about quality. Do not just agree. If something looks cheap, identify why and improve it.

Important current state:

- There is already a GLB loading pipeline via `GLTFLoader`.
- Missing GLBs fall back to procedural characters.
- Loaded GLBs play an `idle` animation if present.
- Kenney Cube Pets CC0 assets are imported for Pip/Bram/Lumi/Roo.
- Generated GLBs exist for Miss Malia, Joshy, Tilly, and dogs.
- Run `pnpm run qa:models`, `pnpm run build`, and browser smoke test after meaningful changes.

Do not break:

- five student tasks
- center charm choice
- localStorage save
- parade reveal
- post-ending walk-around
- Joshy hug/kiss
- dog petting
- mobile/desktop boot

Recommended next moves:

1. Improve model style consistency or source better GLBs.
2. Upgrade Miss Malia and Joshy first.
3. Add movement/walk animation support.
4. Polish parade cutscene/camera.
5. Improve final dialogue only after visual direction stabilizes.

When making code changes, keep them scoped and verify with the existing commands.
