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
  ActivityIndicator,
} from "react-native";

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useLoader } from "../../context/LoaderContext"
import { Fonts } from "../../constants/Fonts";
import { prepareStudentAfterLogin } from "../../services/studentDataService";
import {
  loginUsername,
  getAuthErrorMessage
} from "../../services/firebaseAuth"

const LoginScreen = () => {
  const router = useRouter();
  const {showLoader, hideLoader } = useLoader()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Empty field", "Your username is empty.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Empty field", "Your password is empty.");
      return;
    }

    try {
      setLoading(true);
      showLoader("Logging in....")
      await loginUsername({
        username,
        password,
      });

      await prepareStudentAfterLogin()

        
      router.replace("(tabs)/home");
    
      
    } catch (error) {
      Alert.alert("Login failed", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
      hideLoader()
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
              <Text style={styles.subtitle}>Enter your magic classroom</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Login</Text>

              <Text style={styles.label}>Wizard Name</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor="#AFA4D8"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Text style={styles.label}>Magic Key</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#AFA4D8"
                  secureTextEntry={hidePassword}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setHidePassword((prev) => !prev)}
                  disabled={loading}
                >
                  <Text style={styles.showText}>
                    {hidePassword ? "SHOW" : "HIDE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#21103F" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/registerScreen")}
                disabled={loading}
              >
                <Text style={styles.signupText}>
                  No account yet? Create one
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.back()} disabled={loading}>
              <Text style={styles.backText}>Back to welcome</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;

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
    marginBottom: 28,
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
    marginBottom: 24,
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
    marginBottom: 18,
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
    marginBottom: 24,
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

  loginButton: {
    width: "100%",
    backgroundColor: "#FFD86B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 16,
    minHeight: 56,
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  loginButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: "#21103F",
  },

  signupText: {
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