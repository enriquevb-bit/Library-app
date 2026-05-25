import { Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface Props {
  text: string;
}

export function EmptyList({ text }: Props) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 40,
    fontSize: 15,
  },
});
