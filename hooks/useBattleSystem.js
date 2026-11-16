import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { recordBattleResult } from "../services/battleStatsService";

const DEFAULT_WIZARD = {
  maxHp: 100,
  attack: 20,
};

const DEFAULT_MONSTER = {
  maxHp: 1000,
  attack: 50,
};

const DEFAULT_TIME_LIMIT = 15;

const WIZARD_CAST_DELAY = 350;
const MONSTER_CAST_DELAY = 300;
const NEXT_QUESTION_DELAY = 1000;

// Fisher-Yates (uniform shuffle)
const shuffleArray = (array = []) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const clampPercent = (value) => {
  return Math.max(Math.min(value, 100), 0);
};

export const useBattleSystem = ({
  questions = [],
  wizard = DEFAULT_WIZARD,
  monster = DEFAULT_MONSTER,
  timeLimit = DEFAULT_TIME_LIMIT,
  battleType = "dungeon",
  enemy = "Monster",
  wizardAttackEffect = "waterBlast",
  monsterAttackEffect = "poisonBlast",
  paused = false,
}) => {
  const nextQuestionTimeoutRef = useRef(null);
  const skillEffectTimeoutRef = useRef(null);
  const animationTimeoutsRef = useRef([]);
  const battleIdRef = useRef(
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
  const hasRecordedResultRef = useRef(false);

  // Question "deck": every question is used once before any repeats
  const deckRef = useRef([]);
  const lastQuestionIdRef = useRef(null);

  // Refs so damage math never depends on stale closures or state updaters
  const wizardHpRef = useRef(0);
  const monsterHpRef = useRef(0);
  const answerLockedRef = useRef(false);

  const wizardMaxHp = Number(wizard?.maxHp || DEFAULT_WIZARD.maxHp);
  const wizardAttack = Number(wizard?.attack || DEFAULT_WIZARD.attack);

  const monsterMaxHp = Number(monster?.maxHp || DEFAULT_MONSTER.maxHp);
  const monsterAttack = Number(monster?.attack || DEFAULT_MONSTER.attack);

  const [wizardHp, setWizardHp] = useState(wizardMaxHp);
  const [monsterHp, setMonsterHp] = useState(monsterMaxHp);

  const [wizardAction, setWizardAction] = useState("idle");
  const [monsterAction, setMonsterAction] = useState("idle");

  const [skillEffect, setSkillEffect] = useState(null);
  const [skillEffectTarget, setSkillEffectTarget] = useState("right");

  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [shouldRevealAnswer, setShouldRevealAnswer] = useState(false);

  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [battleMessage, setBattleMessage] = useState(
    "A monster appeared! Answer before the timer runs out."
  );
  const [battleRecordError, setBattleRecordError] = useState(null);

  const battleStatus = useMemo(() => {
    if (monsterHp <= 0) return "won";
    if (wizardHp <= 0) return "lost";
    // Based on the questions list, not currentQuestion, so there is no
    // "No Questions" flash between loading and the first draw.
    if (!Array.isArray(questions) || questions.length === 0) return "noQuestions";

    return "playing";
  }, [monsterHp, wizardHp, questions]);

  const wizardHpPercent = useMemo(() => {
    if (wizardMaxHp <= 0) return 0;
    return clampPercent((wizardHp / wizardMaxHp) * 100);
  }, [wizardHp, wizardMaxHp]);

  const monsterHpPercent = useMemo(() => {
    if (monsterMaxHp <= 0) return 0;
    return clampPercent((monsterHp / monsterMaxHp) * 100);
  }, [monsterHp, monsterMaxHp]);

  const clearNextQuestionTimeout = useCallback(() => {
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
  }, []);

  const clearSkillEffectTimeout = useCallback(() => {
    if (skillEffectTimeoutRef.current) {
      clearTimeout(skillEffectTimeoutRef.current);
      skillEffectTimeoutRef.current = null;
    }
  }, []);

  const clearAnimationTimeouts = useCallback(() => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
  }, []);

  const clearBattleTimeouts = useCallback(() => {
    clearNextQuestionTimeout();
    clearSkillEffectTimeout();
    clearAnimationTimeouts();
  }, [clearNextQuestionTimeout, clearSkillEffectTimeout, clearAnimationTimeouts]);

  const runAfterDelay = useCallback((callback, delay) => {
    const id = setTimeout(() => {
      animationTimeoutsRef.current = animationTimeoutsRef.current.filter(
        (timeoutId) => timeoutId !== id
      );
      callback();
    }, delay);

    animationTimeoutsRef.current.push(id);
  }, []);

  const showSkillEffectAfterDelay = useCallback(
    ({ effectName, target, delay }) => {
      clearSkillEffectTimeout();

      skillEffectTimeoutRef.current = setTimeout(() => {
        setSkillEffect(effectName);
        setSkillEffectTarget(target);
      }, delay);
    },
    [clearSkillEffectTimeout]
  );

  // Draws the next question from a shuffled deck (no repeats until all used,
  // and never the same question twice in a row when the pool allows it).
  const drawQuestion = useCallback(() => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return null;
    }

    if (deckRef.current.length === 0) {
      const deck = shuffleArray(questions);

      if (
        deck.length > 1 &&
        lastQuestionIdRef.current !== null &&
        deck[0].id === lastQuestionIdRef.current
      ) {
        const swapIndex = deck.length - 1;
        [deck[0], deck[swapIndex]] = [deck[swapIndex], deck[0]];
      }

      deckRef.current = deck;
    }

    const next = deckRef.current.shift();
    lastQuestionIdRef.current = next.id ?? null;

    return {
      ...next,
      choices: shuffleArray(next.choices || []),
    };
  }, [questions]);

  const goToNextQuestion = useCallback(() => {
    setCurrentQuestion(drawQuestion());
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    answerLockedRef.current = false;
    setShouldRevealAnswer(false);
    setTimeLeft(timeLimit);

    setWizardAction("idle");
    setMonsterAction("idle");
    setSkillEffect(null);
  }, [drawQuestion, timeLimit]);

  const scheduleNextQuestion = useCallback(() => {
    clearNextQuestionTimeout();

    nextQuestionTimeoutRef.current = setTimeout(() => {
      goToNextQuestion();
    }, NEXT_QUESTION_DELAY);
  }, [clearNextQuestionTimeout, goToNextQuestion]);

  const damageMonster = useCallback(
    (replyText) => {
      const nextHp = Math.max(monsterHpRef.current - wizardAttack, 0);
      monsterHpRef.current = nextHp;
      setMonsterHp(nextHp);

      setWizardAction("attack");
      setMonsterAction("idle");
      setSkillEffect(null);

      showSkillEffectAfterDelay({
        effectName: wizardAttackEffect,
        target: "right",
        delay: WIZARD_CAST_DELAY,
      });

      runAfterDelay(() => {
        setMonsterAction(nextHp <= 0 ? "die" : "hurt");
      }, WIZARD_CAST_DELAY);

      if (nextHp <= 0) {
        setBattleMessage("Correct! Your wizard defeated the monster!");
        return;
      }

      setBattleMessage(
        replyText || "Correct! Your wizard cast a spell at the monster."
      );
      scheduleNextQuestion();
    },
    [
      wizardAttack,
      wizardAttackEffect,
      scheduleNextQuestion,
      showSkillEffectAfterDelay,
      runAfterDelay,
    ]
  );

  const damageWizard = useCallback(
    (message) => {
      const nextHp = Math.max(wizardHpRef.current - monsterAttack, 0);
      wizardHpRef.current = nextHp;
      setWizardHp(nextHp);

      setMonsterAction("attack");
      setWizardAction("idle");
      setSkillEffect(null);

      showSkillEffectAfterDelay({
        effectName: monsterAttackEffect,
        target: "left",
        delay: MONSTER_CAST_DELAY,
      });

      runAfterDelay(() => {
        setWizardAction(nextHp <= 0 ? "die" : "hurt");
      }, MONSTER_CAST_DELAY);

      if (nextHp <= 0) {
        setBattleMessage(message || "The monster defeated your wizard.");
        return;
      }

      setBattleMessage(message || "The monster attacked your wizard.");
      scheduleNextQuestion();
    },
    [
      monsterAttack,
      monsterAttackEffect,
      scheduleNextQuestion,
      showSkillEffectAfterDelay,
      runAfterDelay,
    ]
  );

  const handleAnswer = useCallback(
    (choice) => {
      if (
        !currentQuestion ||
        answerLockedRef.current ||
        isAnswerLocked ||
        battleStatus !== "playing"
      ) {
        return;
      }

      answerLockedRef.current = true;
      setSelectedAnswer(choice);
      setIsAnswerLocked(true);

      const isCorrect = choice === currentQuestion.answer;

      if (isCorrect) {
        setShouldRevealAnswer(true);
        damageMonster(currentQuestion.correctReply);
        return;
      }

      setShouldRevealAnswer(false);
      damageWizard(
        currentQuestion.wrongReply ||
          "Wrong answer! The monster attacked your wizard."
      );
    },
    [
      currentQuestion,
      isAnswerLocked,
      battleStatus,
      damageMonster,
      damageWizard,
    ]
  );

  const handleTimeOut = useCallback(() => {
    if (
      !currentQuestion ||
      answerLockedRef.current ||
      isAnswerLocked ||
      battleStatus !== "playing"
    ) {
      return;
    }

    answerLockedRef.current = true;
    setSelectedAnswer(null);
    setIsAnswerLocked(true);
    setShouldRevealAnswer(true);

    damageWizard("Time's up! The monster attacked your wizard.");
  }, [currentQuestion, isAnswerLocked, battleStatus, damageWizard]);

  const resetBattle = useCallback(() => {
    clearBattleTimeouts();
    battleIdRef.current =
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    hasRecordedResultRef.current = false;
    setBattleRecordError(null);

    deckRef.current = [];
    lastQuestionIdRef.current = null;
    answerLockedRef.current = false;

    wizardHpRef.current = wizardMaxHp;
    monsterHpRef.current = monsterMaxHp;
    setWizardHp(wizardMaxHp);
    setMonsterHp(monsterMaxHp);

    setWizardAction("idle");
    setMonsterAction("idle");

    setSkillEffect(null);
    setSkillEffectTarget("right");

    setCurrentQuestion(drawQuestion());
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setShouldRevealAnswer(false);

    setTimeLeft(timeLimit);

    setBattleMessage(
      questions.length > 0
        ? "A monster appeared! Answer before the timer runs out."
        : "No battle questions found. Ask your teacher to publish lessons first."
    );
  }, [
    clearBattleTimeouts,
    wizardMaxHp,
    monsterMaxHp,
    questions,
    timeLimit,
    drawQuestion,
  ]);

  useEffect(() => {
    if (
      (battleStatus !== "won" && battleStatus !== "lost") ||
      hasRecordedResultRef.current
    ) {
      return;
    }

    hasRecordedResultRef.current = true;

    recordBattleResult({
      result: battleStatus,
      enemy,
      battleType,
      battleId: battleIdRef.current,
    }).catch((error) => {
      console.error("Record battle result error:", error);
      setBattleRecordError(
        error?.message || "Your battle result could not be saved."
      );
    });
  }, [battleStatus, battleType, enemy]);

  useEffect(() => {
    resetBattle();
  }, [resetBattle]);

  useEffect(() => {
    if (
      paused ||
      battleStatus !== "playing" ||
      isAnswerLocked ||
      !currentQuestion
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((currentTime) => currentTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    paused,
    timeLeft,
    battleStatus,
    isAnswerLocked,
    currentQuestion,
    handleTimeOut,
  ]);

  useEffect(() => {
    return () => {
      clearBattleTimeouts();
    };
  }, [clearBattleTimeouts]);

  return {
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
  };
};