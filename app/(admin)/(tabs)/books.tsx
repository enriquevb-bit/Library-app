import { useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getBooks } from '@/services/api';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyList } from '@/components/EmptyList';
import { Pagination } from '@/components/Pagination';
import { BookCard } from '@/components/BookCard';
import { Fab } from '@/components/Fab';

export default function AdminBooksScreen() {
  const router = useRouter();
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks(0, search);
    }, [search, loadBooks])
  );

  const goToPage = (pageNum: number) => {
    if (!loading) {
      loadBooks(pageNum, search);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={() => loadBooks(0, search)}
        placeholder="Buscar por título..."
      />

      {error && <ErrorBox message={error} onRetry={() => loadBooks(0, search)} />}

      <FlatList
        ref={listRef}
        data={books}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={() => router.push(`/books/${item.id}`)} />
        )}
        ListEmptyComponent={!loading ? <EmptyList text="No se encontraron libros" /> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
      />

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} disabled={loading} />

      <Fab onPress={() => router.push('/books/form')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
