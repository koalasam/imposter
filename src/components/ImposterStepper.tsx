import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radii, spacing, typography } from "@/theme/theme";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

interface ImposterStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function ImposterStepper({
  value,
  min,
  max,
  onChange,
}: ImposterStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      Haptics.selectionAsync().catch(() => {});
      onChange(next);
    }
  };

  return (
    <Card>
      <SectionLabel>Imposters</SectionLabel>
      <View style={styles.row}>
        <StepButton
          symbol="−"
          disabled={!canDecrement}
          onPress={() => step(-1)}
          accessibilityLabel="Decrease number of imposters"
        />
        <Text style={styles.value} maxFontSizeMultiplier={1.4}>
          {value}
        </Text>
        <StepButton
          symbol="+"
          disabled={!canIncrement}
          onPress={() => step(1)}
          accessibilityLabel="Increase number of imposters"
        />
      </View>
    </Card>
  );
}

function StepButton({
  symbol,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  symbol: string;
  disabled: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.stepButton,
        disabled && styles.stepButtonDisabled,
        pressed && !disabled && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
    >
      <Text style={styles.stepButtonText}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  stepButtonText: {
    color: colors.accentAlt,
    fontSize: 26,
    fontWeight: "800",
    marginTop: -2,
  },
  value: {
    ...typography.title,
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: "center",
  },
});
