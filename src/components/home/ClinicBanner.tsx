import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";

interface ClinicBannerProps {
  imageSource?: ImageSourcePropType;
}

const ClinicBanner: React.FC<ClinicBannerProps> = ({ imageSource }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visit Our Clinic</Text>
      <Text style={styles.subtitle}>
        Get medicines, tests and checkups from modern clinics.
      </Text>

      <TouchableOpacity style={styles.cta}>
        <Text style={styles.ctaText}>Book appointment</Text>
      </TouchableOpacity>

      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      ) : null}
    </View>
  );
};

export default ClinicBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EAE3FF",
    padding: 14,
    borderRadius: 14,
    marginVertical: 10,
    minHeight: 168,
    overflow: "hidden",
  },
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    maxWidth: "58%",
  },
  subtitle: {
    marginTop: 6,
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "58%",
  },
  cta: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#6520C8",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  image: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 140,
    height: 120,
  },
});