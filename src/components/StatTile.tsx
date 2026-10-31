import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  icon: string;
  label: string;
  value: string;
  testID?: string;
}

export function StatTile({ icon, label, value, testID }: Props) {
  return (
    <View style={styles.tile} testID={testID}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  icon: { fontSize: 20 },
  value: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
