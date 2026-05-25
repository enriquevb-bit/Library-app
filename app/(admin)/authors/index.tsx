import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthors } from '@/services/api';
import { AuthorDTO } from '@/types';
import { colors } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyList } from '@/components/EmptyList';
import { Fab } from '@/components/Fab';

export default function AuthorsScreen() {
  const router = useRouter();
  const [authors, setAuthors] = useState<AuthorDTO[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuthors = useCallback(async (pageNum = 0, fullName = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuthors({
        fullName: fullName || undefined,
        pageNumber: pageNum + 1,
        pageSize: 10,
      });
      setAuthors(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar autores');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAuthors(0, search);
    }, [search, loadAuthors])
  );

  const loadMore = () => {
    if (page + 1 < totalPages && !loading) {
      loadAuthors(page + 1, search);
    }
  };

  const renderAuthor = ({ item }: { item: AuthorDTO }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/authors/${item.id}`)}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.fullName}</Text>
        {item.country && <Text style={styles.cardSub}>{item.country}</Text>}
        {item.birthDate && <Text style={styles.cardSub}>{item.birthDate}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={() => loadAuthors(0, search)}
        placeholder="Buscar por nombre..."
      />

      {error && <ErrorBox message={error} onRetry={() => loadAuthors(0, search)} />}

      <FlatList
        data={authors}
        keyExtractor={(item) => item.id!}
        renderItem={renderAuthor}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? <EmptyList text="No se encontraron autores" /> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
      />

      <Fab onPress={() => router.push('/authors/form')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
