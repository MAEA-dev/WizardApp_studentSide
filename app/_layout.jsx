import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";

import { LoaderProvider } from "../context/LoaderContext";
import { IMAGE_ASSETS } from "../constants/preloadAssets";

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