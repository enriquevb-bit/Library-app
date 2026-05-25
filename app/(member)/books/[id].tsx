import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBook } from '@/services/api';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';
import { DetailRow } from '@/components/DetailRow';

export default function MemberBookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<BookDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBook(id!);
      setBook(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el libro');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Libro no encontrado'}</Text>
        <TouchableOpacity onPress={loadBook}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="book" size={48} color={colors.primary} />
        <Text style={styles.title}>{book.title}</Text>
        {book.authors && book.authors.length > 0 && (
          <Text style={styles.subtitle}>
            {book.authors.map(a => a.fullName).join(', ')}
          </Text>
        )}
      </View>

      {book.genres && book.genres.length > 0 && (
        <View style={styles.tagsRow}>
          {book.genres.map(g => (
            <View key={g.id} style={styles.tag}>
              <Text style={styles.tagText}>{g.name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <DetailRow label="ISBN" value={book.isbn} />
        <DetailRow label="Precio" value={`${book.price?.toFixed(2)} €`} />
        <DetailRow label="Copias disponibles" value={String(book.availableCopies)} highlight={book.availableCopies === 0} />
        <DetailRow label="Fecha de publicación" value={book.publishedDate || 'N/A'} />
      </View>

      {book.authors && book.authors.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Autores</Text>
          <View style={styles.section}>
            {book.authors.map(a => (
              <View key={a.id} style={styles.authorRow}>
                <View style={styles.authorIcon}>
                  <Ionicons name="person" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{a.fullName}</Text>
                  {a.country && <Text style={styles.authorDetail}>{a.country}</Text>}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 12, textAlign: 'center', paddingHorizontal: 16 },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tag: { backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  authorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  value: { fontSize: 15, fontWeight: '500', color: colors.text },
  authorDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  errorText: { color: colors.error, fontSize: 15 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
});
