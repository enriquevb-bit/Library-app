import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { getToken, getStoredRole } from '@/services/auth';
import { UserRole } from '@/types';
import { colors } from '@/constants/theme';

type Destination = '/login' | '/(admin)/(tabs)/home' | '/(member)/(tabs)/home';

export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (mounted) setDestination('/login');
        return;
      }
      const role: UserRole | null = await getStoredRole();
      if (!mounted) return;
      if (role === 'ADMIN') setDestination('/(admin)/(tabs)/home');
      else if (role === 'MEMBER') setDestination('/(member)/(tabs)/home');
      else setDestination('/login');
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (destination === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
