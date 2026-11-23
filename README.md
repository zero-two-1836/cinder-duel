[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/zero-two-1836/cinder-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/zero-two-1836/cinder-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Cinder Duel

An original ember-card duel for the make.fun best-card-game bounty. You are
the Ember Knight; across the table sits Lady Cinder, the Ashen Rival. First
duelist to 0 life falls.

## The game

Four suits, told apart by colour and shape:

- **Flame ▲ (orange)** — attacks that bite through shield into life.
- **Aegis ⬟ (blue)** — shields that soak damage, plus a little mending.
- **Ember ● (red)** — Burn: damage that ticks at the start of every round.
- **Spark ◆ (violet)** — energy surges and extra draws.

Burn is the combo engine: Kindle sets her burning, Fan the Flames doubles
it, and Firestorm cashes every Burn stack in for 2 damage each. At the start
of each round Lady Cinder's **intent** is revealed — strike, wall, ignite or
scheme — so every hand is a decision: shield up before the heavy swing, race
her before the wall, or feed the fire and let Burn work.

Energy grows each round (3 on round 1, up to 8). Decks are 31 cards; when a
deck runs dry, fatigue damage grows by 1 each draw. Win and loss screens
report rounds fought, damage dealt, cards played and your biggest hit.

**Controls:** click a card to play it, or press its number key (1–8). Space
or Enter ends the turn. Enter also starts the duel and the rematch.

## Layout

- `game/` — the game itself: static files, no build step, no network.
  `index.html` loads `css/table.css`, `css/cards.css` and the ES modules in
  `js/` (rng, cards, state, effects, ai, render, staging, main — one job
  each).
- `main.ts` — the hand-in program (Node 22, standard library only): copies
  `game/` and `screenshots/` to the output directory and writes
  `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.
- `vendor/makefun-game.ts` — the make.fun kit's dossier library, unchanged.
- `screenshots/` — renders of the real game: title, table, victory, defeat.
  The game poses itself for them with `?shot=title|table|win|loss&seed=7`.

## Run it

Serve `game/` with any static file server and open `index.html`, or build
the hand-in and inspect the output:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
