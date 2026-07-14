# Asset Upgrade Plan

## Current State

The game now ships generated starter GLB files in `public/models/`.
These prove the model-loading pipeline, keep the game fully playable, and can be replaced one file at a time.

## Recommended Next Upgrade

Use a consistent low-poly/stylized asset source first, then customize.

Best near-term candidates:

1. Quaternius
   - Useful packs: Ultimate Animated Animal Pack, Ultimate Modular Women Pack, Ultimate Modular Men Pack, Stylized Nature Pack, Ultimate House Interior Pack.
   - Why it fits: broad stylized 3D library with animals, humanoid modular characters, nature, and interiors.
   - URL: https://quaternius.com/

2. Kenney Cube Pets
   - Useful for pet/dog stand-ins or style experiments.
   - Why it fits: CC0, 3D, animated, small set, easy to test.
   - URL: https://kenney.nl/assets/cube-pets

3. itch.io 3D + Animals marketplace
   - Useful for paid or free animal-specific packs.
   - Why it fits: filters for 3D, animals, low-poly, cute, Blender, characters, and asset packs.
   - URL: https://itch.io/game-assets/tag-3d/tag-animals

4. Poly Pizza
   - Useful for props and occasional low-poly character/placeholders.
   - Why it fits: large low-poly free model library.
   - URL: https://poly.pizza/

## Replacement Workflow

1. Download/source a stronger model.
2. Convert/export as GLB if needed.
3. Rename it to one of the expected filenames in `public/models/`.
4. Run `pnpm run qa:models`.
5. Run `pnpm run build`.
6. Launch the game and tune model scale/rotation in `src/main.ts` if needed.

## Priority Order

1. Miss Malia
2. Joshy
3. Four dogs
4. Five students
5. Classroom props and parade decorations

## Quality Bar

Accept a replacement only if it improves:

- silhouette readability from the isometric camera
- face clarity
- material/color consistency
- file size
- compatibility with browser GLB loading
