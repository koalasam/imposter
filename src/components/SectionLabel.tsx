import React from "react";
import { StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@/theme/theme";

interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <Text
      style={styles.label}
      accessibilityRole="header"
      maxFontSizeMultiplier={1.4}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
