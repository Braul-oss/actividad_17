import { StyleSheet, Text, View } from 'react-native';

import type { DailyForecast } from '../api/forecast';
import { describeWeather, formatDay, formatTemperature } from '../utils/weather';
import { colors, radius, shadow, spacing } from '../theme';

/** Pronóstico de los próximos días. */
export function DailyList({ days }: { days: DailyForecast[] }) {
  return (
    <View style={styles.card} testID="daily-list">
      <Text style={styles.title}>Pronóstico de {days.length} días</Text>
      {days.map((day, index) => {
        const { weekday, date } = formatDay(day.date, index);
        const info = describeWeather(day.weatherCode);
        return (
          <View
            key={day.date}
            style={[styles.row, index === days.length - 1 && styles.rowLast]}
            accessibilityLabel={`${weekday}: ${info.label}, máxima ${Math.round(day.maxTemperature)} grados, mínima ${Math.round(day.minTemperature)} grados`}
          >
            <View style={styles.dayCol}>
              <Text style={styles.weekday}>{weekday}</Text>
              <Text style={styles.date}>{date}</Text>
            </View>
            <Text style={styles.icon}>{info.icon}</Text>
            <Text style={styles.rain}>
              {day.precipitationProbability !== null ? `💧 ${day.precipitationProbability}%` : ''}
            </Text>
            <Text style={styles.min}>{formatTemperature(day.minTemperature)}</Text>
            <Text style={styles.max}>{formatTemperature(day.maxTemperature)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    ...shadow,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  dayCol: { width: 72 },
  weekday: { fontSize: 15, fontWeight: '600', color: colors.text },
  date: { fontSize: 12, color: colors.textMuted },
  icon: { fontSize: 22, width: 36, textAlign: 'center' },
  rain: { flex: 1, fontSize: 13, color: colors.rain, paddingLeft: spacing.sm },
  min: { width: 40, fontSize: 15, color: colors.textMuted, textAlign: 'right' },
  max: { width: 44, fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' },
});
