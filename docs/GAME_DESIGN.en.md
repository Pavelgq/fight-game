# Game design overview

**English** · [Русский](GAME_DESIGN.ru.md)

High-level rules for the turn-based combat system. For implementation details and balance constants, see `src/model/Battle/constants.ts` and [`.cursor/rules/battle-mechanics.mdc`](../.cursor/rules/battle-mechanics.mdc).

## Core loop

1. **Planning** — both fighters receive a hand of ability cards. Each builds a **timeline** of abilities and stance steps within a personal **time budget** for the round.
2. **Ready** — when the player confirms, the AI plans its timeline, then the engine **simulates** the round.
3. **Playback** — `RoundPlayback` shows both timelines, hit markers, damage and interrupts.
4. **Cleanup** — apply HP changes, check for knockout, draw new hands, reset stances to center, increase fatigue if configured.

## Stances (not distance)

Each fighter has a stance column: **left (0) / center (1) / right (2)**.

- **Steps** on the timeline move stance by ±1 (clamped).
- Attacks must **reach** the defender's column (`reach`: 0 = same column only, 1 = adjacent, 2 = any column).
- A hit requires the defender to stand in the targeted column when the attack resolves; otherwise **miss**.

## 3×3 grid

| Rows | Meaning |
|------|---------|
| 0 | Head |
| 1 | Body |
| 2 | Legs |

| Columns | Meaning |
|---------|---------|
| 0 | Left |
| 1 | Center |
| 2 | Right |

- **Player field** (left side of UI) — place **defence** abilities on your grid.
- **Enemy field** (right side) — place **attacks** on opponent cells.

## Ability types

| Type | Placement | Effect |
|------|-----------|--------|
| **Attack** | Enemy grid cell | Damage if reach + stance align; may be blocked or dodged |
| **Block** | Own grid cell | Reduces damage to that cell while active |
| **Dodge** | No cell pick | Grants invulnerability zones for the ability duration |

Each ability has a **speed** (duration on the timeline). Longer abilities spend more of the round budget.

## Simulation order

Events are ordered by **end time** on the timeline. For each attack:

1. Skip if **interrupted** by a faster hit
2. Resolve stance at impact moment
3. Check reach and column → miss or continue
4. Apply block / dodge rules
5. Apply damage via `DamageCalculator`

Steps change stance at their scheduled times and can affect later hits in the same round.

## Deck & hand

- Deck is built from the fighter's ability list (`buildDeck`)
- Hand size and draw rules: `battleConfig` in `constants.ts`
- Cards unavailable if their speed exceeds **remaining timeline budget**

## AI

`planEnemyTimeline()` in `src/model/Battle/ai.ts` — heuristic planner for the opponent. Replaceable for difficulty tiers or PvP.

## Where to change what

| Change | Location |
|--------|----------|
| Balance numbers | `src/model/Battle/constants.ts` |
| New ability | `src/model/Player/abilities/` + registry |
| Hit formula | `src/model/Actions/DamageCalculator.ts` |
| Round logic | `src/model/Battle/simulateRound.ts` |
| Planning API | `src/model/Battle/BattleSession.ts` |

Always add or update tests in `src/model/**/*.test.ts` when changing resolution rules.
