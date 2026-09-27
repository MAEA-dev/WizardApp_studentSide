import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const shuffleArray = (array = []) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const getRandomQuestion = (questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];

  return {
    ...question,
    choices: shuffleArray(question.choices || []),
  };
};

const clampPercent = (value) => {
  return Math.max(Math.min(value, 100), 0);
};

export const useBattleSystem = ({
  questions = [],
  wizard = DEFAULT_WIZARD,
  monster = DEFAULT_MONSTER,
  timeLimit = DEFAULT_TIME_LIMIT,
}) => {
  const nextQuestionTimeoutRef = useRef(null);
  const skillEffectTimeoutRef = useRef(null);

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

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getRandomQuestion(questions)
  );

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [shouldRevealAnswer, setShouldRevealAnswer] = useState(false);

  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [battleMessage, setBattleMessage] = useState(
    "A monster appeared! Answer before the timer runs out."
  );

  const battleStatus = useMemo(() => {
    if (monsterHp <= 0) return "won";
    if (wizardHp <= 0) return "lost";
    if (!currentQuestion) return "noQuestions";

    return "playing";
  }, [monsterHp, wizardHp, currentQuestion]);

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

  const clearBattleTimeouts = useCallback(() => {
    clearNextQuestionTimeout();
    clearSkillEffectTimeout();
  }, [clearNextQuestionTimeout, clearSkillEffectTimeout]);

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

  const goToRandomQuestion = useCallback(() => {
    setCurrentQuestion(getRandomQuestion(questions));
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setShouldRevealAnswer(false);
    setTimeLeft(timeLimit);

    setWizardAction("idle");
    setMonsterAction("idle");
    setSkillEffect(null);
  }, [questions, timeLimit]);

  const scheduleNextQuestion = useCallback(() => {
    clearNextQuestionTimeout();

    nextQuestionTimeoutRef.current = setTimeout(() => {
      goToRandomQuestion();
    }, NEXT_QUESTION_DELAY);
  }, [clearNextQuestionTimeout, goToRandomQuestion]);

  const damageMonster = useCallback(() => {
    setWizardAction("attack");
    setMonsterAction("idle");
    setSkillEffect(null);

    showSkillEffectAfterDelay({
      effectName: "waterBlast",
      target: "right",
      delay: WIZARD_CAST_DELAY,
    });

    setMonsterHp((currentHp) => {
      const nextHp = Math.max(currentHp - wizardAttack, 0);

      setTimeout(() => {
        if (nextHp <= 0) {
          setMonsterAction("die");
        } else {
          setMonsterAction("hurt");
        }
      }, WIZARD_CAST_DELAY);

      if (nextHp <= 0) {
        setBattleMessage("Correct! Your wizard defeated the monster!");
        return nextHp;
      }

      setBattleMessage("Correct! Your wizard cast a spell at the monster.");
      scheduleNextQuestion();

      return nextHp;
    });
  }, [wizardAttack, scheduleNextQuestion, showSkillEffectAfterDelay]);

  const damageWizard = useCallback(
    (message) => {
      setMonsterAction("attack");
      setWizardAction("idle");
      setSkillEffect(null);

      showSkillEffectAfterDelay({
        effectName: "poisonBlast",
        target: "left",
        delay: MONSTER_CAST_DELAY,
      });

      setWizardHp((currentHp) => {
        const nextHp = Math.max(currentHp - monsterAttack, 0);

        setTimeout(() => {
          if (nextHp <= 0) {
            setWizardAction("die");
          } else {
            setWizardAction("hurt");
          }
        }, MONSTER_CAST_DELAY);

        if (nextHp <= 0) {
          setBattleMessage(message || "The monster defeated your wizard.");
          return nextHp;
        }

        setBattleMessage(message || "The monster attacked your wizard.");
        scheduleNextQuestion();

        return nextHp;
      });
    },
    [monsterAttack, scheduleNextQuestion, showSkillEffectAfterDelay]
  );

  const handleAnswer = useCallback(
    (choice) => {
      if (!currentQuestion || isAnswerLocked || battleStatus !== "playing") {
        return;
      }

      setSelectedAnswer(choice);
      setIsAnswerLocked(true);

      const isCorrect = choice === currentQuestion.answer;

      if (isCorrect) {
        setShouldRevealAnswer(true);
        damageMonster();
        return;
      }

      setShouldRevealAnswer(false);
      damageWizard("Wrong answer! The monster attacked your wizard.");
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
    if (!currentQuestion || isAnswerLocked || battleStatus !== "playing") {
      return;
    }

    setSelectedAnswer(null);
    setIsAnswerLocked(true);
    setShouldRevealAnswer(true);

    damageWizard("Time's up! The monster attacked your wizard.");
  }, [currentQuestion, isAnswerLocked, battleStatus, damageWizard]);

  const resetBattle = useCallback(() => {
    clearBattleTimeouts();

    setWizardHp(wizardMaxHp);
    setMonsterHp(monsterMaxHp);

    setWizardAction("idle");
    setMonsterAction("idle");

    setSkillEffect(null);
    setSkillEffectTarget("right");

    setCurrentQuestion(getRandomQuestion(questions));
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
  ]);

  useEffect(() => {
    resetBattle();
  }, [resetBattle]);

  useEffect(() => {
    if (battleStatus !== "playing" || isAnswerLocked) {
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
  }, [timeLeft, battleStatus, isAnswerLocked, handleTimeOut]);

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

    handleAnswer,
    resetBattle,
  };
};