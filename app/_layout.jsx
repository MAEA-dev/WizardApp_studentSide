import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";

import { LoaderProvider } from "../context/LoaderContext";
import { IMAGE_ASSETS } from "../constants/preloadAssets";
import { auth } from "../services/firebaseConfig";

import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";

import {
  Nunito_400Regular,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

import {
  PressStart2P_400Regular,
} from "@expo-google-fonts/press-start-2p";

SplashScreen.preventAutoHideAsync();

const preloadImages = async () => {
  if (!Array.isArray(IMAGE_ASSETS) || IMAGE_ASSETS.length === 0) {
    return;
  }

  const imagePromises = IMAGE_ASSETS.map((image) => {
    return Asset.fromModule(image).downloadAsync();
  });

  await Promise.all(imagePromises);
};

export default function RootLayout() {
  const router = useRouter();
  const connectivityLogoutInProgress = useRef(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    PressStart2P_400Regular,
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await preloadImages();
      } catch (error) {
        console.log("Preload image error:", error);
      } finally {
        setAssetsLoaded(true);
      }
    };

    prepareApp();
  }, []);

  const isAppReady = assetsLoaded && (fontsLoaded || fontError);

  useEffect(() => {
    if (!isAppReady) return undefined;

    let currentUser = null;
    let isOffline = false;
    let disposed = false;

    const signOutIfOffline = async () => {
      if (!currentUser || !isOffline || connectivityLogoutInProgress.current) {
        return;
      }

      connectivityLogoutInProgress.current = true;
      try {
        await signOut(auth);
      } catch (error) {
        console.warn("Could not sign out after connection loss:", error);
      }

      if (!disposed) {
        router.replace("/(auth)/loginScreen");
        Alert.alert(
          "Connection lost",
          "You have been returned to Login. Reconnect to the internet and sign in again."
        );
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (!user) connectivityLogoutInProgress.current = false;
      signOutIfOffline();
    });

    const networkSubscription = Network.addNetworkStateListener((state) => {
      isOffline =
        state.isConnected === false || state.isInternetReachable === false;
      if (!isOffline) connectivityLogoutInProgress.current = false;
      signOutIfOffline();
    });

    return () => {
      disposed = true;
      unsubscribeAuth();
      networkSubscription.remove();
    };
  }, [isAppReady, router]);

  const handleRootLayout = useCallback(async () => {
    if (!isAppReady) return;

    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.log("Hide splash error:", error);
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={handleRootLayout}>
      <LoaderProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
        </SafeAreaProvider>
      </LoaderProvider>
    </View>
  );
}
