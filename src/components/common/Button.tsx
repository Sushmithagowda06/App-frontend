import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../../styles/colors";

interface Props {
  title: string;
  onPress?: () => void;
}

const Button: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});