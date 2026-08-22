import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { colors, spacing, typography } from "@/theme/theme";
import { useGameStore } from "@/state/gameStore";
import { useSettingsStore } from "@/state/settingsStore";
import { findPlayer, getImposterPlayers } from "@/game/engine";

import { GameHeader } from "@/components/GameHeader";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function StartOfPlayScreen() {
  const router = useRouter();

  const round = useGameStore((s) => s.round);
  const isWordRevealed = useGameStore((s) => s.isWordRevealed);
  const areImpostersRevealed = useGameStore((s) => s.areImpostersRevealed);
  const toggleWordRevealed = useGameStore((s) => s.toggleWordRevealed);
  const toggleImpostersRevealed = useGameStore((s) => s.toggleImpostersRevealed);
  const startNewRound = useGameStore((s) => s.startNewRound);
  const endRound = useGameStore((s) => s.endRound);

  const players = useSettingsStore((s) => s.players);
  const selectedCategories = useSettingsStore((s) => s.selectedCategories);
  const numberOfImposters = useSettingsStore((s) => s.numberOfImposters);
  const hintsEnabled = useSettingsStore((s) => s.hintsEnabled);

  useEffect(() => {
    if (!round) {
      router.replace("/");
    }
  }, [round, router]);

  if (!round) {
    return null;
  }

  const startingPlayer = findPlayer(players, round.startingPlayerId);
  const imposterPlayers = getImposterPlayers(round, players);

  const handleLeave = () => {
    endRound();
    router.replace("/");
  };

  const handlePlayAgain = () => {
    // Spec §17: same settings, same players, same categories, same
    // imposter count, same hint setting — only the randomized elements
    // change. We simply re-read current settings and generate a fresh
    // round from them.
    startNewRound({
      players,
      selectedCategories,
      numberOfImposters,
      hintsEnabled,
    });
    router.replace("/game/reveal");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <GameHeader onConfirmLeave={handleLeave} />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(350).springify()}>
          <Text style={styles.roundReady} maxFontSizeMultiplier={1.4}>
            ROUND READY
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).duration(350).springify()}
          style={styles.startingPlayerBlock}
        >
          <Text style={styles.startingLabel} maxFontSizeMultiplier={1.4}>
            STARTING PLAYER
          </Text>
          <Text style={styles.startingName} maxFontSizeMultiplier={1.3}>
            {startingPlayer?.name ?? "—"}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(350).springify()}
          style={styles.revealSection}
        >
          <RevealBlock
            visible={isWordRevealed}
            onToggle={() => toggleWordRevealed()}
            hiddenLabel="REVEAL WORD"
            title="THE WORD IS"
            content={round.word.word}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(220).duration(350).springify()}
          style={styles.revealSection}
        >
          <RevealBlock
            visible={areImpostersRevealed}
            onToggle={() => toggleImpostersRevealed()}
            hiddenLabel="REVEAL IMPOSTERS"
            title={imposterPlayers.length === 1 ? "THE IMPOSTER IS" : "THE IMPOSTERS ARE"}
            content={imposterPlayers.map((p) => p.name).join("\n")}
            danger
          />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button label="PLAY AGAIN" onPress={handlePlayAgain} />
      </View>
    </SafeAreaView>
  );
}

function RevealBlock({
  visible,
  onToggle,
  hiddenLabel,
  title,
  content,
  danger = false,
}: {
  visible: boolean;
  onToggle: () => void;
  hiddenLabel: string;
  title: string;
  content: string;
  danger?: boolean;
}) {
  return (
    <Card style={danger ? styles.dangerCard : undefined}>
      {visible ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.revealedBlock}>
          <Text
            style={[styles.revealedTitle, danger && styles.revealedTitleDanger]}
            maxFontSizeMultiplier={1.4}
          >
            {title}
          </Text>
          <Text
            style={[styles.revealedContent, danger && styles.revealedContentDanger]}
            maxFontSizeMultiplier={1.3}
          >
            {content}
          </Text>
          <Button
            label="HIDE"
            variant="ghost"
            fullWidth={false}
            onPress={onToggle}
            style={styles.hideButton}
          />
        </Animated.View>
      ) : (
        <Button label={hiddenLabel} variant="secondary" onPress={onToggle} />
      )}
    </Card>
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
    gap: spacing.md,
  },
  roundReady: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  startingPlayerBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  startingLabel: {
    ...typography.label,
    color: colors.accentAlt,
    marginBottom: spacing.xs,
  },
  startingName: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
  },
  revealSection: {
    width: "100%",
  },
  dangerCard: {
    borderColor: colors.dangerSoft,
  },
  revealedBlock: {
    alignItems: "center",
  },
  revealedTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  revealedTitleDanger: {
    color: colors.danger,
  },
  revealedContent: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },
  revealedContentDanger: {
    color: colors.danger,
  },
  hideButton: {
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
  },
});
