# Trainers, schools & ability progression

Status: **design decided — open questions resolved, still needs foundational systems (currency, time, reputation) before any UI work.**

## The pitch

The game already has the concept of a **fighting style/school** (`street`, `karate`, `boxer` in [`src/model/Player/FightingStyle.ts`](../../src/model/Player/FightingStyle.ts)), each with a fixed ability list. The proposal extends this into a progression system:

- A roster of **trainers**, one or more per school, that grows over time (content-wise).
- Each trainer can teach you a new ability card, but only after **training** with them.
- Training costs **money or time** (not decided which, possibly both).
- Not every trainer will train you — some kind of **reputation or money gate**.
- Training takes time to complete.
- You can also **drill** an ability you already have, which slightly **improves the card**.
- Abilities from the same school can be **combined/strengthened** together (combo system) — pitch explicitly says there's room for a lot of interesting mechanics here, not yet designed.

## What already exists vs. what's missing

Already exists:
- `FightingStyle` with a fixed `abilityIds` list per style ([`FightingStyle.ts`](../../src/model/Player/FightingStyle.ts))
- `AbilityRegistry` for looking up ability definitions by id

Does **not** exist yet (checked directly in the codebase, not assumed):
- Any currency/money concept anywhere in `src/model/`
- Any time/calendar/turn-counter concept outside of a single battle round
- Any reputation/relationship tracking
- Any per-ability leveling or "improved by drilling" mechanic — abilities today are static, immutable definitions
- Any combo/synergy mechanic between abilities

This means the trainer system needs several **foundational** model pieces before a `Trainer`/`Training` concept can be built on top, let alone before `TrainerScene`/`TrainerSelectScene`/`TrainingScene` (currently stubs, see `src/game.ts`) can show anything real.

## Decisions

1. **Training cost:** both money and time. Needs a currency system and a time-cost/duration primitive — not just one or the other.
2. **Reputation:** a single number **per trainer** (not per school or global). Exact gain/loss triggers still TBD when the reputation system is actually built.
3. **Drilling:** a small stat bump on the player's copy of the ability per drill session. Exact balancing (caps, diminishing returns) deliberately deferred — there's no balancing framework yet, revisit once one exists.
4. **Combo, first version:** a bonus for placing same-school abilities **back-to-back on the timeline** (consecutive ticks). Simple, easy for the player to read.

## Rough decomposition (foundational-first order)

- [x] ~~Design doc addendum answering the 4 questions above~~ — done, see Decisions
- [ ] Model: currency primitive **and** a time-cost/duration primitive — new, foundational, both needed per Q1
- [ ] Model: `Trainer` entity — id, name, school (`FightingStyleId`), reputation requirement (single number), cost (money + time), ability(ies) offered
- [ ] Model: per-trainer reputation tracking
- [ ] Model: training flow — spend cost, wait duration, unlock ability id into the player's pool
- [ ] Model: ability "level"/drilling — small stat bump per drill; needs to change abilities from static definitions to something with a per-player mutable component (bigger change than it sounds; today `AbilityRegistry` returns shared immutable objects). Balancing numbers deferred.
- [ ] Model: first combo rule — consecutive same-school abilities on the timeline get a bonus
- [ ] Screens: replace `TrainerSelectScene` and `TrainingScene` stubs once the model above exists
- [ ] Content: a first roster of 2-3 trainers per existing school as reference data

Don't start on `TrainerScene`/`TrainerSelectScene`/`TrainingScene` UI before at least the currency/time and `Trainer` entity pieces exist — there's nothing real to show otherwise.
