# Backlog

Working list of known problems and improvement ideas, prioritized. Not GitHub issues yet — items get promoted to issues (with labels) as they're picked up. Keep this list groomed: remove items once they become an issue (link it instead), reprioritize as context changes.

## P0 — correctness / data risk

- [ ] **Zero test coverage on core combat logic.** `src/model/Battle/BattleSession.ts` (the whole round command/orchestration API), `src/model/Actions/DamageCalculator.ts`, `src/model/Battle/ai.ts`, `src/model/Player/Fighter.ts`, `Health.ts`, `Staff.ts`, `src/model/Battle/matchState.ts` (save/load DTOs) all have no Vitest coverage. A bug here either breaks combat silently or corrupts saved games.
- [ ] **Silent profile loss on deserialize failure.** `src/session/GameSession.ts` falls back to `new GameSession()` if `fromDTO`/deserialize throws (e.g. after a future DTO shape change) — player's saved profile disappears with no error surfaced. Needs either schema versioning/migration or at least a visible warning instead of silent reset.

## P1 — gameplay depth

- [ ] **AI opponent doesn't react to the player.** `src/model/Battle/ai.ts:33` hardcodes `assumedDefenderStance` to the starting stance — it never reads where the player actually stands. All entries in `src/model/Opponents/opponents.ts` share the same planning logic, so there's no per-opponent behavior or difficulty variance despite having distinct opponent flavor text.
- [ ] **Localization / i18n.** All in-game UI strings (ability names, scene labels, menus) are hardcoded Russian literals inline in `scenes/`/`views/` (e.g. `"Информация о персонаже"`, `"Джеб"`). This blocks non-Russian-speaking contributors from reading, testing, or reviewing UI changes, and blocks non-Russian players entirely. Needs, roughly in this order:
  - [ ] Extract hardcoded strings into a central strings/locale module (audit `this.add.text(..., "...", ...)` call sites across `src/scenes/`, `src/screens/`, `src/views/`, plus ability/opponent/style names in `src/model/`)
  - [ ] Minimal `t(key)` lookup mechanism — no need for a heavy i18n library at this scale
  - [ ] Ship English as the first additional locale
  - [ ] Document the convention in `CONTRIBUTING.md` (how to add a new UI string correctly so it doesn't reintroduce a hardcoded literal)

## P2 — architecture / docs

- [ ] **Fragile unsafe cast in `BattleSession.fromState()`.** Uses `Object.create(BattleSession.prototype)` plus an inline `as unknown as {...}` cast to bypass the constructor and hand-assign private fields. Adding/renaming a field won't produce a compiler error here — it'll just silently misassign at runtime. Worth a safer reconstruction path (e.g. a dedicated `restore()` factory that assigns through typed setters).
- [ ] **Docs don't cover the new "state mapper" pattern.** `src/scenes/CharacterInfoScene/characterInfoState.ts` (added in PR #8) reads `model/` directly and maps to a view-state DTO, living inside `scenes/` rather than `controllers/`. It's allowed by the CONTRIBUTING.md import table, but `ARCHITECTURE.en.md`'s "adding a new screen" steps don't mention it — next contributor has no documented place to put this. Small doc update once the convention is confirmed.

## P3 — nice to have, not urgent

- [ ] **No keyboard navigation.** Only one keyboard handler exists in the whole app (`PlayerBuildScene` name entry) — battle and menus are pointer-only. Relevant for accessibility and eventually mobile/gamepad support.

## Feature epics (design proposals, decomposed separately)

These are large enough to need their own design doc before becoming issues — see `docs/design-proposals/`:

- [ ] [Reactive tick-by-tick round resolution](design-proposals/reactive-timeline.md) — biggest, touches the whole core loop, has open design questions that need the maintainer's call before implementation starts
- [ ] [Trainers, schools & ability progression](design-proposals/trainers-and-schools.md) — needs new foundational systems (currency, time/calendar, reputation, ability leveling) before any UI work
- [ ] [Location-specific abilities](design-proposals/location-abilities.md) — smallest of the four, no "location" concept exists yet
- [ ] [Between-round rest phase (buffs/debuffs/consumables)](design-proposals/rest-phase.md) — needs a status-effect system that doesn't exist yet

## Known gap in this backlog itself

The four design-proposal docs above are English-only for now (matching the international-contributor goal from the localization item), unlike every other doc in `docs/` which ships an `.en.md`/`.ru.md` pair. Add Russian mirrors once the designs stabilize enough to not be rewritten every week.
