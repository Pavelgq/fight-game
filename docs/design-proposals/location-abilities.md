# Location-specific abilities

Status: **design decided — open questions resolved, no "location" concept exists yet.**

## The pitch

Certain battle locations grant a unique, temporary ability available only in a fight at that location. Reference example from the pitch: fighting on sand lets you throw sand in the opponent's face — a "dirty" ability that deals damage for one turn even if the opponent blocks.

## What already exists vs. what's missing

Checked directly in the codebase:
- There is **no location/arena concept** at all today. `BattleSelectScene` picks an *opponent* (`src/model/Opponents/opponents.ts`), not a place to fight. The single `background` image used across scenes is just decorative, not a gameplay entity.
- Opponents aren't tied to a place either — `Opponent` has no location field.

So this needs a new `Location`/`Arena` entity from scratch, plus a decision on how a battle gets assigned one (fixed per opponent? player picks separately? random?).

## Decisions

1. **Location assignment:** context-dependent — sometimes random, sometimes fixed by the surrounding context (e.g. a tournament format could pin a location). Note: "tournament" is itself not a concept that exists in the code yet either — this is a dependency worth tracking separately if tournament structure ever gets its own proposal.
2. **Visibility:** the location's ability is **mixed into the deck** like any other card — it may or may not be drawn into hand during a given battle, same as regular cards. Not guaranteed-visible from the start.
3. **"Deals damage even if blocked":** not a special case. Any ability card can already carry an arbitrary custom effect — this is just one example effect, not a mechanic unique to location abilities requiring its own flag. Whatever effect system abilities use generally is sufficient here.

## Rough decomposition

- [x] ~~Answer the 3 questions above~~ — done, see Decisions
- [ ] Model: `Location` entity — id, name, and the ability id it grants
- [ ] Model: decide + implement how a specific battle gets an associated location — random by default, with a way for a fixed context (e.g. future tournament structure) to pin one
- [ ] Model: mix the location's ability into the deck for that battle only (not a permanent unlock, unlike trainer-taught abilities — see [trainers-and-schools.md](trainers-and-schools.md)) — reuse whatever general per-ability effect mechanism abilities already support, no new flag needed
- [ ] Content: ship "sand throw" as the first reference location ability, exactly as pitched
- [ ] UI: decide whether a location-granted card drawn into hand needs any visual distinction, or is treated exactly like a normal card (leaning toward "no distinction needed" since it's just a normal deck card mechanically — confirm during implementation)
