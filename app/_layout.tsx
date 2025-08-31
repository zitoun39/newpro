// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { CalculatorProvider } from "@/contexts/CalculatorContext";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootProviders() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Ensure RTL is set once at app startup and never changed
  useEffect(() => {
    // Only set RTL if it's not already set to prevent unnecessary reloads
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      // Note: This may require app restart on some platforms
    }
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash screen visible for 2 seconds minimum
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Perform any other initialization here if needed
        // e.g., load fonts, check authentication, etc.
        
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        // Hide the splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <CalculatorProvider>
          <QueryClientProvider client={queryClient}>
            {/* كل المجموعات (drawer) و (hidden) تمر من هنا */}
            <Slot />
          </QueryClientProvider>
        </CalculatorProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
