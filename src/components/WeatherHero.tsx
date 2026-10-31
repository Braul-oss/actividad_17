import { StyleSheet, Text, View } from 'react-native';

import type { CurrentWeather, DailyForecast } from '../api/forecast';
import { describeWeather, formatTemperature } from '../utils/weather';
import { colors, radius, spacing } from '../theme';

interface Props {
  name: string;
  region: string;
  current: CurrentWeather;
  today?: DailyForecast;
}

/** Tarjeta principal con el clima actual. */
export function WeatherHero({ name, region, current, today }: Props) {
  const info = describeWeather(current.weatherCode, current.isDay);
  return (
    <View
      testID="weather-hero"
      style={[styles.card, { backgroundColor: current.isDay ? colors.heroDay : colors.heroNight }]}
    >
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      {region ? <Text style={styles.region}>{region}</Text> : null}
      <View style={styles.row}>
        <Text style={styles.icon}>{info.icon}</Text>
        <Text testID="current-temperature" style={styles.temperature}>
          {formatTemperature(current.temperature)}
          <Text style={styles.unit}>C</Text>
        </Text>
      </View>
      <Text testID="current-condition" style={styles.condition}>
        {info.label}
      </Text>
      <Text style={styles.subtitle}>
        Sensación térmica {formatTemperature(current.apparentTemperature)}
        {today
          ? `  ·  Máx ${formatTemperature(today.maxTemperature)}  Mín ${formatTemperature(today.minTemperature)}`
          : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  name: { color: colors.onPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  region: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  icon: { fontSize: 56, marginRight: spacing.md },
  temperature: { color: colors.onPrimary, fontSize: 72, fontWeight: '300' },
  unit: { fontSize: 28, fontWeight: '400' },
  condition: { color: colors.onPrimary, fontSize: 20, fontWeight: '700', marginTop: spacing.xs },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
