import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors, spacing, typography } from "@/theme/theme";
import { useSettingsStore } from "@/state/settingsStore";
import { useGameStore } from "@/state/gameStore";
import { GameValidationError, MIN_PLAYERS, clampImposterCount } from "@/game/engine";
import { CATEGORY_IDS } from "@/data/categories";

import { PlayerManager } from "@/components/PlayerManager";
import { CategorySelector } from "@/components/CategorySelector";
import { ImposterStepper } from "@/components/ImposterStepper";
import { HintToggle } from "@/components/HintToggle";
import { Button } from "@/components/Button";

export default function MainMenuScreen() {
  const router = useRouter();
  const [startError, setStartError] = useState<string | null>(null);

  const players = useSettingsStore((s) => s.players);
  const selectedCategories = useSettingsStore((s) => s.selectedCategories);
  const numberOfImposters = useSettingsStore((s) => s.numberOfImposters);
  const hintsEnabled = useSettingsStore((s) => s.hintsEnabled);

  const addPlayer = useSettingsStore((s) => s.addPlayer);
  const removePlayer = useSettingsStore((s) => s.removePlayer);
  const renamePlayer = useSettingsStore((s) => s.renamePlayer);
  const toggleCategory = useSettingsStore((s) => s.toggleCategory);
  const toggleAllCategories = useSettingsStore((s) => s.toggleAllCategories);
  const setNumberOfImposters = useSettingsStore((s) => s.setNumberOfImposters);
  const setHintsEnabled = useSettingsStore((s) => s.setHintsEnabled);

  const startNewRound = useGameStore((s) => s.startNewRound);

  const maxImposters = useMemo(
    () => Math.max(1, players.length - 1),
    [players.length]
  );

  const handleStartRound = () => {
    setStartError(null);
    const settings = {
      players,
      selectedCategories,
      numberOfImposters: clampImposterCount(
        numberOfImposters,
        Math.max(players.length, 1)
      ),
      hintsEnabled,
    };

    try {
      startNewRound(settings);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      router.push("/game/reveal");
    } catch (err) {
      if (err instanceof GameValidationError) {
        setStartError(err.message);
      } else {
        setStartError("Something went wrong starting the round. Please try again.");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).springify()}>
            <Text style={styles.appTitle} maxFontSizeMultiplier={1.3}>
              IMPOSTER
            </Text>
            <Text style={styles.appSubtitle} maxFontSizeMultiplier={1.5}>
              Pass the phone. Trust no one.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(80).duration(400).springify()}
            style={styles.section}
          >
            <PlayerManager
              players={players}
              onAdd={addPlayer}
              onRemove={removePlayer}
              onRename={renamePlayer}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(140).duration(400).springify()}
            style={styles.section}
          >
            <CategorySelector
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onToggleAll={toggleAllCategories}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400).springify()}
            style={styles.section}
          >
            <ImposterStepper
              value={Math.min(numberOfImposters, maxImposters)}
              min={1}
              max={maxImposters}
              onChange={setNumberOfImposters}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(260).duration(400).springify()}
            style={styles.section}
          >
            <HintToggle enabled={hintsEnabled} onChange={setHintsEnabled} />
          </Animated.View>

          {players.length < MIN_PLAYERS && (
            <Text style={styles.validationHint} maxFontSizeMultiplier={1.6}>
              You need at least {MIN_PLAYERS} players to start.
            </Text>
          )}

          {startError && (
            <Text
              style={styles.errorText}
              accessibilityLiveRegion="polite"
              maxFontSizeMultiplier={1.6}
            >
              {startError}
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button label="START ROUND" onPress={handleStartRound} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  appTitle: {
    ...typography.display,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  appSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  validationHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
