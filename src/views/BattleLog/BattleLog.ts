/**
 * Лог боя в HTML-панели рядом с канвасом (#log-lines в index.html).
 * Копится по раундам со скроллом — отдельно от Phaser-сцены.
 */
export class BattleLog {
  private readonly container: HTMLElement | null;
  private readonly lines: HTMLElement | null;

  constructor() {
    this.container = document.getElementById("log-panel");
    this.lines = document.getElementById("log-lines");
  }

  clear() {
    if (this.lines) this.lines.innerHTML = "";
  }

  addRound(title: string) {
    this.append(title, "round");
  }

  addLine(text: string) {
    this.append(text, "entry");
  }

  private append(text: string, className: string) {
    if (!this.lines) return;
    const row = document.createElement("div");
    row.className = className === "round" ? "entry round" : "entry";
    row.textContent = text;
    this.lines.appendChild(row);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.container) this.container.scrollTop = this.container.scrollHeight;
  }
}
