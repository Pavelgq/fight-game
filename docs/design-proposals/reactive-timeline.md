# Reactive tick-by-tick round resolution

Status: **early design — has open questions that need the maintainer's decision before implementation starts.**

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

## Open questions — need your call, not an engineering guess

The pitch itself flags these as unresolved ("пока не знаю"), so implementation should not start until they're answered:

1. **What counts as one tick?** Today, time is a budget consumed by ability `speed` (2–5 units), not a literal per-frame clock. Is a "tick" one time-budget unit, or something coarser (e.g. one card resolving)?
2. **Multi-tick actions in progress.** If you committed to a 2-tick punch and a new tick reveals the opponent dodged, are you locked into the remaining tick of your own action, or do you also get to react? The pitch says "надо тоже придумать" (also needs figuring out) — this is the crux of the whole system and isn't decided yet.
3. **Symmetry.** Does the AI opponent get the same mid-round reveal-and-replan loop, or does only the player get to react (with the AI's plan fixed from the start)? This has large fairness and difficulty implications, and ties directly into the AI weakness already tracked in [BACKLOG.md](../BACKLOG.md) (`ai.ts` never reads the player's real stance).
4. **Balance fallout.** Reducing blind-commitment uncertainty is a fundamental difficulty/pacing change. Abilities tuned for a "you can't see this coming" model may need re-tuning once players can react mid-round.

## Rough decomposition (once the open questions above are answered)

- [ ] Write down concrete answers to the 4 questions above as an addendum to this doc — blocks everything else
- [ ] Model: replace (or extend) `resolveRound()` in `src/model/Battle/simulateRound.ts` with an incremental resolver that can stop after N ticks and report partial state + which opponent actions are now "visible"
- [ ] Model: define replanning rules for in-flight actions (locked vs. cancellable) per the answer to question 2
- [ ] `BattleSession`: new command flow to replace the current single `submitRound` — something like `revealNextTick()` / `replanFrom(tick)` / `commitTick()`
- [ ] AI: extend `ai.ts` to plan reactively if question 3 says it should (this would also close the existing "AI ignores player stance" backlog item as a side effect)
- [ ] UI: `RoundPlayback`/`TimelineStrip` need a real "pause here, let me edit" interaction instead of pure animated playback
- [ ] Balance pass across `src/model/Player/abilities/*.ts` once the new information flow is playable
- [ ] Update [GAME_DESIGN.en.md](../GAME_DESIGN.en.md) / `.ru.md` and `.cursor/rules/battle-mechanics.mdc` to describe the new flow once it's implemented

This is large enough that it should land as its own tracked epic (or milestone) rather than a single issue, once question 1–3 are answered.
