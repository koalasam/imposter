import React from "react";
import { StyleSheet, Text, View, Switch, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing, typography } from "@/theme/theme";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

interface HintToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function HintToggle({ enabled, onChange }: HintToggleProps) {
  const handleChange = (value: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(value);
  };

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <SectionLabel>Imposter Hint</SectionLabel>
          <Text style={styles.description} maxFontSizeMultiplier={1.6}>
            Give imposters a subtle clue related to the word.
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleChange}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={Platform.OS === "android" ? colors.white : undefined}
          ios_backgroundColor={colors.border}
          accessibilityLabel="Imposter hint"
          accessibilityHint="When on, imposters see a subtle clue related to the secret word"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
});
