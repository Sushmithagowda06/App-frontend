/**
 * Doctorsearchmodal.tsx  (updated)
 *
 * Changes from original:
 *   - Added `initialSpecialization?: string` prop
 *   - When provided (by HealthStoryBot), auto-sets the active chip filter
 *     so the modal opens directly showing doctors for that specialization
 *   - Everything else is unchanged
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doctorApi, type Doctor } from "../services/api";
import { colors } from "../styles/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** When set (e.g. by HealthStoryBot), the modal opens pre-filtered to this specialization */
  initialSpecialization?: string;
}

const getSpecializations = (doctors: Doctor[]): string[] =>
  [...new Set(doctors.map((d) => d.specialization))].sort();

const getScore = (text: string, query: string): number => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (q.length >= 4 && t.includes(q.slice(0, 4))) return 40;
  return 0;
};

const DoctorSearchModal: React.FC<Props> = ({ visible, onClose, initialSpecialization }) => {
  const [query, setQuery]           = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [doctors, setDoctors]       = useState<Doctor[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    setError(null);

    doctorApi
      .getAll()
      .then((data) => {
        setDoctors(data);

        // ── Auto-filter when opened from HealthStoryBot ──
        if (initialSpecialization) {
          // Find the best matching specialization in the DB (case-insensitive)
          const match = data.find(
            (d) => d.specialization.toLowerCase() === initialSpecialization.toLowerCase()
          );
          if (match) {
            setActiveChip(match.specialization);
            setQuery("");
          } else {
            // Fallback: use as search query
            setQuery(initialSpecialization);
            setActiveChip(null);
          }
        } else {
          setActiveChip(null);
          setQuery("");
        }
      })
      .catch((err: any) => setError(err.message ?? "Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [visible, initialSpecialization]);

  const handleClose = () => {
    setQuery("");
    setActiveChip(null);
    onClose();
  };

  const handleChip = (spec: string) => {
    if (activeChip === spec) {
      setActiveChip(null);
      setQuery("");
    } else {
      setActiveChip(spec);
      setQuery("");
    }
  };

  const specializations = getSpecializations(doctors);
  const isSearching = query.trim() !== "" || activeChip !== null;

  const results: Doctor[] = (() => {
    if (activeChip) {
      return doctors.filter((d) => d.specialization === activeChip);
    }
    if (query.trim() === "") return [];
    return doctors
      .map((doc) => ({
        ...doc,
        score:
          getScore(doc.specialization, query) * 2 + getScore(doc.name, query),
      }))
      .filter((doc) => doc.score > 0)
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 8);
  })();

  type ListItem =
    | { type: "searchBar" }
    | { type: "botBanner" }
    | { type: "sectionLabel"; label: string }
    | { type: "chip"; spec: string }
    | { type: "activeFilter" }
    | { type: "emptyHint" }
    | { type: "noResults" }
    | { type: "doctor"; doctor: Doctor };

  const listData: ListItem[] = [{ type: "searchBar" }];

  if (!loading && !error) {
    // Show a "filtered by AI" banner when opened from bot
    if (initialSpecialization && activeChip) {
      listData.push({ type: "botBanner" });
    }

    if (!isSearching) {
      listData.push({ type: "sectionLabel", label: "Browse by specialization" });
      specializations.forEach((spec) => listData.push({ type: "chip", spec }));
      listData.push({ type: "emptyHint" });
    } else {
      listData.push({ type: "sectionLabel", label: "Results" });
      if (activeChip) listData.push({ type: "activeFilter" });
      if (results.length === 0) {
        listData.push({ type: "noResults" });
      } else {
        results.forEach((doc) => listData.push({ type: "doctor", doctor: doc }));
      }
    }
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case "searchBar":
        return (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              placeholder="Search doctors by name or specialization..."
              placeholderTextColor={colors.gray}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setActiveChip(null);
              }}
              style={styles.input}
              autoFocus={!initialSpecialization} // don't steal focus when bot pre-fills
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => { setQuery(""); setActiveChip(null); }}>
                <Ionicons name="close-circle" size={20} color={colors.gray} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={22} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        );

      case "botBanner":
        return (
          <View style={styles.botBanner}>
            <Text style={styles.botBannerIcon}>🤖</Text>
            <Text style={styles.botBannerText}>
              Showing doctors recommended by the Health Bot
            </Text>
            <TouchableOpacity onPress={() => setActiveChip(null)}>
              <Ionicons name="close" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        );

      case "sectionLabel":
        return <Text style={styles.sectionLabel}>{item.label}</Text>;

      case "chip": {
        const isActive = activeChip === item.spec;
        return (
          <TouchableOpacity
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => handleChip(item.spec)}
            activeOpacity={0.7}
          >
            <View style={styles.chipLeft}>
              <View style={[styles.chipDot, isActive && styles.chipDotActive]} />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {item.spec}
              </Text>
            </View>
            <View style={styles.chipRight}>
              <Text style={[styles.chipCount, isActive && styles.chipCountActive]}>
                {doctors.filter((d) => d.specialization === item.spec).length}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isActive ? colors.white : colors.gray}
              />
            </View>
          </TouchableOpacity>
        );
      }

      case "activeFilter":
        return (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterLabel}>Filtering by:</Text>
            <TouchableOpacity
              style={styles.activeChip}
              onPress={() => { setActiveChip(null); setQuery(""); }}
            >
              <Text style={styles.activeChipText}>{activeChip}</Text>
              <Ionicons name="close" size={13} color={colors.white} />
            </TouchableOpacity>
          </View>
        );

      case "emptyHint":
        return (
          <View style={styles.emptyHint}>
            <Ionicons name="search-outline" size={44} color={colors.lightGray} />
            <Text style={styles.hint}>
              Tap a specialization above{"\n"}or type a doctor's name
            </Text>
          </View>
        );

      case "noResults":
        return (
          <View style={styles.noResults}>
            <Text style={styles.hint}>No doctors found for "{query}"</Text>
          </View>
        );

      case "doctor": {
        const doc = item.doctor;
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleChip(doc.specialization)}
            activeOpacity={0.75}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(doc.name ?? "?")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]!.toUpperCase())
                  .join("")}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}> {doc.name}</Text>
              <View style={styles.specRow}>
                <Ionicons name="medical-outline" size={12} color={colors.primary} />
                <Text style={styles.cardSpec}>{doc.specialization}</Text>
              </View>
              <Text style={styles.cardExp}>
                {doc.experience?.years ?? 0}{" "}
                {(doc.experience?.years ?? 0) === 1 ? "year" : "years"} experience
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.lightGray} />
          </TouchableOpacity>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.hint}>Loading doctors...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={listData}
            keyExtractor={(_, i) => i.toString()}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
          />
        )}

        {/* show search bar even while loading */}
        {loading && (
          <View style={[styles.searchBar, { margin: 16 }]}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              placeholder="Search doctors by name or specialization..."
              placeholderTextColor={colors.gray}
              style={styles.input}
              editable={false}
            />
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={22} color={colors.gray} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default DoctorSearchModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 32 },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray,
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  botBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EEE8FF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C9B8FF",
  },
  botBannerIcon: { fontSize: 18 },
  botBannerText: { flex: 1, fontSize: 13, color: colors.primary, fontWeight: "500" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  chipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lightGray },
  chipDotActive: { backgroundColor: colors.white },
  chipText: { fontSize: 14, fontWeight: "500", color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: "600" },
  chipRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  chipCount: { fontSize: 13, color: colors.gray, fontWeight: "600" },
  chipCountActive: { color: colors.white },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  activeFilterLabel: { fontSize: 13, color: colors.gray },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeChipText: { fontSize: 13, color: colors.white, fontWeight: "600" },
  emptyHint: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 40,
  },
  noResults: { alignItems: "center", paddingTop: 40 },
  hint: { color: colors.gray, fontSize: 13, textAlign: "center", lineHeight: 20 },
  errorText: { color: "#B91C1C", fontSize: 13, textAlign: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: "700" },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: "600", color: colors.text },
  specRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardSpec: { fontSize: 12, color: colors.primary, fontWeight: "500" },
  cardExp: { fontSize: 11, color: colors.gray },
});