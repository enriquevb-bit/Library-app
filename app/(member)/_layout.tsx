import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MemberLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: 'bold', color: colors.text },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="books/[id]" options={{ title: 'Detalle del libro' }} />
      <Stack.Screen name="loans/[id]" options={{ title: 'Detalle del préstamo' }} />
      <Stack.Screen name="loans/create" options={{ title: 'Reservar préstamo' }} />
    </Stack>
  );
}
