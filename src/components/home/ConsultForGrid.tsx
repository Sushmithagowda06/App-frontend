import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../../navigation/HomeStackNavigator";
import { doctorApi } from "../../services/api"; // ← single import
import { colors } from "../../styles/colors";

const SPEC_EMOJI: Record<string, string> = {
  Cardiologist: "❤️",
  Dermatologist: "🧴",
  Pediatrician: "👶",
  "ENT Specialist": "👂",
  Orthopedic: "🦴",
  Neurologist: "🧠",
  Gynecologist: "🌸",
  Diabetologist: "🩸",
  Psychiatrist: "🧘",
  Ophthalmologist: "👁️",
  Dentist: "🦷",
  Urologist: "💊",
};

const getEmoji = (spec: string) => SPEC_EMOJI[spec] ?? "🩺";

type NavProp = NativeStackNavigationProp<HomeStackParamList>;

const VISIBLE_COUNT = 7;

const ConsultForGrid = () => {
  const navigation = useNavigation<NavProp>();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    doctorApi
      .getAll()
      .then((data) => {
        const unique = [...new Set(data.map((d) => d.specialization))].sort();
        setSpecializations(unique);
      })
      .catch(() => {
        // ConsultForGrid silently degrades – no specializations shown if fetch fails
      })
      .finally(() => setLoading(false));
  }, []);

  const displayed = showAll
    ? specializations
    : specializations.slice(0, VISIBLE_COUNT);

  const remaining = specializations.length - VISIBLE_COUNT;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>CONSULT FOR</Text>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading specializations...</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {displayed.map((spec, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() =>
                navigation.navigate("DoctorsBySpecialization", {
                  specialization: spec,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>{getEmoji(spec)}</Text>
              </View>
              <Text style={styles.text} numberOfLines={2}>
                {spec}
              </Text>
            </TouchableOpacity>
          ))}

          {specializations.length > VISIBLE_COUNT && (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setShowAll((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, styles.viewAllCircle]}>
                <Text style={styles.viewAllIcon}>
                  {showAll ? "−" : `+${remaining}`}
                </Text>
              </View>
              <Text style={[styles.text, styles.viewAllText]}>
                {showAll ? "Show\nLess" : "View\nAll"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default ConsultForGrid;

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  heading: { fontSize: 20, fontWeight: "500", color: "#111827", marginBottom: 10 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: { fontSize: 13, color: colors.gray },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: { width: "23%", alignItems: "center", marginVertical: 8 },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFEAFD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  icon: { fontSize: 22 },
  text: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: "#111827",
    fontWeight: "500",
  },
  viewAllCircle: { backgroundColor: colors.primary },
  viewAllIcon: { fontSize: 16, fontWeight: "700", color: "#fff" },
  viewAllText: { color: colors.primary, fontWeight: "600" },
});