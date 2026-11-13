
import { useState } from "react";

import { StatusBar } from "expo-status-bar";

import {
  Modal,
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

  
    myStats,
    opponentStats,

    s,
    dispatch,
    join,
    send,
    leave,
    surrender,
    surrenderPromptVisible,
    cancelSurrender,
    confirmSurrender,
    rematch,
    rematchDialog,
    respondToRematch,
    dismissRematchDialog,
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

    
            myStats={myStats}
            opponentStats={opponentStats}
          />
        )}

        <Modal
          visible={surrenderPromptVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelSurrender}
        >
          <View style={st.modalBackdrop}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>Surrender?</Text>
              <Text style={st.modalMessage}>
                Do you really want to exit? Exit means surrender.
              </Text>

              <View style={st.modalActions}>
                <Pressable
                  style={[st.modalButton, st.modalButtonSecondary]}
                  onPress={cancelSurrender}
                >
                  <Text style={st.modalButtonSecondaryText}>No</Text>
                </Pressable>
                <Pressable
                  style={st.modalButton}
                  onPress={confirmSurrender}
                >
                  <Text style={st.modalButtonText}>Yes</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(rematchDialog)}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (rematchDialog?.type === "incoming") {
              respondToRematch(false);
            } else {
              dismissRematchDialog();
            }
          }}
        >
          <View style={st.modalBackdrop}>
            <View style={st.modalCard}>
              <Text style={st.modalTitle}>
                {rematchDialog?.type === "incoming"
                  ? "Rematch?"
                  : rematchDialog?.type === "declined"
                    ? "Rematch declined"
                    : rematchDialog?.type === "error"
                      ? "Rematch unavailable"
                      : "Rematch"}
              </Text>
              <Text style={st.modalMessage}>
                {rematchDialog?.type === "incoming"
                  ? `${opponentUsername} wants a rematch. Do you agree?`
                  : rematchDialog?.type === "waiting"
                    ? `Waiting for ${opponentUsername} to respond…`
                    : rematchDialog?.type === "starting"
                      ? `${opponentUsername} agreed. Starting rematch…`
                      : rematchDialog?.type === "declined"
                        ? `${opponentUsername} declined the rematch.`
                        : rematchDialog?.message}
              </Text>

              {rematchDialog?.type === "incoming" && (
                <View style={st.modalActions}>
                  <Pressable
                    style={[st.modalButton, st.modalButtonSecondary]}
                    onPress={() => respondToRematch(false)}
                  >
                    <Text style={st.modalButtonSecondaryText}>No</Text>
                  </Pressable>
                  <Pressable
                    style={st.modalButton}
                    onPress={() => respondToRematch(true)}
                  >
                    <Text style={st.modalButtonText}>Yes</Text>
                  </Pressable>
                </View>
              )}

              {(rematchDialog?.type === "declined" ||
                rematchDialog?.type === "error") && (
                <Pressable
                  style={[st.modalButton, st.modalSingleButton]}
                  onPress={dismissRematchDialog}
                >
                  <Text style={st.modalButtonText}>OK</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
