import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useState } from "react";
import { Fonts } from "../../constants/Fonts";
import { useLoader } from "../../context/LoaderContext";
import {
  getAuthErrorMessage,
  loginUsername,
  sendPasswordResetForIdentifier,
} from "../../services/firebaseAuth";
import { prepareStudentAfterLogin } from "../../services/studentDataService";

const LoginScreen = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetError, setResetError] = useState("");

  const handleLogin = async () => {
    if (loading || resettingPassword) return;

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
      showLoader("Logging in....");
      await loginUsername({
        username,
        password,
      });

      await prepareStudentAfterLogin();

      router.replace("(tabs)/home");
    } catch (error) {
      Alert.alert("Login failed", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const openPasswordReset = () => {
    setResetIdentifier("");
    setResetError("");
    setResetModalVisible(true);
  };

  const handlePasswordReset = async () => {
    if (resettingPassword) return;

    if (!resetIdentifier.trim()) {
      setResetError("Enter your email address or username.");
      return;
    }

    setResetError("");
    try {
      setResettingPassword(true);
      await sendPasswordResetForIdentifier(resetIdentifier);
      setResetModalVisible(false);
      Alert.alert(
        "Password reset email sent",
        "If the account exists, password reset instructions have been sent to its email address."
      );
    } catch (error) {
      setResetError(getAuthErrorMessage(error));
    } finally {
      setResettingPassword(false);
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
                editable={!loading && !resettingPassword}
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
                  editable={!loading && !resettingPassword}
                />

                <TouchableOpacity
                  onPress={() => setHidePassword((prev) => !prev)}
                  disabled={loading || resettingPassword}
                >
                  <Text style={styles.showText}>
                    {hidePassword ? "SHOW" : "HIDE"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={openPasswordReset}
                disabled={loading}
                accessibilityRole="button"
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (loading || resettingPassword) && styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={loading || resettingPassword}
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
                disabled={loading || resettingPassword}
              >
                <Text style={styles.signupText}>
                  No account yet? Create one
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!resettingPassword) setResetModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.resetModal}>
            <Text style={styles.resetModalTitle}>Reset your magic key</Text>
            <Text style={styles.resetModalDescription}>
              Enter the email address or username for your account.
            </Text>

            <TextInput
              value={resetIdentifier}
              onChangeText={(value) => {
                setResetIdentifier(value);
                setResetError("");
              }}
              placeholder="Email or username"
              placeholderTextColor="#AFA4D8"
              style={styles.resetInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!resettingPassword}
              accessibilityLabel="Email address or username"
              returnKeyType="send"
              onSubmitEditing={handlePasswordReset}
            />

            {!!resetError && (
              <Text style={styles.resetError}>{resetError}</Text>
            )}

            <View style={styles.resetActions}>
              <TouchableOpacity
                style={[styles.resetAction, styles.cancelResetButton]}
                onPress={() => setResetModalVisible(false)}
                disabled={resettingPassword}
                accessibilityRole="button"
              >
                <Text style={styles.cancelResetText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetAction, styles.sendResetButton]}
                onPress={handlePasswordReset}
                disabled={resettingPassword}
                accessibilityRole="button"
              >
                {resettingPassword ? (
                  <ActivityIndicator size="small" color="#21103F" />
                ) : (
                  <Text style={styles.sendResetText}>SEND EMAIL</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 8,
  },

  forgotPasswordButton: {
    minHeight: 36,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 16,
  },

  forgotPasswordText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFD86B",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(12, 6, 28, 0.78)",
  },

  resetModal: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    padding: 22,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFD86B",
    backgroundColor: "#24164A",
  },

  resetModalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: "#FFD86B",
    textAlign: "center",
  },

  resetModalDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#E8DFFF",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 18,
  },

  resetInput: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    fontFamily: Fonts.body,
    fontSize: 15,
    color: "#FFFFFF",
  },

  resetError: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#FFB4A7",
    marginTop: 8,
  },

  resetActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  resetAction: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
  },

  cancelResetButton: {
    borderColor: "#BFA7FF",
    backgroundColor: "transparent",
  },

  cancelResetText: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#E8DFFF",
  },

  sendResetButton: {
    borderColor: "#FFFFFF",
    backgroundColor: "#FFD86B",
  },

  sendResetText: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#21103F",
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
