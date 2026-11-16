import {
  Alert,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Fonts } from "../constants/Fonts";
import { auth } from "../services/firebaseConfig";
import { prepareStudentAfterLogin } from "../services/studentDataService";
import WizardMessageModal from "../components/shared/wizardMessageModal";

export default function Index() {
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            await prepareStudentAfterLogin();
            if (active) router.replace("/(tabs)/home");
          } catch (error) {
            const stillSignedIn = auth.currentUser?.uid === user.uid;
            if (stillSignedIn) await signOut(auth).catch(() => {});
            if (active) {
              router.replace("/(auth)/loginScreen");
              if (stillSignedIn) {
                Alert.alert(
                  "Connection required",
                  error?.message ||
                    "Connect to the internet before entering the app."
                );
              }
            }
          }
          return;
        }

        if (active) setAuthChecking(false);
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        if (active) setAuthChecking(false);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  const tutorialMessages = [
    {
      title: "Welcome, Young Wizard!",
      message:
        "I will guide you through your magical learning journey. Let me show you how the game works.",
    },
    {
      title: "Choose a Subject",
      message:
        "Start by choosing a subject like Math, Science, English, or Filipino. Each subject contains magical lessons.",
    },
    {
      title: "Complete Lessons",
      message:
        "Read  and complete lessons to prove your wizard skills.",
    },
    
      {
        title: "Earn XP",
        message:
        "XP is like magic points for learning. You collect XP by finishing lessons.\n\nWhen you collect enough XP, your wizard levels up and becomes stronger!",
      },
    
    {
      title: "Wizard Stats",
      message:
         "Your wizard has Power, and HP .\n\n ⚡ Power - makes your wizard stronger.\n❤️ HP - helps your wizard stay in the game longer.\n\nWhen your wizard levels up , all of these stats increase!",},
    {
      title: "Ready to Begin?",
      message:
        "Your magical classroom is waiting. Tap ENTER and begin your adventure.",
    },
  ];

  const currentTutorial = tutorialMessages[tutorialStep];

  const handleStartLearning = () => {
    setTutorialStep(0);
    setModalVisibility(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialMessages.length - 1) {
      setTutorialStep((prev) => prev + 1);
      return;
    }

    setModalVisibility(false);
    router.replace("/(auth)/loginScreen");
  };

  if (authChecking) {
    return (
      <View style={styles.authLoading}>
        <ActivityIndicator size="large" color="#FFD86B" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/landScreenBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.appName}>WIZARD</Text>

          <Text style={styles.tagline}>
            Learn, play, and complete magical lessons.
          </Text>

          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>Welcome, Young Wizard!</Text>

            <Text style={styles.tutorialText}>
              Choose your subject, finish lessons, earn XP, and level up your
              magic skills.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartLearning}
          >
            <Text style={styles.primaryButtonText}>START LEARNING</Text>
          </TouchableOpacity>
        </View>
      </View>

      <WizardMessageModal
        visible={modalVisibility}
        onClose={handleTutorialNext}
        title={currentTutorial.title}
        message={currentTutorial.message}
        buttonText={
          tutorialStep === tutorialMessages.length - 1 ? "ENTER" : "NEXT"
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  authLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#130B2B",
  },

  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 11, 43, 0.55)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  appName: {
    fontFamily: Fonts.pixel,
    fontSize: 35,
    color: "#FFD86B",
    letterSpacing: 2,
    marginBottom: 12,
  },

  tagline: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: "#E8DFFF",
    textAlign: "center",
    marginBottom: 24,
  },

  tutorialCard: {
    width: "100%",
    backgroundColor: "rgba(36, 22, 74, 0.88)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
  },

  tutorialTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: "#FFD86B",
    textAlign: "center",
    marginBottom: 10,
  },

  tutorialText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#FFD86B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 4,
  },

  primaryButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: "#21103F",
  },
});
