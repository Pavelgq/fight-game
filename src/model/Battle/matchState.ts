import { Ability } from "../Player/Ability";
import { Fighter } from "../Player/Fighter";
import { FighterProfile } from "../Player/FighterProfile";
import { abilityRegistry } from "../Player/abilities/AbilityRegistry";
import { statusEffectRegistry } from "../Player/statusEffects/StatusEffectRegistry";
import { Combatant } from "./Combatant";
import { battleConfig } from "./constants";
import {
  CombatantStateDTO,
  MatchPhase,
  MatchStateDTO,
  TimelineActionDTO,
} from "./matchTypes";
import { TimelineAction } from "./TimelineAction";
import { Rng, defaultRng } from "../Rng";

export function timelineToDTO(timeline: TimelineAction[]): TimelineActionDTO[] {
  return timeline.map((action) => {
    if (action.kind === "step") {
      return { kind: "step", direction: action.direction };
    }
    return {
      kind: "ability",
      abilityId: action.ability.id,
      row: action.row,
      col: action.col,
    };
  });
}

export function timelineFromDTO(dtos: TimelineActionDTO[]): TimelineAction[] {
  return dtos.map((dto) => {
    if (dto.kind === "step") {
      return {
        kind: "step",
        direction: dto.direction,
        duration: battleConfig.stepTime,
      };
    }
    const ability = abilityRegistry.get(dto.abilityId);
    return {
      kind: "ability",
      ability,
      row: dto.row,
      col: dto.col,
      duration: ability.speed,
    };
  });
}

export function combatantToState(combatant: Combatant): CombatantStateDTO {
  const { fighter } = combatant;
  const profile = FighterProfile.fromFighter(
    fighter,
    fighter.abilities.map((a) => a.id)
  );

  return {
    profile: profile.toDTO(),
    hp: fighter.health.currentValue,
    maxHp: fighter.health.maxValue,
    hand: combatant.hand.map((a) => a.id),
    drawPile: combatant.deck.getDrawPileIds(),
    timeline: timelineToDTO(combatant.timeline),
    stance: combatant.stance,
    lastStance: combatant.lastStance,
    roundIndex: combatant.roundIndex,
    activeEffects: fighter.activeEffects.map((a) => ({
      id: a.effect.id,
      roundsRemaining: a.roundsRemaining,
    })),
  };
}

export function combatantFromState(
  state: CombatantStateDTO,
  rng?: Rng
): Combatant {
  const profile = FighterProfile.fromDTO(state.profile);
  const abilities = abilityRegistry.getMany(state.profile.abilityIds);
  const fighter = profile.toFighter(abilities);
  fighter.health.currentValue = state.hp;
  fighter.health.maxValue = state.maxHp;
  fighter.activeEffects = (state.activeEffects ?? []).map((a) => ({
    effect: statusEffectRegistry.get(a.id),
    roundsRemaining: a.roundsRemaining,
  }));

  const combatant = new Combatant(fighter, rng ?? defaultRng);
  combatant.hand = abilityRegistry.getMany(state.hand);
  combatant.deck.restoreDrawPile(state.drawPile, rng ?? defaultRng);
  combatant.timeline = timelineFromDTO(state.timeline);
  combatant.stance = state.stance;
  combatant.lastStance = state.lastStance;
  combatant.roundIndex = state.roundIndex;
  return combatant;
}

export function matchToState(
  left: Combatant,
  right: Combatant,
  options: {
    matchSeed: number;
    roundNumber: number;
    phase: MatchPhase;
    selectedTimelineIndex: number;
    pendingHandIndex: number;
  }
): MatchStateDTO {
  return {
    matchSeed: options.matchSeed,
    roundNumber: options.roundNumber,
    phase: options.phase,
    left: combatantToState(left),
    right: combatantToState(right),
    selectedTimelineIndex: options.selectedTimelineIndex,
    pendingHandIndex: options.pendingHandIndex,
  };
}

export function matchFromState(state: MatchStateDTO, rng?: Rng): {
  left: Combatant;
  right: Combatant;
} {
  return {
    left: combatantFromState(state.left, rng),
    right: combatantFromState(state.right, rng),
  };
}

export function serializeMatchState(state: MatchStateDTO): string {
  return JSON.stringify(state);
}

export function deserializeMatchState(json: string): MatchStateDTO {
  return JSON.parse(json) as MatchStateDTO;
}
