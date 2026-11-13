
import { useEffect, useRef, useState } from "react";

import {
  Pressable,
  Text,
  View,
  ImageBackground,
  useWindowDimensions,
} from "react-native";

import { st } from "../PvpStyles";
import { Wizard } from "./Wizard";
import { Stats } from "./PlayerStats";
import { Book } from "./Spellbook";
import { DamageFlash } from "../Animation/DamageFlash";
import {
  effectsByCardId,
} from "../Animation/effects";
import { skillEffects } from "../../../data/skillEffects";

export function Duel({
  s,
  send,
  dispatch,
  rematch,
  leave,
  surrender,
  opponentAvatarId,
  opponentUsername,
}) {
  const { height, width } = useWindowDimensions();

  const [hideOpponent, setHideOpponent] = useState(false);

  const lastEffect = s.lastEffect;

  const [damageFlashHits, setDamageFlashHits] = useState(0);
  const [flashType, setFlashType] = useState("damage");
  const [spellFlashKey, setSpellFlashKey] = useState(null);

  const [bookShakeHits, setBookShakeHits] = useState(0);

  const previousEffectKey = useRef(null);
  const pendingPlayerDamage = useRef(false);

  const nonDamageCards = ["heal", "shield", "ward"];

  const isDamageCard =
    !!lastEffect &&
    !nonDamageCards.includes(lastEffect.cardId);


  useEffect(() => {
  if (s.opp.hp > 0) {
    setHideOpponent(false);
  }
}, [s.opp.hp]);  

  const opponentEffect = (() => {
    if (
      lastEffect?.who === "me" &&
      lastEffect?.target === "opp" &&
      isDamageCard
    ) {
      const effect = effectsByCardId[lastEffect.cardId];

      return effect
        ? {
            ...effect,
            key: lastEffect.key,
            cardId: lastEffect.cardId,
          }
        : null;
    }

    if (
      lastEffect?.who === "opp" &&
      lastEffect?.target === "opp"
    ) {
      const effectKey =
        lastEffect.cardId === "ward"
          ? "shield"
          : lastEffect.cardId;

      if (!["heal", "shield"].includes(effectKey)) {
        return null;
      }

      const effect = skillEffects[effectKey];

      return effect
        ? {
            ...effect,
            key: lastEffect.key,
            cardId: lastEffect.cardId,
          }
        : null;
    }

    return null;
  })();

  const over = s.me.hp <= 0 || s.opp.hp <= 0;
  const won = s.opp.hp <= 0;

  const opponentHeight = Math.min(
    Math.max(height * 0.34, 210),
    280
  );

  const statsPadding = Math.max(
    12,
    Math.min(width * 0.07, 40)
  );


  const isOpponentDamageAttack =
    lastEffect?.who === "opp" &&
    lastEffect?.target === "me" &&
    isDamageCard;

  const opponentAnimation = isOpponentDamageAttack
    ? "attack"
    : "idle";

  const opponentAnimationKey = isOpponentDamageAttack
    ? lastEffect.key
    : 0;

  const isEnemyMeteor =
    isOpponentDamageAttack &&
    lastEffect?.cardId === "meteor";

  const isHealing =
    lastEffect?.who === "me" &&
    lastEffect?.cardId === "heal";


  useEffect(() => {
    if (lastEffect?.key == null) return;

    if (previousEffectKey.current === lastEffect.key) {
      return;
    }

    previousEffectKey.current = lastEffect.key;

    setSpellFlashKey(null);
    pendingPlayerDamage.current = false;

    if (isHealing) {
      setFlashType("heal");
      setSpellFlashKey(lastEffect.key);
    }

    if (isOpponentDamageAttack) {
      pendingPlayerDamage.current = true;
    }
  }, [
    lastEffect?.key,
    lastEffect?.who,
    lastEffect?.cardId,
    isHealing,
    isOpponentDamageAttack,
  ]);


const handleOpponentAttackComplete = () => {
  if (pendingPlayerDamage.current) {
    pendingPlayerDamage.current = false;

    setFlashType(isEnemyMeteor ? "critical" : "damage");
    setSpellFlashKey(null);

    setBookShakeHits((value) => value + 1);
    setDamageFlashHits((value) => value + 1);
  }

  if (s.opp.hp <= 0) {
    setHideOpponent(true);
  }
};




  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <Pressable
        style={st.exitBtn}
        onPress={surrender}
        accessibilityRole="button"
        accessibilityLabel="Exit duel and surrender"
        hitSlop={8}
      >
        <Text style={st.exitBtnText}>X</Text>
      </Pressable>

      {/* Opponent area */}
      <ImageBackground
        source={require("../../../assets/images/duelBG.png")}
        style={{
          height: opponentHeight,
          width: "100%",
          flexGrow: 0,
          flexShrink: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
        resizeMode="cover"
      >
        <View
          style={{
            width: "100%",
            paddingHorizontal: statsPadding,
          }}
        >
          <Stats
            p={s.opp}
            label={opponentUsername}
            align="center"
            hits={s.hits.opp}
            manaUses={s.manaUses.opp}
          />
        </View>

        {!hideOpponent && (
        <Wizard
          avatarId={opponentAvatarId}
          hits={s.hits.opp}
          flip
          effect={opponentEffect}
          animation={opponentAnimation}
          animationKey={opponentAnimationKey}
           onAnimationComplete={handleOpponentAttackComplete}
          />
        )}
      </ImageBackground>

      {/* Middle area */}
      <View
        style={[
          st.mid,
          {
            flex: 1.1,
            minHeight: 0,
            justifyContent: "center",
            marginTop: 10,
          },
        ]}
      >
        <Text style={st.log} numberOfLines={2}>
          {s.log}
        </Text>

      </View>

      <View style={st.mineAndBook}>
        {/* Your HP and stats */}
        <View style={st.mine}>
          <Stats
            p={s.me}
            label="You"
            align="flex-start"
            hits={s.hits.me}
            manaUses={s.manaUses.me}
          />
        </View>

        {/* Spellbook handles its own shake */}
        <Book
          s={s}
          shakeHits={bookShakeHits}
          onPlay={(id) => {
            dispatch({ t: "play", who: "me", id });
            send({ type: "play", id });
          }}
        />
      </View>

      <Pressable
        disabled={s.turn !== "me" || over}
        style={[
          st.endBtn,
          (s.turn !== "me" || over) && {
            opacity: 0.35,
          },
        ]}
        onPress={() => {
          dispatch({ t: "end", who: "me" });
          send({ type: "end" });
        }}
      >
        <Text style={[st.btnTxt, st.endBtnText]}>
          {s.turn === "me" ? "END TURN" : "RIVAL'S TURN…"}
        </Text>
      </Pressable>

      {/* End game overlay */}
      {over && (
        <View style={st.overlay}>
          <Text style={st.logo}>
            {won ? "Victory!" : "Defeated"}
          </Text>

          <Pressable style={st.btn} onPress={rematch}>
            <Text style={st.btnTxt}>Rematch</Text>
          </Pressable>

          <Pressable
            style={[st.btn, st.ghost]}
            onPress={leave}
          >
            <Text style={st.btnTxt}>Leave</Text>
          </Pressable>
        </View>
      )}

      {/* Screen damage/heal flash */}
      <DamageFlash
        hits={damageFlashHits}
        spellKey={spellFlashKey}
        type={flashType}
      />
    </View>
  );
}
