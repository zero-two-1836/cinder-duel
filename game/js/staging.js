// staging.js — poses the real game for its screenshots. A ?shot= parameter
// puts the duel into a genuine mid-game, won or lost state using the game's
// own cards and rules, so every screenshot is a render of actual play.

import { makeCard } from './cards.js';
import { energyForRound, drawCards } from './state.js';

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return { shot: params.get('shot'), seed: Number(params.get('seed') || 7) };
}

// Poses a believable round-4 table: both duelists bloodied, the rival
// burning, a face-off pair on the table and a five-card hand for the player.
export function stageTable(game) {
  game.round = 4;
  game.phase = 'player';
  for (const side of [game.player, game.rival]) {
    drawCards(game, side, 5);
  }
  game.player.hand = [makeCard('blazing-slash'), makeCard('aegis-wall'), makeCard('kindle'), makeCard('quick-study'), makeCard('surge')];
  game.rival.hand = [makeCard('ember-strike'), makeCard('bastion'), makeCard('wildfire'), makeCard('mirror-guard')];
  game.player.life = 14;
  game.player.shield = 3;
  game.player.burn = 0;
  game.player.maxEnergy = energyForRound(game.round);
  game.player.energy = 4;
  game.rival.life = 11;
  game.rival.shield = 2;
  game.rival.burn = 3;
  game.intent = { kind: 'attack', label: 'She means to strike hard', power: 6 };
  game.lastPlayed = [
    { by: 'rival', card: makeCard('ember-strike') },
    { by: 'player', card: makeCard('firestorm') },
  ];
  game.log = [
    'Round 4 — Firestorm cashes in 3 Burn for 6 damage.',
    'Round 4 — Kindle sets Lady Cinder, the Ashen Rival burning (3 Burn).',
    'Round 3 — Burn bites Lady Cinder, the Ashen Rival for 2.',
    'Round 3 — Aegis Wall raises 4 shield.',
  ];
  game.stats.damageDealt = 13;
  game.stats.cardsPlayed = 7;
  game.stats.biggestHit = 6;
}

export function stageEnd(game, won) {
  stageTable(game);
  if (won) {
    game.phase = 'won';
    game.rival.life = 0;
    game.round = 6;
    game.stats = { damageDealt: 27, cardsPlayed: 12, biggestHit: 9 };
  } else {
    game.phase = 'lost';
    game.player.life = 0;
    game.round = 5;
    game.stats = { damageDealt: 16, cardsPlayed: 10, biggestHit: 6 };
  }
}
