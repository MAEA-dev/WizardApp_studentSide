import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { refreshPvpEnergy } from "../services/pvpEnergyService";

export const usePvpEnergy = ({ countdownEnabled = true } = {}) => {
  const [energyStatus, setEnergyStatus] = useState(null);
  const [now, setNow] = useState(Date.now());
  const refreshInFlight = useRef(false);
  const lastExpiredRefresh = useRef(null);

  const refresh = useCallback(async () => {
    if (refreshInFlight.current) return null;
    refreshInFlight.current = true;
    try {
      const nextStatus = await refreshPvpEnergy();
      setEnergyStatus(nextStatus);
      setNow(Date.now());
      return nextStatus;
    } catch (error) {
      console.warn("Could not refresh PvP Energy:", error);
      return null;
    } finally {
      refreshInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    if (!countdownEnabled) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [countdownEnabled]);

  useEffect(() => {
    const nextAt = energyStatus?.nextEnergyAt;
    if (!countdownEnabled || !nextAt || now < nextAt) return;
    if (lastExpiredRefresh.current === nextAt) return;
    lastExpiredRefresh.current = nextAt;
    refresh();
  }, [countdownEnabled, energyStatus?.nextEnergyAt, now, refresh]);

  const countdown = useMemo(() => {
    if (!energyStatus) return "";
    if (energyStatus.energy >= energyStatus.maxEnergy) return "FULL";
    const remainingMs = Math.max(0, (energyStatus.nextEnergyAt || now) - now);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [energyStatus, now]);

  const applyEnergy = useCallback((nextStatus) => {
    setEnergyStatus((current) => current ? { ...current, ...nextStatus } : nextStatus);
    setNow(Date.now());
  }, []);

  return { energyStatus, countdown, refresh, applyEnergy };
};
