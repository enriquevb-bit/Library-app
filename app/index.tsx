import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { getToken } from '@/services/auth';
import { colors } from '@/constants/theme';

export default function Index() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getToken().then((token) => {
      if (mounted) setHasToken(!!token);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (hasToken === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return hasToken ? <Redirect href="/(tabs)/home" /> : <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
