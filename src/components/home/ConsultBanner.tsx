import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";

interface ConsultBannerProps {
  imageSource?: ImageSourcePropType;
}

const ConsultBanner: React.FC<ConsultBannerProps> = ({ imageSource }) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>In just 15 mins</Text>
      </View>

      <Text style={styles.title}>Instant online consultation</Text>
      <Text style={styles.subtitle}>
        Speak to a Clinikk doctor from the convenience of your home.
      </Text>

      <TouchableOpacity style={styles.cta}>
        <Text style={styles.ctaText}>Consult now</Text>
      </TouchableOpacity>

      <View style={styles.bottomStrip}>
        <Text style={styles.bottomStripText}>Doctors on call 24x7</Text>
      </View>

      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      ) : null}
    </View>
  );
};

export default ConsultBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#DDE7FF",
    borderRadius: 14,
    marginVertical: 10,
    padding: 14,
    paddingBottom: 38,
    minHeight: 168,
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    left: 10,
    top: 0,
    backgroundColor: "#0C6DE9",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    marginTop: 18,
    color: "#0F172A",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
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
    backgroundColor: "#173E95",
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
    bottom: 10,
    width: 140,
    height: 120,
  },
  bottomStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    backgroundColor: "#0F3277",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomStripText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});