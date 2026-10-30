import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../constants/Fonts";
import TypewriterText from "../../shared/TypeWriterText";

export default function LessonStepCard({
  step,
  selectedAnswer,
  onAnswerPress,
}) {
  const isQuestionStep = step?.type === "ask";
  const isTutorStep = step?.type === "say";

  return (
    <View style={styles.lessonCard}>
      <View style={styles.stepBadge}>
        <Ionicons
          name={isQuestionStep ? "help-circle" : "chatbubble-ellipses"}
          size={18}
          color="#FFD86B"
        />

        <Text style={styles.stepBadgeText}>
          {isQuestionStep ? "Question" : "Wizard Says"}
        </Text>
      </View>

      {isTutorStep && (
        <TypewriterText
          text={step.text}
          speed={4}
          style={styles.lessonText}
        />
      )}

      {isQuestionStep && (
        <View>
          <TypewriterText
            text={step.question}
            speed={30}
            style={styles.questionText}
          />

          <View style={styles.choicesBox}>
            {step.choices.map((choice, index) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectChoice = choice === step.answer;

              return (
                <TouchableOpacity
                  key={`${choice}-${index}`}
                  activeOpacity={0.85}
                  style={[
                    styles.choiceButton,
                    isSelected && styles.choiceSelected,
                    isSelected && isCorrectChoice && styles.choiceCorrect,
                    isSelected && !isCorrectChoice && styles.choiceWrong,
                  ]}
                  onPress={() => onAnswerPress(choice)}
                  disabled={!!selectedAnswer}
                >
                  <View style={styles.choiceCircle}>
                    <Text style={styles.choiceLetter}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>

                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lessonCard: {
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 26,
    padding: 17,
    minHeight: 280,
  },

  stepBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 216, 107, 0.13)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    marginBottom: 16,
  },

  stepBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: "#FFD86B",
  },

  lessonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 30,
  },

  questionText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 29,
    marginBottom: 18,
  },

  choicesBox: {
    gap: 12,
  },

  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(44, 36, 95, 0.9)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 18,
    padding: 12,
  },

  choiceSelected: {
    borderColor: "#FFD86B",
  },

  choiceCorrect: {
    backgroundColor: "rgba(54, 170, 120, 0.25)",
  },

  choiceWrong: {
    backgroundColor: "rgba(255, 100, 100, 0.2)",
  },

  choiceCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255, 216, 107, 0.15)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  choiceLetter: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFD86B",
  },

  choiceText: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
  },
});