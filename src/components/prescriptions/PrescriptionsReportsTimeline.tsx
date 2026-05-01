import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  FlatList,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

/* ─── Types ─────────────────────────────────────────── */

export type DocumentEntry = {
  id: number;
  file_name: string;
  file_url: string;
};

export type TimelineEntry = {
  id: string;
  date: string;
  title: "Prescription" | "Report";
  detail: string;
  doctor: string;
  documents: DocumentEntry[];
};

/* ─── Open PDF via Linking ───────────────────────────── */

const openPdf = async (
  doc: DocumentEntry,
  setOpeningId: (id: number | null) => void
) => {
  try {
    setOpeningId(doc.id);
    const supported = await Linking.canOpenURL(doc.file_url);
    if (supported) {
      await Linking.openURL(doc.file_url);
    } else {
      Alert.alert("Error", "Cannot open this file on your device.");
    }
  } catch (e: any) {
    Alert.alert("Error", e.message || "Could not open file");
  } finally {
    setOpeningId(null);
  }
};

/* ─── Document list bottom sheet ─────────────────────── */

interface DocModalProps {
  visible: boolean;
  prescriptionTitle: string;
  documents: DocumentEntry[];
  onClose: () => void;
}

const DocumentListModal: React.FC<DocModalProps> = ({
  visible,
  prescriptionTitle,
  documents,
  onClose,
}) => {
  const [openingId, setOpeningId] = useState<number | null>(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <SafeAreaView style={modal.sheet}>
          {/* Handle */}
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.header}>
            <View>
              <Text style={modal.headerTitle}>Attached Documents</Text>
              <Text style={modal.headerSub}>
                {prescriptionTitle} · {documents.length}{" "}
                {documents.length === 1 ? "file" : "files"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Document list */}
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={modal.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={modal.docRow}
                onPress={() => openPdf(item, setOpeningId)}
                disabled={openingId === item.id}
                activeOpacity={0.7}
              >
                {/* Index badge */}
                <View style={modal.indexBadge}>
                  <Text style={modal.indexText}>{index + 1}</Text>
                </View>

                {/* PDF icon */}
                <View style={modal.pdfIcon}>
                  <Ionicons name="document-text" size={22} color="#B91C1C" />
                </View>

                {/* File name */}
                <View style={modal.fileInfo}>
                  <Text style={modal.fileName} numberOfLines={1}>
                    {item.file_name}
                  </Text>
                  <Text style={modal.fileUrl} numberOfLines={1}>
                    {item.file_url}
                  </Text>
                </View>

                {/* Open button */}
                {openingId === item.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={modal.openBtn}>
                    <Text style={modal.openBtnText}>Open</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            /* Divider between items */
            ItemSeparatorComponent={() => <View style={modal.separator} />}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

/* ─── Timeline ───────────────────────────────────────── */

type Props = {
  entries: TimelineEntry[];
};

export default function PrescriptionsReportsTimeline({ entries }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.line} />

      {entries.map((entry, index) => {
        const isPrescription = entry.title === "Prescription";
        const docCount = entry.documents?.length ?? 0;

        return (
          <View key={entry.id} style={styles.row}>
            {/* Timeline dot */}
            <View
              style={[
                styles.dot,
                isPrescription ? styles.dotPrescription : styles.dotReport,
              ]}
            />

            {/* Card */}
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{entry.date}</Text>
                <View
                  style={[
                    styles.tag,
                    isPrescription ? styles.tagPrescription : styles.tagReport,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isPrescription
                        ? styles.tagTextPrescription
                        : styles.tagTextReport,
                    ]}
                  >
                    {entry.title}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text style={styles.detail}>{entry.detail}</Text>
              <Text style={styles.doctor}>{entry.doctor}</Text>

              {/* Documents section */}
              <View style={styles.docsSection}>
                <View style={styles.docsSectionHeader}>
                  <Ionicons
                    name="document-attach-outline"
                    size={14}
                    color={docCount > 0 ? colors.primary : colors.gray}
                  />
                  <Text
                    style={[
                      styles.docsSectionTitle,
                      docCount === 0 && styles.docsSectionTitleNone,
                    ]}
                  >
                    {docCount === 0
                      ? "No documents attached"
                      : `${docCount} document${docCount > 1 ? "s" : ""} attached`}
                  </Text>
                </View>

                {/* Preview of first 2 docs */}
                {docCount > 0 && (
                  <View style={styles.docPreviewList}>
                    {entry.documents.slice(0, 2).map((doc, i) => (
                      <View key={doc.id} style={styles.docPreviewRow}>
                        <Ionicons
                          name="document-text-outline"
                          size={13}
                          color="#B91C1C"
                        />
                        <Text style={styles.docPreviewName} numberOfLines={1}>
                          {doc.file_name}
                        </Text>
                      </View>
                    ))}
                    {docCount > 2 && (
                      <Text style={styles.docMoreText}>
                        +{docCount - 2} more file{docCount - 2 > 1 ? "s" : ""}
                      </Text>
                    )}
                  </View>
                )}

                {/* View all button */}
                {docCount > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={() => setSelectedEntry(entry)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>View all documents</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={13}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {index === entries.length - 1 && (
              <View style={styles.lineEndSpacer} />
            )}
          </View>
        );
      })}

      {/* Document bottom sheet */}
      {selectedEntry && (
        <DocumentListModal
          visible={!!selectedEntry}
          prescriptionTitle={selectedEntry.title}
          documents={selectedEntry.documents}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrap: { marginTop: 20, paddingLeft: 8 },
  line: {
    position: "absolute",
    left: 17,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#CBD5E1",
  },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: "#fff",
    marginTop: 16,
    zIndex: 1,
  },
  dotPrescription: { borderColor: "#7C3AED" },
  dotReport: { borderColor: "#0EA5E9" },
  card: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: { fontSize: 13, color: "#64748B", fontWeight: "600" },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagPrescription: { backgroundColor: "#EDE9FE" },
  tagReport: { backgroundColor: "#E0F2FE" },
  tagText: { fontSize: 12, fontWeight: "700" },
  tagTextPrescription: { color: "#6D28D9" },
  tagTextReport: { color: "#0369A1" },
  detail: { fontSize: 14, lineHeight: 20, color: "#1F2937" },
  doctor: { marginTop: 6, fontSize: 13, color: "#6B7280", fontWeight: "500" },

  /* Documents section inside card */
  docsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  docsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  docsSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  docsSectionTitleNone: { color: colors.gray, fontWeight: "400" },
  docPreviewList: { gap: 5, marginBottom: 10 },
  docPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  docPreviewName: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  docMoreText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: "italic",
    paddingLeft: 4,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  lineEndSpacer: { height: 8 },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  headerSub: { fontSize: 12, color: colors.gray, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  separator: { height: 1, backgroundColor: "#F8FAFC" },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  indexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  pdfIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, color: colors.text, fontWeight: "600" },
  fileUrl: { fontSize: 11, color: colors.gray, marginTop: 2 },
  openBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openBtnText: { fontSize: 12, color: "#fff", fontWeight: "600" },
});