import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, radii, spacing, typography, durations } from "@/theme/theme";

interface HoldToRevealProps {
  /** Rendered only while the secret is actively being revealed. */
  renderSecret: () => React.ReactNode;
  isImposter: boolean;
  /** Called once, the first time the secret becomes visible. */
  onFirstReveal: () => void;
  /** Reset key — changing this forces the card back to hidden (e.g. on player change). */
  resetKey: string | number;
}

/**
 * A press-and-hold card. The secret is only rendered while the finger is
 * actively down, and is unmounted (not just visually hidden) the instant
 * the finger lifts — see spec §11 (Reveal Security): the content must not
 * linger anywhere once released.
 */
export function HoldToReveal({
  renderSecret,
  isImposter,
  onFirstReveal,
  resetKey,
}: HoldToRevealProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Whenever the underlying player changes, force the card back to its
    // hidden resting state so the previous player's info can never bleed
    // into the next player's screen.
    setIsRevealed(false);
    progress.value = 0;
  }, [resetKey, progress]);

  const handlePressIn = useCallback(() => {
    setIsRevealed(true);
    progress.value = withTiming(1, {
      duration: durations.fast,
      easing: Easing.out(Easing.quad),
    });
    Haptics.impactAsync(
      isImposter
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
    onFirstReveal();
  }, [isImposter, onFirstReveal, progress]);

  const handlePressOut = useCallback(() => {
    setIsRevealed(false);
    progress.value = withTiming(0, {
      duration: durations.fast,
      easing: Easing.in(Easing.quad),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [progress]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.02 }],
    borderColor: isRevealed
      ? isImposter
        ? colors.danger
        : colors.accent
      : colors.border,
  }));

  const hiddenStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  const secretStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={
        isRevealed ? "Secret revealed, release to hide" : "Hold to reveal your secret"
      }
      accessibilityHint="Press and hold to view your secret. It hides automatically when you let go."
      style={styles.touchArea}
    >
      <Animated.View
        style={[
          styles.card,
          isImposter ? styles.cardImposterTint : styles.cardNormalTint,
          cardStyle,
        ]}
      >
        <Animated.View style={[styles.layer, hiddenStyle]} pointerEvents="none">
          <View style={styles.iconCircle}>
            <Text style={styles.iconGlyph}>◍</Text>
          </View>
          <Text style={styles.holdLabel} maxFontSizeMultiplier={1.4}>
            HOLD TO REVEAL
          </Text>
          <Text style={styles.holdSubLabel} maxFontSizeMultiplier={1.6}>
            Keep it away from prying eyes
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.layer, styles.secretLayer, secretStyle]}
          pointerEvents="none"
        >
          {isRevealed && renderSecret()}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    width: "100%",
  },
  card: {
    minHeight: 260,
    borderRadius: radii.xl,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardNormalTint: {
    backgroundColor: colors.surfaceElevated,
  },
  cardImposterTint: {
    backgroundColor: colors.surfaceElevated,
  },
  layer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  secretLayer: {
    // Sits above the hidden layer while revealed.
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconGlyph: {
    fontSize: 24,
    color: colors.accentAlt,
  },
  holdLabel: {
    ...typography.heading,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  holdSubLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
});
