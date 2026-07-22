# Trainers, schools & ability progression

Status: **early design — needs foundational systems that don't exist yet before any UI work makes sense.**

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

## Open questions — need your call

1. Money, time, or both as the training cost? (Affects whether a currency system is even needed first.)
2. What does "reputation" mean concretely — a single number per trainer, per school, or global? What raises/lowers it?
3. What does "drilling improves the card" mean numerically — a small stat bump on your copy of the ability, a cap on how much, diminishing returns?
4. What's a combo, mechanically — same-school abilities used in the same round get a bonus? Adjacent ticks? This is flagged in the pitch as wide-open design space; needs a concrete first version, not an abstract system.

## Rough decomposition (foundational-first order)

- [ ] Design doc addendum answering the 4 questions above
- [ ] Model: currency and/or time-cost primitive (whichever the answer to Q1 needs) — new, foundational
- [ ] Model: `Trainer` entity — id, name, school (`FightingStyleId`), reputation requirement, cost, ability(ies) offered
- [ ] Model: reputation/relationship tracking per the answer to Q2
- [ ] Model: training flow — spend cost, wait duration, unlock ability id into the player's pool
- [ ] Model: ability "level"/drilling — needs to change abilities from static definitions to something with a per-player mutable component (bigger change than it sounds; today `AbilityRegistry` returns shared immutable objects)
- [ ] Model: first concrete combo rule (start with one simple, shippable version, not a general framework)
- [ ] Screens: replace `TrainerSelectScene` and `TrainingScene` stubs once the model above exists
- [ ] Content: a first roster of 2-3 trainers per existing school as reference data

Don't start on `TrainerScene`/`TrainerSelectScene`/`TrainingScene` UI before at least the currency/time and `Trainer` entity pieces exist — there's nothing real to show otherwise.
