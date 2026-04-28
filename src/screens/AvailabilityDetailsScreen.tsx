import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DoctorStackParamList } from "../navigation/DoctorStackNavigator";
import { colors } from "../styles/colors";
import { doctorApi, type Slot, type SlotGroup } from "../services/api";

type RouteProp = NativeStackScreenProps<DoctorStackParamList, "AvailabilityDetails">["route"];

type DateItem = { key: string; day: string; dayNum: number };

const buildUpcomingDates = (daysToShow: number): DateItem[] => {
  const now = new Date();
  return Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const key = d.toISOString().split("T")[0];
    return { key, day, dayNum };
  });
};

const GROUPS: SlotGroup[] = ["Morning", "Afternoon", "Evening"];

const getStatusStyles = (status: Slot["status"]) => {
  switch (status) {
    case "available":
      return { bg: "#DCFCE7", fg: "#166534", border: "#86EFAC" };
    case "limited":
      return { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D" };
    case "unavailable":
    default:
      return { bg: "#F1F5F9", fg: "#475569", border: "#E2E8F0" };
  }
};

export default function AvailabilityDetailsScreen() {
  const route = useRoute<RouteProp>();
  const { doctorId } = route.params;

  const dates = useMemo(() => buildUpcomingDates(7), []);
  const [activeDateKey, setActiveDateKey] = useState(dates[0]?.key);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    doctorApi
      .getSlots(doctorId, dates[0]?.key, dates.length)
      .then((data) => {
        if (!mounted) return;
        setSlotsByDate(data);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err.message ?? "Failed to load slots");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [doctorId, dates]);

  const activeSlots = slotsByDate[activeDateKey] ?? [];

  const grouped = useMemo(() => {
    const map: Record<SlotGroup, Slot[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };
    for (const s of activeSlots) map[s.group].push(s);
    return map;
  }, [activeSlots]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.hint}>Loading availability...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setLoading(true);
            setError(null);
            doctorApi
              .getSlots(doctorId, dates[0]?.key, dates.length)
              .then(setSlotsByDate)
              .catch((err: any) => setError(err.message ?? "Failed to load slots"))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <FlatList
          data={dates}
          keyExtractor={(d) => d.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRowContent}
          renderItem={({ item }) => {
            const active = item.key === activeDateKey;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => setActiveDateKey(item.key)}
              >
                <Text style={[styles.dateChipDay, active && styles.dateChipDayActive]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateChipNum, active && styles.dateChipNumActive]}>
                  {item.dayNum}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={GROUPS}
        keyExtractor={(g) => g}
        contentContainerStyle={styles.groupsList}
        renderItem={({ item: group }) => {
          const groupSlots = grouped[group] ?? [];
          return (
            <View style={styles.groupBlock}>
              <Text style={styles.groupTitle}>{group}</Text>

              {groupSlots.length === 0 ? (
                <Text style={styles.emptyGroup}>No slots</Text>
              ) : (
                <View style={styles.slotsWrap}>
                  {groupSlots.map((s) => {
                    const tone = getStatusStyles(s.status);
                    return (
                      <View
                        key={s.id}
                        style={[
                          styles.slotPill,
                          { backgroundColor: tone.bg, borderColor: tone.border },
                        ]}
                      >
                        <Text style={[styles.slotText, { color: tone.fg }]}>{s.time}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
    backgroundColor: "#F8FAFC",
  },
  hint: {
    color: colors.gray,
  },
  errorText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: colors.white, fontWeight: "700" },

  dateRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  dateRowContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
  dateChip: {
    width: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  dateChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  dateChipDay: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  dateChipDayActive: {
    color: "#FFFFFF",
  },
  dateChipNum: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  dateChipNumActive: {
    color: "#FFFFFF",
  },

  groupsList: {
    padding: 14,
    gap: 14,
  },
  groupBlock: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyGroup: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },
  slotsWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  slotText: {
    fontSize: 12,
    fontWeight: "800",
  },
});

