import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: 'bold', color: colors.text },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="books/[id]" options={{ title: 'Detalle del libro' }} />
        <Stack.Screen name="books/form" options={{ title: 'Libro' }} />
        <Stack.Screen name="members/[id]" options={{ title: 'Detalle del miembro' }} />
        <Stack.Screen name="members/form" options={{ title: 'Miembro' }} />
        <Stack.Screen name="loans/[id]" options={{ title: 'Detalle del préstamo' }} />
        <Stack.Screen name="loans/create" options={{ title: 'Nuevo préstamo' }} />
        <Stack.Screen name="authors/index" options={{ title: 'Autores' }} />
        <Stack.Screen name="authors/[id]" options={{ title: 'Detalle del autor' }} />
        <Stack.Screen name="authors/form" options={{ title: 'Autor' }} />
        <Stack.Screen name="genres/index" options={{ title: 'Géneros' }} />
        <Stack.Screen name="genres/[id]" options={{ title: 'Detalle del género' }} />
        <Stack.Screen name="genres/form" options={{ title: 'Género' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
