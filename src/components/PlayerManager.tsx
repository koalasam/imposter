import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Player } from "@/models/types";
import { colors, radii, spacing, typography } from "@/theme/theme";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PlayerManagerProps {
  players: Player[];
  onAdd: (name: string) => { ok: boolean; error?: string };
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => { ok: boolean; error?: string };
}

export function PlayerManager({
  players,
  onAdd,
  onRemove,
  onRename,
}: PlayerManagerProps) {
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    const result = onAdd(draftName);
    if (result.ok) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDraftName("");
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      setError(result.error ?? "Couldn't add that player.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    }
  };

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onRemove(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const result = onRename(editingId, editingName);
    if (result.ok) {
      setEditingId(null);
      setEditingName("");
      setError(null);
    } else {
      setError(result.error ?? "Couldn't rename that player.");
    }
  };

  return (
    <Card>
      <SectionLabel>Players</SectionLabel>

      {players.length === 0 && (
        <Text style={styles.emptyText} maxFontSizeMultiplier={1.6}>
          Add at least 3 players to get started.
        </Text>
      )}

      {players.map((player) => (
        <View key={player.id} style={styles.row}>
          {editingId === player.id ? (
            <TextInput
              value={editingName}
              onChangeText={setEditingName}
              onSubmitEditing={commitEditing}
              onBlur={commitEditing}
              autoFocus
              style={styles.editInput}
              maxFontSizeMultiplier={1.5}
              accessibilityLabel={`Edit name for ${player.name}`}
              returnKeyType="done"
            />
          ) : (
            <Pressable
              style={styles.nameTouchable}
              onPress={() => startEditing(player)}
              accessibilityRole="button"
              accessibilityLabel={`Rename ${player.name}`}
            >
              <Text
                style={styles.playerName}
                numberOfLines={1}
                maxFontSizeMultiplier={1.6}
              >
                {player.name}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => handleRemove(player.id)}
            style={styles.removeButton}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${player.name}`}
            hitSlop={10}
          >
            <Text style={styles.removeButtonText}>−</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.addRow}>
        <TextInput
          value={draftName}
          onChangeText={(text) => {
            setDraftName(text);
            if (error) setError(null);
          }}
          placeholder="Player name"
          placeholderTextColor={colors.textMuted}
          style={styles.addInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          maxFontSizeMultiplier={1.5}
          accessibilityLabel="New player name"
        />
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add player"
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {error && (
        <Text
          style={styles.errorText}
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={1.6}
        >
          {error}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameTouchable: {
    flex: 1,
    paddingVertical: spacing.xxs,
  },
  playerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  editInput: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: spacing.xxs,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: "800",
    marginTop: -2,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  addButtonText: {
    ...typography.bodyBold,
    color: colors.accentAlt,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
