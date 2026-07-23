import { FightingStyleId } from "./FightingStyle";
import { Fighter } from "./Fighter";
import { Ability } from "./Ability";
import { FighterProfileDTO, FighterStatsDTO } from "../Battle/matchTypes";
import { Rng, defaultRng } from "../Rng";
import { Health } from "./Health";

export class FighterProfile {
  name: string;
  styleId?: FightingStyleId;
  abilityIds: string[];
  stats: FighterStatsDTO;
  currency: number;

  constructor(
    name: string,
    abilityIds: string[],
    stats?: Partial<FighterStatsDTO>,
    styleId?: FightingStyleId
  ) {
    this.name = name;
    this.abilityIds = abilityIds;
    this.styleId = styleId;
    this.stats = {
      power: stats?.power ?? defaultRng.nextInt(1, 10),
      agility: stats?.agility ?? defaultRng.nextInt(1, 10),
      stamina: stats?.stamina ?? defaultRng.nextInt(1, 10),
      speed: stats?.speed ?? defaultRng.nextInt(1, 10),
      luck: stats?.luck ?? defaultRng.nextInt(1, 10),
    };
    this.currency = 0;
  }

  get maxHp(): number {
    return 60 + this.stats.stamina * 4;
  }

  earn(amount: number): void {
    this.currency += amount;
  }

  spend(amount: number): boolean {
    if (amount > this.currency) return false;
    this.currency -= amount;
    return true;
  }

  toDTO(): FighterProfileDTO {
    return {
      name: this.name,
      styleId: this.styleId,
      abilityIds: [...this.abilityIds],
      stats: { ...this.stats },
      currency: this.currency,
    };
  }

  static fromDTO(dto: FighterProfileDTO): FighterProfile {
    const profile = new FighterProfile(dto.name, dto.abilityIds, dto.stats, dto.styleId);
    profile.currency = dto.currency ?? 0;
    return profile;
  }

  static fromFighter(fighter: Fighter, abilityIds: string[], styleId?: FightingStyleId): FighterProfile {
    return new FighterProfile(
      fighter.name,
      abilityIds,
      {
        power: fighter.power,
        agility: fighter.agility,
        stamina: fighter.stamina,
        speed: fighter.speed,
        luck: fighter.luck,
      },
      styleId
    );
  }

  toFighter(abilities: Ability[]): Fighter {
    const fighter = new Fighter(this.name, abilities, this.stats);
    fighter.health = new Health(this.maxHp);
    return fighter;
  }
}
