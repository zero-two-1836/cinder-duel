// state.js — the duel's state and the rules that change it: damage against
// shield, burn ticking at the start of a round, fatigue when a deck runs dry.

import { buildDeck } from './cards.js';

export const START_LIFE = 20;
export const HAND_LIMIT = 8;

export function energyForRound(round) {
  return Math.min(2 + round, 8);
}

function makeSide(name, deck) {
  return {
    name,
    life: START_LIFE,
    shield: 0,
    burn: 0,
    energy: 0,
    maxEnergy: 0,
    deck,
    hand: [],
    discard: [],
    fatigue: 0,
  };
}

export function createGame(rng) {
  const player = makeSide('You, the Ember Knight', buildDeck(rng));
  const rival = makeSide('Lady Cinder, the Ashen Rival', buildDeck(rng));
  const game = {
    rng,
    round: 0,
    phase: 'title', // title | player | rival | won | lost
    player,
    rival,
    intent: null, // the rival's telegraphed plan for this round
    lastPlayed: [], // cards shown face-off on the table, newest last
    log: [],
    stats: { damageDealt: 0, cardsPlayed: 0, biggestHit: 0 },
  };
  return game;
}

export function drawCards(game, side, count) {
  for (let i = 0; i < count; i++) {
    if (side.deck.length === 0) {
      side.fatigue += 1;
      dealDamage(game, side, side.fatigue, 'fatigue');
      logLine(game, `${side.name} is out of cards and takes ${side.fatigue} fatigue damage.`);
      continue;
    }
    if (side.hand.length >= HAND_LIMIT) return;
    side.hand.push(side.deck.pop());
  }
}

// Damage soaks into shield first; returns the life actually lost.
export function dealDamage(game, target, amount, source) {
  let remaining = amount;
  if (target.shield > 0) {
    const soaked = Math.min(target.shield, remaining);
    target.shield -= soaked;
    remaining -= soaked;
  }
  target.life -= remaining;
  if (source === 'player-attack' || source === 'player-burn') {
    game.stats.damageDealt += remaining;
    if (remaining > game.stats.biggestHit) game.stats.biggestHit = remaining;
  }
  return remaining;
}

export function tickBurn(game, side) {
  if (side.burn <= 0) return 0;
  const dealt = dealDamage(game, side, side.burn, side === game.rival ? 'player-burn' : 'rival-burn');
  logLine(game, `Burn bites ${side.name} for ${dealt}.`);
  side.burn = Math.max(0, side.burn - 1);
  return dealt;
}

export function checkEnd(game) {
  if (game.rival.life <= 0 && game.player.life > 0) game.phase = 'won';
  else if (game.player.life <= 0) game.phase = 'lost';
  return game.phase === 'won' || game.phase === 'lost';
}

export function logLine(game, text) {
  game.log.unshift(`Round ${Math.max(1, game.round)} — ${text}`);
  if (game.log.length > 5) game.log.length = 5;
}
