import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorScreen from "../screens/DoctorScreen";
import AvailabilityDetailsScreen from "../screens/AvailabilityDetailsScreen";

export type DoctorStackParamList = {
  DoctorHome: undefined;
  AvailabilityDetails: { doctorId: string };
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoctorHome"
        component={DoctorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AvailabilityDetails"
        component={AvailabilityDetailsScreen}
        options={{ title: "Availability" }}
      />
    </Stack.Navigator>
  );
}

