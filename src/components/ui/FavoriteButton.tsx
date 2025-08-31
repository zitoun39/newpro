// src/components/ui/FavoriteButton.tsx
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useFavoritesStore, FavoriteItem } from '@/src/stores/favoritesStore';

interface FavoriteButtonProps {
  variant?: 'icon' | 'chip';
  item: Omit<FavoriteItem, 'addedAt'>;
  size?: number;
  showLabel?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  disabled?: boolean;
}

export function FavoriteButton({ 
  variant = 'icon', 
  item, 
  size = 24,
  showLabel = false,
  onToggle,
  disabled = false
}: FavoriteButtonProps) {
  const { theme } = useTheme();
  const { isFav, toggle, hasHydrated, error } = useFavoritesStore();
  
  const isFavorited = useMemo(() => {
    if (!hasHydrated || !item?.key) return false;
    return isFav(item.key);
  }, [isFav, item?.key, hasHydrated]);
  
  const handlePress = useCallback(() => {
    if (disabled || !hasHydrated || !item?.key) {
      console.warn('FavoriteButton: Cannot toggle - missing data or not hydrated');
      return;
    }
    toggle(item);
    if (onToggle) {
      onToggle(!isFavorited);
    }
  }, [isFavorited, onToggle, toggle, item, disabled, hasHydrated]);

  const isDisabled = disabled || !hasHydrated || !!error;

  // Chip variant
  if (variant === 'chip') {
    return (
      <TouchableOpacity
        style={[
          styles.chipButton,
          {
            backgroundColor: isFavorited ? theme.colors.primary + '10' : theme.colors.border,
            borderColor: isFavorited ? theme.colors.primary : theme.colors.border,
            opacity: isDisabled ? 0.6 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Feather
          name="star"
          size={16}
          color={isFavorited ? theme.colors.primary : theme.colors.textSecondary}
          fill={isFavorited ? theme.colors.primary : 'transparent'}
        />
        <Text
          style={[
            styles.chipLabel,
            { color: isFavorited ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {isFavorited ? 'مفضّلة' : 'إضافة للمفضّلة'}
        </Text>
      </TouchableOpacity>
    );
  }
  
  // Icon variant
  return (
    <TouchableOpacity 
        style={[
          styles.iconButton,
          {
            backgroundColor: isFavorited 
              ? theme.colors.primary + '10' 
              : 'transparent',
            opacity: isDisabled ? 0.6 : 1,
          }
        ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isFavorited ? 'إزالة من المفضّلة' : 'إضافة للمفضّلة'}
      accessibilityState={{ selected: isFavorited, disabled: isDisabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Feather
        name="star"
        size={size}
        color={isFavorited ? theme.colors.primary : theme.colors.textSecondary}
        fill={isFavorited ? theme.colors.primary : 'transparent'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: Platform.select({ android: 10, default: 8 }),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  chipButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  }
});