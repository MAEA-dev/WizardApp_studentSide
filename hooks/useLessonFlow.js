import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_MODAL = {
  visible: false,
  title: "Wizard Guide",
  message: "",
  type: "default",
  action: null,
};

const MODAL_ACTIONS = {
  GO_NEXT: "goNext",
};

const QUESTION_REWARD = {
  xp: 50,
  gold: 25,
};

const getLessonSteps = (lesson) => {
  return (
    lesson?.interactiveSteps ||
    lesson?.aiLesson?.interactiveSteps ||
    lesson?.steps ||
    []
  );
};

const getIntroMessage = (lesson) => {
  return (
    lesson?.introMessage ||
    lesson?.aiLesson?.introMessage ||
    "Welcome, young wizard! Let us begin this lesson."
  );
};

const getCorrectReply = (step) => {
  return step?.correctReply || "Correct! Great job.";
};

const getWrongReply = (step) => {
  return step?.wrongReply || "Not quite. Try to remember the clue.";
};

const getQuestionCount = (steps) => {
  return steps.filter((step) => step.type === "ask").length;
};

const buildCorrectMessage = ({ step, rewardEnabled }) => {
  const message = getCorrectReply(step);

  if (!rewardEnabled) {
    return message;
  }

  return `${message}\n\n+${QUESTION_REWARD.xp} XP  +${QUESTION_REWARD.gold} Gold`;
};

const buildAnswerDetails = ({ steps, selectedAnswers }) => {
  return steps
    .map((step, stepIndex) => {
      if (step?.type !== "ask") return null;

      const selectedAnswer = selectedAnswers[stepIndex] || "";

      if (!selectedAnswer) return null;

      const correctAnswer = step.answer || "";
      const isCorrect = selectedAnswer === correctAnswer;

      return {
        stepIndex,
        question: step.question || "",
        selectedAnswer,
        correctAnswer,
        isCorrect,
        result: isCorrect ? "correct" : "wrong",
      };
    })
    .filter(Boolean);
};

export const useLessonFlow = (lesson, options = {}) => {
  const {
    onLessonComplete,
    rewardEnabled = true,
  } = options;

  const completionHandledRef = useRef(false);
  const lessonStartedAtRef = useRef(Date.now());

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [earnedReward, setEarnedReward] = useState({
    xp: 0,
    gold: 0,
  });
  const [completionResult, setCompletionResult] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [wizardModal, setWizardModal] = useState(DEFAULT_MODAL);

  const steps = useMemo(() => getLessonSteps(lesson), [lesson]);

  const totalSteps = steps.length;

  const totalQuestions = useMemo(() => {
    return getQuestionCount(steps);
  }, [steps]);

  const currentStep = steps[currentStepIndex] || null;
  const selectedAnswer = selectedAnswers[currentStepIndex];

  const isQuestionStep = currentStep?.type === "ask";
  const isLastStep = totalSteps > 0 && currentStepIndex === totalSteps - 1;
  const canGoNext = !isQuestionStep || !!selectedAnswer;

  const correctAnswers = useMemo(() => {
    return Object.entries(selectedAnswers).reduce((total, [index, answer]) => {
      const step = steps[Number(index)];

      if (step?.type === "ask" && answer === step.answer) {
        return total + 1;
      }

      return total;
    }, 0);
  }, [selectedAnswers, steps]);

  const answerDetails = useMemo(() => {
    return buildAnswerDetails({
      steps,
      selectedAnswers,
    });
  }, [steps, selectedAnswers]);

  const progress = useMemo(() => {
    if (!totalSteps) return 0;

    return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  }, [currentStepIndex, totalSteps]);

  const openWizardModal = useCallback(
    ({ title, message, type = "default", action = null }) => {
      setWizardModal({
        visible: true,
        title,
        message,
        type,
        action,
      });
    },
    []
  );

  const resetLessonFlow = useCallback(() => {
    completionHandledRef.current = false;
    lessonStartedAtRef.current = Date.now();

    setCurrentStepIndex(0);
    setSelectedAnswers({});
    setEarnedReward({
      xp: 0,
      gold: 0,
    });
    setCompletionResult(null);
    setShowSummary(false);

    setWizardModal({
      visible: true,
      title: "Wizard Guide",
      message: getIntroMessage(lesson),
      type: "default",
      action: null,
    });
  }, [lesson]);

  useEffect(() => {
    if (!lesson) return;

    resetLessonFlow();
  }, [lesson?.id, resetLessonFlow]);

  const completeLesson = useCallback(async () => {
    if (completionHandledRef.current) return;

    completionHandledRef.current = true;

    let result = null;

    try {
      result = await onLessonComplete?.({
        lesson,
        earnedReward: rewardEnabled ? earnedReward : { xp: 0, gold: 0 },
        correctAnswers,
        totalQuestions,
        answerDetails,
        durationSeconds: Math.max(
          1,
          Math.round((Date.now() - lessonStartedAtRef.current) / 1000)
        ),
      });
    } catch (error) {
      console.log("Lesson completion error:", error);
    }

    setCompletionResult(result || null);
    setShowSummary(true);
  }, [
    lesson,
    earnedReward,
    correctAnswers,
    totalQuestions,
    answerDetails,
    onLessonComplete,
    rewardEnabled,
  ]);

  const moveToNextStep = useCallback(async () => {
    if (!totalSteps) return;

    if (isLastStep) {
      await completeLesson();
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
  }, [totalSteps, isLastStep, completeLesson]);

  const closeWizardModal = useCallback(() => {
    const modalAction = wizardModal.action;

    setWizardModal((prev) => ({
      ...prev,
      visible: false,
      action: null,
    }));

    if (modalAction === MODAL_ACTIONS.GO_NEXT) {
      moveToNextStep();
    }
  }, [wizardModal.action, moveToNextStep]);

  const goToNextStep = useCallback(() => {
    if (!currentStep) return;

    if (!canGoNext) {
      openWizardModal({
        title: "Answer First",
        message: "Choose an answer before moving to the next lesson step.",
        type: "default",
        action: null,
      });

      return;
    }

    moveToNextStep();
  }, [currentStep, canGoNext, openWizardModal, moveToNextStep]);

  const handleAnswer = useCallback(
    (choice) => {
      if (!isQuestionStep || selectedAnswer) return;

      const isCorrect = choice === currentStep.answer;

      setSelectedAnswers((prev) => ({
        ...prev,
        [currentStepIndex]: choice,
      }));

      if (!isCorrect) {
        openWizardModal({
          title: "Try Again",
          message: getWrongReply(currentStep),
          type: "wrong",
          action: MODAL_ACTIONS.GO_NEXT,
        });

        return;
      }

      if (rewardEnabled) {
        setEarnedReward((prev) => ({
          xp: prev.xp + QUESTION_REWARD.xp,
          gold: prev.gold + QUESTION_REWARD.gold,
        }));
      }

      openWizardModal({
        title: "Correct!",
        message: buildCorrectMessage({
          step: currentStep,
          rewardEnabled,
        }),
        type: "success",
        action: MODAL_ACTIONS.GO_NEXT,
      });
    },
    [
      isQuestionStep,
      selectedAnswer,
      currentStep,
      currentStepIndex,
      openWizardModal,
      rewardEnabled,
    ]
  );

  return {
    steps,

    currentStep,
    currentStepIndex,
    totalSteps,

    selectedAnswer,
    selectedAnswers,

    earnedReward,
    completionResult,
    correctAnswers,
    totalQuestions,
    answerDetails,

    showSummary,
    wizardModal,

    progress,
    canGoNext,
    isLastStep,
    isQuestionStep,

    goToNextStep,
    handleAnswer,
    closeWizardModal,
  };
};