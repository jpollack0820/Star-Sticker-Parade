---
project: Star Sticker Parade
status: active-production
canonical_branch: codex/ssp-visual-proof
last_verified_commit: b8c2533e6405a32db453233334438ebf268470f9
last_verified_date: 2026-08-04
owner: Manager/Creative Director
current_gate: owner review of representative classroom proof
---

# Project State

## Verified current state

- The authoritative working branch is `codex/ssp-visual-proof`; `main` is a stale
  scaffold and `claude/star-sticker-parade-dev-jcdfst` is not the continuation branch.
- Commit `b8c2533` completed a classroom environment pass with a small CC0 Quaternius
  prop subset. The active cast remains the consistent generated chibi-critter GLBs;
  Kenney substitutions are historical and inactive.
- The active visual gate is owner review of this one classroom proof. It does not
  authorize broad asset churn, paid assets, or piecemeal character replacement.

## Continuation entrypoints

1. `AGENTS.md` — branch, source-of-truth, and gates.
2. `ASSET_UPGRADE_PLAN.md` — visual authority and evidence-backed priority.
3. `docs/WORK_PACKETS.md` — the active bounded packet and required handoff.
4. `CLAUDE_BROWSER_HANDOFF.md` — detailed implementation and playtest context.

## Next manager decision

Review the classroom proof in-game and choose exactly one next surface: a named
classroom correction, courtyard/parade, or a whole-cast direction decision. If the
proof is rejected, record the visible blocker before sourcing another asset set.

## Guardrails

- No paid assets, asset-generation tooling, or model-tier escalation without the
  relevant owner gate and evidence that the normal path failed.
- Preserve core gameplay and verify a visual change before calling it complete.
- Commit code/assets and this state/handoff together, then push the canonical branch
  so Claude, Codex, GitHub, and Obsidian point to the same resumable state.
