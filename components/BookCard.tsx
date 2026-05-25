import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';

interface Props {
  book: BookDTO;
  onPress: () => void;
}

export function BookCard({ book, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
        {book.authors && book.authors.length > 0 && (
          <Text style={styles.authors} numberOfLines={1}>
            {book.authors.map(a => a.fullName).join(', ')}
          </Text>
        )}
        <View style={styles.row}>
          <Text style={styles.price}>{book.price?.toFixed(2)} EUR</Text>
          <Text style={styles.copies}>
            {book.availableCopies} {book.availableCopies === 1 ? 'copia' : 'copias'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  authors: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  price: { fontSize: 14, fontWeight: '500', color: colors.primary },
  copies: { fontSize: 13, color: colors.textSecondary },
});
