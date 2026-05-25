import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBooks, getMembers, createLoan } from '@/services/api';
import { BookDTO, RequestedLoanItem } from '@/types';
import { colors } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';
import { SelectModal, SelectOption } from '@/components/SelectModal';

export default function AdminCreateLoanScreen() {
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const router = useRouter();
  const { alert } = useConfirm();

  const [selectedMember, setSelectedMember] = useState<string>(memberId || '');
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [memberModal, setMemberModal] = useState(false);
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [searchBook, setSearchBook] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const booksData = await getBooks({ pageSize: 50 });
      setBooks(booksData.content);
    } catch {
      alert({ title: 'Error', message: 'No se pudieron cargar los datos' });
    } finally {
      setLoadingData(false);
    }
  };

  const loadMemberOptions = async (search: string): Promise<SelectOption[]> => {
    const data = await getMembers({ name: search || undefined, pageSize: 100 });
    return data.content
      .filter(m => m.memberState === 'ACTIVE')
      .map(m => ({ id: m.id!, label: m.name, sublabel: m.email }));
  };

  const searchBooks = async () => {
    try {
      const data = await getBooks({ title: searchBook || undefined, pageSize: 50 });
      setBooks(data.content);
    } catch {
      // keep current list
    }
  };

  const addToCart = (bookId: string, max: number) => {
    const current = cart[bookId] || 0;
    if (current < max) setCart({ ...cart, [bookId]: current + 1 });
  };

  const removeFromCart = (bookId: string) => {
    const current = cart[bookId] || 0;
    if (current > 0) {
      const newCart = { ...cart };
      if (current === 1) delete newCart[bookId];
      else newCart[bookId] = current - 1;
      setCart(newCart);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMember) {
      alert({ title: 'Error', message: 'Selecciona un miembro' });
      return;
    }

    const items: RequestedLoanItem[] = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([bookId, quantity]) => ({ bookId, quantity }));

    if (items.length === 0) {
      alert({ title: 'Error', message: 'Selecciona al menos un libro' });
      return;
    }

    setLoading(true);
    try {
      await createLoan(selectedMember, items);
      alert({
        title: 'Préstamo creado',
        message: 'El préstamo se ha creado correctamente',
        onDismiss: () => router.back(),
      });
    } catch (e) {
      alert({
        title: 'Error',
        message: e instanceof Error ? e.message : 'No se pudo crear el préstamo',
      });
    } finally {
      setLoading(false);
    }
  };

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderBook = ({ item }: { item: BookDTO }) => {
    const qty = cart[item.id!] || 0;
    return (
      <View style={styles.bookRow}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.bookSub}>Disponibles: {item.availableCopies}</Text>
        </View>
        <View style={styles.qtyControls}>
          <TouchableOpacity
            style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
            onPress={() => removeFromCart(item.id!)}
            disabled={qty === 0}
          >
            <Ionicons name="remove" size={18} color={qty === 0 ? colors.textMuted : colors.error} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, qty >= item.availableCopies && styles.qtyBtnDisabled]}
            onPress={() => addToCart(item.id!, item.availableCopies)}
            disabled={qty >= item.availableCopies}
          >
            <Ionicons name="add" size={18} color={qty >= item.availableCopies ? colors.textMuted : colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!memberId && (
        <View style={styles.memberSection}>
          <Text style={styles.sectionLabel}>Miembro</Text>
          <TouchableOpacity style={styles.selectField} onPress={() => setMemberModal(true)}>
            <Text
              style={[styles.selectFieldText, !selectedMember && styles.selectFieldPlaceholder]}
              numberOfLines={1}
            >
              {selectedMember ? (selectedMemberName || 'Miembro seleccionado') : 'Seleccionar miembro'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar libro..."
          placeholderTextColor={colors.textMuted}
          value={searchBook}
          onChangeText={setSearchBook}
          onSubmitEditing={searchBooks}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={searchBooks}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id!}
        renderItem={renderBook}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay libros disponibles</Text>}
      />

      <TouchableOpacity
        style={[styles.submitBtn, (loading || cartCount === 0) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading || cartCount === 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            Crear préstamo ({cartCount} {cartCount === 1 ? 'libro' : 'libros'})
          </Text>
        )}
      </TouchableOpacity>

      <SelectModal
        visible={memberModal}
        title="Miembro"
        selected={selectedMember ? [{ id: selectedMember, label: selectedMemberName }] : []}
        loadOptions={loadMemberOptions}
        searchPlaceholder="Buscar miembro..."
        emptyText="No hay miembros activos"
        onClose={() => setMemberModal(false)}
        onConfirm={(items) => {
          const m = items[0];
          setSelectedMember(m?.id ?? '');
          setSelectedMemberName(m?.label ?? '');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  memberSection: { paddingHorizontal: 12, paddingTop: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectFieldText: { flex: 1, fontSize: 15, color: colors.text },
  selectFieldPlaceholder: { color: colors.textMuted },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8 },
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
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 15, fontWeight: '500', color: colors.text },
  bookSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyText: { fontSize: 16, fontWeight: '600', color: colors.text, minWidth: 20, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.primary, margin: 12, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40, fontSize: 15 },
});
