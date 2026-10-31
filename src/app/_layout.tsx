import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ClimaYa' }} />
        <Stack.Screen name="weather" options={{ title: 'Clima' }} />
      </Stack>
    </>
  );
}
