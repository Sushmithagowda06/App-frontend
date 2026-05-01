import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorScreen from "../screens/DoctorScreen";
import AvailabilityDetailsScreen from "../screens/Availability";
import BookingScreen from "../screens/Booking";
import type { Doctor } from "../data/doctors";

export type DoctorStackParamList = {
  DoctorHome: undefined;
  AvailabilityDetails: { doctorId: string };
  Booking: {
    doctor: Doctor;
    dateKey: string;
    slotLabel: string;
    mode: string;
  };
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="DoctorHome">
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
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: "Booking" }}
      />
    </Stack.Navigator>
  );
}