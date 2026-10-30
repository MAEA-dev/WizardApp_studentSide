import { useCallback, useEffect, useState } from "react";

import {
  loadStudentCacheFirst,
  syncStudentFromFirebase,
} from "../services/studentDataService";

export const useStudentData = () => {
  const [student, setStudent] = useState(null);
  const [loadingCache, setLoadingCache] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((message, err) => {
    console.log(message, err);
    setError(err?.message || "Something went wrong.");
  }, []);

  const loadStudent = useCallback(async () => {
    setError(null);
    setLoadingCache(true);

    try {
      const cachedStudent = await loadStudentCacheFirst();

      if (cachedStudent) {
        setStudent(cachedStudent);
      }

      setLoadingCache(false);
      setSyncing(true);

      const freshStudent = await syncStudentFromFirebase();

      if (freshStudent) {
        setStudent(freshStudent);
      }

      return freshStudent;
    } catch (err) {
      handleError("Load student data error:", err);
      return null;
    } finally {
      setLoadingCache(false);
      setSyncing(false);
    }
  }, [handleError]);

  const refreshStudent = useCallback(async () => {
    setError(null);
    setSyncing(true);

    try {
      const freshStudent = await syncStudentFromFirebase();

      if (freshStudent) {
        setStudent(freshStudent);
      }

      return freshStudent;
    } catch (err) {
      handleError("Refresh student error:", err);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  return {
    student,
    loadingCache,
    syncing,
    error,

    loadStudent,
    refreshStudent,
    setStudent,
  };
};