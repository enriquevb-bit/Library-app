import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBox({ message, onRetry }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retry}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.errorLight,
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: { color: colors.error, fontSize: 14 },
  retry: { color: colors.primary, fontWeight: '600', marginTop: 4 },
});
