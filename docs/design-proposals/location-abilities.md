# Location-specific abilities

Status: **early design — smallest of the four proposals, no "location" concept exists yet.**

## The pitch

Certain battle locations grant a unique, temporary ability available only in a fight at that location. Reference example from the pitch: fighting on sand lets you throw sand in the opponent's face — a "dirty" ability that deals damage for one turn even if the opponent blocks.

## What already exists vs. what's missing

Checked directly in the codebase:
- There is **no location/arena concept** at all today. `BattleSelectScene` picks an *opponent* (`src/model/Opponents/opponents.ts`), not a place to fight. The single `background` image used across scenes is just decorative, not a gameplay entity.
- Opponents aren't tied to a place either — `Opponent` has no location field.

So this needs a new `Location`/`Arena` entity from scratch, plus a decision on how a battle gets assigned one (fixed per opponent? player picks separately? random?).

## Open questions

1. Is location chosen by the player (a location-select step, similar to opponent select), tied to the opponent, or randomized per battle?
2. Is the granted ability visible in the hand from the start of the battle, or does it need to be "discovered"/highlighted as special so the player understands it's temporary and location-only?
3. Does "deals damage even if blocked" need a new mechanical flag on abilities (e.g. `ignoresBlock: true`) or is it closer to an existing mechanic already in `DamageCalculator.ts`/`Defense.ts`? (Worth checking before designing a new flag — DamageCalculator.ts currently has no test coverage either, see [BACKLOG.md](../BACKLOG.md), so verify its actual behavior before assuming.)

## Rough decomposition

- [ ] Answer the 3 questions above
- [ ] Model: `Location` entity — id, name, and the ability id it grants
- [ ] Model: decide + implement how a battle gets an associated location (per the answer to Q1)
- [ ] Model: inject the location's ability into the player's available cards for that battle only — not a permanent unlock, unlike trainer-taught abilities (see [trainers-and-schools.md](trainers-and-schools.md))
- [ ] Model: implement (or confirm existing support for) a block-ignoring damage flag per Q3
- [ ] Content: ship "sand throw" as the first reference location ability, exactly as pitched
- [ ] UI: visually distinguish the location-granted card in hand (per Q2) so it doesn't read as a permanent ability
