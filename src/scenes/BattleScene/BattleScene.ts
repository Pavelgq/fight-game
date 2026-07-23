import { Scene, Time } from "phaser";
import { getBattleLayout } from "../../layouts/BattleLayout";
import { RoundPlayback } from "../../views/RoundPlayback/RoundPlayback";
import { BattleLog } from "../../views/BattleLog/BattleLog";
import { Fighter } from "../../model/Player/Fighter";
import { BattleSession } from "../../model/Battle/BattleSession";
import { battleConfig } from "../../model/Battle/constants";
import { SimResult } from "../../model/Battle/simulateRound";
import { BattleFieldController } from "../../controllers/BattleFieldController";
import {
  BattleScreen,
  BattleScreenRefreshState,
} from "../../screens/BattleScreen/BattleScreen";
import { GameSession } from "../../session/GameSession";
import { abilityTagFill } from "../../ui/abilityVisuals";

type BattleSceneData = {
  enemy?: Fighter;
};

const RESULT_TAIL: Record<SimResult, string> = {
  hit: "попадание",
  blocked: "блок",
  dodged: "уклон",
  miss: "не достал",
  interrupted: "сбит",
};

export class BattleScene extends Scene {
  private session!: BattleSession;
  private screen!: BattleScreen;
  private fieldController!: BattleFieldController;
  private battleLog = new BattleLog();

  private hintTimer?: Time.TimerEvent;

  constructor() {
    super("BattleScene");
  }

  create(data: BattleSceneData) {
    const gameSession = GameSession.get();
    const player = gameSession.getPlayerFighter();
    const enemy = gameSession.getOpponentFighter();

    if (!player || !enemy) {
      this.scene.start("RoomScene");
      return;
    }

    const existing = gameSession.getBattleSession();
    this.session =
      existing && !existing.isFinished
        ? existing
        : gameSession.startBattle(player, enemy);

    this.battleLog.clear();
    this.battleLog.addRound(`${player.name} против ${enemy.name}`);

    this.screen = new BattleScreen(this, {
      onStance: (target) => this.dispatch({ type: "goToStance", target }),
      onTimelineSelect: (index) => this.dispatch({ type: "selectTimeline", index }),
      onMoveTimeline: (offset) => this.dispatch({ type: "moveTimeline", offset }),
      onRemoveTimeline: () => this.dispatch({ type: "removeTimeline" }),
      onFight: () => this.dispatch({ type: "submitRound" }),
      onBackToRoom: () => {
        GameSession.get().clearBattle();
        this.scene.start("RoomScene");
      },
      onHandCardSelect: (index) => this.dispatch({ type: "beginPlacement", handIndex: index }),
    });

    this.buildScene();
  }

  private buildScene() {
    const layout = getBattleLayout();
    const fields = this.screen.mount(layout, this.buildScreenState());

    this.fieldController = new BattleFieldController(
      this.session.left,
      fields.playerField,
      fields.enemyField,
      {
        onPlaced: () => {
          this.dispatch({ type: "clearPending" });
          this.refresh();
        },
        onHint: (msg) => this.flashHint(msg),
        tagFillForType: abilityTagFill,
      }
    );
    this.fieldController.setPendingIndex(this.session.pendingHandIndex);
    this.fieldController.syncFromTimeline();
  }

  private buildScreenState(): BattleScreenRefreshState {
    const { left, right } = this.session;
    return {
      roundNumber: this.session.roundNumber,
      playerName: left.fighter.name,
      enemyName: right.fighter.name,
      playerHp: {
        current: left.fighter.health.currentValue,
        max: left.fighter.health.maxValue,
      },
      enemyHp: {
        current: right.fighter.health.currentValue,
        max: right.fighter.health.maxValue,
      },
      playerStance: left.stance,
      playerProjectedStance: left.projectedStance(),
      enemyLastStance: right.lastStance,
      timeline: left.timeline,
      selectedTimelineIndex: this.session.selectedTimelineIndex,
      timelineBudget: left.budget(),
      hand: left.hand,
      pendingHandIndex: this.session.pendingHandIndex,
      finished: this.session.isFinished,
      playing: this.session.isPlaying,
      remainingTime: left.remainingTime(),
    };
  }

  private dispatch(command: Parameters<BattleSession["apply"]>[0]) {
    const result = this.session.apply(command);

    if (result.hint) {
      this.flashHint(result.hint);
    }

    if (result.simulation) {
      this.logSimulation(result.simulation);
      this.refresh();
      new RoundPlayback(
        this,
        result.simulation,
        {
          left: this.session.left.fighter.name,
          right: this.session.right.fighter.name,
        },
        () => this.afterPlayback()
      );
      GameSession.get().setBattleSession(this.session);
      return;
    }

    if (result.battleEnded) {
      this.battleLog.addLine(`Итог: ${result.battleEnded.message}`);
      this.refresh();
      this.screen.showResult(result.battleEnded.message, result.battleEnded.color);
      GameSession.get().clearBattle();
      return;
    }

    if (result.ok) {
      this.fieldController.setPendingIndex(this.session.pendingHandIndex);
      if (this.session.pendingHandIndex >= 0) {
        this.fieldController.beginPlacement(this.session.pendingHandIndex);
      } else {
        this.fieldController.clearSelection();
      }
      this.refresh();
      GameSession.get().setBattleSession(this.session);
    }
  }

  private logSimulation(sim: NonNullable<ReturnType<BattleSession["apply"]>["simulation"]>) {
    this.battleLog.addRound(`Раунд ${this.session.roundNumber}`);
    if (sim.events.length === 0) {
      this.battleLog.addLine("Никто не дотянулся до соперника");
    }
    for (const event of sim.events) {
      const tail =
        event.damage > 0
          ? `${RESULT_TAIL[event.result]} −${event.damage}`
          : RESULT_TAIL[event.result];
      this.battleLog.addLine(`${event.attacker}: ${event.ability} → ${event.zone} (${tail})`);
    }
  }

  private afterPlayback() {
    const result = this.session.apply({ type: "finishPlayback" });

    if (result.battleEnded) {
      this.battleLog.addLine(`Итог: ${result.battleEnded.message}`);
      if (!result.battleEnded.playerDead && result.battleEnded.enemyDead) {
        const profile = GameSession.get().getPlayerProfile();
        profile?.earn(battleConfig.victoryReward);
        GameSession.get().save();
        this.battleLog.addLine(`Награда: +${battleConfig.victoryReward}`);
      }
      this.refresh();
      this.screen.showResult(result.battleEnded.message, result.battleEnded.color);
      GameSession.get().clearBattle();
      return;
    }

    this.refresh();
    GameSession.get().setBattleSession(this.session);
  }

  private refresh() {
    this.screen.refresh(this.buildScreenState());
    if (this.session.pendingHandIndex < 0) {
      this.fieldController.syncFromTimeline();
    }
  }

  private flashHint(message: string) {
    this.screen.setHint(message);
    this.hintTimer?.remove();
    this.hintTimer = this.time.delayedCall(1800, () => this.screen.clearHint());
  }
}
