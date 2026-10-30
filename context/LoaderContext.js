import React, { createContext, useContext, useState } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../constants/Fonts";

const LoaderContext = createContext(null);

export const useLoader = () => {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error("useLoader must be used inside LoaderProvider");
  }

  return context;
};

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Loading...");

  const showLoader = (text = "Loading...") => {
    setMessage(text);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}

      <Modal
        visible={loading}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={30} color="#FFD86B" />
            </View>

            <ActivityIndicator size="large" color="#FFD86B" />

            <Text style={styles.loadingTitle}>Please Wait</Text>
            <Text style={styles.loadingMessage}>{message}</Text>
          </View>
        </View>
      </Modal>
    </LoaderContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(8, 4, 20, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  loaderBox: {
    width: "100%",
    maxWidth: 280,
    backgroundColor: "rgba(25, 20, 58, 0.98)",
    borderWidth: 3,
    borderColor: "#FFD86B",
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  loadingTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: "#FFD86B",
    marginTop: 14,
    marginBottom: 6,
    textAlign: "center",
  },

  loadingMessage: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#EDE7FF",
    textAlign: "center",
    lineHeight: 20,
  },
});