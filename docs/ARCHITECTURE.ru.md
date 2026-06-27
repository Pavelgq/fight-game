# Архитектура

[English](ARCHITECTURE.en.md) · **Русский**

Как устроен код Fight Game. Цель — **тестируемые правила** и **заменяемый UI** без переписывания боя.

## Слои

```
┌─────────────────────────────────────────────────────────┐
│  scenes/          Phaser lifecycle, навигация           │
│    └─ screens/    Сборка views, refresh(state)          │
│         └─ views/ Только отображение                    │
│    └─ controllers/ Клики → колбэки модели               │
├─────────────────────────────────────────────────────────┤
│  layouts/         x, y, width, height (design px)      │
│  ui/              designSystem, масштаб, фикстуры       │
├─────────────────────────────────────────────────────────┤
│  session/         GameSession — профиль и матч          │
│  model/           Правила, симуляция, способности       │
└─────────────────────────────────────────────────────────┘
```

**Главное:** `model/` не импортирует Phaser. `views/` не импортирует `BattleSession`.

## Слои подробно

### `src/model/`

Чистая логика на TypeScript.

- `Battle/simulateRound.ts` — разрешение раунда по двум таймлайнам
- `Battle/BattleSession.ts` — API команд планирования и боя
- `Battle/matchState.ts` — сериализуемые DTO для сохранений / сети
- `Player/abilities/` — определения приёмов и реестр

Тесты: `npm test`

### `src/session/`

`GameSession` — **источник истины** для мета-игры:

- `FighterProfile` после создания персонажа
- Выбранный соперник перед боем
- Ссылка на активный `BattleSession`

Загружается в `src/index.ts`. Сцены работают с сессией, не с Phaser Registry.

### `src/views/`

Изолированные Phaser-объекты.

- Данные через конструктор / методы — без прямого импорта модели
- События наружу через `emit` / `pointerup`
- Примеры: `Button`, `AbilityCard`, `BattleGrid`, `TimelineStrip`, `StanceBar`

### `src/screens/`

Композиция экрана.

- `mount(layout, initialState)` — создать дочерние views
- `refresh(state)` — обновить из plain-object состояния
- `BattleScreen` не знает формулу урона

### `src/controllers/`

Связка UI и колбэков.

- `BattleFieldController` — подсветка клеток и клики по полю
- Цвета по типу приёма — из `src/ui/abilityVisuals.ts`, не из views

### `src/scenes/`

Тонкие Phaser-адаптеры.

- `create()` — layout, mount screen, обработчики
- Навигация на `pointerup` (`scene.start`)
- `BattleScene` — попап проигрывания и лог; правила в `BattleSession`

### `src/layouts/`

Функции вроде `getBattleLayout()` возвращают координаты в **design-пикселях** (1280×720).

Перевод в canvas: `src/ui/designSystem.ts`:

| Хелпер | Назначение |
|--------|------------|
| `x()`, `y()`, `u()` | design px → canvas px (× DPR) |
| `cx`, `cy` | центр экрана |
| `CANVAS` | размер внутреннего буфера Phaser |

`Scale.FIT` — layout считается один раз, без пересчёта при resize.

## Поток данных (бой)

```
Клик пользователя
  → событие BattleScreen
  → обработчик BattleScene
  → BattleSession.apply(command)
  → обновлённое состояние
  → BattleScreen.refresh(state)
```

Симуляция:

```
Оба готовы
  → resolveRound(state, plans)   // чистая функция
  → applyRoundResult(state, result)
  → UI RoundPlayback
```

## Новый экран

1. Layout в `src/layouts/MyScreenLayout.ts`
2. Views в `src/views/` (при необходимости)
3. Опционально `src/screens/MyScreen.ts`
4. Тонкая сцена в `src/scenes/`
5. Регистрация ключа в `src/game.ts`

## См. также

- [Обзор геймдизайна](GAME_DESIGN.ru.md)
- [Участие в разработке](../CONTRIBUTING.ru.md)
- Детали боя: [`.cursor/rules/battle-mechanics.mdc`](../.cursor/rules/battle-mechanics.mdc)
