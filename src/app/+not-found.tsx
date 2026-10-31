import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StateView } from '../components/StateView';
import { colors } from '../theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <StateView
        variant="error"
        icon="🧭"
        title="Esta pantalla no existe"
        actionLabel="Ir a la búsqueda"
        onAction={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
});
