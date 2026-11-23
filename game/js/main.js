// main.js — boots Cinder Duel, runs the turn flow and wires the input.
// Round flow: burn ticks, the rival's intent is revealed, the player plays
// any affordable cards, then Lady Cinder answers card by card with pauses
// so her plays can be read. Mouse clicks and the number keys both play
// cards; Space or Enter ends the turn, starts the duel and rematches.

import { mulberry32 } from './rng.js';
import { createGame, drawCards, energyForRound, tickBurn, checkEnd, logLine } from './state.js';
import { chooseIntent, planRivalTurn } from './ai.js';
import { applyCard } from './effects.js';
import { render } from './render.js';
import { readShotParams, stageTable, stageEnd } from './staging.js';

const root = document.getElementById('app');
const { shot, seed } = readShotParams();
const game = createGame(mulberry32(seed));
let busy = false;

const handlers = { onStart: startDuel, onEndTurn: endPlayerTurn, onPlayCard: playPlayerCard };

function refresh() {
  render(game, root, handlers);
}

function startDuel() {
  if (game.phase !== 'title') return;
  beginRound(true);
}

function beginRound(first = false) {
  game.round += 1;
  game.lastPlayed = [];
  tickBurn(game, game.rival);
  if (checkEnd(game)) return refresh();
  tickBurn(game, game.player);
  if (checkEnd(game)) return refresh();
  for (const side of [game.player, game.rival]) {
    side.maxEnergy = energyForRound(game.round);
    side.energy = side.maxEnergy;
  }
  drawCards(game, game.player, first ? 5 : 2);
  drawCards(game, game.rival, first ? 5 : 2);
  game.intent = chooseIntent(game);
  game.phase = 'player';
  logLine(game, `Round ${game.round} begins. Her intent: ${game.intent.label.toLowerCase()}.`);
  refresh();
}

function playPlayerCard(card) {
  if (busy || game.phase !== 'player') return;
  if (card.cost > game.player.energy) return;
  game.player.energy -= card.cost;
  game.player.hand = game.player.hand.filter((c) => c.uid !== card.uid);
  game.player.discard.push(card);
  game.stats.cardsPlayed += 1;
  game.lastPlayed.push({ by: 'player', card });
  applyCard(game, game.player, game.rival, card);
  refresh();
  flashTable();
  if (checkEnd(game)) refresh();
}

function endPlayerTurn() {
  if (busy || game.phase !== 'player') return;
  busy = true;
  game.phase = 'rival';
  refresh();
  const plan = planRivalTurn(game);
  let index = 0;
  const step = () => {
    if (checkEnd(game)) { busy = false; return refresh(); }
    if (index >= plan.length) {
      busy = false;
      return beginRound();
    }
    const card = plan[index++];
    if (!game.rival.hand.some((c) => c.uid === card.uid)) return step();
    game.rival.energy -= card.cost;
    game.rival.hand = game.rival.hand.filter((c) => c.uid !== card.uid);
    game.rival.discard.push(card);
    game.lastPlayed.push({ by: 'rival', card });
    applyCard(game, game.rival, game.player, card);
    refresh();
    flashTable();
    window.setTimeout(step, 650);
  };
  window.setTimeout(step, 500);
}

function flashTable() {
  const table = root.querySelector('.table');
  if (!table) return;
  table.classList.remove('flash');
  void table.offsetWidth;
  table.classList.add('flash');
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (game.phase === 'title') startDuel();
    else if (game.phase === 'won' || game.phase === 'lost') window.location.reload();
    else endPlayerTurn();
    return;
  }
  if (event.key === ' ') {
    event.preventDefault();
    if (game.phase === 'player') endPlayerTurn();
    return;
  }
  const num = Number(event.key);
  if (Number.isInteger(num) && num >= 1 && num <= game.player.hand.length) {
    playPlayerCard(game.player.hand[num - 1]);
  }
});

// Screenshot staging: pose the real game, then render it once.
if (shot === 'table') stageTable(game);
else if (shot === 'win') stageEnd(game, true);
else if (shot === 'loss') stageEnd(game, false);

refresh();
