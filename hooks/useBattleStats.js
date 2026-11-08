import { useCallback, useEffect, useRef, useState } from "react";

import {
  getBattleHistory,
  getBattleStatistics,
} from "../services/battleStatsService";
import {
  getCurrentUserUid,
  watchCurrentUserUid,
} from "../services/firebaseAuth";

const EMPTY_CATEGORY_STATS = {
  wins: 0,
  losses: 0,
  totalBattles: 0,
  winRate: 0,
};

const EMPTY_STATS = {
  overall: EMPTY_CATEGORY_STATS,
  pve: EMPTY_CATEGORY_STATS,
  pvp: EMPTY_CATEGORY_STATS,
};

export const useBattleStats = ({ enabled = true } = {}) => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const loadBattleStats = useCallback(async (uid) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const [freshStats, freshHistory] = await Promise.all([
        getBattleStatistics(uid),
        getBattleHistory(uid),
      ]);

      if (requestId === requestIdRef.current) {
        setStats(freshStats);
        setHistory(freshHistory);
      }
    } catch (loadError) {
      console.error("Load battle statistics error:", loadError);

      if (requestId === requestIdRef.current) {
        setError(loadError?.message || "Failed to load battle statistics.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const unsubscribe = watchCurrentUserUid((uid) => {
      if (!active) {
        return;
      }

      if (!uid) {
        requestIdRef.current += 1;
        setStats(EMPTY_STATS);
        setHistory([]);
        setError("Sign in to view battle statistics.");
        setLoading(false);
        return;
      }

      loadBattleStats(uid);
    });

    return () => {
      active = false;
      requestIdRef.current += 1;
      unsubscribe();
    };
  }, [enabled, loadBattleStats]);

  const refresh = useCallback(async () => {
    const uid = getCurrentUserUid();

    if (!uid) {
      setError("Sign in to view battle statistics.");
      return;
    }

    await loadBattleStats(uid);
  }, [loadBattleStats]);

  return {
    overallStats: stats.overall,
    pveStats: stats.pve,
    pvpStats: stats.pvp,
    ...stats,
    history,
    loading,
    error,
    refresh,
  };
};
