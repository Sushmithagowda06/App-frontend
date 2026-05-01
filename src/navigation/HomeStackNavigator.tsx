import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PrescriptionsReportsScreen from "../screens/PrescriptionsReportsScreen";
import DoctorsBySpecializationScreen from "../screens/Doctorsbyspecializationscreen";

export type HomeStackParamList = {
  HomeMain: undefined;
  PrescriptionsReports: undefined;
  DoctorsBySpecialization: { specialization: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrescriptionsReports"
        component={PrescriptionsReportsScreen}
        options={{
          title: "Prescriptions & Reports",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="DoctorsBySpecialization"
        component={DoctorsBySpecializationScreen}
        options={{ headerShown: false }} // custom header inside screen
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;