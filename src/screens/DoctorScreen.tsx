import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import DoctorCard from "../components/DoctorCard";
import DoctorDetails from "../components/DoctorDetails";
import { doctorApi, type Doctor } from "../services/api";
import { colors } from "../styles/colors";

const DoctorScreen = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktopLike = useMemo(() => width >= 920, [width]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getAll();
      setDoctors(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (doctors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No doctors found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.pageInner, isDesktopLike && styles.pageInnerDesktop]}>
        <Text style={[styles.screenTitle, isDesktopLike && styles.screenTitleDesktop]}>
          {doctors.length} doctors available
        </Text>

        <Text style={styles.screenSubtitle}>Book appointments with experienced doctors</Text>

        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DoctorCard
              doctor={item}
              isDesktopLike={isDesktopLike}
              onPress={(doc) => setSelectedDoctor(doc)}
              onPressAvailability={(doc) =>
                navigation.navigate("AvailabilityDetails", { doctorId: doc.id })
              }
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            isDesktopLike && styles.listContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        />

        <DoctorDetails
          doctor={selectedDoctor}
          visible={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onPressAvailability={(doc) =>
            navigation.navigate("AvailabilityDetails", { doctorId: doc.id })
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default DoctorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  pageInner: {
    flex: 1,
  },
  pageInnerDesktop: {
    maxWidth: 860,
    width: "100%",
    alignSelf: "center",
  },
  screenTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111827",
  },
  screenTitleDesktop: {
    fontSize: 32,
  },
  screenSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 28,
  },
  listContentDesktop: {
    paddingBottom: 26,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.gray },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  emptyText: { fontSize: 14, color: colors.gray },
});