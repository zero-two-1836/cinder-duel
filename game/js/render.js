// render.js — draws the whole table from state: the rival's panel and card
// backs up top, the face-off strip and log in the middle, the player's life,
// shield, energy and hand of real cards along the bottom. Cards are DOM, so
// values stay crisp at any size; CSS transitions give them slide and weight.

import { SUITS } from './cards.js';
import { START_LIFE } from './state.js';

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function cardElement(card, options = {}) {
  const suit = SUITS[card.suit];
  const node = el('div', `card suit-${card.suit}`);
  node.style.setProperty('--suit', suit.colour);
  node.dataset.uid = String(card.uid);
  const cost = el('div', 'card-cost', String(card.cost));
  cost.title = 'Energy cost';
  const glyph = el('div', 'card-glyph', suit.glyph);
  const name = el('div', 'card-name', card.name);
  const power = el('div', 'card-power', card.power > 0 ? String(card.power) : '×2');
  const kindLabel = el('div', 'card-kind', kindText(card));
  const text = el('div', 'card-text', card.text);
  const suitName = el('div', 'card-suitname', `${suit.name} · cost ${card.cost}`);
  node.append(cost, glyph, name, power, kindLabel, text, suitName);
  if (options.unaffordable) node.classList.add('unaffordable');
  if (options.facedown) {
    node.className = 'card card-back';
    node.textContent = '';
    node.append(el('div', 'card-back-mark', '✦'));
  }
  return node;
}

function kindText(card) {
  switch (card.kind) {
    case 'attack': return 'ATTACK';
    case 'shield': return 'SHIELD';
    case 'shield-draw': return 'SHIELD · DRAW';
    case 'heal': return 'MEND';
    case 'burn': return 'IGNITE';
    case 'fan': return 'DOUBLE BURN';
    case 'firestorm': return 'BURN → DAMAGE';
    case 'energy': return 'SURGE';
    case 'draw': return 'DRAW';
    default: return '';
  }
}

function lifeBar(side) {
  const wrap = el('div', 'lifebar');
  const fill = el('div', 'lifebar-fill');
  fill.style.width = `${Math.max(0, (side.life / START_LIFE) * 100)}%`;
  if (side.life <= 6) fill.classList.add('low');
  wrap.append(fill);
  return wrap;
}

function statBadges(side) {
  const row = el('div', 'badges');
  row.append(el('span', 'badge life', `♥ ${side.life} / ${START_LIFE}`));
  if (side.shield > 0) row.append(el('span', 'badge shield', `⬟ ${side.shield} shield`));
  if (side.burn > 0) row.append(el('span', 'badge burn', `● ${side.burn} burn`));
  return row;
}

export function render(game, root, handlers) {
  root.textContent = '';
  const table = el('div', 'table');

  // Rival panel
  const rivalPanel = el('section', 'panel rival-panel');
  const rivalHead = el('div', 'panel-head');
  rivalHead.append(el('h2', 'duelist-name', game.rival.name), statBadges(game.rival));
  rivalPanel.append(rivalHead, lifeBar(game.rival));
  if (game.intent) {
    const intent = el('div', 'intent');
    intent.append(el('span', 'intent-label', 'HER INTENT'), el('span', 'intent-text', `${game.intent.label} (~${game.intent.power})`));
    rivalPanel.append(intent);
  }
  const rivalHand = el('div', 'rival-hand');
  for (const card of game.rival.hand) rivalHand.append(cardElement(card, { facedown: true }));
  rivalPanel.append(rivalHand);
  table.append(rivalPanel);

  // Middle: face-off strip + log
  const middle = el('section', 'middle');
  const roundBanner = el('div', 'round-banner', game.round > 0 ? `ROUND ${game.round}` : 'THE DUEL');
  middle.append(roundBanner);
  const faceoff = el('div', 'faceoff');
  if (game.lastPlayed.length === 0) {
    faceoff.append(el('div', 'faceoff-empty', 'Play a card — or press its number key. Space ends your turn.'));
  } else {
    for (const entry of game.lastPlayed.slice(-2)) {
      const holder = el('div', `faceoff-card ${entry.by}`);
      holder.append(cardElement(entry.card));
      faceoff.append(holder);
    }
  }
  middle.append(faceoff);
  const log = el('div', 'log');
  for (const line of game.log) log.append(el('div', 'log-line', line));
  middle.append(log);
  table.append(middle);

  // Player panel
  const playerPanel = el('section', 'panel player-panel');
  const playerHead = el('div', 'panel-head');
  const titleBlock = el('div', 'player-title');
  titleBlock.append(el('h2', 'duelist-name', game.player.name), statBadges(game.player));
  const energy = el('div', 'energy');
  for (let i = 0; i < game.player.maxEnergy; i++) {
    energy.append(el('span', `gem${i < game.player.energy ? ' full' : ''}`, '◆'));
  }
  const energyLabel = el('div', 'energy-label', `ENERGY ${game.player.energy}/${game.player.maxEnergy}`);
  const energyBlock = el('div', 'energy-block');
  energyBlock.append(energy, energyLabel);
  const endBtn = el('button', 'end-turn', game.phase === 'player' ? 'END TURN ⏎' : '···');
  endBtn.disabled = game.phase !== 'player';
  endBtn.addEventListener('click', handlers.onEndTurn);
  const piles = el('div', 'piles', `Deck ${game.player.deck.length} · Discard ${game.player.discard.length}`);
  playerHead.append(titleBlock, energyBlock, endBtn, piles);
  playerPanel.append(playerHead, lifeBar(game.player));
  const hand = el('div', 'hand');
  game.player.hand.forEach((card, index) => {
    const node = cardElement(card, { unaffordable: card.cost > game.player.energy || game.phase !== 'player' });
    node.style.setProperty('--tilt', `${(index - (game.player.hand.length - 1) / 2) * 2.2}deg`);
    node.append(el('div', 'card-key', String(index + 1)));
    if (game.phase === 'player') node.addEventListener('click', () => handlers.onPlayCard(card));
    hand.append(node);
  });
  playerPanel.append(hand);
  table.append(playerPanel);

  root.append(table);

  if (game.phase === 'title') root.append(titleScreen(handlers));
  if (game.phase === 'won') root.append(endScreen(true, game));
  if (game.phase === 'lost') root.append(endScreen(false, game));
}

function titleScreen(handlers) {
  const overlay = el('div', 'overlay title-screen');
  const box = el('div', 'overlay-box');
  box.append(el('div', 'game-logo', 'CINDER DUEL'));
  box.append(el('p', 'tagline', 'An ember-card duel against Lady Cinder, the Ashen Rival.'));
  const rules = el('div', 'how-to');
  rules.append(el('p', '', '▲ Flame strikes · ⬟ Aegis shields · ● Ember burns · ◆ Spark bends energy.'));
  rules.append(el('p', '', 'Burn bites every round and feeds Firestorm. Read her intent, then counter it.'));
  rules.append(el('p', '', 'First duelist to 0 life falls. Play cards with the mouse or keys 1–8; Space ends the turn.'));
  box.append(rules);
  const start = el('button', 'big-button', 'BEGIN THE DUEL');
  start.addEventListener('click', handlers.onStart);
  box.append(start);
  box.append(el('p', 'hint', 'or press Enter'));
  overlay.append(box);
  return overlay;
}

function endScreen(won, game) {
  const overlay = el('div', `overlay end-screen ${won ? 'won' : 'lost'}`);
  const box = el('div', 'overlay-box');
  box.append(el('div', 'end-title', won ? 'VICTORY' : 'DEFEAT'));
  box.append(el('p', 'tagline', won
    ? `Lady Cinder's last ember gutters out on round ${game.round}. The table is yours.`
    : `Your light fails on round ${game.round}. Lady Cinder bows, and keeps the table.`));
  const stats = el('div', 'end-stats');
  stats.append(el('div', 'stat', `Rounds fought: ${game.round}`));
  stats.append(el('div', 'stat', `Damage you dealt: ${game.stats.damageDealt}`));
  stats.append(el('div', 'stat', `Cards you played: ${game.stats.cardsPlayed}`));
  stats.append(el('div', 'stat', `Biggest single hit: ${game.stats.biggestHit}`));
  stats.append(el('div', 'stat', `Your life left: ${Math.max(0, game.player.life)} · Rival's: ${Math.max(0, game.rival.life)}`));
  box.append(stats);
  const again = el('button', 'big-button', 'DUEL AGAIN');
  again.addEventListener('click', () => window.location.reload());
  box.append(again);
  box.append(el('p', 'hint', 'or press Enter'));
  overlay.append(box);
  return overlay;
}
