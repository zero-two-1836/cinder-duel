// cards.js — the card pool of Cinder Duel. Four suits, told apart by colour
// and shape: Flame (orange triangle) attacks, Aegis (blue shield) defends and
// mends, Ember (red circle) sets the rival burning, Spark (violet diamond)
// bends the rules of energy and drawing. Burn is the combo engine: Fan the
// Flames doubles it, Firestorm cashes it in for damage.

import { shuffle } from './rng.js';

export const SUITS = {
  flame: { name: 'Flame', glyph: '▲', colour: '#ff8c3a' },
  aegis: { name: 'Aegis', glyph: '⬟', colour: '#57b6ff' },
  ember: { name: 'Ember', glyph: '●', colour: '#ff5252' },
  spark: { name: 'Spark', glyph: '◆', colour: '#c792ff' },
};

export const CARD_DEFS = [
  { id: 'spark-jab',    name: 'Spark Jab',    suit: 'flame', cost: 0, power: 1, kind: 'attack', text: 'Deal 1 damage. A free tap to keep the pressure on.' },
  { id: 'ember-strike', name: 'Ember Strike', suit: 'flame', cost: 1, power: 3, kind: 'attack', text: 'Deal 3 damage.' },
  { id: 'blazing-slash',name: 'Blazing Slash',suit: 'flame', cost: 2, power: 5, kind: 'attack', text: 'Deal 5 damage.' },
  { id: 'inferno-crash',name: 'Inferno Crash',suit: 'flame', cost: 4, power: 9, kind: 'attack', text: 'Deal 9 damage.' },
  { id: 'aegis-wall',   name: 'Aegis Wall',   suit: 'aegis', cost: 1, power: 4, kind: 'shield', text: 'Gain 4 shield. Shield soaks damage before life.' },
  { id: 'mirror-guard', name: 'Mirror Guard', suit: 'aegis', cost: 2, power: 5, kind: 'shield-draw', text: 'Gain 5 shield and draw a card.' },
  { id: 'bastion',      name: 'Bastion',      suit: 'aegis', cost: 3, power: 9, kind: 'shield', text: 'Gain 9 shield.' },
  { id: 'second-wind',  name: 'Second Wind',  suit: 'aegis', cost: 2, power: 4, kind: 'heal', text: 'Restore 4 life.' },
  { id: 'kindle',       name: 'Kindle',       suit: 'ember', cost: 1, power: 2, kind: 'burn', text: 'Set the foe burning: 2 Burn. Burn bites at the start of each round.' },
  { id: 'wildfire',     name: 'Wildfire',     suit: 'ember', cost: 3, power: 4, kind: 'burn', text: 'Set the foe burning: 4 Burn.' },
  { id: 'fan-flames',   name: 'Fan the Flames', suit: 'ember', cost: 2, power: 0, kind: 'fan', text: 'Double the foe\'s Burn.' },
  { id: 'firestorm',    name: 'Firestorm',    suit: 'ember', cost: 2, power: 2, kind: 'firestorm', text: 'Deal 2 damage for each Burn on the foe.' },
  { id: 'surge',        name: 'Surge',        suit: 'spark', cost: 0, power: 1, kind: 'energy', text: 'Gain 1 energy this round.' },
  { id: 'overcharge',   name: 'Overcharge',   suit: 'spark', cost: 1, power: 2, kind: 'energy', text: 'Gain 2 energy this round.' },
  { id: 'quick-study',  name: 'Quick Study',  suit: 'spark', cost: 1, power: 2, kind: 'draw', text: 'Draw 2 cards.' },
];

const DECK_RECIPE = [
  ['spark-jab', 2], ['ember-strike', 3], ['blazing-slash', 3], ['inferno-crash', 2],
  ['aegis-wall', 3], ['mirror-guard', 2], ['bastion', 2], ['second-wind', 1],
  ['kindle', 3], ['wildfire', 2], ['fan-flames', 1], ['firestorm', 2],
  ['surge', 2], ['overcharge', 1], ['quick-study', 2],
];

let uidCounter = 0;

export function makeCard(defId) {
  const def = CARD_DEFS.find((d) => d.id === defId);
  uidCounter += 1;
  return { uid: uidCounter, defId: def.id, name: def.name, suit: def.suit, cost: def.cost, power: def.power, kind: def.kind, text: def.text };
}

export function buildDeck(rng) {
  const cards = [];
  for (const [defId, count] of DECK_RECIPE) {
    for (let i = 0; i < count; i++) cards.push(makeCard(defId));
  }
  return shuffle(cards, rng);
}

export function defOf(card) {
  return CARD_DEFS.find((d) => d.id === card.defId);
}
