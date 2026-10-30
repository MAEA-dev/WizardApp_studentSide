import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Fonts } from "../../constants/Fonts";

import { useLoader } from "../../context/LoaderContext";

import {
  createUser,
  getAuthErrorMessage,
} from "../../services/firebaseAuth";

const RegisterScreen = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const handleRegister = async () => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername) {
      Alert.alert("Missing field", "Please enter your wizard name.");
      return;
    }

    if (cleanUsername.length < 3) {
      Alert.alert("Invalid username", "Username must be at least 3 characters.");
      return;
    }

    if (!cleanEmail) {
      Alert.alert("Missing field", "Please enter your Gmail or email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!firstname.trim()) {
      Alert.alert("Missing field", "Please enter your first name.");
      return;
    }

    if (!lastname.trim()) {
      Alert.alert("Missing field", "Please enter your last name.");
      return;
    }

    if (!gradeLevel) {
      Alert.alert("Missing field", "Please select your grade level.");
      return;
    }

    if (!password) {
      Alert.alert("Missing field", "Please enter your magic key.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Your magic keys do not match.");
      return;
    }

    try {
      showLoader("Creating your wizard account...");

      const user = await createUser({
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: "student",
        profile: {
          firstName: firstname.trim(),
          lastName: lastname.trim(),
          grade: gradeLevel,
        },
      });

      if (user?.success) {
        Alert.alert("Success", "Account created successfully. You can now login.", [
          {
            text: "OK",
            onPress: () => router.replace("/loginScreen"),
          },
        ]);
      }
    } catch (error) {
      console.log("REGISTER CODE:", error.code);
      console.log("REGISTER MESSAGE:", error.message);
      console.log("REGISTER DETAILS:", error.details);

      Alert.alert("Signup Failed", getAuthErrorMessage(error));
    } finally {
      hideLoader();
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/landScreenBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.appName}>WIZARD</Text>
              <Text style={styles.subtitle}>Create your wizard account</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Register</Text>

              <Text style={styles.label}>Wizard Name</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#AFA4D8"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={styles.label}>Gmail / Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your Gmail or email"
                placeholderTextColor="#AFA4D8"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    value={firstname}
                    onChangeText={setFirstname}
                    placeholder="First name"
                    placeholderTextColor="#AFA4D8"
                    style={styles.input}
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    value={lastname}
                    onChangeText={setLastname}
                    placeholder="Last name"
                    placeholderTextColor="#AFA4D8"
                    style={styles.input}
                  />
                </View>
              </View>

              <Text style={styles.label}>Grade Level</Text>
              <View style={styles.gradeContainer}>
                {["4", "5", "6"].map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    activeOpacity={0.85}
                    style={[
                      styles.gradeButton,
                      gradeLevel === grade && styles.gradeButtonActive,
                    ]}
                    onPress={() => setGradeLevel(grade)}
                  >
                    <Text
                      style={[
                        styles.gradeButtonText,
                        gradeLevel === grade && styles.gradeButtonTextActive,
                      ]}
                    >
                      Grade {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Magic Key</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create password"
                  placeholderTextColor="#AFA4D8"
                  secureTextEntry={hidePassword}
                  style={styles.passwordInput}
                />

                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                  <Text style={styles.showText}>
                    {hidePassword ? "SHOW" : "HIDE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Magic Key</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor="#AFA4D8"
                  secureTextEntry={hideConfirmPassword}
                  style={styles.passwordInput}
                />

                <TouchableOpacity
                  onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                >
                  <Text style={styles.showText}>
                    {hideConfirmPassword ? "SHOW" : "HIDE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.registerButton}
                onPress={handleRegister}
              >
                <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/loginScreen")}>
                <Text style={styles.loginText}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backText}>Back to welcome</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 11, 43, 0.62)",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  appName: {
    fontFamily: Fonts.pixel,
    fontSize: 34,
    color: "#FFD86B",
    letterSpacing: 2,
    marginBottom: 12,
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: "#E8DFFF",
    textAlign: "center",
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(36, 22, 74, 0.92)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },

  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: "#FFD86B",
    textAlign: "center",
    marginBottom: 22,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  halfInput: {
    flex: 1,
  },

  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
  },

  gradeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  gradeButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },

  gradeButtonActive: {
    backgroundColor: "#FFD86B",
    borderColor: "#FFFFFF",
  },

  gradeButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
  },

  gradeButtonTextActive: {
    color: "#21103F",
  },

  passwordContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: "#FFFFFF",
  },

  showText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFD86B",
    marginLeft: 10,
  },

  registerButton: {
    width: "100%",
    backgroundColor: "#FFD86B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginTop: 8,
    marginBottom: 16,
  },

  registerButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: "#21103F",
  },

  loginText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#E8DFFF",
    textAlign: "center",
  },

  backText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#CFC3FF",
    textAlign: "center",
  },
});