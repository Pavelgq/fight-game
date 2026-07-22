# Between-round rest phase (buffs/debuffs/consumables)

Status: **early design — needs a status-effect system that doesn't exist yet.**

## The pitch

Between rounds, add a breather/rest phase where the player can use consumables that apply buffs or debuffs lasting into the following round(s) — e.g. treat bleeding, drink water, inject adrenaline. Effects should be temporary, lasting a defined number of rounds.

## What already exists vs. what's missing

Checked directly in the codebase:
- [`Health.ts`](../../src/model/Player/Health.ts) tracks only `currentValue`/`maxValue` and applies flat/percent damage — there is **no status-effect concept** (no bleeding, no buffs, no debuffs, no duration tracking) anywhere in `src/model/`.
- The round flow already has a documented "Cleanup" step (see [GAME_DESIGN.en.md](../GAME_DESIGN.en.md) — "apply HP changes, check for knockout, draw new hands, reset stances, increase fatigue if configured") — a rest phase is a natural extension of this existing step, not a brand-new phase bolted on awkwardly.

## Open questions

1. What's the actual list of launch consumables/actions, beyond the three examples in the pitch (bleeding treatment, water, adrenaline)? Each needs a concrete effect (what stat, how much, how long).
2. Are consumables limited (finite inventory, need to be earned/bought) or freely available every round? This likely connects to the currency system also needed for [trainers-and-schools.md](trainers-and-schools.md) — worth deciding both together rather than inventing two separate resource models.
3. Do status effects stack, refresh duration, or overwrite when reapplied?

## Rough decomposition

- [ ] Answer the 3 questions above
- [ ] Model: generic status-effect primitive — id, remaining-rounds counter, and its modifier (e.g. `StatusEffect { id, roundsRemaining, apply(fighter) }`) — foundational, likely lives alongside `Health.ts`/`Fighter.ts`
- [ ] Model: extend `Combatant`/`Fighter` to hold a list of active status effects and tick them down during the existing Cleanup step
- [ ] Model: consumable/item definitions — reuse the ability-factory pattern from `src/model/Player/abilities/factories.ts` as a reference if it fits, rather than inventing a parallel content format
- [ ] Model: "bleeding" as the first negative status effect, since it's explicitly named in the pitch
- [ ] UI: rest-phase screen/step in the `BattleScene` flow, shown between rounds, listing available consumables and letting the player pick
- [ ] Content: ship the 3 pitched consumables (bleeding treatment, water, adrenaline) as the initial set
