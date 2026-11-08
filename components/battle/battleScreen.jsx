import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useEffect, useMemo, useState } from "react";

import { useBattleSystem } from "../../hooks/useBattleSystem";
import { useHomeData } from "../../hooks/useHomeData";
import { getBattleQuestionsByGrade } from "../../services/battleService";

import WizardMessage from "../shared/wizardModal";
import AnswerChoices from "./AnswerChoices";
import BattleFooter from "./BattleFooter";
import BattleStage from "./BattleStage";
import MessageBox from "./MessageBox";
import QuestionCard from "./QuestionCard";

const getStudentGradeLevel = (student) => {
  return (
    student?.profile?.grade ||
    student?.profile?.gradeLevel ||
    student?.gradeLevel ||
    student?.grade ||
    ""
  );
};

const buildWizardStats = (student) => {
  const hp = Number(student?.hp || 100);
  const power = Number(student?.power || 20);
  const energy = Number(student?.energy || 0);

  return {
    maxHp: Math.max(hp, 1),
    attack: Math.max(power, 1),
    energy,
  };
};

const BattleScreen = ({ onExitBattle }) => {
  const {
    student,
    loadingCache,
    refreshStudent,
  } = useHomeData();

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const gradeLevel = useMemo(() => {
    return String(getStudentGradeLevel(student) || "").trim();
  }, [student]);

  const wizardStats = useMemo(() => {
    return buildWizardStats(student);
  }, [student]);

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      if (!gradeLevel) {
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      try {
        setLoadingQuestions(true);

        const data = await getBattleQuestionsByGrade(gradeLevel);

        if (mounted) {
          setQuestions(data);
        }
      } catch (error) {
        console.log("Load battle questions error:", error);

        if (mounted) {
          Alert.alert(
            "Error",
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
  }, [gradeLevel]);

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
    wizard: {
      maxHp: wizardStats.maxHp,
      attack: wizardStats.attack,
    },
    monster: {
      maxHp: 100,
      attack: 50,
    },
    battleType: "dungeon",
    enemy: "Monster",
  });

  const handleExitBattle = () => {
    Alert.alert("Exit Battle", "Do you want to leave the dungeon?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Exit",
        style: "destructive",
        onPress: () => {
          resetBattle();
          onExitBattle?.();
        },
      },
    ]);
  };

  const handleResultClose = async () => {
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
    return "No Questions";
  };

  const getResultMessage = () => {
    let message;

    if (isVictory) {
      message =
        "Amazing spell casting! You defeated the monster and cleared the dungeon.";
    } else if (isDefeat) {
      message =
        "The monster won this round. Train your magic and try again!";
    } else {
      return "No published battle questions found for your grade level.";
    }

    return battleRecordError
      ? `${message}\n\nBattle result could not be saved: ${battleRecordError}`
      : message;
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

  if (wizardStats.energy <= 0) {
    return (
      <View style={styles.container}>
        <WizardMessage
          visible
          title="No Energy"
          message="Your wizard has no energy. Restore energy before entering battle."
          type="wrong"
          buttonText="BACK"
          onClose={onExitBattle}
        />
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
});