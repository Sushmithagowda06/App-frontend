import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../../navigation/HomeStackNavigator";
import Card from "../common/Card";

const actions = [
  { id: "prescriptions", icon: "💊", label: "Prescriptions\n& Reports" },
  { id: "appointments", icon: "📅", label: "All\nAppointments" },
  { id: "health", icon: "💜", label: "My\nHealth" },
];

const QuickActions = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList, "HomeMain">>();

  return (
    <View style={styles.row} pointerEvents="box-none">
      {actions.map((action) => (
        <Card
          key={action.id}
          style={styles.card}
          onPress={() => {
            if (action.id === "prescriptions") {
              navigation.navigate("PrescriptionsReports");
            }
          }}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Card>
      ))}
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -24,
    marginBottom: 16,
    zIndex: 2,
    elevation: 4,
  },
  card: {
    width: "31.5%",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 21,
    color: "#202020",
    fontWeight: "500",
  },
});