import { useEffect, useState } from "react";

import { listenLessonById } from "../services/lessonService";

export const useFirebaseLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState(null);

  useEffect(() => {
    if (!lessonId) {
      setLesson(null);
      setLessonError("Missing lesson id.");
      setLoadingLesson(false);
      return;
    }

    setLoadingLesson(true);
    setLessonError(null);

    const unsubscribe = listenLessonById({
      lessonId,
      onSuccess: (lessonData) => {
        setLesson(lessonData);
        setLoadingLesson(false);
      },
      onError: (error) => {
        console.log("Load lesson error:", error);
        setLessonError(error?.message || "Failed to load lesson.");
        setLoadingLesson(false);
      },
    });

    return unsubscribe;
  }, [lessonId]);

  return {
    lesson,
    loadingLesson,
    lessonError,
  };
};