# Architecture

**English** · [Русский](ARCHITECTURE.ru.md)

This document describes how the Fight Game codebase is organized. The goal is to keep **game rules testable** and **UI replaceable** without rewriting combat logic.

## Layer overview

```
┌─────────────────────────────────────────────────────────┐
│  scenes/          Phaser lifecycle, navigation            │
│    └─ screens/    Compose views, refresh(state)         │
│         └─ views/ Pure display components               │
│    └─ controllers/ Map clicks → model callbacks         │
├─────────────────────────────────────────────────────────┤
│  layouts/         x, y, width, height (design px)       │
│  ui/              designSystem, scaling, fixtures       │
├─────────────────────────────────────────────────────────┤
│  session/         GameSession — profile & match state   │
│  model/           Rules, simulation, abilities          │
└─────────────────────────────────────────────────────────┘
```

**Rule of thumb:** `model/` never imports Phaser. `views/` never imports `BattleSession`.

## Layers in detail

### `src/model/`

Pure TypeScript game logic.

- `Battle/simulateRound.ts` — resolve a round from two timelines
- `Battle/BattleSession.ts` — command API for planning and fighting
- `Battle/matchState.ts` — serializable DTOs for saves / future multiplayer
- `Player/abilities/` — ability definitions and registry

Run tests: `npm test`

### `src/session/`

`GameSession` is the **source of truth** for meta-game data:

- Player `FighterProfile` after character creation
- Selected opponent before battle
- Optional active `BattleSession` reference

Loaded at startup in `src/index.ts`. Scenes read/write session; they do not use Phaser Registry for profile data.

### `src/views/`

Self-contained Phaser display objects.

- Receive values via constructor / methods — no direct model imports
- Emit `pointerup` / custom events upward
- Examples: `Button`, `AbilityCard`, `BattleGrid`, `TimelineStrip`, `StanceBar`

### `src/screens/`

Screen-level composition.

- `mount(layout, initialState)` — create child views
- `refresh(state)` — update from a plain state object
- Example: `BattleScreen` does not know how damage is calculated

### `src/controllers/`

Glue between UI events and game callbacks.

- Example: `BattleFieldController` highlights grid cells and forwards clicks
- Visual tokens (colors per ability type) come from `src/ui/abilityVisuals.ts`, not from views

### `src/scenes/`

Thin Phaser adapters.

- `create()` — build layout, mount screen, wire handlers
- `pointerup` for navigation (`scene.start`)
- `BattleScene` owns playback popup and battle log; combat rules stay in `BattleSession`

### `src/layouts/`

Functions like `getBattleLayout()` return positions in **design pixels** (1280×720).

Converted to canvas coordinates via `src/ui/designSystem.ts`:

| Helper | Purpose |
|--------|---------|
| `x()`, `y()`, `u()` | design px → canvas px (× DPR) |
| `cx`, `cy` | screen center |
| `CANVAS` | internal Phaser buffer size |

Phaser uses `Scale.FIT` — layouts are computed once, not on window resize.

## Data flow (battle)

```
User click
  → BattleScreen event
  → BattleScene handler
  → BattleSession.apply(command)
  → updated match state
  → BattleScreen.refresh(state)
```

Simulation path:

```
Both ready
  → resolveRound(state, plans)   // pure
  → applyRoundResult(state, result)
  → RoundPlayback UI
```

## Adding a new screen

1. Create layout in `src/layouts/MyScreenLayout.ts`
2. Build views in `src/views/` (if needed)
3. Optional: `src/screens/MyScreen.ts` for composition
4. Thin scene in `src/scenes/MyScreenScene/`
5. Register scene key in `src/game.ts`

## Related docs

- [Game design overview](GAME_DESIGN.en.md)
- [Contributing guide](../CONTRIBUTING.md)
- Maintainer battle spec: [`.cursor/rules/battle-mechanics.mdc`](../.cursor/rules/battle-mechanics.mdc)
