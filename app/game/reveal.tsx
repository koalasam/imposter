import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

import { colors, spacing, typography } from "@/theme/theme";
import { useGameStore } from "@/state/gameStore";
import { useSettingsStore } from "@/state/settingsStore";
import { isImposter as computeIsImposter, findPlayer } from "@/game/engine";

import { GameHeader } from "@/components/GameHeader";
import { HoldToReveal } from "@/components/HoldToReveal";
import { SecretContent } from "@/components/SecretContent";
import { Button } from "@/components/Button";

export default function RevealScreen() {
  const router = useRouter();

  const round = useGameStore((s) => s.round);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const isCurrentPlayerRevealed = useGameStore((s) => s.isCurrentPlayerRevealed);
  const markCurrentPlayerRevealed = useGameStore((s) => s.markCurrentPlayerRevealed);
  const goToNextPlayer = useGameStore((s) => s.goToNextPlayer);
  const endRound = useGameStore((s) => s.endRound);

  const players = useSettingsStore((s) => s.players);

  // Guard: if a round doesn't exist (e.g. deep-link, fast refresh, or the
  // round was ended elsewhere), bounce back to the main menu instead of
  // crashing on null data.
  useEffect(() => {
    if (!round) {
      router.replace("/");
    }
  }, [round, router]);

  if (!round) {
    return null;
  }

  const currentPlayerId = round.playerOrder[currentPlayerIndex];
  const currentPlayer = currentPlayerId
    ? findPlayer(players, currentPlayerId)
    : undefined;
  const playerIsImposter = currentPlayerId
    ? computeIsImposter(round, currentPlayerId)
    : false;
  const totalPlayers = round.playerOrder.length;

  const handleLeave = () => {
    endRound();
    router.replace("/");
  };

  const handleNext = () => {
    const result = goToNextPlayer();
    if (result === "finished") {
      router.replace("/game/start");
    }
  };

  if (!currentPlayer) {
    // Defensive: a player referenced in the round no longer exists in the
    // roster (shouldn't happen in normal flow, but keeps the app stable).
    return (
      <SafeAreaView style={styles.safeArea}>
        <GameHeader onConfirmLeave={handleLeave} />
        <View style={styles.center}>
          <Text style={styles.errorText}>
            This player is no longer available. Please start a new round.
          </Text>
          <Button label="Main Menu" onPress={handleLeave} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <GameHeader onConfirmLeave={handleLeave} />

      <View style={styles.content}>
        <Animated.View
          key={`progress-${currentPlayerIndex}`}
          entering={FadeIn.duration(200)}
          style={styles.progressRow}
        >
          <Text style={styles.progressText} maxFontSizeMultiplier={1.5}>
            PLAYER {currentPlayerIndex + 1} OF {totalPlayers}
          </Text>
        </Animated.View>

        <Animated.View
          key={`name-${currentPlayerIndex}`}
          entering={FadeInUp.duration(300).springify()}
        >
          <Text style={styles.playerName} maxFontSizeMultiplier={1.3}>
            {currentPlayer.name}
          </Text>
        </Animated.View>

        <View style={styles.cardWrapper}>
          <HoldToReveal
            resetKey={currentPlayerIndex}
            isImposter={playerIsImposter}
            onFirstReveal={markCurrentPlayerRevealed}
            renderSecret={() => (
              <SecretContent
                isImposter={playerIsImposter}
                word={round.word.word}
                hint={round.hint}
              />
            )}
          />
        </View>

        <Text style={styles.instructions} maxFontSizeMultiplier={1.6}>
          Only {currentPlayer.name} should be looking right now.
        </Text>
      </View>

      <View style={styles.footer}>
        {isCurrentPlayerRevealed ? (
          <Animated.View entering={FadeIn.duration(250)}>
            <Button
              label="NEXT PLAYER"
              onPress={handleNext}
              accessibilityHint="Advances to the next player's reveal"
            />
          </Animated.View>
        ) : (
          <View style={styles.disabledFooterHint}>
            <Text style={styles.disabledFooterHintText} maxFontSizeMultiplier={1.6}>
              Hold the card above to view your secret first
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  progressRow: {
    marginTop: spacing.sm,
  },
  progressText: {
    ...typography.label,
    color: colors.textMuted,
  },
  playerName: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  cardWrapper: {
    width: "100%",
  },
  instructions: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  footer: {
    padding: spacing.lg,
    minHeight: 96,
    justifyContent: "center",
  },
  disabledFooterHint: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  disabledFooterHintText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
});
