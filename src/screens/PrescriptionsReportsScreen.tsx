import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import PrescriptionsReportsTimeline, {
  type TimelineEntry,
} from "../components/prescriptions/PrescriptionsReportsTimeline";
import { prescriptionApi, type Prescription } from "../services/api"; // ← single import
import { colors } from "../styles/colors";

const toTimelineEntry = (p: Prescription): TimelineEntry => ({
  id: p.id.toString(),
  date: p.date,
  title: p.title,
  detail: p.detail,
  doctor: p.doctor_name,
  documents: p.documents ?? [],
});

export default function PrescriptionsReportsScreen() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await prescriptionApi.getAll();
      setEntries(data.map(toTimelineEntry));
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Prescriptions & Reports</Text>
        <Text style={styles.subtitle}>Patient treatment timeline</Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.hint}>Loading timeline...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchPrescriptions}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && entries.length === 0 && (
          <View style={styles.centered}>
            <Text style={styles.hint}>No prescriptions or reports found.</Text>
          </View>
        )}

        {!loading && !error && entries.length > 0 && (
          <PrescriptionsReportsTimeline entries={entries} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#4B5563", marginBottom: 4 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  hint: { fontSize: 14, color: colors.gray, textAlign: "center" },
  errorText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: "600", fontSize: 14 },
});