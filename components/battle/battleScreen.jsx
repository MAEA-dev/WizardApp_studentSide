import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useCallback, useEffect, useRef, useState } from "react";

import { useBattleSystem } from "../../hooks/useBattleSystem";
import { useHomeData } from "../../hooks/useHomeData";
import { getDungeonQuestionsByDifficulty } from "../../services/battleService";
import { getStageDifficulty } from "../../data/dungeonDifficulty";
import { Fonts } from "../../constants/Fonts";
import { getWizardAvatar } from "../../constants/wizardAvatars";

import WizardMessage from "../shared/wizardModal";
import AnswerChoices from "./AnswerChoices";
import BattleFooter from "./BattleFooter";
import BattleStage from "./BattleStage";
import MessageBox from "./MessageBox";
import QuestionCard from "./QuestionCard";

const buildWizardStats = (student) => {
  const hp = Number(student?.hp || 100);
  const power = Number(student?.power || 20);

  return {
    maxHp: Math.max(hp, 1),
    attack: Math.max(power, 1),
  };
};

const BattleScreen = ({ onExitBattle, onStageComplete, stage }) => {
  const {
    student,
    loadingCache,
    refreshStudent,
  } = useHomeData();

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);
  const [stageProgressError, setStageProgressError] = useState(null);
  const [stageReward, setStageReward] = useState(null);
  const [surrenderModalVisible, setSurrenderModalVisible] = useState(false);
  const stageProgressSavedRef = useRef(false);
  const stageProgressPromiseRef = useRef(null);

  const difficulty = getStageDifficulty(stage);

  // Freeze wizard stats once the student has loaded, so background updates
  // (exp/level changes) can't restart or replace a battle in progress.
  const [lockedStats, setLockedStats] = useState(null);

  useEffect(() => {
    if (!loadingCache && student && !lockedStats) {
      setLockedStats(buildWizardStats(student));
    }
  }, [loadingCache, student, lockedStats]);

  const wizardStats = lockedStats || buildWizardStats(student);

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setQuestionsError(null);

        const data = await getDungeonQuestionsByDifficulty(difficulty);

        if (mounted) {
          setQuestions(data);
        }
      } catch (error) {
        console.log("Load battle questions error:", error);

        if (mounted) {
          setQuestions([]);
          setQuestionsError(
            error?.message || "Failed to load battle questions."
          );
        }
      } finally {
        if (mounted) {
          setLoadingQuestions(false);
        }
      }
    };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, [difficulty]);

  const {
    wizardHp,
    monsterHp,

    wizardHpPercent,
    monsterHpPercent,

    wizardAction,
    monsterAction,
    setWizardAction,
    setMonsterAction,

    skillEffect,
    skillEffectTarget,
    setSkillEffect,

    currentQuestion,

    selectedAnswer,
    isAnswerLocked,
    shouldRevealAnswer,

    timeLeft,
    timeLimit,

    battleMessage,
    battleStatus,
    battleRecordError,

    handleAnswer,
    resetBattle,
  } = useBattleSystem({
    questions,
    timeLimit: 15,
    paused: surrenderModalVisible,
    wizard: {
      maxHp: wizardStats.maxHp,
      attack: wizardStats.attack,
    },
    monster: {
      maxHp: stage?.monsterHp || 100,
      attack: stage?.monsterAttack || 50,
    },
    battleType: "dungeon",
    enemy: stage?.monster?.name || "Monster",
    wizardAttackEffect:
      getWizardAvatar(student?.equippedSkin).attackEffect || "waterBlast",
    monsterAttackEffect: stage?.monster?.attackEffect || "poisonBlast",
  });

  const persistStageCompletion = useCallback(async () => {
    if (!stage?.id || !onStageComplete || stageProgressSavedRef.current) {
      return;
    }

    if (!stageProgressPromiseRef.current) {
      stageProgressPromiseRef.current = Promise.resolve()
        .then(() => onStageComplete(stage.id))
        .then((completion) => {
          stageProgressSavedRef.current = true;
          setStageReward(
            completion?.reward
              ? { ...completion.reward, firstClear: completion.firstClear }
              : null
          );
          setStageProgressError(null);
        })
        .catch((error) => {
          setStageProgressError(
            error?.message || "Dungeon floor progress could not be saved."
          );
          throw error;
        })
        .finally(() => {
          stageProgressPromiseRef.current = null;
        });
    }

    return stageProgressPromiseRef.current;
  }, [onStageComplete, stage?.id]);

  useEffect(() => {
    if (battleStatus === "won") {
      persistStageCompletion().catch(() => {});
    }
  }, [battleStatus, persistStageCompletion]);

  const handleExitBattle = () => {
    setSurrenderModalVisible(true);
  };

  const confirmSurrender = () => {
    setSurrenderModalVisible(false);
    resetBattle();
    onExitBattle?.();
  };

  const handleResultClose = async () => {
    if (battleStatus === "won" && onStageComplete && stage?.id) {
      try {
        await persistStageCompletion();
      } catch (error) {
        Alert.alert(
          "Progress Not Saved",
          error?.message || "The dungeon floor completion could not be saved."
        );
        return;
      }
    }

    resetBattle();
    await refreshStudent?.();
    onExitBattle?.();
  };

  const isVictory = battleStatus === "won";
  const isDefeat = battleStatus === "lost";
  const hasNoQuestions = battleStatus === "noQuestions";

  const resultModalVisible = isVictory || isDefeat || hasNoQuestions;

  const getResultTitle = () => {
    if (isVictory) return "Victory!";
    if (isDefeat) return "Defeated";
    return questionsError ? "Load Failed" : "No Questions";
  };

  const getResultMessage = () => {
    let message;

    if (isVictory) {
      message =
        "Amazing spell casting! You defeated the monster and cleared the dungeon.";
      if (stageReward) {
        message += `\n\n${stageReward.gold} Gold and ${stageReward.xp} EXP earned${stageReward.firstClear ? " for your first clear" : " for replaying this floor"}.`;
      }
    } else if (isDefeat) {
      message =
        "The monster won this round. Train your magic and try again!";
    } else {
      if (questionsError) {
        return `Could not load questions: ${questionsError}`;
      }
      return `No published ${difficulty} questions found for your grade level yet. Ask your teacher to publish a lesson.`;
    }

    const errors = [
      battleRecordError && `Battle result could not be saved: ${battleRecordError}`,
      stageProgressError && `Dungeon progress could not be saved: ${stageProgressError}`,
    ].filter(Boolean);

    return errors.length ? `${message}\n\n${errors.join("\n")}` : message;
  };

  const getResultType = () => {
    if (isVictory) return "complete";
    if (isDefeat) return "wrong";
    return "default";
  };

  if (loadingCache || loadingQuestions) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading battle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BattleStage
        wizardHp={wizardHp}
        monsterHp={monsterHp}
        wizardHpPercent={wizardHpPercent}
        monsterHpPercent={monsterHpPercent}
        wizardAvatarId={student?.equippedSkin}
        monsterAnimations={stage?.monster?.animations}
        monsterFlipped={stage?.monster?.flipped}
        monsterScale={stage?.monster?.scale}
        monsterHeightScale={stage?.monster?.heightScale}
        wizardAction={wizardAction}
        monsterAction={monsterAction}
        setWizardAction={setWizardAction}
        setMonsterAction={setMonsterAction}
        skillEffect={skillEffect}
        skillEffectTarget={skillEffectTarget}
        onSkillEffectFinish={() => setSkillEffect(null)}
      />

      <MessageBox message={battleMessage} />

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {battleStatus === "playing" && currentQuestion && (
          <>
            <QuestionCard question={currentQuestion.question} />

            <AnswerChoices
              choices={currentQuestion.choices}
              answer={currentQuestion.answer}
              selectedAnswer={selectedAnswer}
              isAnswerLocked={isAnswerLocked}
              shouldRevealAnswer={shouldRevealAnswer}
              onAnswerPress={handleAnswer}
            />
          </>
        )}
      </ScrollView>

      <BattleFooter
        timeLeft={timeLeft}
        timeLimit={timeLimit}
        onSurrender={handleExitBattle}
      />

      <WizardMessage
        visible={resultModalVisible}
        title={getResultTitle()}
        message={getResultMessage()}
        type={getResultType()}
        buttonText="BACK"
        onClose={handleResultClose}
      />

      <Modal
        visible={surrenderModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSurrenderModalVisible(false)}
      >
        <View style={styles.surrenderBackdrop}>
          <View style={styles.surrenderCard}>
            <View style={styles.surrenderIcon}>
              <Ionicons name="flag" size={30} color="#FDA4AF" />
            </View>
            <Text style={styles.surrenderTitle}>SURRENDER BATTLE?</Text>
            <Text style={styles.surrenderMessage}>
              This battle will end. Any floor you already completed will stay
              completed.
            </Text>
            <View style={styles.surrenderButtons}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.stayButton}
                onPress={() => setSurrenderModalVisible(false)}
              >
                <Text style={styles.stayButtonText}>STAY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.surrenderButton}
                onPress={confirmSurrender}
              >
                <Text style={styles.surrenderButtonText}>SURRENDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BattleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18002F",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#18002F",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 14,
  },

  contentScroll: {
    flex: 1,
  },

  contentContainer: {
    padding: 10,
    paddingBottom: 95,
  },
  surrenderBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(8, 4, 20, 0.78)",
  },
  surrenderCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    padding: 22,
    borderWidth: 3,
    borderColor: "#7557D9",
    borderRadius: 22,
    backgroundColor: "rgba(25, 20, 58, 0.99)",
  },
  surrenderIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#F87171",
    borderRadius: 29,
    backgroundColor: "rgba(248, 113, 113, 0.16)",
  },
  surrenderTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 13,
    color: "#FFD86B",
    textAlign: "center",
  },
  surrenderMessage: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: "#E5DFFF",
    textAlign: "center",
    marginTop: 12,
  },
  surrenderButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginTop: 22,
  },
  stayButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: "#75699C",
    borderRadius: 10,
    backgroundColor: "#453B68",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 3,
    elevation: 3,
  },
  stayButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#FFFFFF",
  },
  surrenderButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: "#FB7185",
    borderRadius: 10,
    backgroundColor: "#BE123C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 3,
    elevation: 3,
  },
  surrenderButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFFFFF",
  },
});
