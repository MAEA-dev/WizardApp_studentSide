import { useCallback, useEffect, useRef, useState } from "react";

import { getLeaderboardForMode } from "../services/leaderboardService";
import {
  getCurrentUserUid,
  watchCurrentUserUid,
} from "../services/firebaseAuth";

export const useLeaderboard = () => {
  const [mode, setMode] = useState("overall");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const loadLeaderboard = useCallback(async (uid, selectedMode = mode) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      if (!uid) {
        throw new Error("Sign in to view the leaderboard.");
      }

      const results = await getLeaderboardForMode(selectedMode);
      if (requestId === requestIdRef.current) {
        setLeaderboard(results);
      }
    } catch (loadError) {
      console.error("Load leaderboard error:", loadError);
      if (requestId === requestIdRef.current) {
        setLeaderboard([]);
        setError(loadError?.message || "Failed to load the leaderboard.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    let active = true;
    const unsubscribe = watchCurrentUserUid((uid) => {
      if (active) {
        loadLeaderboard(uid, mode);
      }
    });

    return () => {
      active = false;
      requestIdRef.current += 1;
      unsubscribe();
    };
  }, [loadLeaderboard, mode]);

  const refresh = useCallback(async () => {
    await loadLeaderboard(getCurrentUserUid(), mode);
  }, [loadLeaderboard, mode]);

  return {
    leaderboard,
    loading,
    error,
    refresh,
    mode,
    setMode,
  };
};
