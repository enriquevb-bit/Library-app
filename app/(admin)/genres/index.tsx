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
import { getGenres } from '@/services/api';
import { GenreDTO } from '@/types';
import { colors } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { ErrorBox } from '@/components/ErrorBox';
import { EmptyList } from '@/components/EmptyList';
import { Fab } from '@/components/Fab';

export default function GenresScreen() {
  const router = useRouter();
  const [genres, setGenres] = useState<GenreDTO[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGenres = useCallback(async (pageNum = 0, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGenres({
        name: name || undefined,
        pageNumber: pageNum + 1,
        pageSize: 10,
      });
      setGenres(prev => pageNum === 0 ? data.content : [...prev, ...data.content]);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar géneros');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGenres(0, search);
    }, [search, loadGenres])
  );

  const loadMore = () => {
    if (page + 1 < totalPages && !loading) {
      loadGenres(page + 1, search);
    }
  };

  const renderGenre = ({ item }: { item: GenreDTO }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/genres/${item.id}`)}>
      <View style={styles.icon}>
        <Ionicons name="pricetag" size={22} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        {item.description && <Text style={styles.cardSub} numberOfLines={2}>{item.description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onSubmit={() => loadGenres(0, search)}
        placeholder="Buscar por nombre..."
      />

      {error && <ErrorBox message={error} onRetry={() => loadGenres(0, search)} />}

      <FlatList
        data={genres}
        keyExtractor={(item) => item.id!}
        renderItem={renderGenre}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? <EmptyList text="No se encontraron géneros" /> : null}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
      />

      <Fab onPress={() => router.push('/genres/form')} />
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
  icon: {
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
