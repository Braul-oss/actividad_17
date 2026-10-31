import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isApiError, toUserMessage } from '../api/errors';
import { getForecast, type Forecast } from '../api/forecast';
import { Attribution } from '../components/Attribution';
import { DailyList } from '../components/DailyList';
import { StatTile } from '../components/StatTile';
import { StateView } from '../components/StateView';
import { WeatherHero } from '../components/WeatherHero';
import { colors, radius, spacing } from '../theme';
import { validateLocationParams } from '../utils/validation';
import { formatClock, formatLocalTime, formatTemperature } from '../utils/weather';

export default function WeatherScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lon?: string; name?: string; region?: string }>();

  // Los parámetros pueden llegar desde un enlace profundo: se validan siempre.
  const location = useMemo(
    () => validateLocationParams({ lat: params.lat, lon: params.lon, name: params.name, region: params.region }),
    [params.lat, params.lon, params.name, params.region],
  );

  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cada cambio de `request` dispara una consulta; `force` ignora la caché.
  const [request, setRequest] = useState({ id: 0, force: false });

  useEffect(() => {
    if (!location.ok) return;
    const controller = new AbortController();
    getForecast(location.value.latitude, location.value.longitude, {
      signal: controller.signal,
      forceRefresh: request.force,
    })
      .then((data) => {
        if (controller.signal.aborted) return;
        setForecast(data);
        setError(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted || (isApiError(e) && e.kind === 'aborted')) return;
        setError(toUserMessage(e));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
        setRefreshing(false);
      });
    // Al salir de la pantalla o iniciar otra consulta se cancela la anterior.
    return () => controller.abort();
  }, [location, request]);

  const refresh = () => {
    setRefreshing(true);
    setRequest((r) => ({ id: r.id + 1, force: true }));
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    setRequest((r) => ({ id: r.id + 1, force: false }));
  };

  if (!location.ok) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Stack.Screen options={{ title: 'Ubicación inválida' }} />
        <StateView
          testID="state-invalid-location"
          variant="error"
          title="No se puede mostrar el clima"
          message={location.error}
          actionLabel="Volver a la búsqueda"
          onAction={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </SafeAreaView>
    );
  }

  const { name, region } = location.value;
  const title = name.length > 22 ? `${name.slice(0, 21)}…` : name;

  if (loading && !forecast) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Stack.Screen options={{ title }} />
        <StateView testID="state-loading" variant="loading" title="Obteniendo el clima…" message={name} />
      </SafeAreaView>
    );
  }

  if (!forecast) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <Stack.Screen options={{ title }} />
        <StateView
          testID="state-error"
          variant="error"
          title="No se pudo obtener el clima"
          message={error ?? undefined}
          actionLabel="Reintentar"
          onAction={retry}
        />
      </SafeAreaView>
    );
  }

  const { current, daily } = forecast;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title }} />
      <ScrollView
        testID="weather-scroll"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {error ? (
          <View style={styles.banner} testID="refresh-error" accessibilityRole="alert">
            <Text style={styles.bannerText}>⚠️ {error} Se muestran los últimos datos obtenidos.</Text>
          </View>
        ) : null}

        <WeatherHero name={name} region={region} current={current} today={daily[0]} />

        <View style={styles.grid}>
          <StatTile testID="stat-humidity" icon="💧" label="Humedad" value={`${Math.round(current.humidity)}%`} />
          <StatTile testID="stat-wind" icon="🌬️" label="Viento" value={`${Math.round(current.windSpeed)} km/h`} />
          <StatTile
            testID="stat-precipitation"
            icon="🌧️"
            label="Precipitación"
            value={`${current.precipitation.toFixed(1)} mm`}
          />
          <StatTile
            testID="stat-apparent"
            icon="🌡️"
            label="Sensación térmica"
            value={formatTemperature(current.apparentTemperature)}
          />
        </View>

        {daily.length > 0 ? <DailyList days={daily} /> : null}

        <View style={styles.updateCard}>
          <Text style={styles.updateText} testID="updated-at">
            Medición: {formatLocalTime(current.time)} (hora local, {forecast.timezone}){'\n'}
            Actualizado en la app: {formatClock(forecast.fetchedAt)}
          </Text>
          <Pressable
            testID="refresh-button"
            onPress={refresh}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Actualizar clima"
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.refreshPressed,
              refreshing && styles.refreshDisabled,
            ]}
          >
            <Text style={styles.refreshText}>{refreshing ? 'Actualizando…' : '↻  Actualizar'}</Text>
          </Pressable>
          <Text style={styles.hint}>También puedes deslizar hacia abajo para actualizar.</Text>
        </View>

        <Attribution />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  banner: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerText: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  updateCard: { alignItems: 'center', gap: spacing.sm },
  updateText: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  refreshPressed: { backgroundColor: colors.primaryDark },
  refreshDisabled: { opacity: 0.6 },
  refreshText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  hint: { fontSize: 12, color: colors.textMuted },
});
