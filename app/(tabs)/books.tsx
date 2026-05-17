import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBooks } from '@/services/api';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';
import { useRole } from '@/services/role';

export default function BooksScreen() {
  const router = useRouter();
  const role = useRole();
  const isAdmin = role === 'ADMIN';
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const loadBooks = useCallback(async (pageNum = 0, title = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks({
        title: title || undefined,
        pageNumber: pageNum + 1,
        pageSize: 10,
      });
      setBooks(data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      setError(e.message || 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks(0, search);
    }, [search, loadBooks])
  );

  const handleSearch = () => {
    loadBooks(0, search);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages && !loading) {
      loadBooks(pageNum, search);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  const renderBook = ({ item }: { item: BookDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/books/${item.id}`)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.authors && item.authors.length > 0 && (
          <Text style={styles.cardAuthors} numberOfLines={1}>
            {item.authors.map(a => a.fullName).join(', ')}
          </Text>
        )}
        <View style={styles.cardRow}>
          <Text style={styles.cardPrice}>{item.price?.toFixed(2)} EUR</Text>
          <Text style={styles.cardCopies}>
            {item.availableCopies} {item.availableCopies === 1 ? 'copia' : 'copias'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadBooks(0, search)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={books}
        keyExtractor={(item) => item.id!}
        renderItem={renderBook}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No se encontraron libros</Text>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null
        }
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
            onPress={() => goToPage(page - 1)}
            disabled={page === 0}
          >
            <Ionicons name="chevron-back" size={20} color={page === 0 ? colors.textMuted : '#fff'} />
          </TouchableOpacity>
          <Text style={styles.pageText}>
            {page + 1} / {totalPages}
          </Text>
          <TouchableOpacity
            style={[styles.pageBtn, page + 1 >= totalPages && styles.pageBtnDisabled]}
            onPress={() => goToPage(page + 1)}
            disabled={page + 1 >= totalPages}
          >
            <Ionicons name="chevron-forward" size={20} color={page + 1 >= totalPages ? colors.textMuted : '#fff'} />
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/books/form')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
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
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardAuthors: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  cardPrice: { fontSize: 14, fontWeight: '500', color: colors.primary },
  cardCopies: { fontSize: 13, color: colors.textSecondary },
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
  errorBox: {
    backgroundColor: colors.errorLight,
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: { color: colors.error, fontSize: 14 },
  retryText: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 15 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 80,
    gap: 16,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
