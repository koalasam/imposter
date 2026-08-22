import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography, shadows } from "@/theme/theme";
import { Button } from "./Button";

interface GameHeaderProps {
  onConfirmLeave: () => void;
  title?: string;
}

/**
 * Back button shown on every in-round screen. Pressing it always confirms
 * before leaving, so a round can never be lost by an accidental tap
 * (spec §13).
 */
export function GameHeader({ onConfirmLeave, title }: GameHeaderProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => setConfirmVisible(true)}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Back to main menu"
        hitSlop={12}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      {title ? (
        <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {title}
        </Text>
      ) : null}

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.dialog, shadows.card]}>
            <Text style={styles.dialogTitle}>Leave Round?</Text>
            <Text style={styles.dialogBody}>
              Going back to the main menu will end the current round.
            </Text>
            <View style={styles.dialogButtons}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setConfirmVisible(false)}
              />
              <View style={{ height: spacing.sm }} />
              <Button
                label="Main Menu"
                variant="danger"
                onPress={() => {
                  setConfirmVisible(false);
                  onConfirmLeave();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    marginBottom: spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backArrow: {
    color: colors.accentAlt,
    fontSize: 28,
    marginRight: -2,
    marginTop: -2,
  },
  backLabel: {
    ...typography.bodyBold,
    color: colors.accentAlt,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dialogBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dialogButtons: {
    width: "100%",
  },
});
