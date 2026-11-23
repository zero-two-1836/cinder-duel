// effects.js — what each card does when it lands on the table. One function,
// applyCard, resolves a played card for either duelist and returns the line
// the table log narrates.

import { dealDamage, drawCards, logLine } from './state.js';

export function applyCard(game, actor, target, card) {
  let note = '';
  switch (card.kind) {
    case 'attack': {
      const lost = dealDamage(game, target, card.power, actor === game.player ? 'player-attack' : 'rival-attack');
      note = `${card.name} hits ${target.name} for ${lost} life${card.power - lost > 0 ? ` (${card.power - lost} soaked by shield)` : ''}.`;
      break;
    }
    case 'shield': {
      actor.shield += card.power;
      note = `${actor.name} raises ${card.power} shield.`;
      break;
    }
    case 'shield-draw': {
      actor.shield += card.power;
      drawCards(game, actor, 1);
      note = `${actor.name} raises ${card.power} shield and draws a card.`;
      break;
    }
    case 'heal': {
      const before = actor.life;
      actor.life = Math.min(20, actor.life + card.power);
      note = `${actor.name} mends ${actor.life - before} life.`;
      break;
    }
    case 'burn': {
      target.burn += card.power;
      note = `${card.name} sets ${target.name} burning (${target.burn} Burn).`;
      break;
    }
    case 'fan': {
      target.burn *= 2;
      note = `Fan the Flames doubles ${target.name}'s Burn to ${target.burn}.`;
      break;
    }
    case 'firestorm': {
      const amount = card.power * target.burn;
      const lost = dealDamage(game, target, amount, actor === game.player ? 'player-attack' : 'rival-attack');
      note = `Firestorm cashes in ${target.burn} Burn for ${lost} damage.`;
      break;
    }
    case 'energy': {
      actor.energy += card.power;
      note = `${actor.name} surges +${card.power} energy.`;
      break;
    }
    case 'draw': {
      drawCards(game, actor, card.power);
      note = `${actor.name} draws ${card.power} cards.`;
      break;
    }
    default:
      note = `${card.name} fizzles.`;
  }
  logLine(game, note);
  return note;
}
