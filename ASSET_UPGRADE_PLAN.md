# Asset Upgrade Plan

## Current State

Every character (Miss Malia, Joshy, all five students, all four dogs) uses the same
generated GLB style from `scripts/generate-character-glbs.mjs`. An earlier version of
the game swapped four students to an imported Kenney Cube Pets pack, but that pack's
blocky voxel style clashed with everyone else's soft rounded look, so it was removed —
the whole cast now shares one consistent look instead of two clashing ones.

This generated style is a real, cohesive art direction (not just a placeholder), but it
is still simple flat-colored primitive geometry. A future pass with custom-modeled or
commissioned GLBs would still be a legitimate upgrade — just make sure any replacement
is done for the *entire* cast at once, not one character at a time, so the mismatch
this plan just fixed doesn't reappear.

## Recommended Next Upgrade

Use a consistent low-poly/stylized asset source first, then customize.

Best near-term candidates:

1. Quaternius
   - Useful packs: Ultimate Animated Animal Pack, Ultimate Modular Women Pack, Ultimate Modular Men Pack, Stylized Nature Pack, Ultimate House Interior Pack.
   - Why it fits: broad stylized 3D library with animals, humanoid modular characters, nature, and interiors.
   - URL: https://quaternius.com/

2. itch.io 3D + Animals marketplace
   - Useful for paid or free animal-specific packs.
   - Why it fits: filters for 3D, animals, low-poly, cute, Blender, characters, and asset packs.
   - URL: https://itch.io/game-assets/tag-3d/tag-animals

3. Poly Pizza
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
