
export type AbilityType = 'attack' | 'defence' | 'dodge'

export class Ability {
    type: AbilityType;
    name: string;
    

    constructor(type: AbilityType, name: string) {
        this.type = type;
        this.name = name;
    }
    
}

export class AttackAbility extends Ability {
    damage: number[]; //Массив где индекс - расстояние до противника а значение - сила удара

    constructor(type: AbilityType, name: string, damage: number[]) {
        super(type, name);
        this.damage = damage;

    }
}