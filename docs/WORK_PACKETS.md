# Work Packets

## SSP-VISUAL-FOUNDATION-002 — owner review and one follow-up surface

**Status:** Ready. Do not implement until the owner selects a surface from current
visual evidence.

**Objective:** Turn the classroom proof into one clear next visual decision without
reopening the whole game or creating a mixed-style asset roster.

**Source of truth:** `AGENTS.md`, `ASSET_UPGRADE_PLAN.md`, `docs/PROJECT_STATE.md`,
and a fresh review on `codex/ssp-visual-proof`.

**Allowed first action:** Run the existing project checks and inspect the classroom
proof. Record the precise visible blocker and select one surface only: (1) a named
classroom correction, (2) courtyard/parade visual direction, or (3) a whole-cast
replacement direction decision.

**Not authorized:** paid assets, external asset-generation tools, piecemeal character
replacement, a second asset-shopping sweep, publishing, or a broader engine change.

**Required verification for any implementation packet:**

```bash
pnpm run qa:models
pnpm run build
node scripts/visual-smoke.mjs
```

Capture fresh desktop and mobile evidence locally in `qa/` when available. A build
pass alone is insufficient for visual approval.

**Handoff required:** commit SHA, changed files, verification output, visible result,
remaining risk, and the single next owner decision.

**Stop condition:** If review does not name a concrete visual blocker, stop and return
the decision to the owner; do not compensate with generic art churn.
