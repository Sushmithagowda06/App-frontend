import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../styles/colors";

export type HamburgerMenuItemId =
  | "patient"
  | "doctor"
  | "payment"
  | "nursing"
  | "records"
  | "reports"
  | "logout";

export interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  onItemPress: (id: HamburgerMenuItemId) => void;
}

const MENU_ROWS: { id: HamburgerMenuItemId; label: string }[] = [
  { id: "patient", label: "Patient" },
  { id: "doctor", label: "Doctor" },
  { id: "payment", label: "Payment" },
  { id: "nursing", label: "Nursing" },
  { id: "records", label: "Records" },
  { id: "reports", label: "Reports" },
  { id: "logout", label: "Logout" },
];

function useScreenWidth() {
  return useMemo(() => Dimensions.get("window").width, []);
}

const CLOSE_HIT = 44;

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  visible,
  onClose,
  onItemPress,
}) => {
  const insets = useSafeAreaInsets();
  const screenW = useScreenWidth();
  const slideAnim = useRef(new Animated.Value(-screenW)).current;
  const [modalShown, setModalShown] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalShown(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!modalShown) return;

    if (visible) {
      slideAnim.setValue(-screenW);
      const id = requestAnimationFrame(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }).start();
      });
      return () => cancelAnimationFrame(id);
    }

    const anim = Animated.timing(slideAnim, {
      toValue: -screenW,
      duration: 220,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) setModalShown(false);
    });
    return () => anim.stop();
  }, [visible, modalShown, screenW, slideAnim]);

  return (
    <Modal
      visible={modalShown}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              width: screenW,
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={[styles.headerSide, { minWidth: CLOSE_HIT }]}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
              >
                <Text style={styles.closeSymbol}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.panelTitle}>Menu</Text>
            <View style={[styles.headerSide, { minWidth: CLOSE_HIT }]} />
          </View>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {MENU_ROWS.map((row) => (
              <TouchableOpacity
                key={row.id}
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => {
                  onItemPress(row.id);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    row.id === "logout" && styles.rowLabelLogout,
                  ]}
                >
                  {row.label}
                </Text>
                <Text
                  style={[
                    styles.rowChevron,
                    row.id === "logout" && styles.rowChevronLogout,
                  ]}
                >
                  {">"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default HamburgerMenu;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerSide: {
    width: "25%",
  },
  closeButton: {
    width: CLOSE_HIT,
    height: CLOSE_HIT,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  closeSymbol: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.text,
    fontWeight: "300",
  },
  panelTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  rowLabelLogout: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  rowChevron: {
    fontSize: 18,
    color: colors.gray,
    marginLeft: 12,
    fontWeight: "400",
  },
  rowChevronLogout: {
    color: "#B91C1C",
  },
});