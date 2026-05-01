// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   Pressable,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { RouteProp } from "@react-navigation/native";
// import ConsultationModeToggle, { ConsultMode } from "../components/ConsultationMode";
// import CustomTimeSlotPicker from "../components/CustomTimeSlotPicker";
// import DateSelector from "../components/Dateselector";
// import DoctorCard from "../components/DoctorCard";
// import TimeSlotsGrid, { TimeSlot } from "../components/TimeSlot";
// import type { Doctor } from "../data/doctors";
// import { getAvailableSlots } from "../services/bookingApi";

// const API_BASE_URL =
//   Platform.OS === "android"
//     ? "http://10.0.2.2:8000"
//     : "http://localhost:8000";

// const DAYS_TO_SHOW = 7;

// const getDateLabel = (date: Date) => {
//   const day = date.toLocaleDateString("en-US", { weekday: "short" });
//   const dayNum = date.getDate();
//   return { day, dayNum, key: date.toISOString().split("T")[0] };
// };

// const buildUpcomingDates = () => {
//   const now = new Date();
//   return Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
//     const d = new Date(now);
//     d.setDate(now.getDate() + i);
//     return getDateLabel(d);
//   });
// };

// const upcomingDates = buildUpcomingDates();

// type AvailabilityRouteParams = {
//   AvailabilityDetails: { doctor?: Doctor };
// };

// type DoctorAvailabilityScreenProps = {
//   route?: RouteProp<AvailabilityRouteParams, "AvailabilityDetails">;
//   navigation: {
//     navigate: (screen: string, params?: object) => void;
//   };
// };

// const DoctorAvailabilityScreen = ({ route, navigation }: DoctorAvailabilityScreenProps) => {
//   const [mode, setMode] = useState<ConsultMode>("Video");
//   const [selectedDateKey, setSelectedDateKey] = useState(upcomingDates[0].key);
//   const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [loadingDoctors, setLoadingDoctors] = useState(false);
//   const [loadingSlots, setLoadingSlots] = useState(false);
//   const [slotError, setSlotError] = useState("");
//   const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
//   const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(route?.params?.doctor ?? null);
//   const [suggestedDoctors, setSuggestedDoctors] = useState<Doctor[]>([]);
//   const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
//   const [customSlotLabel, setCustomSlotLabel] = useState(""); // ← NEW

//   const selectedDoctor = activeDoctor;

//   const notify = (title: string, message: string) => {
//     if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
//     else Alert.alert(title, message);
//   };

//   const normalizeSlotLabel = (value: string) => {
//     const compact = value.trim().toUpperCase().replace(/\s+/g, " ");
//     const match = compact.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
//     if (!match) return null;
//     const hh = Number(match[1]);
//     const mm = match[2];
//     if (hh < 1 || hh > 12) return null;
//     return `${String(hh).padStart(2, "0")}:${mm} ${match[3]}`;
//   };

//   const toMinutesFrom12h = (label: string): number | null => {
//     const match = label.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
//     if (!match) return null;
//     let hour = Number(match[1]) % 12;
//     const minute = Number(match[2]);
//     const isPM = match[3].toUpperCase() === "PM";
//     if (isPM) hour += 12;
//     return hour * 60 + minute;
//   };

//   const toMinutesFrom24h = (label: string): number | null => {
//     const match = label.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
//     if (!match) return null;
//     const hour = Number(match[1]);
//     const minute = Number(match[2]);
//     return hour * 60 + minute;
//   };

//   const applyCustomSlot = (value: string) => {
//     if (!selectedDoctor) return;
//     const normalized = normalizeSlotLabel(value);
//     if (!normalized) {
//       notify("Invalid time format", "Use time like 10:00 AM.");
//       return;
//     }

//     setCustomSlotLabel(normalized); // ← SAVE custom slot label

//     const matched = availableSlots.find((slot) => slot.label === normalized);
//     if (!matched) {
//       const customMinutes = toMinutesFrom12h(normalized);
//       const matchingDoctors =
//         customMinutes === null
//           ? []
//           : (doctors as any[]).filter((doc) => {
//               if (!doc?.available_from || !doc?.available_to) return false;
//               const from = toMinutesFrom24h(String(doc.available_from));
//               const to = toMinutesFrom24h(String(doc.available_to));
//               if (from === null || to === null) return false;
//               return customMinutes >= from && customMinutes < to;
//             });
//       const suggested = matchingDoctors.filter((doc) => doc?.id !== selectedDoctor.id);
//       setSuggestedDoctors(suggested.slice(0, 6));
//       const suggestedNames = suggested.map((doc) => doc?.name).slice(0, 5);

//       notify(
//         "Doctor unavailable",
//         suggestedNames.length > 0
//           ? `This doctor is not available at ${normalized}.\n\nAvailable doctors at this time:\n- ${suggestedNames.join("\n- ")}`
//           : `This doctor is not available at ${normalized}.\n\nNo other doctors are currently available at this time.`
//       );
//       if (suggested.length > 0) {
//         setSuggestionModalOpen(true);
//       }
//       return;
//     }
//     setSelectedSlot(matched);
//   };

//   useEffect(() => {
//     setSelectedSlot(null);
//   }, [selectedDateKey, mode]);

//   useEffect(() => {
//     setActiveDoctor(route?.params?.doctor ?? null);
//   }, [route?.params?.doctor]);

//   useEffect(() => {
//     let cancelled = false;
//     const fetchSlots = async () => {
//       if (!selectedDoctor) {
//         setAvailableSlots([]);
//         setSlotError("");
//         return;
//       }
//       try {
//         setLoadingSlots(true);
//         setSlotError("");
//         const slots = await getAvailableSlots(selectedDoctor.id, selectedDateKey);
//         if (cancelled) return;
//         setAvailableSlots(
//           slots.map((label) => ({
//             id: label,
//             label,
//             available: true,
//           }))
//         );
//       } catch (error: any) {
//         if (!cancelled) {
//           setAvailableSlots([]);
//           setSlotError(error?.message ?? "Failed to load available slots");
//         }
//       } finally {
//         if (!cancelled) setLoadingSlots(false);
//       }
//     };
//     fetchSlots();
//     return () => { cancelled = true; };
//   }, [selectedDoctor, selectedDateKey]);

//   useEffect(() => {
//     let cancelled = false;
//     const fetchDoctors = async () => {
//       try {
//         setLoadingDoctors(true);
//         const r = await fetch(
//           `${API_BASE_URL}/api/doctors?date=${selectedDateKey}&mode=${encodeURIComponent(mode)}`
//         );
//         const payload = await r.json();
//         console.log("API doctor sample:", JSON.stringify(payload.doctors?.[0]));
//         if (!cancelled && r.ok) {
//           const mapped = (payload.doctors ?? []).map((doc: any) => ({
//             ...doc,
//             fee: doc.fee ?? doc.consultation_fee ?? doc.consultationFee ?? doc.price ?? 0,
//           }));
//           setDoctors(mapped);
//         }
//       } catch {
//         if (!cancelled) setDoctors([]);
//       } finally {
//         if (!cancelled) setLoadingDoctors(false);
//       }
//     };
//     fetchDoctors();
//     return () => { cancelled = true; };
//   }, [mode, selectedDateKey]);

//   const selectedSummary = useMemo(() => {
//     const d = new Date(`${selectedDateKey}T12:00:00`);
//     if (Number.isNaN(d.getTime())) return null;
//     const day = d.toLocaleDateString("en-US", { weekday: "short" });
//     const dayNum = d.getDate();
//     const base = `${day}, ${dayNum} • ${mode}`;
//     return selectedSlot ? `${base} • ${selectedSlot.label}` : base;
//   }, [mode, selectedDateKey, selectedSlot]);

//   const canBook = !!selectedDoctor && !!selectedSlot;

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Doctor Availability</Text>
//         <Text style={styles.subtitle}>Choose your doctor, date, and time slot</Text>
//       </View>

//       <ConsultationModeToggle value={mode} onChange={setMode} />

//       <DateSelector
//         dates={upcomingDates}
//         selectedDateKey={selectedDateKey}
//         onSelectDate={setSelectedDateKey}
//       />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {selectedDoctor ? (
//           <View style={styles.selectedDoctorBlock}>
//             <DoctorCard doctor={selectedDoctor} showAvailabilityButton={false} />
//           </View>
//         ) : null}

//         {selectedDoctor ? (
//           <>
//             <CustomTimeSlotPicker onApply={applyCustomSlot} disabled={loadingSlots} />
//             {loadingSlots ? (
//               <View style={styles.feedbackBox}>
//                 <ActivityIndicator size="small" color="#2563EB" />
//                 <Text style={styles.feedbackText}>Loading available slots...</Text>
//               </View>
//             ) : slotError ? (
//               <View style={styles.feedbackBox}>
//                 <Text style={styles.feedbackText}>{slotError}</Text>
//               </View>
//             ) : availableSlots.length === 0 ? (
//               <View style={styles.feedbackBox}>
//                 <Text style={styles.feedbackText}>No slots available for this date.</Text>
//               </View>
//             ) : (
//               <TimeSlotsGrid
//                 slots={availableSlots}
//                 selectedSlotId={selectedSlot?.id ?? null}
//                 onSelectSlot={setSelectedSlot}
//               />
//             )}
//           </>
//         ) : null}

//         {loadingDoctors ? (
//           <View style={styles.feedbackBox}>
//             <ActivityIndicator size="small" color="#2563EB" />
//             <Text style={styles.feedbackText}>Loading doctors...</Text>
//           </View>
//         ) : !selectedDoctor && doctors.length > 0 ? (
//           doctors.map((doc) => (
//             <View key={doc.id} style={styles.listItem}>
//               <DoctorCard doctor={doc} showAvailabilityButton={false} />
//             </View>
//           ))
//         ) : null}
//       </ScrollView>

//       <View style={styles.bottomBar}>
//         <Text style={styles.selectionText}>
//           {selectedSummary ?? "Select a slot to continue"}
//         </Text>
//         <TouchableOpacity
//           style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]}
//           disabled={!canBook}
//           onPress={() => {
//             if (!selectedDoctor || !selectedSlot) return;
//             navigation.navigate("Booking", {
//               doctor: selectedDoctor,
//               dateKey: selectedDateKey,
//               slotLabel: selectedSlot.label,
//               mode,
//             });
//           }}
//         >
//           <Text style={styles.bookBtnText}>Book Appointment</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Suggestion Modal */}
//       <Modal
//         transparent
//         visible={suggestionModalOpen}
//         animationType="fade"
//         onRequestClose={() => setSuggestionModalOpen(false)}
//       >
//         <Pressable style={styles.modalBackdrop} onPress={() => setSuggestionModalOpen(false)} />
//         <View style={styles.modalCard}>
//           <Text style={styles.modalTitle}>Available Doctors at {customSlotLabel}</Text>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             {suggestedDoctors.map((doc) => (
//               <View key={doc.id} style={styles.modalOption}>
//                 {/* Doctor Info */}
//                 <View style={styles.modalDocInfo}>
//                   <Text style={styles.modalOptionText}>{doc.name}</Text>
//                   <Text style={styles.modalOptionSub}>
//                     {(doc as any).specialty ?? (doc as any).specialization ?? "Doctor"} •{" "}
//                     {(doc as any).experience?.years ?? (doc as any).experience_years ?? 0} yrs
//                   </Text>
//                   <Text style={styles.modalOptionFee}>
//                     Rs {(doc as any).fee ?? (doc as any).consultation_fee ?? "N/A"}
//                   </Text>
//                 </View>

//                 {/* Book Now Button */}
//                 <TouchableOpacity
//                   style={styles.bookNowBtn}
//                   activeOpacity={0.8}
//                   onPress={() => {
//                     setSuggestionModalOpen(false);
//                     navigation.navigate("Booking", {
//                       doctor: doc,
//                       dateKey: selectedDateKey,
//                       slotLabel: customSlotLabel,
//                       mode,
//                     });
//                   }}
//                 >
//                   <Text style={styles.bookNowText}>Book Now</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F7F8FC" },
//   header: { paddingHorizontal: 16, paddingTop: 10 },
//   title: { fontSize: 22, fontWeight: "700", color: "#111827" },
//   subtitle: { marginTop: 4, color: "#6B7280", fontSize: 13 },
//   scroll: { flex: 1 },
//   scrollContent: { paddingBottom: 140 },
//   selectedDoctorBlock: { paddingHorizontal: 16, paddingTop: 20 },
//   listItem: { paddingHorizontal: 16, paddingTop: 10 },
//   feedbackBox: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     padding: 12,
//     marginHorizontal: 16,
//     marginTop: 12,
//     alignItems: "center",
//     gap: 6,
//   },
//   feedbackText: { color: "#6B7280", fontSize: 13, textAlign: "center" },
//   bottomBar: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     paddingBottom: 16,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
//   selectionText: { color: "#374151", marginBottom: 10, fontSize: 13 },
//   bookBtn: {
//     backgroundColor: "#2563EB",
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 13,
//     minHeight: 48,
//   },
//   bookBtnDisabled: { backgroundColor: "#93C5FD" },
//   bookBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
//   modalBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.35)",
//   },
//   modalCard: {
//     position: "absolute",
//     left: 20,
//     right: 20,
//     top: "25%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     padding: 14,
//     maxHeight: "55%",
//   },
//   modalTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
//   modalOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   modalDocInfo: { flex: 1, marginRight: 10 },
//   modalOptionText: { color: "#1F2937", fontSize: 14, fontWeight: "700" },
//   modalOptionSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
//   modalOptionFee: { color: "#2563EB", fontSize: 12, fontWeight: "600", marginTop: 2 },
//   bookNowBtn: {
//     backgroundColor: "#2563EB",
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//   },
//   bookNowText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
// });

// export default DoctorAvailabilityScreen;