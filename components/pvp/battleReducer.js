
import {
  CARDS,
  MAX_HP,
  manaFor,
  other,
} from "./battleConstants";


export const fresh = (
  iGoFirst,
  myPower = 0,
  opponentPower = 0,
  myHP = MAX_HP,
  opponentHP = MAX_HP
) => {
  const playerHP = Math.max(1, Number(myHP) || MAX_HP);
  const rivalHP = Math.max(1, Number(opponentHP) || MAX_HP);

  return {
    me: {
      hp: playerHP,
      maxHp: playerHP,
      sh: 0,
      mana: iGoFirst ? 3 : 0,
      power: Math.max(0, Number(myPower) || 0),
    },

    opp: {
      hp: rivalHP,
      maxHp: rivalHP,
      sh: 0,
      mana: iGoFirst ? 0 : 3,
      power: Math.max(0, Number(opponentPower) || 0),
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

    lastEffect: null,

    log: iGoFirst
      ? "The duel begins. You strike first."
      : "The duel begins. Rival strikes first.",
  };
};

export function reducer(s, a) {

  if (a.t === "reset") {
    return fresh(
      a.first,
      a.myPower,
      a.opponentPower,
      a.myHP,
      a.opponentHP
    );
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

  const foeS = {
    ...s[foe],
  };

  const hits = {
    ...s.hits,
  };

  const manaUses = {
    ...s.manaUses,
    [who]: s.manaUses[who] + 1,
  };

  
  if (card.dmg) {
    const totalDamage = card.dmg + me.power;

    const soak = Math.min(foeS.sh, totalDamage);

    foeS.sh -= soak;

    const damage = totalDamage - soak;

    foeS.hp = Math.max(0, foeS.hp - damage);

    if (damage > 0) {
      hits[foe] += 1;
    }
  }

  if (card.sh) {
    me.sh += card.sh;
  }

  if (card.heal) {
    me.hp = Math.min(
      me.maxHp,
      me.hp + card.heal
    );
  }

  const target = card.dmg ? foe : who;

  return {
    ...s,

    [who]: me,
    [foe]: foeS,

    hits,
    manaUses,

    lastEffect: {
      who,
      target,
      cardId: card.id,
      key: (s.lastEffect?.key || 0) + 1,
    },

    log: `${who === "me" ? "You" : "Rival"} cast ${card.name}!`,
  };
}
