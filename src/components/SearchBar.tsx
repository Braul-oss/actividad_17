import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SEARCH_MAX_LENGTH } from '../utils/validation';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  error?: string | null;
  disabled?: boolean;
}

export function SearchBar({ value, onChangeText, onSubmit, onClear, error, disabled }: Props) {
  return (
    <View>
      <View style={[styles.bar, error ? styles.barError : null]}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          testID="search-input"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Buscar ciudad (ej. Toluca)"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
          maxLength={SEARCH_MAX_LENGTH + 10}
          accessibilityLabel="Nombre de la ciudad"
          style={styles.input}
        />
        {value.length > 0 ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Borrar búsqueda"
            hitSlop={10}
            style={styles.clear}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
        <Pressable
          testID="search-button"
          onPress={onSubmit}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Buscar"
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>
      </View>
      {error ? (
        <Text testID="search-error" style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    ...shadow,
  },
  barError: { borderColor: colors.danger },
  icon: { fontSize: 16, marginRight: spacing.sm },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  clear: { paddingHorizontal: spacing.sm },
  clearText: { fontSize: 16, color: colors.textMuted },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginLeft: spacing.xs,
  },
  buttonPressed: { backgroundColor: colors.primaryDark },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
});
