import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getBook, createBook, updateBook } from '@/services/api';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';

export default function BookFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;
  const { alert } = useConfirm();

  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [availableCopies, setAvailableCopies] = useState('');
  const [price, setPrice] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [version, setVersion] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadExistingBook();
    }
  }, [id]);

  const loadExistingBook = async () => {
    try {
      const book = await getBook(id!);
      setIsbn(book.isbn);
      setTitle(book.title);
      setAvailableCopies(String(book.availableCopies));
      setPrice(String(book.price));
      setPublishedDate(book.publishedDate || '');
      setVersion(book.version);
    } catch (e: any) {
      alert({ title: 'Error', message: 'No se pudo cargar el libro' });
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    const copiesNum = parseInt(availableCopies, 10);
    const priceNum = parseFloat(price);

    if (
      !isbn.trim() ||
      !title.trim() ||
      Number.isNaN(copiesNum) || copiesNum < 0 ||
      Number.isNaN(priceNum) || priceNum < 0
    ) {
      alert({ title: 'Error', message: 'Rellena los campos obligatorios. Copias y precio deben ser números no negativos.' });
      return;
    }

    const book: BookDTO = {
      isbn: isbn.trim(),
      title: title.trim(),
      availableCopies: copiesNum,
      price: priceNum,
      publishedDate: publishedDate.trim() || undefined,
      version,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await updateBook(id!, book);
      } else {
        await createBook(book);
      }
      router.back();
    } catch (e: any) {
      alert({ title: 'Error', message: e.message || 'No se pudo guardar el libro' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>ISBN *</Text>
        <TextInput
          style={styles.input}
          value={isbn}
          onChangeText={setIsbn}
          placeholder="978-0132350884"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nombre del libro"
          placeholderTextColor={colors.textMuted}
          maxLength={30}
        />

        <Text style={styles.label}>Copias disponibles *</Text>
        <TextInput
          style={styles.input}
          value={availableCopies}
          onChangeText={setAvailableCopies}
          placeholder="5"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Precio *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="19.99"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Fecha de publicación</Text>
        <TextInput
          style={styles.input}
          value={publishedDate}
          onChangeText={setPublishedDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              {isEditing ? 'Guardar cambios' : 'Crear libro'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
