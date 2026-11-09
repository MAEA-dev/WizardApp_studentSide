
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
import { effectsByCardId } from "../Animation/effects";

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

  const lastEffect = s.lastEffect;

  const opponentEffect =
    lastEffect?.target === "opp" &&
    effectsByCardId[lastEffect.cardId]
      ? {
          ...effectsByCardId[lastEffect.cardId],
          key: lastEffect.key,
        }
      : null;

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

  const isEnemyAttack =
    lastEffect?.who === "opp" &&
    lastEffect?.target === "me" &&
    lastEffect?.cardId !== "heal" &&
    lastEffect?.cardId !== "ward";

  const isEnemyMeteor =
    isEnemyAttack &&
    lastEffect?.cardId === "meteor";

  const isHealing =
    lastEffect?.who === "me" &&
    lastEffect?.cardId === "heal";

  const flashType = isHealing
    ? "heal"
    : isEnemyMeteor
    ? "critical"
    : "damage";

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      {/* Opponent section */}
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

        <Wizard
          avatarId={opponentAvatarId}
          hits={s.hits.opp}
          flip
          effect={opponentEffect}
        />
      </ImageBackground>

      {/* Middle section */}
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
          <Text style={st.btnTxt}>
            {s.turn === "me"
              ? "End turn"
              : "Rival's turn…"}
          </Text>
        </Pressable>
      </View>

      {/* Player stats */}
      <View
        style={[
          st.mine,
          {
            flex: 0.8,
            minHeight: 0,
            marginTop: 10,
          },
        ]}
      >
        <Stats
          p={s.me}
          label="You"
          align="flex-start"
          hits={s.hits.me}
          manaUses={s.manaUses.me}
        />
      </View>

      {/* Spellbook */}
      <Book
        s={s}
        onPlay={(id) => {
          dispatch({ t: "play", who: "me", id });
          send({ type: "play", id });
        }}
      />

      {/* Victory / Defeat */}
      {over && (
        <View style={st.overlay}>
          <Text style={st.logo}>
            {won ? "Victory!" : "Defeated"}
          </Text>

          <Pressable
            style={st.btn}
            onPress={rematch}
          >
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

      {/* Screen damage / healing flash */}
      <DamageFlash
        hits={s.hits.me}
        spellKey={isHealing ? lastEffect?.key : null}
        type={flashType}
      />
    </View>
  );
}
