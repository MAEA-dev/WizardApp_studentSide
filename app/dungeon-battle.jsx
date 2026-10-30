import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BattleScreen from "../components/battle/battleScreen";

export default function DungeonBattleRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BattleScreen onExitBattle={() => router.back()} />
    </SafeAreaView>
  );
}
