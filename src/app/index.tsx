import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isApiError, toUserMessage } from '../api/errors';
import { searchPlaces, type Place } from '../api/geocoding';
import { Attribution } from '../components/Attribution';
import { PlaceCard } from '../components/PlaceCard';
import { SearchBar } from '../components/SearchBar';
import { StateView } from '../components/StateView';
import { colors, radius, spacing } from '../theme';
import { validateSearchQuery } from '../utils/validation';

type Status = 'idle' | 'loading' | 'success' | 'error';

const SUGGESTIONS = ['Toluca', 'Ciudad de México', 'Monterrey', 'Madrid'];
const DEBOUNCE_MS = 600;
const AUTO_SEARCH_MIN_LENGTH = 3;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<Place[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (text: string) => {
    const validation = validateSearchQuery(text);
    if (!validation.ok) {
      setValidationError(validation.error);
      return;
    }
    setValidationError(null);

    // Cancela la búsqueda anterior para que una respuesta lenta no
    // sobrescriba resultados más recientes.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setErrorMessage(null);
    setSearchedQuery(validation.value);
    try {
      const places = await searchPlaces(validation.value, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setResults(places);
      setStatus('success');
    } catch (error) {
      if (controller.signal.aborted || (isApiError(error) && error.kind === 'aborted')) return;
      setResults([]);
      setErrorMessage(toUserMessage(error));
      setStatus('error');
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      abortRef.current?.abort();
      setValidationError(null);
      setStatus('idle');
      setResults([]);
      return;
    }
    // Mientras se escribe solo se informan errores que no se corrigen
    // tecleando más (caracteres inválidos o texto demasiado largo).
    const validation = validateSearchQuery(text);
    setValidationError(!validation.ok && trimmed.length >= AUTO_SEARCH_MIN_LENGTH ? validation.error : null);
  };

  // Búsqueda automática mientras se escribe (con retardo para no saturar la API).
  useEffect(() => {
    const validation = validateSearchQuery(query);
    if (!validation.ok || validation.value.length < AUTO_SEARCH_MIN_LENGTH) return;
    const timer = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    debounceRef.current = timer;
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const submit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    Keyboard.dismiss();
    runSearch(query);
  };

  const clear = () => handleChangeText('');

  const openPlace = (place: Place) => {
    Keyboard.dismiss();
    router.push({
      pathname: '/weather',
      params: {
        lat: String(place.latitude),
        lon: String(place.longitude),
        name: place.name,
        region: [place.admin1, place.country].filter(Boolean).join(', '),
      },
    });
  };

  const renderBody = () => {
    if (status === 'loading') {
      return (
        <StateView
          testID="state-loading"
          variant="loading"
          title="Buscando ciudades…"
          message={`Consultando "${searchedQuery}"`}
        />
      );
    }
    if (status === 'error') {
      return (
        <StateView
          testID="state-error"
          variant="error"
          title="No se pudo completar la búsqueda"
          message={errorMessage ?? undefined}
          actionLabel="Reintentar"
          onAction={() => runSearch(searchedQuery || query)}
        />
      );
    }
    if (status === 'success' && results.length === 0) {
      return (
        <StateView
          testID="state-empty"
          variant="empty"
          icon="🗺️"
          title={`Sin resultados para "${searchedQuery}"`}
          message="Revisa la ortografía o prueba con el nombre de una ciudad cercana."
        />
      );
    }
    if (status === 'success') {
      return (
        <FlatList
          testID="results-list"
          data={results}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PlaceCard place={item} onPress={openPlace} />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{searchedQuery}”
            </Text>
          }
          ListFooterComponent={<Attribution geocoding />}
        />
      );
    }
    return (
      <View testID="state-idle">
        <StateView
          variant="info"
          icon="🌤️"
          title="Consulta el clima de cualquier ciudad"
          message="Escribe el nombre de una ciudad para ver su clima actual y el pronóstico de 7 días."
        />
        <Text style={styles.suggestionsTitle}>Prueba con:</Text>
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((city) => (
            <Pressable
              key={city}
              onPress={() => handleChangeText(city)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <Text style={styles.chipText}>{city}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.searchArea}>
        <SearchBar
          value={query}
          onChangeText={handleChangeText}
          onSubmit={submit}
          onClear={clear}
          error={validationError}
          disabled={status === 'loading'}
        />
      </View>
      <View style={styles.body}>{renderBody()}</View>
      {status !== 'success' || results.length === 0 ? <Attribution geocoding /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchArea: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  body: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  resultsHeader: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  suggestionsTitle: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipPressed: { backgroundColor: colors.surfaceMuted },
  chipText: { color: colors.primary, fontWeight: '600' },
});
