# Участие в разработке Fight Game

[English](CONTRIBUTING.md) · **Русский**

Спасибо за интерес к проекту! Здесь — настройка окружения, соглашения и процесс отправки изменений.

## Настройка окружения

1. Сделай fork и клонируй репозиторий
2. Node.js **19+** (`nvm use` читает [`.nvmrc`](.nvmrc))
3. `npm install`
4. `npm run develop` — игра на [http://localhost:4000](http://localhost:4000)

### Проверки перед PR

```bash
npm run typecheck
npm test
```

По желанию: `npm run build` для проверки production-сборки.

## Правила архитектуры

Код разделён на **правила игры**, **отображение** и **сборку экрана**. Нарушение границ усложняет тесты и перенос на другие платформы.

| Слой | Папка | Может импортировать | Нельзя |
|------|-------|---------------------|--------|
| Модель | `src/model/` | другую model | Phaser, layouts, views |
| Сессия | `src/session/` | model | Phaser-сцены |
| Views | `src/views/` | Phaser, theme | правила боя, навигация сцен |
| Screens | `src/screens/` | views, типы layouts | прямая мутация модели |
| Controllers | `src/controllers/` | типы model | хардкод цветов/шрифтов |
| Scenes | `src/scenes/` | screens, session, model | координаты inline |
| Layouts | `src/layouts/` | `src/ui/designSystem` | игровые правила |
| UI | `src/ui/` | design tokens | логика боя |

Полное руководство: [docs/ARCHITECTURE.ru.md](docs/ARCHITECTURE.ru.md)

### Кратко: можно и нельзя

**Можно**

- Передавать данные во views через аргументы / `refresh(state)`
- Сообщать о действиях через Phaser events или колбэки
- Координаты держать в `layouts/*Layout.ts` в design-пикселях
- Команды игрока слать через `BattleSession.apply(command)`
- Покрывать новую логику тестами Vitest

**Нельзя**

- Вызывать `scene.start()` из view-компонента
- Хардкодить `640` / `360` — использовать `x()`, `y()`, `u()`, `cx`, `cy` из design system
- Мутировать `Combatant` или таймлайн из view
- Хранить профиль в Phaser Registry — только `GameSession`

## Куда класть изменения

- **Механика / баланс** → `src/model/` (+ обнови [docs/GAME_DESIGN.ru.md](docs/GAME_DESIGN.ru.md), если меняется поведение)
- **Новый UI-виджет** → `src/views/<Name>/`
- **Раскладка экрана** → `src/layouts/<Screen>Layout.ts`
- **Новый экранный поток** → `src/screens/` + тонкая сцена в `src/scenes/`

Отладка layout боя: `/?scene=BattleScene&debug=layout`

## Сообщения коммитов

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <краткое описание>
```

**Типы:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

**Скоупы:** `battle`, `model`, `views`, `layouts`, `scenes`, `session`, `ui`

Примеры из репозитория:

```
feat(battle): add BattleScreen and slim down BattleScene
refactor(model): extract BattleSession and pure round resolution
test(model): cover RNG, deck, combatant and round simulation
```

Один логический change — один коммит, когда это возможно.

## Pull request'ы

1. Ветка от `main`
2. Опиши **что** и **зачем** изменилось
3. Укажи тесты для изменений в model
4. Приложи скриншот/GIF для UI (если уместно)
5. Локально пройди `typecheck` и `test`

Большие PR по нескольким слоям можем попросить разбить.

## Локальные инструменты

### Graphify (опционально)

Граф кода в `graphify-out/` — **только локально**, в git не коммитится.

```bash
graphify update .
graphify query "как работает BattleSession?"
```

### Cursor rules

В [`.cursor/rules/`](.cursor/rules/) — подробные правила для AI (архитектура, бой). Краткие версии для людей — в `docs/`.

## Стиль кода

- TypeScript strict — без `any` без веской причины
- Следуй существующим именам и структуре файлов
- Комментарии — только для неочевидных правил игры
- Расширяй существующие компоненты, не дублируй паттерны

## Вопросы

[GitHub Issues](https://github.com/Pavelgq/fight-game/issues) — для багов, обсуждения дизайна или раннего фидбека перед крупным рефакторингом.
