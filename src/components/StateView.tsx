import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface Props {
  variant: 'loading' | 'empty' | 'error' | 'info';
  title: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Vista reutilizable para estados de carga, vacío, error e informativos. */
export function StateView({ variant, title, message, icon, actionLabel, onAction, testID }: Props) {
  const isError = variant === 'error';
  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole={isError ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      {variant === 'loading' ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <Text style={styles.icon}>{icon ?? (isError ? '⚠️' : '🔎')}</Text>
      )}
      <Text style={[styles.title, isError && styles.titleError]}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  spinner: { marginBottom: spacing.lg },
  icon: { fontSize: 44, marginBottom: spacing.md },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  titleError: { color: colors.danger },
  message: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  buttonPressed: { backgroundColor: colors.primaryDark },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
