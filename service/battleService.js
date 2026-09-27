import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "./firebaseConfig";

const shuffleArray = (array = []) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const normalizeGradeLevel = (value) => {
  return String(value || "").trim();
};

const normalizeQuestion = ({ question, parentData, parentId, index }) => {
  return {
    id: `${parentId}_${index}`,

    question: String(question.question || "").trim(),
    questionType: question.questionType || "multiple_choice",

    choices: Array.isArray(question.choices)
      ? question.choices.map((choice) => String(choice || "").trim()).filter(Boolean)
      : [],

    answer: String(question.answer || "").trim(),

    correctReply: String(question.correctReply || "").trim(),
    wrongReply: String(question.wrongReply || "").trim(),

    order: question.order || index + 1,

    lessonId: parentData.lessonId || parentId,
    lessonTitle: parentData.lessonTitle || "Lesson",
    subjectId: parentData.subjectId || "",
    subjectName: parentData.subjectName || "",
    gradeLevel: parentData.gradeLevel || "",
  };
};

export const getBattleQuestionsByGrade = async (gradeLevel) => {
  const cleanGradeLevel = normalizeGradeLevel(gradeLevel);

  if (!cleanGradeLevel) {
    return [];
  }

  const battleQuery = query(
    collection(db, "questions"),
    where("gradeLevel", "==", cleanGradeLevel),
    where("purpose", "==", "battle_quiz"),
    where("isPublished", "==", true),
    limit(20)
  );

  const snapshot = await getDocs(battleQuery);

  const questions = snapshot.docs.flatMap((docSnap) => {
    const data = docSnap.data();

    if (!Array.isArray(data.questions)) {
      return [];
    }

    return data.questions
      .map((question, index) =>
        normalizeQuestion({
          question,
          parentData: data,
          parentId: docSnap.id,
          index,
        })
      )
      .filter((question) => {
        return (
          question.question &&
          question.answer &&
          question.choices.length >= 2 &&
          question.choices.includes(question.answer)
        );
      });
  });

  return shuffleArray(questions);
};