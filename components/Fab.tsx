import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function Fab({ icon = 'add', onPress }: Props) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Ionicons name={icon} size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
