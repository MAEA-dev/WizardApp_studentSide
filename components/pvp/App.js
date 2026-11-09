
import { useState } from "react";

import { StatusBar } from "expo-status-bar";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { st } from "./PvpStyles";

import { Lobby } from "./Components/Lobby";
import { Duel } from "./Components/Duel";

import { usePvpSession } from "../../hooks/usePvpSession";

export default function App() {
  const [room, setRoom] = useState("");

  const {
    phase,
    status,
    opponentAvatarId,
    opponentUsername,
    s,
    dispatch,
    join,
    send,
    leave,
    surrender,
    rematch,
  } = usePvpSession();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      <SafeAreaView style={st.root}>
        {/* Lobby */}
        {phase === "lobby" && (
          <Lobby
            room={room}
            setRoom={setRoom}
            status={status}
            onJoin={() => join(room)}
          />
        )}

        {/* Waiting for opponent */}
        {phase === "wait" && (
          <View style={st.lobby}>
            <Text style={st.logo}>Waiting…</Text>

            <Text style={st.sub}>
              Waiting for someone who entered the same room words.
            </Text>

            {!!status && (
              <Text style={st.status}>{status}</Text>
            )}

            <Pressable
              style={[st.btn, st.ghost]}
              onPress={leave}
            >
              <Text style={st.btnTxt}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* Duel */}
        {phase === "duel" && (
          <Duel
            s={s}
            send={send}
            dispatch={dispatch}
            leave={leave}
            surrender={surrender}
            opponentAvatarId={opponentAvatarId}
            opponentUsername={opponentUsername}
            rematch={rematch}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
