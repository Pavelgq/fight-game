# Reactive tick-by-tick round resolution

Status: **design decided — open questions resolved, ready to decompose into implementation issues.**

## The problem this solves

Today's round flow (see [GAME_DESIGN.en.md](../GAME_DESIGN.en.md)) is: both fighters lay out a full timeline blind, hit "ready," and watch the whole round simulate and play back with no further input. It's a single blind commitment — the maintainer's own assessment is that this makes rounds feel flat rather than tense, because nothing you do during playback matters; you already lost or won the round the moment you hit "ready."

## The proposed change

Instead of resolving a whole round at once, resolve it **one tick at a time**, pausing between ticks to let the player see what the opponent did and react:

1. Player lays out their timeline as today (still blind for ticks that haven't happened yet).
2. The engine resolves **one tick**, then pauses.
3. The player sees what actually happened that tick — including the opponent's revealed action if it started or landed this tick.
4. The player can **replan the remaining, not-yet-started ticks** of their timeline in response to what they just saw.
5. Repeat until the round's time budget is exhausted.

Worked example from the design pitch, kept verbatim because it's the clearest spec of the intended feel:

> Я поставил шаг назад, а мой противник — удар рукой на 2 хода. Тик прошёл. Я вижу, что соперник бьёт, а я отошёл, и я предполагаю, что надо увернуться — выбираю присесть. Следующий тик. Противник промахнулся и придвинулся на шаг вперёд. Я при этом уже встал из приседа. Мы выбираем новые карты.

(Translation: I planned a step back while the opponent planned a 2-tick punch. Tick resolves: I see the opponent is attacking and that I've already stepped back, so I guess I need to duck — I pick crouch. Next tick: the opponent missed and stepped forward; I've already stood back up from the duck. We both pick new cards.)

## Decisions

1. **What counts as one tick?** One time-budget unit — the smallest granularity. A pause happens after every unit of `speed` spent, so a multi-tick action can be interrupted mid-way through.
2. **Multi-tick actions in progress.** Not a simple lock/cancel binary:
   - If the opponent's action already landed on you, there's a **chance (not guaranteed)** it interrupted your in-progress action.
   - If the opponent dodged/repositioned so your action will now miss, you can **attempt to cancel** it yourself.
   - The **longer your action has already been running (more ticks elapsed), the lower the chance you can successfully interrupt it** — deep commitment is harder to back out of.
   - If interrupted (by the opponent's hit or your own cancel), you're free to start a new action or move.
3. **Symmetry.** Fully symmetric — the AI opponent reacts the same way the player does, but it only ever sees the **last fully-completed tick**, same as the player. Neither side sees the future, mirroring how a real fight actually works.
4. **Balance fallout.** Confirmed as a real consequence, not resolved yet — re-tuning happens once the new flow is playable (see decomposition below).

## Rough decomposition

- [x] ~~Write down concrete answers to the 4 questions above~~ — done, see Decisions
- [ ] Model: replace (or extend) `resolveRound()` in `src/model/Battle/simulateRound.ts` with an incremental resolver that stops after each tick and reports partial state + which opponent actions are now visible
- [ ] Model: implement the interrupt-chance mechanic — probability decreases as a function of ticks already elapsed on the in-progress action
- [ ] Model: distinguish "opponent's hit landed and rolled an interrupt" vs. "player-initiated cancel because the opponent is now unreachable" as two distinct triggers into the same interrupt resolution
- [ ] `BattleSession`: new command flow to replace the current single `submitRound` — something like `revealNextTick()` / `replanFrom(tick)` / `commitTick()`
- [ ] AI: extend `ai.ts` to plan reactively, seeing only the last completed tick — this also closes the existing "AI ignores player stance" backlog item as a side effect
- [ ] UI: `RoundPlayback`/`TimelineStrip` need a real "pause here, let me edit" interaction instead of pure animated playback, plus a visible indicator of interrupt chance/elapsed ticks on in-progress actions
- [ ] Balance pass across `src/model/Player/abilities/*.ts` once the new information flow is playable
- [ ] Update [GAME_DESIGN.en.md](../GAME_DESIGN.en.md) / `.ru.md` and `.cursor/rules/battle-mechanics.mdc` to describe the new flow once it's implemented

This is large enough that it should land as its own tracked epic (or milestone) rather than a single issue.
