import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import type { Doctor } from "../data/doctors";
import { createBooking, getBookingApiBaseUrl } from "../services/bookingApi";


const MODE_OPTIONS = ["Video", "In-Clinic", "At-Home"] as const;

type BookingRouteParams = {
  Booking: {
    doctor: Doctor;
    dateKey: string;
    slotLabel: string;
    mode: string;
  };
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string) => /^[0-9]{10}$/.test(value.trim());

type BookingScreenProps = {
  route: RouteProp<BookingRouteParams, "Booking">;
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

const BookingScreen = ({ route, navigation }: BookingScreenProps) => {
  const { doctor, dateKey, slotLabel, mode } = route.params;
  const [selectedMode, setSelectedMode] = useState(mode);
  const [modePickerOpen, setModePickerOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
  });

  const summary = useMemo(() => {
    const d = new Date(`${dateKey}T12:00:00`);
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    return `${doctor.name} • ${day}, ${d.getDate()} • ${slotLabel} • ${selectedMode}`;
  }, [doctor.name, dateKey, slotLabel, selectedMode]);

  const feeLabel = useMemo(() => {
    const fee = doctor.fee ?? (doctor as any).consultation_fee ?? (doctor as any).consultationFee ?? (doctor as any).price;
    return fee !== undefined && fee !== null && fee !== 0 ? `Rs ${fee}` : "Rs N/A";
  }, [doctor]);
  const nameError = touched.name && !patientName.trim() ? "Name is required" : "";
  const phoneError =
    touched.phone && !isValidPhone(patientPhone) ? "Enter a valid 10-digit phone number" : "";
  const emailError =
    touched.email && !isValidEmail(patientEmail) ? "Enter a valid email address" : "";
  const isFormValid =
    !!patientName.trim() && isValidPhone(patientPhone) && isValidEmail(patientEmail);

  const notify = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const onConfirmBooking = async () => {
    if (!isFormValid) {
      setTouched({ name: true, phone: true, email: true });
      notify("Missing details", "Please enter valid name, phone number, and email.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = await createBooking({
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName,
        patientPhone,
        patientEmail,
        date: dateKey,
        slot: slotLabel,
        mode: selectedMode,
      });
      notify("Booking confirmed", `Appointment created successfully. Booking ID: #${payload.id}`);
      navigation.navigate("DoctorsProfile");
    } catch (error: any) {
      notify(
        "Booking failed",
        `Could not complete booking.\n\nBackend: ${getBookingApiBaseUrl()}\n\nReason: ${error?.message ?? "Failed to fetch"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>BOOKING SUMMARY</Text>
          <Text style={styles.heroTitle}>Confirm Your Appointment</Text>
          <Text style={styles.summary}>{summary}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillLabel}>Consultation</Text>
              <TouchableOpacity
                style={styles.modeDropdown}
                onPress={() => setModePickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.metaPillValue}>{selectedMode}</Text>
                <Text style={styles.modeDropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillLabel}>Fee</Text>
              <Text style={styles.metaPillValue}>{feeLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Patient Details</Text>

          <Text style={styles.label}>
            Full Name <Text style={styles.requiredMark}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="Enter patient name"
            placeholderTextColor="#94A3B8"
          />
          {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

          <Text style={styles.label}>
            Phone Number <Text style={styles.requiredMark}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={patientPhone}
            onChangeText={setPatientPhone}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            placeholderTextColor="#94A3B8"
          />
          {!!phoneError && <Text style={styles.errorText}>{phoneError}</Text>}

          <Text style={styles.label}>
            Email <Text style={styles.requiredMark}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={patientEmail}
            onChangeText={setPatientEmail}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#94A3B8"
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <TouchableOpacity
            style={[styles.confirmBtn, submitting && styles.disabledBtn]}
            onPress={onConfirmBooking}
            disabled={submitting || !isFormValid}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={navigation.goBack} disabled={submitting}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={modePickerOpen}
        animationType="fade"
        onRequestClose={() => setModePickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setModePickerOpen(false)} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select consultation mode</Text>
          {MODE_OPTIONS.map((option) => {
            const active = option === selectedMode;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, active && styles.modalOptionActive]}
                onPress={() => {
                  setSelectedMode(option);
                  setModePickerOpen(false);
                }}
              >
                <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3FF" },
  scrollContent: { padding: 16, paddingBottom: 28, gap: 12 },
  heroCard: {
    backgroundColor: "#1E40AF",
    borderRadius: 16,
    padding: 16,
  },
  heroTag: {
    color: "#BFDBFE",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 6,
  },
  summary: { marginTop: 8, color: "#DBEAFE", fontSize: 13, marginBottom: 14 },
  metaRow: { flexDirection: "row", gap: 10 },
  metaPill: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaPillLabel: { color: "#BFDBFE", fontSize: 11, fontWeight: "600" },
  metaPillValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginTop: 2 },
  modeDropdown: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modeDropdownArrow: { color: "#BFDBFE", fontSize: 11, fontWeight: "700", marginTop: 1 },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  formTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 2 },
  label: { color: "#374151", fontWeight: "600", marginBottom: 6, marginTop: 8 },
  requiredMark: { color: "#DC2626", fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  confirmBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: { backgroundColor: "#93C5FD" },
  confirmText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 4 },
  backBtn: { marginTop: 10, alignItems: "center", justifyContent: "center", minHeight: 40 },
  backText: { color: "#2563EB", fontWeight: "600" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "35%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalOptionActive: {
    backgroundColor: "#EFF6FF",
  },
  modalOptionText: { color: "#1F2937", fontSize: 14, fontWeight: "600" },
  modalOptionTextActive: { color: "#2563EB" },
});

export default BookingScreen;
