# Star Sticker Parade Model Slots

Drop optimized `.glb` files in this folder to replace the procedural fallback characters.

The current files can be regenerated from the project root with:

```bash
pnpm run generate:models
```

That command creates stylized local starter models. Replace any generated file with a stronger hand-made or purchased GLB later and the game will load the replacement automatically.

Run this before publishing or after swapping models:

```bash
pnpm run qa:models
```

It verifies every required model exists, is a valid GLB 2.0 file, and stays under the starter size budget.

Expected filenames:

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

Runtime notes:

- The game checks for each file before loading it.
- Missing files are fine; the existing procedural character stays visible.
- Use GLB as the shipping format.
- Keep each model centered at its feet with forward facing local `-Z` if possible.
- Keep materials simple and reusable for browser performance.
