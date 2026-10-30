import { useEffect, useState } from "react";

import { listenSubjectsByGradeLevel } from "../services/lessonService";

export const useSubjectsWithLessons = (gradeLevel) => {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  useEffect(() => {
    const cleanGradeLevel = String(gradeLevel || "").trim();

    if (!cleanGradeLevel) {
      setSubjects([]);
      setSubjectsError("Missing grade level.");
      setLoadingSubjects(false);
      return () => {};
    }

    setLoadingSubjects(true);
    setSubjectsError(null);

    const unsubscribe = listenSubjectsByGradeLevel({
      gradeLevel: cleanGradeLevel,

      onSuccess: (data = []) => {
        setSubjects(data);
        setLoadingSubjects(false);
      },

      onError: (error) => {
        console.log("Load subjects with lessons error:", error);

        setSubjects([]);
        setSubjectsError(error?.message || "Failed to load lessons.");
        setLoadingSubjects(false);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, [gradeLevel]);

  return {
    subjects,
    loadingSubjects,
    subjectsError,
    hasSubjects: subjects.length > 0,
  };
};