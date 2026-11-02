import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  sampleDailyTask,
  homeMenuItems,
} from "../data/homeData";

import { useStudentData } from "./useStudentData";

const getExpPercent = (student) => {
  const xp = Number(student?.xp || 0);
  const maxXp = Number(student?.maxXp || 0);

  if (maxXp <= 0) return 0;

  return Math.min((xp / maxXp) * 100, 100);
};

const buildStats = (student) => {
  return [
    {
      id: "hp",
      label: "HP",
      value: student?.hp ?? 0,
      icon: "❤️",
      type: "hp",
    },
    {
      id: "power",
      label: "POWER",
      value: student?.power ?? 0,
      icon: "⚡",
      type: "power",
    },
    {
      id: "energy",
      label: "ENERGY",
      value: student?.energy ?? 0,
      icon: "🔋",
      type: "energy",
    },
  ];
};

export const useHomeData = () => {
  const {
    student,
    loading,
    loadingCache,
    syncing,
    error,
    refreshStudent,
    setStudent,
  } = useStudentData();

  useFocusEffect(
    useCallback(() => {
      refreshStudent();
    }, [refreshStudent])
  );

  const isLoading = loadingCache ?? loading;

  const dailyTask = sampleDailyTask;
  const menuItems = homeMenuItems;

  const expPercent = getExpPercent(student);
  const stats = buildStats(student);

  return {
    student,

    dailyTask,
    menuItems,
    stats,
    expPercent,

    level: student?.level ?? 1,
    xp: student?.xp ?? 0,
    maxXp: student?.maxXp ?? 150,
    gold: student?.gold ?? 0,
    statPoints: student?.statPoints ?? 0,
    streak: student?.streak ?? 0,

    loadingCache: isLoading,
    syncing,
    error,
    refreshStudent,
    setStudent,

    isHomeReady: !!student && !isLoading,
  };
};