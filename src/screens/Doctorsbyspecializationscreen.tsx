import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/HomeStackNavigator";
import { Ionicons } from "@expo/vector-icons";
import { doctorApi, type Doctor } from "../services/api"; // ← single import
import { colors } from "../styles/colors";

type RouteProp = NativeStackScreenProps<HomeStackParamList, "DoctorsBySpecialization">["route"];
type NavProp = NativeStackNavigationProp<HomeStackParamList>;

export default function DoctorsBySpecializationScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation<NavProp>();
  const { specialization } = route.params;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getBySpecialization(specialization);
      setDoctors(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{specialization}</Text>
          {!loading && !error && (
            <Text style={styles.headerSub}>
              {doctors.length} doctor{doctors.length !== 1 ? "s" : ""} available
            </Text>
          )}
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.hint}>Finding doctors...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDoctors}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && doctors.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="person-outline" size={48} color={colors.lightGray} />
          <Text style={styles.hint}>
            No doctors found for{"\n"}{specialization}
          </Text>
        </View>
      )}

      {!loading && !error && doctors.length > 0 && (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name ?? "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]!.toUpperCase())
                    .join("")}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}> {item.name}</Text>
                <View style={styles.specRow}>
                  <Ionicons name="medical-outline" size={12} color={colors.primary} />
                  <Text style={styles.cardSpec}>{item.specialty}</Text>
                </View>
                <View style={styles.expRow}>
                  <Ionicons name="time-outline" size={12} color={colors.gray} />
                  <Text style={styles.cardExp}>
                    {item.experience?.years ?? 0}{" "}
                    {(item.experience?.years ?? 0) === 1 ? "year" : "years"} experience
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.consultBtn} activeOpacity={0.8}>
                <Text style={styles.consultText}>Consult</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  headerSub: { fontSize: 13, color: colors.gray, marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 20, fontWeight: "700" },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: 15, fontWeight: "600", color: colors.text },
  specRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardSpec: { fontSize: 12, color: colors.primary, fontWeight: "500" },
  expRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardExp: { fontSize: 12, color: colors.gray },
  consultBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  consultText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  hint: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: "600", fontSize: 14 },
});