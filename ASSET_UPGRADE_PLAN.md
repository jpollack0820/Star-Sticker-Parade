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

**The classroom environment proof is now implemented.** The immediate visible
weakness was the sparse procedural composition, so the first focused pass added
consistent seating, rugs, shelving, window dressing, wall trim, and a stronger
teacher-wall focal point while preserving a playable center aisle. Do not roll this
asset set through the courtyard or parade until the owner reviews the verified
desktop/mobile proof.

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

**Source actually adopted:** [Quaternius Ultimate House Interior Pack](https://quaternius.com/packs/ultimatehomeinterior.html), official source. The selected OBJ/MTL subset (two bookshelves, three chair variants, and three rugs) is recorded in `public/third-party/quaternius-ultimate-house-interior/`, including its supplied CC0 licence text. No account, paid asset, new package, or conversion tool was used.

**What passed:** the existing Three.js OBJ/MTL loaders imported the subset; model QA,
production build, and desktop/mobile visual smoke passed. The scene now reads as one
deliberately arranged classroom rather than a bare test floor: the props create reading,
craft, and teacher zones without blocking the center aisle. The camera remains at 48
degrees landscape and 58 degrees portrait; a lower/farther camera trial made the
composition worse and was rejected.

**What did not pass:** a GLB mirror trial from the same asset family produced a darker,
less appealing window treatment and a headless-browser shader validation warning. It
was removed rather than forced into the game. This remains one representative
environment proof, not permission to call the art pipeline solved or to replace the
cast piecemeal.

**Next bounded decision:** the owner reviews the verified classroom proof in-game. If
the look is accepted, choose one next surface (courtyard/parade or whole-cast direction)
as a separate packet. If it is not accepted, name the visible blocker before sourcing
another asset set; do not respond with a generic asset shopping spree.

## Quality Bar

Accept a replacement only if it improves:

- silhouette readability from the isometric camera
- face clarity
- material/color consistency
- file size
- compatibility with browser GLB loading
