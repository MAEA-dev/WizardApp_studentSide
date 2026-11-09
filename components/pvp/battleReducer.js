// Both phones run the same reducer on the same actions, so they stay in sync.
import {
  CARDS,
  MAX_HP,
  manaFor,
  other,
} from "./battleConstants";

export const fresh = (iGoFirst) => ({
  me: {
    hp: MAX_HP,
    sh: 0,
    mana: iGoFirst ? 3 : 0,
  },
  opp: {
    hp: MAX_HP,
    sh: 0,
    mana: iGoFirst ? 0 : 3,
  },
  turn: iGoFirst ? "me" : "opp",
  turns: {
    me: iGoFirst ? 1 : 0,
    opp: iGoFirst ? 0 : 1,
  },
  hits: {
    me: 0,
    opp: 0,
  },
  manaUses: {
    me: 0,
    opp: 0,
  },
  log: iGoFirst
    ? "The duel begins. You strike first."
    : "The duel begins. Rival strikes first.",
});


export function reducer(s, a) {
  if (a.t === "reset") {
    return fresh(a.first);
  }

  if (
    s.me.hp <= 0 ||
    s.opp.hp <= 0 ||
    s.turn !== a.who
  ) {
    return s;
  }

  const who = a.who;
  const foe = other(who);

  if (a.t === "end") {
    const turns = {
      ...s.turns,
      [foe]: s.turns[foe] + 1,
    };

    return {
      ...s,
      turn: foe,
      turns,
      [foe]: {
        ...s[foe],
        mana: manaFor(turns[foe]),
      },
      log: `${foe === "me" ? "Your" : "Rival's"} turn.`,
    };
  }

  const card = CARDS.find((c) => c.id === a.id);

  if (!card || s[who].mana < card.cost) {
    return s;
  }

  const me = {
    ...s[who],
    mana: s[who].mana - card.cost,
  };

  const foeS = { ...s[foe] };
  const hits = { ...s.hits };

  const manaUses = {
    ...s.manaUses,
    [who]: s.manaUses[who] + 1,
  };

  if (card.dmg) {
    const soak = Math.min(foeS.sh, card.dmg);

    foeS.sh -= soak;

    const damage = card.dmg - soak;

    foeS.hp = Math.max(0, foeS.hp - damage);

    if (damage > 0) {
      hits[foe] += 1;
    }
  }

  if (card.sh) {
    me.sh += card.sh;
  }

  if (card.heal) {
    me.hp = Math.min(MAX_HP, me.hp + card.heal);
  }

  return {
    ...s,
    [who]: me,
    [foe]: foeS,
    hits,
    manaUses,
    log: `${who === "me" ? "You" : "Rival"} cast ${card.name}!`,
  };
}
