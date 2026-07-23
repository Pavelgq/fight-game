# Between-round rest phase (buffs/debuffs/consumables)

Status: **design decided — open questions resolved, still needs a status-effect system that doesn't exist yet.**

## The pitch

Between rounds, add a breather/rest phase where the player can use consumables that apply buffs or debuffs lasting into the following round(s) — e.g. treat bleeding, drink water, inject adrenaline. Effects should be temporary, lasting a defined number of rounds.

## What already exists vs. what's missing

Checked directly in the codebase:
- [`Health.ts`](../../src/model/Player/Health.ts) tracks only `currentValue`/`maxValue` and applies flat/percent damage — there is **no status-effect concept** (no bleeding, no buffs, no debuffs, no duration tracking) anywhere in `src/model/`.
- The round flow already has a documented "Cleanup" step (see [GAME_DESIGN.en.md](../GAME_DESIGN.en.md) — "apply HP changes, check for knockout, draw new hands, reset stances, increase fatigue if configured") — a rest phase is a natural extension of this existing step, not a brand-new phase bolted on awkwardly.

## Decisions

1. **Launch consumable list:** the 3 pitched examples are enough to start — bleeding treatment, water, adrenaline. More can be added later once the mechanic exists; not blocking.
2. **Limited vs. free:** consumables can be **bought or won** (exact acquisition sources still open, not decided as blocking), and the player starts a battle with **some starter supply already in hand**. Ties into the same currency system needed for [trainers-and-schools.md](trainers-and-schools.md) — use one shared currency, not two parallel resource models.
3. **Reapplication:** **overwrites**. Using the same consumable again while its effect is still active replaces the old effect with the new one — no stacking, no duration extension.

## Rough decomposition

- [x] ~~Answer the 3 questions above~~ — done, see Decisions
- [ ] Model: generic status-effect primitive — id, remaining-rounds counter, and its modifier (e.g. `StatusEffect { id, roundsRemaining, apply(fighter) }`) — foundational, likely lives alongside `Health.ts`/`Fighter.ts`. Reapplying the same effect id overwrites the existing instance per decision 3.
- [ ] Model: extend `Combatant`/`Fighter` to hold a list of active status effects and tick them down during the existing Cleanup step
- [ ] Model: consumable/item definitions for the 3 launch items — reuse the ability-factory pattern from `src/model/Player/abilities/factories.ts` as a reference if it fits, rather than inventing a parallel content format
- [ ] Model: "bleeding" as the first negative status effect, since it's explicitly named in the pitch
- [ ] Model: shared currency primitive with [trainers-and-schools.md](trainers-and-schools.md) — don't build this twice
- [ ] Model: starter consumable inventory for a new player profile
- [ ] UI: rest-phase screen/step in the `BattleScene` flow, shown between rounds, listing available consumables and letting the player pick
- [ ] Content: ship the 3 pitched consumables (bleeding treatment, water, adrenaline) as the initial set
