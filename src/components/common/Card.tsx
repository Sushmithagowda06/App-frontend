import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { colors } from "../../styles/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
};

const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    elevation: 6,
    shadowColor: "#000",
  },
});