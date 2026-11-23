// ai.js — Lady Cinder's brain. At the start of each round she commits to an
// intent the player can read (attack, guard, ignite or scheme) and plays
// toward it, so the player can counter: shield up before a heavy swing,
// race her before a guard, or purge nothing — burn cannot be purged, only
// outlived. Her card choices are greedy within the intent: biggest affordable
// card first, combos (Kindle before Fan the Flames) when the hand allows.

import { pickWeighted } from './rng.js';

export function chooseIntent(game) {
  const rival = game.rival;
  const player = game.player;
  const entries = [
    { value: { kind: 'attack', label: 'She means to strike hard' }, weight: 34 },
    { value: { kind: 'guard', label: 'She means to wall up' }, weight: 20 },
    { value: { kind: 'ignite', label: 'She means to set you burning' }, weight: 22 },
    { value: { kind: 'scheme', label: 'She is scheming: energy and cards' }, weight: 14 },
  ];
  if (rival.life <= 7) entries.push({ value: { kind: 'guard', label: 'Wounded — she means to wall up and mend' }, weight: 22 });
  if (player.burn >= 3) entries.push({ value: { kind: 'attack', label: 'She smells blood: striking while you burn' }, weight: 18 });
  const intent = pickWeighted(entries, game.rng);
  intent.power = estimateIntentPower(game, intent.kind);
  return intent;
}

function estimateIntentPower(game, kind) {
  const energy = game.rival.maxEnergy || 4;
  if (kind === 'attack') return Math.min(9, 2 + energy);
  if (kind === 'ignite') return Math.min(6, 1 + Math.floor(energy / 1.5));
  if (kind === 'guard') return Math.min(9, 3 + energy);
  return 2;
}

function cardScore(card, intent, game) {
  const foe = game.player;
  switch (card.kind) {
    case 'attack': return intent.kind === 'attack' ? card.power * 3 - card.cost : card.power - card.cost;
    case 'shield': return intent.kind === 'guard' ? card.power * 2 - card.cost : card.power / 2 - card.cost;
    case 'shield-draw': return card.power / 2 + 2 - card.cost;
    case 'heal': return game.rival.life <= 10 ? 12 - card.cost : -5;
    case 'burn': return intent.kind === 'ignite' ? card.power * 3 - card.cost : card.power - card.cost;
    case 'fan': return foe.burn >= 2 ? foe.burn * 3 : -8;
    case 'firestorm': return foe.burn >= 1 ? foe.burn * 4 - card.cost : -8;
    case 'energy': return intent.kind === 'scheme' ? 6 - card.cost : 2 - card.cost;
    case 'draw': return intent.kind === 'scheme' ? 7 - card.cost : 3 - card.cost;
    default: return 0;
  }
}

// Returns the list of cards the rival plays this round, in play order.
export function planRivalTurn(game) {
  const rival = game.rival;
  const plan = [];
  const hand = rival.hand.slice();
  let energy = rival.energy;
  // Kindle before Fan the Flames: sort burn-setters ahead of the doubler.
  hand.sort((a, b) => cardScore(b, game.intent, game) - cardScore(a, game.intent, game));
  for (const card of hand) {
    if (card.cost <= energy && cardScore(card, game.intent, game) > -4) {
      plan.push(card);
      energy -= card.cost;
      if (card.kind === 'energy') energy += card.power;
    }
  }
  return plan;
}
