import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "../constants/Fonts";
import BattleScreen from "../components/battle/battleScreen";
import { DUNGEON_STAGES } from "../data/dungeonStages";
import {
  DEFAULT_DUNGEON_PROGRESS,
  completeDungeonStage,
  getDungeonProgress,
} from "../services/dungeonProgressService";

export default function DungeonBattleRoute() {
  const [selectedStage, setSelectedStage] = useState(null);
  const [progress, setProgress] = useState(DEFAULT_DUNGEON_PROGRESS);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState(null);

  React.useEffect(() => {
    let active = true;

    getDungeonProgress()
      .then((nextProgress) => {
        if (active) setProgress(nextProgress);
      })
      .catch((error) => {
        if (active) {
          setProgressError(
            error?.message || "Could not load dungeon progress."
          );
        }
      })
      .finally(() => {
        if (active) setProgressLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleStageComplete = useCallback(async (stageId) => {
    const nextProgress = await completeDungeonStage(stageId);
    setProgress(nextProgress);
    setProgressError(null);
    return nextProgress;
  }, []);

  if (selectedStage) {
    return (
      <SafeAreaView style={styles.battleContainer}>
        <BattleScreen
          stage={selectedStage}
          onStageComplete={handleStageComplete}
          onExitBattle={() => setSelectedStage(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/dungeonBg.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>DUNGEON ADVENTURE</Text>
            <Text style={styles.subtitle}>
              Pick a path and prepare for the monster waiting inside.
            </Text>
          </View>

          {!!progressError && (
            <Text style={styles.progressError}>
              Progress could not be loaded. Only Floor 1 is available until it
              reconnects. {progressError}
            </Text>
          )}

          {progressLoading && (
            <View style={styles.progressLoading}>
              <ActivityIndicator color="#FFD84D" />
              <Text style={styles.progressLoadingText}>
                Loading dungeon progress...
              </Text>
            </View>
          )}

          {[...DUNGEON_STAGES]
            .sort((first, second) => second.id - first.id)
            .map((stage) => {
              const isCompleted = progress.completedStages.includes(stage.id);
              const isUnlocked = stage.id <= progress.highestUnlockedStage;
              const stageColor = !isUnlocked
                ? "#65708B"
                : isCompleted
                  ? "#55E6A5"
                  : stage.color;

              return (
              <TouchableOpacity
                key={stage.id}
                accessibilityRole="button"
                activeOpacity={0.85}
                style={[
                  styles.stageCard,
                  {
                    width:
                      stage.id === 3
                        ? "82%"
                        : stage.id === 2
                          ? "91%"
                          : "100%",
                  },
                  { borderColor: stageColor },
                  !isUnlocked && styles.stageCardLocked,
                ]}
                disabled={!isUnlocked || progressLoading}
                onPress={() => setSelectedStage(stage)}
              >
                <View
                  style={[
                    styles.stageIcon,
                    { backgroundColor: `${stageColor}25` },
                  ]}
                >
                  <Ionicons
                    name={!isUnlocked ? "lock-closed" : stage.icon}
                    size={26}
                    color={stageColor}
                  />
                </View>

                <View style={styles.stageInfo}>
                  <View style={styles.floorLabelRow}>
                    <Text style={styles.stageNumber}>
                      Dungeon Floor {stage.id}
                    </Text>
                    <Ionicons
                      name={isCompleted ? "checkmark-circle" : isUnlocked ? "chevron-forward" : "lock-closed"}
                      size={18}
                      color={isCompleted ? "#55E6A5" : stageColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stageStatus,
                      isCompleted
                        ? styles.stageStatusCompleted
                        : isUnlocked
                          ? styles.stageStatusUnlocked
                          : styles.stageStatusLocked,
                    ]}
                  >
                    {isCompleted
                      ? "COMPLETED - REPLAY"
                      : isUnlocked
                        ? "UNLOCKED"
                        : "LOCKED"}
                  </Text>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageDescription}>
                    {stage.description}
                  </Text>
                  <View style={styles.enemyRow}>
                    <Ionicons name="skull" size={14} color="#FDA4AF" />
                    <Text style={styles.enemyText}>{stage.monster.name}</Text>
                    <Text style={styles.difficultyText}>
                      {stage.id === 1
                        ? "EASY"
                        : stage.id === 2
                          ? "MEDIUM"
                          : "HARD"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              );
            })}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(24, 0, 47, 0.38)",
  },
  battleContainer: {
    flex: 1,
    backgroundColor: "#18002F",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
  },
  heading: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  progressError: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: "#FFD6A5",
    backgroundColor: "rgba(80, 35, 25, 0.9)",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  progressLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
  },
  progressLoadingText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#FFFFFF",
  },
  eyebrow: {
    fontFamily: Fonts.pixel,
    fontSize: 11,
    letterSpacing: 1,
    color: "#FFD84D",
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: "#D8CCF5",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 300,
  },
  stageCard: {
    alignSelf: "center",
    minHeight: 178,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: "rgba(43, 0, 79, 0.94)",
  },
  stageCardLocked: {
    backgroundColor: "rgba(29, 34, 51, 0.94)",
  },
  stageIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  stageInfo: {
    flex: 1,
  },
  floorLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageNumber: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    textTransform: "uppercase",
    color: "#FFD84D",
    marginBottom: 5,
  },
  stageStatus: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    marginBottom: 6,
  },
  stageStatusCompleted: {
    color: "#55E6A5",
  },
  stageStatusUnlocked: {
    color: "#8DB4FF",
  },
  stageStatusLocked: {
    color: "#929BB0",
  },
  stageTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  stageDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: "#D8CCF5",
    marginTop: 4,
  },
  enemyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  enemyText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#FDA4AF",
    flex: 1,
  },
  difficultyText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
});
