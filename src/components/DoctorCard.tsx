import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Doctor } from "../services/api";

type DoctorCardProps = {
  doctor: Doctor;
  isDesktopLike?: boolean;
  onPressAvailability?: (doctor: Doctor) => void;
  showAvailabilityButton?: boolean;
  onPress?: (doctor: Doctor) => void;
};

const getExperienceLabel = (experience: Doctor["experience"]) => {
  const years = experience?.years ?? 0;
  const months = experience?.months ?? 0;
  return months > 0 ? `${years} yrs ${months} months` : `${years} yrs`;
};

const getDoctorPhotoUri = (doctor: Doctor) => {
  if (doctor.photo) return doctor.photo;
  const encodedName = encodeURIComponent(doctor.name ?? "Doctor");
  return `https://ui-avatars.com/api/?name=${encodedName}&background=DBEAFE&color=2563EB&size=256&rounded=true`;
};

const getRecommendationLabel = (rating: Doctor["rating"]) => {
  if (typeof rating !== "number") return "95%";
  const percentage = Math.min(99, Math.max(90, Math.round(rating * 20)));
  return `${percentage}%`;
};

export default function DoctorCard({
  doctor,
  isDesktopLike,
  onPressAvailability,
  showAvailabilityButton = true,
  onPress,
}: DoctorCardProps) {
  const specialization = doctor.specialty ?? "-";
  const rating = doctor.rating ?? "-";
  const experience = getExperienceLabel(doctor.experience);
  const recommendation = getRecommendationLabel(doctor.rating);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(doctor)}>
      <View style={[styles.card, isDesktopLike && styles.cardDesktop]}>
        <View style={[styles.row, isDesktopLike && styles.rowDesktop]}>
          <Image
            source={{ uri: getDoctorPhotoUri(doctor) }}
            style={[styles.image, isDesktopLike && styles.imageDesktop]}
          />

          <View style={styles.textWrap}>
            <Text style={[styles.name, isDesktopLike && styles.nameDesktop]}>
              {doctor.name ?? "-"}
            </Text>

            <Text style={styles.sub}>{specialization}</Text>
            <Text style={styles.sub}>{experience} experience overall</Text>
            <Text style={styles.sub}>cuure.health</Text>
          </View>

          {isDesktopLike && showAvailabilityButton && (
            <TouchableOpacity
              style={[styles.button, styles.buttonDesktop]}
              onPress={() => onPressAvailability?.(doctor)}
            >
              <Text style={styles.buttonText}>Check Availability →</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isDesktopLike && showAvailabilityButton && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => onPressAvailability?.(doctor)}
          >
            <Text style={styles.buttonText}>Check Availability →</Text>
          </TouchableOpacity>
        )}

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeValue}>{recommendation}</Text>
            <Text style={styles.badgeText}>Patient Recommendation</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeValue}>{rating}</Text>
            <Text style={styles.badgeText}>Patient Rating</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  cardDesktop: {
    borderRadius: 0,
    paddingVertical: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rowDesktop: {
    alignItems: "center",
  },

  image: {
    width: 100,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  imageDesktop: {
    width: 120,
    height: 130,
  },

  textWrap: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  nameDesktop: {
    fontSize: 24,
  },

  sub: {
    marginTop: 4,
    fontSize: 14,
    color: "#475569",
  },

  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  buttonDesktop: {
    marginLeft: 20,
    marginTop: 0,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  badgesRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  badgeValue: {
    backgroundColor: "#2563EB",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: "700",
    fontSize: 12,
  },

  badgeText: {
    fontSize: 12,
    color: "#475569",
  },
});

