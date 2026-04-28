import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import DoctorSearchModal from "../../screens/Doctorsearchmodal";
 
// ─── Gemini API config ────────────────────────────────────────────────────────
// Replace with your actual key from https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
interface GeminiAnalysis {
  specialization: string;   // top recommended specialization (matches your DB)
  keywords: string[];       // detected symptoms
  summary: string;          // short summary
  urgency: "low" | "medium" | "high";
  urgency_reason: string;
  all_specializations: string[]; // all recommended, in order
}
 
// ─── Example stories ─────────────────────────────────────────────────────────
 
const EXAMPLES = [
  { icon: "💨", label: "Breathing", text: "I have been coughing a lot with yellowish mucus, feeling breathless on stairs, with chest tightness at night and a mild fever." },
  { icon: "🦴", label: "Joints",    text: "My knees are swollen and painful for 3 weeks. Stiff in the morning for an hour. Fingers sore with redness around the knuckles." },
  { icon: "🧠", label: "Head",      text: "Severe headache on one side for 2 days with nausea, dizziness and sensitivity to light and sound." },
  { icon: "🤢", label: "Stomach",   text: "Stomach cramps and loose stools 3-4 times a day for 2 days. Nauseous, bloated, no appetite." },
];
 
const URGENCY_CONFIG = {
  high:   { color: "#C0392B", bg: "#FEF2F2", border: "#FECACA", icon: "🚨", label: "See a doctor urgently" },
  medium: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "⚡", label: "See a doctor soon" },
  low:    { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", icon: "📅", label: "Routine visit" },
};
 
// ─── Gemini call ──────────────────────────────────────────────────────────────
 
async function analyzeWithGemini(story: string): Promise<GeminiAnalysis> {
  const prompt = `You are a medical assistant. Analyze this health story and respond ONLY with valid JSON, no markdown.
 
Health story: "${story}"
 
Return exactly this JSON:
{
  "specialization": "single best matching doctor specialization from: Cardiologist, Pulmonologist, Orthopedist, Gastroenterologist, Neurologist, Ophthalmologist, Dermatologist, ENT Specialist, Rheumatologist, General Physician",
  "all_specializations": ["list", "of", "recommended", "specializations", "in", "order"],
  "keywords": ["symptom1", "symptom2", "symptom3"],
  "summary": "1-2 sentence plain language summary of the health concern",
  "urgency": "low or medium or high",
  "urgency_reason": "brief reason for urgency level"
}
 
Rules:
- specialization must EXACTLY match one of the listed options
- keywords: 3-6 key symptoms extracted from the story
- urgency high = emergency/very concerning, medium = needs prompt attention, low = routine`;
 
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    }),
  });
 
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Gemini error ${response.status}`);
  }
 
  const data = await response.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as GeminiAnalysis;
}
 
// ─── Component ────────────────────────────────────────────────────────────────
 
const HealthStoryBot: React.FC = () => {
  const [botVisible, setBotVisible]       = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [story, setStory]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [analysis, setAnalysis]           = useState<GeminiAnalysis | null>(null);
  const [error, setError]                 = useState<string | null>(null);
 
  // Specialization to pre-fill in DoctorSearchModal
  const [targetSpec, setTargetSpec]       = useState<string | undefined>(undefined);
 
  // Pulse animation for the FAB
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
 
  const handleOpen = () => {
    setStory("");
    setAnalysis(null);
    setError(null);
    setBotVisible(true);
  };
 
  const handleClose = () => {
    setBotVisible(false);
  };
 
  const handleAnalyze = async () => {
    if (story.trim().length < 15) {
      setError("Please describe your symptoms in a bit more detail.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeWithGemini(story);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleFindDoctors = () => {
    if (!analysis) return;
    setTargetSpec(analysis.specialization);
    setBotVisible(false);
    // Small delay so bot modal fully closes before search opens
    setTimeout(() => setSearchVisible(true), 350);
  };
 
  const urgency = analysis ? URGENCY_CONFIG[analysis.urgency] : null;
 
  return (
    <>
      {/* ── Floating Action Button ── */}
      <Animated.View style={[styles.fab, { transform: [{ scale: pulse }] }]}>
        <TouchableOpacity
          onPress={handleOpen}
          style={styles.fabInner}
          activeOpacity={0.85}
          accessibilityLabel="Open AI health bot"
        >
          <Text style={styles.fabEmoji}>🤖</Text>
        </TouchableOpacity>
      </Animated.View>
 
      {/* ── Bot Modal ── */}
      <Modal
        visible={botVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}>
                  <Text style={{ fontSize: 20 }}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Health Story Bot</Text>
                  <Text style={styles.headerSub}>Powered by Gemini AI</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>
 
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Intro text */}
              {!analysis && (
                <View style={styles.intro}>
                  <Text style={styles.introTitle}>Tell me what you're feeling</Text>
                  <Text style={styles.introSub}>
                    Describe your symptoms naturally — I'll recommend the right doctor for you.
                  </Text>
                </View>
              )}
 
              {/* Text input */}
              {!analysis && (
                <>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={5}
                    placeholder="E.g. I've had a sharp chest pain for 3 days when I breathe, feel short of breath and slightly feverish..."
                    placeholderTextColor={colors.gray}
                    value={story}
                    onChangeText={(t) => { setStory(t); setError(null); }}
                    textAlignVertical="top"
                  />
 
                  {/* Example chips */}
                  <Text style={styles.exLabel}>Quick examples:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {EXAMPLES.map((ex) => (
                      <TouchableOpacity
                        key={ex.label}
                        style={styles.exChip}
                        onPress={() => setStory(ex.text)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.exChipText}>{ex.icon} {ex.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
 
              {/* Error */}
              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="warning-outline" size={16} color="#C0392B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
 
              {/* Loading */}
              {loading && (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={styles.loadingText}>Analyzing your story…</Text>
                </View>
              )}
 
              {/* ── Analysis Result ── */}
              {analysis && !loading && (
                <View style={styles.resultContainer}>
                  {/* Keywords */}
                  <View style={styles.keywordsCard}>
                    <Text style={styles.resultLabel}>Detected Symptoms</Text>
                    <View style={styles.keywordsRow}>
                      {analysis.keywords.map((kw) => (
                        <View key={kw} style={styles.kwChip}>
                          <Text style={styles.kwChipText}>{kw}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
 
                  {/* Summary */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.resultLabel}>Summary</Text>
                    <Text style={styles.summaryText}>{analysis.summary}</Text>
                  </View>
 
                  {/* Urgency */}
                  {urgency && (
                    <View style={[styles.urgencyCard, { backgroundColor: urgency.bg, borderColor: urgency.border }]}>
                      <Text style={styles.urgencyIcon}>{urgency.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.urgencyLabel, { color: urgency.color }]}>{urgency.label}</Text>
                        <Text style={styles.urgencyReason}>{analysis.urgency_reason}</Text>
                      </View>
                    </View>
                  )}
 
                  {/* Recommended specialization */}
                  <View style={styles.specCard}>
                    <Text style={styles.resultLabel}>Top Recommended Specialist</Text>
                    <View style={styles.specRow}>
                      <View style={styles.specIconBox}>
                        <Ionicons name="medical" size={22} color={colors.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.specName}>{analysis.specialization}</Text>
                        {analysis.all_specializations.length > 1 && (
                          <Text style={styles.specOthers}>
                            Also: {analysis.all_specializations.slice(1).join(", ")}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
 
                  {/* Edit story link */}
                  <TouchableOpacity
                    style={styles.editLink}
                    onPress={() => setAnalysis(null)}
                  >
                    <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                    <Text style={styles.editLinkText}>Edit my story</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
 
            {/* Bottom CTA */}
            <View style={styles.bottomBar}>
              {!analysis ? (
                <TouchableOpacity
                  style={[styles.analyzeBtn, (loading || story.trim().length < 15) && styles.analyzeBtnDisabled]}
                  onPress={handleAnalyze}
                  disabled={loading || story.trim().length < 15}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons name="search" size={18} color={colors.white} />
                  )}
                  <Text style={styles.analyzeBtnText}>
                    {loading ? "Analyzing…" : "Analyze My Story"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.findBtn}
                  onPress={handleFindDoctors}
                  activeOpacity={0.85}
                >
                  <Ionicons name="people" size={18} color={colors.white} />
                  <Text style={styles.findBtnText}>Find Doctors →</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
 
      {/* ── Doctor Search Modal (pre-filled by bot) ── */}
      <DoctorSearchModal
        visible={searchVisible}
        onClose={() => { setSearchVisible(false); setTargetSpec(undefined); }}
        initialSpecialization={targetSpec}
      />
    </>
  );
};
 
export default HealthStoryBot;
 
// ─── Styles ───────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  // FAB
  fab: {
    position: "absolute",
    bottom: 90,   // above bottom tab bar
    right: 20,
    zIndex: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  fabEmoji: { fontSize: 28 },
 
  // Modal container
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
 
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  headerSub:   { fontSize: 11, color: colors.gray, marginTop: 1 },
 
  // Scroll
  scrollContent: { padding: 20, paddingBottom: 12 },
 
  // Intro
  intro: { marginBottom: 20 },
  introTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 6 },
  introSub:   { fontSize: 14, color: colors.gray, lineHeight: 20 },
 
  // Text area
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 130,
    lineHeight: 22,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
 
  // Example chips
  exLabel: { fontSize: 11, fontWeight: "600", color: colors.gray, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  chipScroll: { marginBottom: 4 },
  exChip: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  exChipText: { fontSize: 13, color: colors.text, fontWeight: "500" },
 
  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { fontSize: 13, color: "#C0392B", flex: 1 },
 
  // Loading
  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 14 },
  loadingText: { fontSize: 14, color: colors.gray },
 
  // Results
  resultContainer: { gap: 12 },
 
  keywordsCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    opacity: 0.75,
  },
  keywordsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kwChip: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  kwChipText: { fontSize: 12.5, color: colors.white, fontWeight: "500" },
 
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  summaryText: { fontSize: 14, color: colors.text, lineHeight: 21 },
 
  urgencyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  urgencyIcon:   { fontSize: 20, marginTop: 1 },
  urgencyLabel:  { fontSize: 13.5, fontWeight: "700", marginBottom: 3 },
  urgencyReason: { fontSize: 12.5, color: "#4B5563", lineHeight: 18 },
 
  specCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  specRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  specIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  specName:   { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 3 },
  specOthers: { fontSize: 12, color: colors.gray },
 
  editLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
  },
  editLinkText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
 
  // Bottom bar
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  analyzeBtnDisabled: { opacity: 0.45 },
  analyzeBtnText: { fontSize: 16, fontWeight: "700", color: colors.white },
 
  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 16,
  },
  findBtnText: { fontSize: 16, fontWeight: "700", color: colors.white },
});