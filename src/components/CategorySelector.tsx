import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { CATEGORIES } from "@/data/categories";
import { ALL_CATEGORIES_ID } from "@/models/types";
import { colors, radii, spacing, typography } from "@/theme/theme";
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

interface CategorySelectorProps {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onToggleAll: () => void;
}

export function CategorySelector({
  selectedCategories,
  onToggleCategory,
  onToggleAll,
}: CategorySelectorProps) {
  const isAllSelected = selectedCategories.includes(ALL_CATEGORIES_ID);

  const isChecked = (categoryId: string) =>
    isAllSelected || selectedCategories.includes(categoryId);

  const handlePress = (id: string, isAll: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    if (isAll) {
      onToggleAll();
    } else {
      onToggleCategory(id);
    }
  };

  return (
    <Card>
      <SectionLabel>Categories</SectionLabel>
      <View style={styles.chipRow}>
        <Chip
          label="All"
          selected={isAllSelected}
          onPress={() => handlePress(ALL_CATEGORIES_ID, true)}
        />
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            label={category.label}
            selected={isChecked(category.id)}
            onPress={() => handlePress(category.id, false)}
          />
        ))}
      </View>
    </Card>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label} category`}
      hitSlop={4}
    >
      <Text
        style={[styles.chipText, selected && styles.chipTextSelected]}
        maxFontSizeMultiplier={1.5}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accentAlt,
  },
});
