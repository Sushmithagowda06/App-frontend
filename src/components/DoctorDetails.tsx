import React from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Doctor } from "../services/api";

type Props = {
  doctor: Doctor | null;
  visible: boolean;
  onClose: () => void;
  onPressAvailability?: (doctor: Doctor) => void;
};

const getRatingTag = (rating: Doctor["rating"]) => {
  if (typeof rating !== "number") return { label: "Good", tone: "good" as const };
  if (rating >= 4.7) return { label: "Excellent", tone: "excellent" as const };
  if (rating >= 4.3) return { label: "Good", tone: "good" as const };
  return { label: "Average", tone: "avg" as const };
};

export default function DoctorDetails({
  doctor,
  visible,
  onClose,
  onPressAvailability,
}: Props) {
  if (!doctor) return null;

  const years = doctor.experience?.years ?? 0;
  const months = doctor.experience?.months ?? 0;
  const experience = months > 0 ? `${years} yrs ${months} months` : `${years} yrs`;

  const encodedName = encodeURIComponent(doctor.name ?? "Doctor");
  const photoUri =
    doctor.photo ||
    `https://ui-avatars.com/api/?name=${encodedName}&background=DBEAFE&color=2563EB&size=256&rounded=true`;

  const certificateUrl =
    (typeof doctor.certificate_image === "string" && doctor.certificate_image.trim()) ||
    (typeof (doctor as any).certificateImage === "string" && (doctor as any).certificateImage.trim()) ||
    "";
  const hasCertificate = certificateUrl.length > 0;
  const ratingTag = getRatingTag(doctor.rating);

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            <View style={styles.header}>
              <Image source={{ uri: photoUri }} style={styles.image} />

              <View style={styles.headerText}>
                <Text style={styles.name}>{doctor.name}</Text>
                <Text style={styles.spec}>{doctor.specialization}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{experience} experience</Text>
                  <View
                    style={[
                      styles.tag,
                      ratingTag.tone === "excellent" && styles.tagExcellent,
                      ratingTag.tone === "good" && styles.tagGood,
                      ratingTag.tone === "avg" && styles.tagAvg,
                    ]}
                  >
                    <Text style={styles.tagText}>{ratingTag.label}</Text>
                  </View>
                  <Text style={styles.metaText}>⭐ {doctor.rating}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.section}>Availability</Text>
              <Text style={styles.info}>
                Tap below to see live availability (date & mode) in the Availability screen.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.availabilityBtn}
                onPress={() => {
                  onClose();
                  onPressAvailability?.(doctor);
                }}
              >
                <Text style={styles.availabilityBtnText}>Check Availability</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.section}>About</Text>
              <Text style={styles.info}>
                {doctor.about?.trim()
                  ? doctor.about
                  : "Experienced doctor providing high-quality care."}
              </Text>
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.section}>Documents</Text>
              <View style={styles.docRow}>
                {hasCertificate ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.docBtn}
                    onPress={() => openUrl(certificateUrl)}
                  >
                    <Text style={styles.docBtnText}>View Certificate</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.info}>Certificate not uploaded.</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    maxHeight: "82%",
  },
  scrollBody: {
    paddingBottom: 2,
  },
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
  },
  spec: {
    color: "#64748B",
    marginTop: 1,
  },
  sectionBox: {
    marginTop: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    fontWeight: "bold",
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagExcellent: {
    backgroundColor: "#DCFCE7",
  },
  tagGood: {
    backgroundColor: "#DBEAFE",
  },
  tagAvg: {
    backgroundColor: "#FEF3C7",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
  },

  availabilityBtn: {
    marginTop: 8,
    backgroundColor: "#15803D",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  availabilityBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  docRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  docBtn: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  docBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },
});

