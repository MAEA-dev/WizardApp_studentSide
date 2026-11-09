
import { Pressable, Text, View } from "react-native";

import { st } from "../PvpStyles";
import { Wizard } from "./Wizard";
import { Stats } from "./PlayerStats";
import { Book } from "./Spellbook";

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
  const over = s.me.hp <= 0 || s.opp.hp <= 0;
  const won = s.opp.hp <= 0;

  return (
    <View style={{ flex: 1 }}>
      {/* Surrender button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Surrender and exit the battle"
        style={st.exitBtn}
        onPress={surrender}
      >
        <Text style={st.exitBtnText}>←</Text>
      </Pressable>

      {/* Opponent section */}
      <View style={st.top}>
        <Stats
          p={s.opp}
          label={opponentUsername}
          align="center"
          hits={s.hits.opp}
          manaUses={s.manaUses.opp}
        />

        <Wizard
          avatarId={opponentAvatarId}
          hits={s.hits.opp}
          flip
        />
      </View>

      {/* Battle controls */}
      <View style={st.mid}>
        <Text style={st.log}>{s.log}</Text>

        <Pressable
          disabled={s.turn !== "me" || over}
          style={[
            st.endBtn,
            (s.turn !== "me" || over) && { opacity: 0.35 },
          ]}
          onPress={() => {
            dispatch({ t: "end", who: "me" });
            send({ type: "end" });
          }}
        >
          <Text style={st.btnTxt}>
            {s.turn === "me" ? "End turn" : "Rival's turn…"}
          </Text>
        </Pressable>
      </View>

      {/* Player section */}
      <View style={st.mine}>
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

      {/* Battle result */}
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
    </View>
  );
}
