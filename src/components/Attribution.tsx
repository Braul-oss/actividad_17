import { Linking, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

const OPEN_METEO_URL = 'https://open-meteo.com/';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/**
 * Atribución requerida por la licencia CC BY 4.0 de Open-Meteo: debe
 * mostrarse junto a los datos con un enlace a open-meteo.com.
 */
export function Attribution({ geocoding = false }: { geocoding?: boolean }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {geocoding ? 'Búsqueda de ciudades' : 'Datos meteorológicos'} por{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(OPEN_METEO_URL)}>
          Open-Meteo.com
        </Text>
        {geocoding ? ' (base GeoNames)' : ''} ·{' '}
        <Text style={styles.link} accessibilityRole="link" onPress={() => Linking.openURL(LICENSE_URL)}>
          CC BY 4.0
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
  text: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  link: { color: colors.primary, textDecorationLine: 'underline', fontWeight: '600' },
});
