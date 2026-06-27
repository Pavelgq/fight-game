# Fight Game

[English](README.md) · **Русский**

Прототип пошагового карточного файтинга на **Phaser 3** и **TypeScript**.  
Раскладываешь приёмы и шаги на таймлайне, выбираешь клетки на сетке 3×3 — раунд симулируется и проигрывается.

> Проект в активной разработке. Багрепорты и pull request'ы приветствуются.

## Возможности

- **Бой по таймлайну** — приёмы и смена стойки в рамках бюджета времени раунда
- **Стойки и дальность** — лево / центр / право; попадание зависит от столбца и `reach`
- **Зоны 3×3** — голова / корпус / ноги × лево / центр / право
- **Чистая модель** — правила в `src/model/`, тесты на Vitest, без Phaser
- **Слои UI** — изолированные views, layouts, screens и тонкие Phaser-сцены
- **Design 1280×720** — `Scale.FIT` и HiDPI-буфер canvas

## Быстрый старт

**Нужно:** Node.js 19+ ([`.nvmrc`](.nvmrc))

```bash
git clone https://github.com/Pavelgq/fight-game.git
cd fight-game
npm install
npm run develop
```

Открой [http://localhost:4000](http://localhost:4000).

### Полезные URL для разработки

| URL | Назначение |
|-----|------------|
| `/?scene=BattleScene` | Сразу экран боя (фикстуры, если нет профиля) |
| `/?scene=BattleScene&debug=layout` | Бой с отладочной разметкой layout |

### Скрипты

| Команда | Описание |
|---------|----------|
| `npm run develop` | Dev-сервер на порту **4000** |
| `npm run build` | Сборка в `dist/` |
| `npm test` | Юнит-тесты Vitest |
| `npm run typecheck` | Проверка TypeScript |

## Структура проекта

```
src/
├── model/          # Правила, симуляция боя, способности (без Phaser)
├── session/        # GameSession — профиль и состояние матча
├── views/          # UI-компоненты (Button, AbilityCard, BattleGrid…)
├── screens/        # Сборка экранов (например BattleScreen)
├── controllers/    # Связка ввода и модели (BattleFieldController)
├── scenes/         # Phaser-сцены — только lifecycle и навигация
├── layouts/        # Координаты и размеры в design-пикселях (1280×720)
└── ui/             # Design system, масштаб, dev-фикстуры
```

Подробнее: [docs/ARCHITECTURE.ru.md](docs/ARCHITECTURE.ru.md)

## Геймдизайн

Цикл раунда: **планирование** → **готово** → **симуляция** → **проигрывание** → следующий раунд.

Оба бойца набирают таймлайн приёмов и шагов; движок разрешает удары, блоки, уклоны и сбивы по времени.

Обзор: [docs/GAME_DESIGN.ru.md](docs/GAME_DESIGN.ru.md)  
Детали баланса (для мейнтейнеров): [.cursor/rules/battle-mechanics.mdc](.cursor/rules/battle-mechanics.mdc)

## Участие в разработке

Перед PR прочитай [CONTRIBUTING.ru.md](CONTRIBUTING.ru.md).

- **Логика** не в views, **вёрстка** не в model
- **Conventional commits** (`feat(battle): …`, `refactor(model): …`)
- Перед отправкой: `npm test` и `npm run typecheck`

## Лицензия

[ISC](LICENSE) © Pavel Gordeev
