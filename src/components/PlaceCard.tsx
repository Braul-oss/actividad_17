import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Place } from '../api/geocoding';
import { formatCoordinates, formatPopulation } from '../utils/weather';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  place: Place;
  onPress: (place: Place) => void;
}

/** Tarjeta de un resultado de búsqueda (nombre, región/país, coordenadas, población, altitud). */
export function PlaceCard({ place, onPress }: Props) {
  const region = [place.admin1, place.country].filter(Boolean).join(', ');
  const population = formatPopulation(place.population);
  return (
    <Pressable
      testID={`place-${place.id}`}
      onPress={() => onPress(place)}
      accessibilityRole="button"
      accessibilityLabel={`Ver clima de ${place.name}, ${region}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{place.countryCode.toUpperCase().slice(0, 2) || '—'}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        {region ? (
          <Text style={styles.region} numberOfLines={1}>
            {region}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>📍 {formatCoordinates(place.latitude, place.longitude)}</Text>
          {place.elevation !== undefined ? (
            <Text style={styles.meta}>⛰️ {Math.round(place.elevation)} m</Text>
          ) : null}
          {population ? <Text style={styles.meta}>👥 {population} hab.</Text> : null}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  cardPressed: { backgroundColor: colors.surfaceMuted },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#E3EDFD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  badgeText: { fontSize: 15, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  body: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  region: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, gap: spacing.md },
  meta: { fontSize: 12, color: colors.textMuted },
  chevron: { fontSize: 28, color: colors.textMuted, marginLeft: spacing.sm },
});
