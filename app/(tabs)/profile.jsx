import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";

import { Fonts } from "../../constants/Fonts";
import { auth } from "../../services/firebaseConfig";

import { useStudentData } from "../../hooks/useStudentData";
import { clearStudentLocalData } from "../../services/studentDataService";

const profileMenuItems = [
  {
    id: "logout",
    title: "Logout",
    description: "Sign out from this account",
    icon: "log-out-outline",
    type: "danger",
  },
  {
    id: "change-password",
    title: "Change Password",
    description: "Update your account password",
    icon: "key-outline",
  },
];

const getStudentName = (student) => {
  const firstName = student?.profile?.firstName || student?.firstName || "";
  const lastName = student?.profile?.lastName || student?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Student Wizard";
};

const getStudentGrade = (student) => {
  return student?.profile?.grade || "Student";
};

const Profile = () => {
  const router = useRouter();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    student,
    loading,
    loadingCache,
    syncing,
    error,
  } = useStudentData();

  const isLoading = loadingCache ?? loading;

  const rawUsername = student?.username || "Student";
  const username = rawUsername.replace(
    /(^|\s)\S/g,
    (character) => character.toUpperCase(),
  );
  const fullName = getStudentName(student);
  const grade = getStudentGrade(student);

  const openChangePassword = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordVisible(true);
  };

  const closeChangePassword = () => {
    if (changingPassword) return;
    setChangePasswordVisible(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing field", "Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password mismatch",
        "New password and confirm password don't match.",
      );
      return;
    }

    const user = auth.currentUser;

    if (!user?.email) {
      Alert.alert("Error", "Unable to verify your account. Please log in again.");
      return;
    }

    setChangingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setChangePasswordVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Your password has been changed.");
    } catch (error) {
      if (
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
      ) {
        Alert.alert("Incorrect password", "The old password is incorrect.");
      } else {
        Alert.alert(
          "Password change failed",
          error?.message || "Please try again.",
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAuthExit = async () => {
    try {
      await clearStudentLocalData();
      await signOut(auth);

      router.replace("(auth)/loginScreen");
    } catch (err) {
      console.log("Logout error:", err);
      Alert.alert("Error", err?.message || "Failed to logout.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: handleAuthExit,
        },
      ]
    );
  };

  const handleMenuPress = (item) => {
    switch (item.id) {
      case "logout":
        handleLogout();
        break;

      case "change-password":
        openChangePassword();
        break;

      default:
        break;
    }
  };

  if (isLoading) {
    return (
      
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD86B" />
          <Text style={styles.centerText}>Loading profile...</Text>
        </View>
    
    );
  }

  if (error) {
    return (
     
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

    );
  }

  return (
   
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Profile</Text>

            {syncing && (
              <Text style={styles.syncText}>Syncing...</Text>
            )}
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarBox}>
              <Image
                source={require("../../assets/images/default-avatar.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.username}>{username}</Text>
            <Text style={styles.fullName}>{fullName}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Grade {grade}</Text>
            </View>
            {/*
                <View style={styles.statsRow}>
              <ProfileStat label="Level" value={level} />
              <ProfileStat label="XP" value={xp} />
              <ProfileStat label="Gold" value={gold} />
              <ProfileStat label="Streak" value={streak} />
            </View>
            
            
            */}
          
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            {profileMenuItems.map((item) => (
              <ProfileMenuItem
                key={item.id}
                item={item}
                onPress={() => handleMenuPress(item)}
              />
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={changePasswordVisible}
          transparent
          animationType="fade"
          onRequestClose={closeChangePassword}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.passwordModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TouchableOpacity
                  accessibilityLabel="Close change password"
                  onPress={closeChangePassword}
                  disabled={changingPassword}
                >
                  <Ionicons name="close" size={26} color="#D8CFFF" />
                </TouchableOpacity>
              </View>

              <PasswordField
                label="Old Password"
                value={oldPassword}
                onChangeText={setOldPassword}
                hidden={!showOldPassword}
                onToggleVisibility={() => setShowOldPassword(!showOldPassword)}
              />
              <PasswordField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                hidden={!showNewPassword}
                onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                hidden={!showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.confirmButton,
                  changingPassword && styles.confirmButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator color="#21103F" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
  
  );
};

const PasswordField = ({
  label,
  value,
  onChangeText,
  hidden,
  onToggleVisibility,
}) => (
  <View style={styles.passwordField}>
    <Text style={styles.passwordLabel}>{label}</Text>
    <View style={styles.passwordInputContainer}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hidden}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.passwordInput}
      />
      <TouchableOpacity
        accessibilityLabel={hidden ? `Show ${label}` : `Hide ${label}`}
        onPress={onToggleVisibility}
      >
        <Ionicons
          name={hidden ? "eye-off-outline" : "eye-outline"}
          size={22}
          color="#FFD86B"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ProfileMenuItem = ({ item, onPress }) => {
  const isDanger = item.type === "danger";
  const isWarning = item.type === "warning";

  const iconColor = isDanger
    ? "#FF7A7A"
    : isWarning
    ? "#FFD86B"
    : "#BFA7FF";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.menuItem,
        isDanger && styles.dangerMenuItem,
        isWarning && styles.warningMenuItem,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIconBox,
          isDanger && styles.dangerIconBox,
          isWarning && styles.warningIconBox,
        ]}
      >
        <Ionicons name={item.icon} size={24} color={iconColor} />
      </View>

      <View style={styles.menuTextBox}>
        <Text
          style={[
            styles.menuTitle,
            isDanger && styles.dangerText,
          ]}
        >
          {item.title}
        </Text>

        <Text style={styles.menuDescription}>
          {item.description}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#BFA7FF" />
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#130B2B",
  },

  container: {
    flex: 1,
    backgroundColor: "#130B2B",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#130B2B",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  centerText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 10,
  },

  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FF7A7A",
    textAlign: "center",
    marginBottom: 14,
  },

  loginButton: {
    backgroundColor: "#FFD86B",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  loginButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#130B2B",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: "#FFD86B",
  },

  syncText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: "#FFD86B",
  },

  profileCard: {
    backgroundColor: "rgba(25, 20, 58, 0.96)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    marginBottom: 22,
  },

  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "#151833",
    borderWidth: 3,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 14,
  },

  avatar: {
    width: 120,
    height: 120,
  },

  username: {
    fontFamily: Fonts.pixel,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },

  fullName: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#D8CFFF",
    marginBottom: 10,
  },

  roleBadge: {
    backgroundColor: "rgba(255, 216, 107, 0.15)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
  },

  roleText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
    textTransform: "capitalize",
  },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },

  statBox: {
    flex: 1,
    backgroundColor: "rgba(44, 36, 95, 0.8)",
    borderWidth: 1.5,
    borderColor: "#7557D9",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },

  statValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: "#FFD86B",
  },

  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: "#D8CFFF",
    marginTop: 3,
  },

  menuSection: {
    gap: 12,
  },

  sectionTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 20,
    padding: 14,
  },

  warningMenuItem: {
    borderColor: "#FFD86B",
  },

  dangerMenuItem: {
    borderColor: "#FF7A7A",
  },

  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(191, 167, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  warningIconBox: {
    backgroundColor: "rgba(255, 216, 107, 0.14)",
  },

  dangerIconBox: {
    backgroundColor: "rgba(255, 122, 122, 0.14)",
  },

  menuTextBox: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 3,
  },

  dangerText: {
    color: "#FF7A7A",
  },

  menuDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(10, 5, 24, 0.78)",
  },

  passwordModal: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#24164A",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 24,
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 21,
    color: "#FFD86B",
  },

  passwordField: {
    marginBottom: 14,
  },

  passwordLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 7,
  },

  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontFamily: Fonts.body,
    fontSize: 15,
  },

  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 8,
    backgroundColor: "#FFD86B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 14,
  },

  confirmButtonDisabled: {
    opacity: 0.7,
  },

  confirmButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#21103F",
  },
});