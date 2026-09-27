import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from "react-native";

import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../constant/Fonts";
import BattleScreen from "../../components/battle/battleScreen";

const Battle = () => {
  const [startedBattle, setStartedBattle] = useState(false);

  if (startedBattle) {
    return <BattleScreen onExitBattle={() => setStartedBattle(false)} />;
  }

  return (
    <ImageBackground
      source={require("../../assets/images/battleBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.titleBox}>
            <Text style={styles.screenTitle}>BATTLE MODE</Text>
            <Text style={styles.screenSubtitle}>Choose your challenge</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.modeCard}
            onPress={() => setStartedBattle(true)}
          >
            <View style={styles.cardGlow} />

            <View style={styles.iconCircle}>
              <Ionicons name="shield" size={30} color="#FFD84D" />
            </View>

            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>DUNGEON BATTLE</Text>

              <Text style={styles.modeDescription}>
                Answer correctly to cast spells. Defeat the monster before your
                wizard falls.
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="help-circle" size={12} color="#FFFFFF" />
                  <Text style={styles.statText}>Questions</Text>
                </View>

                <View style={styles.statBadge}>
                  <Ionicons name="timer" size={12} color="#FFFFFF" />
                  <Text style={styles.statText}>Timer</Text>
                </View>

                <View style={styles.statBadgeDanger}>
                  <Ionicons name="skull" size={12} color="#FFFFFF" />
                  <Text style={styles.statText}>Monster</Text>
                </View>
              </View>
            </View>

          </TouchableOpacity>

          <View style={styles.lockedCard}>
            <View style={styles.iconCircleLocked}>
              <Ionicons name="lock-closed" size={24} color="#BDB4D8" />
            </View>

            <View style={styles.modeInfo}>
              <Text style={styles.lockedTitle}>PVP</Text>

              <Text style={styles.lockedDescription}>
                Coming soon. Challenge another student in a battle.
              </Text>

              <View style={styles.lockedStatsRow}>
                <View style={styles.lockedBadge}>
                  <Ionicons name="people" size={12} color="#D9D1E8" />
                  <Text style={styles.lockedBadgeText}>PLAYER VS PLAYER</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Battle;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 4, 27, 0.62)",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20
  },

  titleBox: {
    alignItems: "center",
    marginBottom: 28,
  },

  screenTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 22,
    color: "#FFE500",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowRadius: 2,
  },

  screenSubtitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 10,
    opacity: 0.9,
  },

  modeCard: {
    width: "100%",
    minHeight: 250,
    backgroundColor: "rgba(43, 0, 79, 0.94)",
    borderWidth: 3,
    borderColor: "#FFD84D",
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },

  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255, 216, 77, 0.18)",
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 216, 77, 0.18)",
    borderWidth: 2,
    borderColor: "#FFD84D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  modeInfo: {
    flex: 1,
  },

  modeTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 15,
    color: "#FFE500",
    marginBottom: 10,
  },

  modeDescription: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
    lineHeight: 20,
    opacity: 0.95,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },

  statBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.18)",
    borderWidth: 1,
    borderColor: "#34D399",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statBadgeDanger: {
    backgroundColor: "rgba(244, 63, 94, 0.18)",
    borderWidth: 1,
    borderColor: "#F43F5E",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#FFFFFF",
  },

  playButton: {
    alignSelf: "flex-end",
    backgroundColor: "#7E22CE",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  playButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 11,
    color: "#FFFFFF",
  },

  lockedCard: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "rgba(32, 20, 67, 0.78)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    opacity: 0.78,
  },

  iconCircleLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  lockedTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 13,
    color: "#BDB4D8",
    marginBottom: 8,
  },

  lockedDescription: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 18,
    opacity: 0.75,
  },

  lockedStatsRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  lockedBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  lockedBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#D9D1E8",
  },
});