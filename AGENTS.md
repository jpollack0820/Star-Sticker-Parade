# Star Sticker Parade Agent Instructions

## Status (corrected 2026-07-18)

**Active production, not concept discovery.** This is a real, playtested browser game (Vite + TypeScript + Three.js) with iterated art direction, five distinct minigames, and an in-progress visual-quality pass. The prior "concept incubator, no concept greenlit" framing (still on `main`'s placeholder scaffold) was stale — corrected here and in Brain's registry.

**This branch (`codex/ssp-visual-proof`) is the active development lineage**, not `main`. It diverged from `main` at the "Import Star Sticker Parade project" commit, which brought in real prior work (including an earlier Claude-driven development lineage, per `CLAUDE_BROWSER_HANDOFF.md`). `main`'s AGENTS.md/docs scaffold was never reconciled with this branch's real state — treat this file as current for Star Sticker Parade work, not `main`, until the branches are formally merged.

## Source of truth

- `ASSET_UPGRADE_PLAN.md` — the visual/asset bible: current art-direction state, replacement priorities, and the whole-cast-at-once rule.
- `CLAUDE_BROWSER_HANDOFF.md` — cross-agent continuity context.
- `qa/*.png` — visual evidence (desktop, mobile, parade screenshots).
- `../../Brain/docs/PROJECT_REGISTRY.md` — portfolio-level status.

## Portfolio orientation (required before work starts)

Before work, read `../../Brain/AGENTS.md`, `../../Brain/docs/PROJECT_REGISTRY.md`, and the three source-of-truth files above. Use the Brain/vault orientation sequence for the active assignment; do not treat a past chat as the source of truth.

## Current visual-quality gate

**Source reconciliation (2026-07-31):** live `src/main.ts` maps every active character to the generated chibi-critter GLBs in `public/models/`. The older Kenney Cube Pets substitution is not active; use the live model map rather than an old handoff when judging art direction.

The environment/classroom is the larger visible gap (sparse, procedural, prototype-looking), not the character models specifically. The next visual packet is **one complete representative classroom scene, plus whichever character best serves that scene** — decided from the current asset plan and screenshot evidence, not mechanically by list order (do not default to "Joshy is next" just because `ASSET_UPGRADE_PLAN.md` lists him second). Do not replace the character cast piecemeal — per that plan's own rule, whole cast at once or not at all.

## Gates (Brain-wide defaults, unchanged)

No Sol/Fable escalation without named Terra-medium failure evidence. No Blender MCP or asset-generator tools without a concrete task demonstrating the need (tracked as a conditional candidate in `../../Brain/docs/SKILL_BANK.md`). No paid asset packs without explicit owner spend approval. No `visual-direction` skill extraction yet — this is the first proof case, not a second use.
