import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../../navigation/HomeStackNavigator";
import HamburgerMenu, {
  type HamburgerMenuItemId,
} from "../common/HamburgerMenu";
import DoctorSearchModal from "../../screens/Doctorsearchmodal";   // ← new import

export type MainTabParamList = {
  Home: undefined;
  Doctor: undefined;
  Profile: undefined;
};

interface TopBarProps {
  scrolled?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ scrolled = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);   // ← new state
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const handleMenuItem = useCallback(
    (id: HamburgerMenuItemId) => {
      switch (id) {
        case "patient":
          navigation.navigate("HomeMain");
          break;
        case "doctor":
          tabNavigation?.navigate("Doctor");
          break;
        case "payment":
          Alert.alert("Payment", "Payment flows will be available here.");
          break;
        case "nursing":
          Alert.alert("Nursing", "Nursing services will be available here.");
          break;
        case "records":
          tabNavigation?.navigate("Profile");
          break;
        case "reports":
          navigation.navigate("PrescriptionsReports");
          break;
        case "logout":
          Alert.alert("Logout", "You have been logged out.");
          break;
        default:
          break;
      }
    },
    [navigation, tabNavigation]
  );

  return (
    <View style={[styles.container, scrolled && styles.containerScrolled]}>
      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Text style={[styles.menu, scrolled && styles.menuScrolled]}>☰</Text>
      </TouchableOpacity>

      <Text style={[styles.name, scrolled && styles.nameScrolled]}>Manu Amidal</Text>

      <View style={styles.rightActions}>
        {/* ── Search icon ── */}
        <TouchableOpacity
          onPress={() => setSearchOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Search doctors"
        >
          <Ionicons
            name="search"
            size={20}
            color={scrolled ? "#111827" : "#fff"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.switch, scrolled && styles.switchScrolled]}>
          <Text style={[styles.switchText, scrolled && styles.switchTextScrolled]}>
            Switch profile
          </Text>
        </TouchableOpacity>
      </View>

      <HamburgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onItemPress={handleMenuItem}
      />

      {/* ── Search modal ── */}
      <DoctorSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  containerScrolled: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menu: {
    fontSize: 20,
    color: "#fff",
  },
  menuScrolled: {
    color: "#111827",
  },
  name: {
    color: "#fff",
    fontWeight: "600",
  },
  nameScrolled: {
    color: "#111827",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switch: {
    backgroundColor: "#EEE8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  switchScrolled: {
    backgroundColor: "#F3F4F6",
  },
  switchText: {
    color: "#5B2EFF",
    fontSize: 12,
  },
  switchTextScrolled: {
    color: "#111827",
  },
});