import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MainNavigation from "./src/navigation/MainNavigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}