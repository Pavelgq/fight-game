# Fight Game

**English** · [Русский](README.ru.md)

A turn-based card battler prototype built with **Phaser 3** and **TypeScript**.  
Plan attacks and movement on a timeline, position your fighter on a 3×3 grid, then watch the round resolve.

> Work in progress — mechanics and UI evolve quickly. Issues and PRs are welcome.

## Features

- **Timeline combat** — queue abilities and stance steps within a per-round time budget
- **Stances & reach** — fighters move left / center / right; attacks hit based on column and reach
- **3×3 zones** — head / body / legs × left / center / right targeting
- **Pure game model** — battle logic lives in `src/model/` with Vitest coverage, no Phaser dependency
- **Layered UI** — isolated views, layout functions, screens and thin Phaser scenes
- **Design resolution** — 1280×720 layout with `Scale.FIT` and HiDPI canvas support

## Quick start

**Requirements:** Node.js 19+ (see [`.nvmrc`](.nvmrc))

```bash
git clone https://github.com/Pavelgq/fight-game.git
cd fight-game
npm install
npm run develop
```

Open [http://localhost:4000](http://localhost:4000).

### Useful dev URLs

| URL | Purpose |
|-----|---------|
| `/?scene=BattleScene` | Jump straight to battle (uses fixtures if no profile) |
| `/?scene=BattleScene&debug=layout` | Battle screen with layout debug overlay |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run develop` | Dev server on port **4000** with HMR |
| `npm run build` | Production bundle to `dist/` |
| `npm test` | Run Vitest unit tests |
| `npm run typecheck` | TypeScript check without emit |

## Project structure

```
src/
├── model/          # Game rules, battle simulation, abilities (no Phaser)
├── session/        # GameSession — player profile & match persistence
├── views/          # Reusable UI components (Button, AbilityCard, BattleGrid…)
├── screens/        # Screen composition (e.g. BattleScreen)
├── controllers/    # Input ↔ model glue (e.g. BattleFieldController)
├── scenes/         # Phaser scenes — lifecycle & navigation only
├── layouts/        # Positions & sizes in design pixels (1280×720)
└── ui/             # Design system, display scaling, dev fixtures
```

See [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md) for layer boundaries and conventions.

## Game design

Round flow: **plan** → **ready** → **simulate** → **playback** → next round.

Both fighters build a timeline of abilities and stance steps, then the engine resolves hits, blocks, dodges and interrupts in time order.

Overview: [docs/GAME_DESIGN.en.md](docs/GAME_DESIGN.en.md)  
Detailed balance notes (maintainers): [.cursor/rules/battle-mechanics.mdc](.cursor/rules/battle-mechanics.mdc)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

- Keep **logic out of views** and **layout out of model**
- Prefer **conventional commits** (`feat(battle): …`, `refactor(model): …`)
- Run `npm test` and `npm run typecheck` before submitting

## License

[ISC](LICENSE) © Pavel Gordeev
