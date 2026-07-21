# Contributing to Fight Game

**English** · [Русский](CONTRIBUTING.ru.md)

Thank you for your interest in the project! This document explains how to set up the environment, follow project conventions, and submit changes.

## Development setup

1. Fork and clone the repository
2. Use Node.js **22.12+** (`nvm use` reads [`.nvmrc`](.nvmrc))
3. `npm install`
4. `npm run develop` — game at [http://localhost:4000](http://localhost:4000)

### Quality checks

Run before every PR:

```bash
npm run typecheck
npm test
```

Optional: `npm run build` to verify the production bundle.

## Architecture rules

The codebase separates **rules**, **presentation**, and **composition**. Breaking these boundaries makes the game harder to test and port.

| Layer | Folder | May import from | Must not |
|-------|--------|-----------------|----------|
| Model | `src/model/` | other model | Phaser, layouts, views |
| Session | `src/session/` | model | Phaser scenes |
| Views | `src/views/` | Phaser, theme | model rules, scene navigation |
| Screens | `src/screens/` | views, layouts types | direct model mutation |
| Controllers | `src/controllers/` | model types | view colors/fonts hardcoded |
| Scenes | `src/scenes/` | screens, session, model | layout coordinates inline |
| Layouts | `src/layouts/` | `src/ui/designSystem` | game rules |
| UI utils | `src/ui/` | design tokens | battle logic |

Full guide: [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md)

### Quick do's and don'ts

**Do**

- Pass data into views via constructor arguments / `refresh(state)`
- Emit user actions via Phaser events or callbacks
- Put x/y/width/height in `layouts/*Layout.ts` using design pixels
- Send player intents through `BattleSession.apply(command)`
- Add Vitest tests for new model behaviour

**Don't**

- Call `scene.start()` from a view component
- Hardcode `640` or `360` — use `designSystem` helpers (`x()`, `y()`, `u()`, `cx`, `cy`)
- Mutate `Combatant` or timeline from a view
- Store player profile in Phaser Registry — use `GameSession`

## Battle & UI changes

- **Mechanics / balance** → `src/model/` (+ update [docs/GAME_DESIGN.en.md](docs/GAME_DESIGN.en.md) if behaviour changes)
- **New UI widget** → `src/views/<Name>/`
- **Screen layout** → `src/layouts/<Screen>Layout.ts`
- **New screen flow** → `src/screens/` + thin scene in `src/scenes/`

Debug battle layout: `/?scene=BattleScene&debug=layout`

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Scopes (examples):** `battle`, `model`, `views`, `layouts`, `scenes`, `session`, `ui`

Examples from this repo:

```
feat(battle): add BattleScreen and slim down BattleScene
refactor(model): extract BattleSession and pure round resolution
test(model): cover RNG, deck, combatant and round simulation
docs(rules): update architecture and battle mechanics
```

Keep commits focused — one logical change per commit when possible.

## Pull requests

1. Branch from `main`
2. Describe **what** changed and **why**
3. Mention test coverage for model changes
4. Add screenshots or GIFs for visible UI changes (if applicable)
5. Ensure CI checks pass locally (`typecheck`, `test`)

We may ask for smaller PRs if a change touches many layers at once.

## Local tooling notes

### Graphify (optional, maintainers)

A local code graph lives in `graphify-out/`. It is **gitignored** and must not be committed.

```bash
graphify update .
graphify query "how does BattleSession work?"
```

Config: [`.graphifyignore`](.graphifyignore), agent rules: [`.cursor/rules/graphify.mdc`](.cursor/rules/graphify.mdc)

### Cursor rules

[`.cursor/rules/`](.cursor/rules/) contains detailed guides for AI-assisted development (architecture, battle mechanics). Humans can read them too; public summaries are in `docs/`.

## Code style

- TypeScript strict mode — no `any` without a good reason
- Match surrounding naming and file structure
- Comments only for non-obvious game rules, not for obvious code
- Prefer extending existing components over duplicating patterns

## Questions

Open a [GitHub issue](https://github.com/Pavelgq/fight-game/issues) for bugs, design questions, or early feedback before large refactors.
