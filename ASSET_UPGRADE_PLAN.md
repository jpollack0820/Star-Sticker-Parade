# Asset Upgrade Plan

## Current State

Every character (Miss Malia, Joshy, all five students, and all four dogs) uses the
same generated GLB style from `scripts/generate-character-glbs.mjs`. An earlier version
mixed four imported Kenney Cube Pets models into the cast. Their blocky voxel style
clashed with the soft rounded models, so the substitution was removed.

The generated cast is internally consistent, but it is simple flat-colored primitive
geometry and is **not accepted as final-quality art direction**. A future custom-model
or commissioned-GLB replacement is legitimate, but it must replace the whole cast at
once rather than recreating a mixed-style roster.

## Recommended Next Upgrade

**First prove the classroom environment.** The immediate visible weakness was the
classroom's sparse procedural composition. Build and evaluate one complete classroom
scene before broad cast replacement or parade work.

If a future cast replacement is justified, source a single compatible stylized set and
replace the whole cast together. Do not mix individual new character models with the
current generated cast.

## Best Near-Term Sources

1. [Quaternius](https://quaternius.com/)
   - Useful packs: Ultimate House Interior Pack, Ultimate Animated Animal Pack,
     Ultimate Modular Women Pack, Ultimate Modular Men Pack, and Stylized Nature Pack.
   - Why it fits: a broad, cohesive stylized 3D library.

2. [itch.io 3D + Animals marketplace](https://itch.io/game-assets/tag-3d/tag-animals)
   - Useful for paid or free animal-specific packs.
   - Confirm the exact licence, cost, and format for each candidate before use.

3. [Poly Pizza](https://poly.pizza/)
   - Useful for props and occasional low-poly character placeholders.
   - Check each asset's individual licence and stylistic fit.

## Replacement Workflow

1. Verify source, licence, format, and cost.
2. Import the smallest coherent test subset.
3. Run `pnpm run qa:models` and `pnpm run build`.
4. Capture desktop and mobile visual evidence, then run the existing visual smoke.
5. Keep the source only if it improves the actual game camera without style or
   performance regressions.

## Priority Order

1. One complete representative classroom scene: lighting, palette, background depth,
   props, readable interaction space, and one scene-serving character.
2. Whole-cast replacement only if the classroom proof shows the generated characters
   are the remaining visual blocker.
3. Parade/courtyard visual pass after the classroom direction proves out.

## 2026-07-31 Classroom Prop Trial

**Source actually tested:** [Quaternius Ultimate House Interior Pack](https://quaternius.com/packs/ultimatehomeinterior.html), official source. The selected OBJ/MTL subset (two bookshelves, three chairs, and one round carpet) is recorded in `public/third-party/quaternius-ultimate-house-interior/`, including its supplied CC0 licence text. No account, paid asset, new package, or conversion tool was used.

**What passed:** the existing Three.js OBJ/MTL loaders imported the subset; model QA,
production build, and desktop/mobile visual smoke passed. A responsive camera field of
view (48 degrees landscape, 58 degrees portrait) makes the classroom legible on both
target viewports instead of letting the player fill the frame.

**What did not pass:** this is an environment proof, not a finished visual direction.
It improves classroom density and framing, but the scene and generated cast are still
below the polished-indie gift-scene bar. Do not call the asset pipeline "solved" or roll
it through the whole game yet.

**Next bounded decision:** decide the classroom art direction from the verified
screenshots. If the owner wants the next quality pass, select a larger but still coherent
interior set and define the final character-art direction as a separate packet; do not
mix individual replacement characters into the current cast.

## Quality Bar

Accept a replacement only if it improves:

- silhouette readability from the isometric camera
- face clarity
- material/color consistency
- file size
- compatibility with browser GLB loading
