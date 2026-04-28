import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WhatsAppHelpBar = () => {
  const phone = "7483068353";

  const openWhatsApp = async () => {
    const waUrl = `whatsapp://send?phone=91${phone}`;
    const webUrl = `https://wa.me/91${phone}`;

    try {
      const supported = await Linking.canOpenURL(waUrl);
      await Linking.openURL(supported ? waUrl : webUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={openWhatsApp}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="logo-whatsapp" size={22} color="#16A34A" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.text}>Need Help? Message Us</Text>
        {/* <Text style={styles.subText}>WhatsApp: {phone}</Text> */}
      </View>
    </TouchableOpacity>
  );
};

export default WhatsAppHelpBar;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 40,
    minHeight: 58,
    backgroundColor: "#DDF4F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  subText: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
});
