import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import DoctorCard from "../components/DoctorCard";
import type { Doctor } from "../services/api";

// ✅ Change this to your backend URL
const BASE_URL = "http://localhost:8000";

type DoctorsProfileProps = {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
};

const DoctorsProfile = ({ navigation }: DoctorsProfileProps) => {
  const [searchText, setSearchText] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { width } = useWindowDimensions();
  const isDesktopLike = width >= 920;

  // ✅ Fetch doctors from the backend on mount
  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${BASE_URL}/api/doctors`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Handle both array response and wrapped response e.g. { results: [...] }
        const list = Array.isArray(data) ? data : data.results ?? data.doctors ?? [];
        setDoctors(list);
        setLoading(false);
      })
      .catch(() => {
        setError("No response from server – check your backend or IP.");
        setLoading(false);
      });
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const name = doctor.name?.toLowerCase() ?? "";
      const specialization = doctor.specialization?.toLowerCase() ?? "";
      return name.includes(query) || specialization.includes(query);
    });
  }, [searchText, doctors]); // ✅ depends on live doctors state

  const renderDoctor = ({ item }: { item: Doctor }) => {
    return (
      <DoctorCard
        doctor={item}
        isDesktopLike={isDesktopLike}
        onPressAvailability={(doctor) =>
          navigation.navigate("AvailabilityDetails", { doctor })
        }
      />
    );
  };

  // ✅ Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </SafeAreaView>
    );
  }

  // ✅ Error state with Retry button
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError("");
            fetch(`${BASE_URL}/api/doctors`)
              .then((res) => res.json())
              .then((data) => {
                const list = Array.isArray(data) ? data : data.results ?? data.doctors ?? [];
                setDoctors(list);
                setLoading(false);
              })
              .catch(() => {
                setError("No response from server – check your backend or IP.");
                setLoading(false);
              });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.pageInner, isDesktopLike && styles.pageInnerDesktop]}>
        <Text
          style={[styles.screenTitle, isDesktopLike && styles.screenTitleDesktop]}
        >
          {filteredDoctors.length} doctors available
        </Text>
        <Text style={styles.screenSubtitle}>
          Book appointments with experienced doctors
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by doctor name or specialization"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.85}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          contentContainerStyle={[
            styles.listContent,
            isDesktopLike && styles.listContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No doctors found for this search.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  centered: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
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
    marginTop: 2,
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    color: "#0F172A",
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 28,
    gap: 0,
  },
  listContentDesktop: {
    paddingBottom: 26,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    marginTop: 20,
  },
});

export default DoctorsProfile;
