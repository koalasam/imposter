import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/theme";

interface SecretContentProps {
  isImposter: boolean;
  word: string;
  hint?: string;
}

/** The actual secret payload — only ever mounted while actively held down. */
export function SecretContent({ isImposter, word, hint }: SecretContentProps) {
  if (isImposter) {
    return (
      <View style={styles.container}>
        <Text style={styles.imposterTitle} maxFontSizeMultiplier={1.3}>
          YOU ARE THE
        </Text>
        <Text style={styles.imposterTitleBig} maxFontSizeMultiplier={1.3}>
          IMPOSTER
        </Text>
        {hint ? (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel} maxFontSizeMultiplier={1.5}>
              HINT
            </Text>
            <Text style={styles.hintText} maxFontSizeMultiplier={1.6}>
              {hint}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.wordLabel} maxFontSizeMultiplier={1.4}>
        THE WORD IS
      </Text>
      <Text style={styles.word} maxFontSizeMultiplier={1.3}>
        {word}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  wordLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  word: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
  },
  imposterTitle: {
    ...typography.heading,
    color: colors.danger,
    letterSpacing: 1,
  },
  imposterTitleBig: {
    ...typography.display,
    color: colors.danger,
    letterSpacing: 0.5,
    marginTop: -4,
  },
  hintBox: {
    marginTop: spacing.lg,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  hintLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  hintText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.xxs,
  },
});
