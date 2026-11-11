import {
  StyleSheet,
  ImageBackground,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { Fonts } from "../../constants/Fonts";

import { useHomeLayout } from "../../hooks/useHomeLayout";
import { useHomeData } from "../../hooks/useHomeData";

import HomeHeader from "../../components/home/HomeHeader";
import ExpProgressCard from "../../components/home/ExpProgressCard";
import StatsRow from "../../components/home/StatsRow";
import WizardAvatar from "../../components/home/WizardAvatar";
import DailyTaskCard from "../../components/home/DailyTaskCard";
import HomeMenu from "../../components/home/HomeMenu";
import HomeMenuModal from "../../components/home/menuModal/HomeMenuModal";
import WizardMessage from "../../components/shared/wizardModal";
import HomeStatAllocationModal from "../../components/home/HomeStatAllocationModal";
import { getTodayKey } from "../../services/dailyStreakService";

import { markDailyRewardModalSeen } from "../../services/lessonCompletionService";

const Home = () => {
  const router = useRouter();
  const layout = useHomeLayout();

  const {
    student,

    dailyTask,
    menuItems,

    level,
    xp,
    maxXp,
    statPoints,
    streak,
    expPercent,
    stats,

    syncing,
    error,
    refreshStudent,
    setStudent,
    isHomeReady,
  } = useHomeData();

  const [activeMenuModal, setActiveMenuModal] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);

  useEffect(() => {
    if (!isHomeReady || !student) return;

    const todayKey = getTodayKey();

    const receivedDailyRewardToday =
      student.lastLessonRewardDate === todayKey;

    const alreadySawDailyRewardModal =
      student.lastDailyRewardModalDate === todayKey;

    if (receivedDailyRewardToday && !alreadySawDailyRewardModal) {
      setShowDailyRewardModal(true);
    }
  }, [isHomeReady, student]);

  useEffect(() => {
    if (!isHomeReady) return;

    if (statPoints > 0) {
      setShowStatModal(true);
    }
  }, [isHomeReady, statPoints]);

  const handleDailyTaskPress = () => {
    router.push("/lessons");
  };

  const handleMenuPress = (item) => {
    setActiveMenuModal(item.id);
  };

  const closeMenuModal = () => {
    setActiveMenuModal(null);
  };

  const handleCloseDailyRewardModal = async () => {
    try {
      setShowDailyRewardModal(false);

      await markDailyRewardModalSeen();
      await refreshStudent();
    } catch (err) {
      console.log("Close daily reward modal error:", err);
    }
  };

  const handleCloseStatModal = async () => {
    setShowStatModal(false);
    await refreshStudent();
  };

  const handleStudentUpdated = async () => {
    await refreshStudent();
  };

  return (
    <ImageBackground
      source={require("../../assets/images/homeScreenBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {!isHomeReady ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FFD86B" />

            <Text style={styles.loadingTitle}>Loading Wizard Data</Text>

            <Text style={styles.loadingText}>
              {error
                ? "Something went wrong while loading your data."
                : "Preparing your progress..."}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.container,
              {
                padding: layout.screenPadding,
                paddingBottom: layout.screenBottomPadding,
              },
            ]}
          >
            <HomeHeader student={student} layout={layout} />

            <ExpProgressCard
              xp={xp}
              maxXp={maxXp}
              expPercent={expPercent}
            />

            {statPoints > 0 && (
              <View style={styles.statPointNotice}>
                <Text style={styles.statPointText}>
                  You have {statPoints} unused stat points.
                </Text>
              </View>
            )}

            <StatsRow stats={stats} layout={layout} />

            <WizardAvatar
              avatarId={student?.equippedSkin}
                scale={layout.wizardScale}
              />

            <DailyTaskCard
              task={dailyTask}
              layout={layout}
              onPress={handleDailyTaskPress}
            />

            <HomeMenu
              items={menuItems}
              layout={layout}
              onMenuPress={handleMenuPress}
            />

            {syncing && (
              <Text style={styles.syncText}>Syncing latest progress...</Text>
            )}
          </View>

          <HomeMenuModal
            visible={!!activeMenuModal}
            type={activeMenuModal}
            onClose={closeMenuModal}
            student={student}
            onStudentUpdated={setStudent}
          />

          <WizardMessage
            visible={showDailyRewardModal}
            title="Daily Lesson Reward!"
            message={`Great job! You finished your first lesson today.\n\n+30 XP  +20 Gold\n🔥 Streak: ${streak} day${
              streak === 1 ? "" : "s"
            }`}
            type="complete"
            buttonText="CLAIM"
            onClose={handleCloseDailyRewardModal}
          />

          <HomeStatAllocationModal
            visible={!showDailyRewardModal && showStatModal}
            level={level}
            statPoints={statPoints}
            onClose={handleCloseStatModal}
            onStudentUpdated={handleStudentUpdated}
          />
        </>
      )}
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "rgba(19, 11, 43, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "rgba(25, 20, 58, 0.96)",
    borderWidth: 3,
    borderColor: "#FFD86B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  loadingTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: "#FFD86B",
    marginTop: 16,
    marginBottom: 6,
    textAlign: "center",
  },

  loadingText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#EDE7FF",
    textAlign: "center",
    lineHeight: 19,
  },

  statPointNotice: {
    backgroundColor: "rgba(255, 216, 107, 0.16)",
    borderWidth: 1.5,
    borderColor: "#FFD86B",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  statPointText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
    textAlign: "center",
  },

  syncText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: "#FFD86B",
    textAlign: "center",
    marginTop: 6,
  },
});
