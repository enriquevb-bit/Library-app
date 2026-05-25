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
import { Ionicons } from '@expo/vector-icons';
import { getBook, createBook, updateBook, getAuthors, getGenres } from '@/services/api';
import { BookDTO } from '@/types';
import { colors } from '@/constants/theme';
import { useConfirm } from '@/services/confirm';
import { SelectModal, SelectOption } from '@/components/SelectModal';

function isValidIsbn(raw: string): boolean {
  const s = raw.replace(/[\s-]/g, '').toUpperCase();
  return /^(?:97[89]\d{10}|\d{9}[\dX])$/.test(s);
}

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const [year, month, day] = s.split('-').map(Number);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

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

  const [selectedAuthors, setSelectedAuthors] = useState<SelectOption[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<SelectOption[]>([]);
  const [authorModal, setAuthorModal] = useState(false);
  const [genreModal, setGenreModal] = useState(false);

  useEffect(() => {
    if (isEditing) loadExistingBook();
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
      setSelectedAuthors((book.authors ?? []).filter(a => a.id).map(a => ({ id: a.id!, label: a.fullName })));
      setSelectedGenres((book.genres ?? []).filter(g => g.id).map(g => ({ id: g.id!, label: g.name })));
    } catch {
      alert({ title: 'Error', message: 'No se pudo cargar el libro' });
      router.back();
    } finally {
      setLoadingData(false);
    }
  };

  const loadAuthorOptions = async (search: string): Promise<SelectOption[]> => {
    const data = await getAuthors({ fullName: search || undefined, pageSize: 100 });
    return data.content.map(a => ({ id: a.id!, label: a.fullName, sublabel: a.country }));
  };

  const loadGenreOptions = async (search: string): Promise<SelectOption[]> => {
    const data = await getGenres({ name: search || undefined, pageSize: 100 });
    return data.content.map(g => ({ id: g.id!, label: g.name, sublabel: g.description }));
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

    if (!isValidIsbn(isbn)) {
      alert({ title: 'Error', message: 'El ISBN debe ser un ISBN-10 o ISBN-13 válido (ej. 978-0132350884).' });
      return;
    }

    const trimmedDate = publishedDate.trim();
    if (trimmedDate && !isValidIsoDate(trimmedDate)) {
      alert({ title: 'Error', message: 'La fecha de publicación debe tener formato YYYY-MM-DD (ej. 2024-01-31).' });
      return;
    }

    const book: BookDTO = {
      isbn: isbn.trim(),
      title: title.trim(),
      availableCopies: copiesNum,
      price: priceNum,
      publishedDate: trimmedDate || undefined,
      version,
      authors: selectedAuthors.map(a => ({ id: a.id, fullName: '' })),
      genres: selectedGenres.map(g => ({ id: g.id, name: '' })),
    };

    setLoading(true);
    try {
      if (isEditing) await updateBook(id!, book);
      else await createBook(book);
      router.back();
    } catch (e) {
      alert({ title: 'Error', message: e instanceof Error ? e.message : 'No se pudo guardar el libro' });
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
        <TextInput style={styles.input} value={isbn} onChangeText={setIsbn} placeholder="978-0132350884" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Título *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Nombre del libro" placeholderTextColor={colors.textMuted} maxLength={30} />

        <Text style={styles.label}>Copias disponibles *</Text>
        <TextInput style={styles.input} value={availableCopies} onChangeText={setAvailableCopies} placeholder="5" placeholderTextColor={colors.textMuted} keyboardType="numeric" />

        <Text style={styles.label}>Precio *</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="19.99" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" />

        <Text style={styles.label}>Fecha de publicación</Text>
        <TextInput style={styles.input} value={publishedDate} onChangeText={setPublishedDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} maxLength={10} />

        <Text style={styles.label}>Autores</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setAuthorModal(true)}>
          <Text
            style={[styles.selectFieldText, selectedAuthors.length === 0 && styles.selectFieldPlaceholder]}
            numberOfLines={1}
          >
            {selectedAuthors.length === 0 ? 'Seleccionar autores' : selectedAuthors.map(a => a.label).join(', ')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.label}>Géneros</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setGenreModal(true)}>
          <Text
            style={[styles.selectFieldText, selectedGenres.length === 0 && styles.selectFieldPlaceholder]}
            numberOfLines={1}
          >
            {selectedGenres.length === 0 ? 'Seleccionar géneros' : selectedGenres.map(g => g.label).join(', ')}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Guardar cambios' : 'Crear libro'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <SelectModal
        visible={authorModal}
        title="Autores"
        multiple
        selected={selectedAuthors}
        loadOptions={loadAuthorOptions}
        searchPlaceholder="Buscar autor..."
        emptyText="No hay autores"
        onClose={() => setAuthorModal(false)}
        onConfirm={setSelectedAuthors}
      />

      <SelectModal
        visible={genreModal}
        title="Géneros"
        multiple
        selected={selectedGenres}
        loadOptions={loadGenreOptions}
        searchPlaceholder="Buscar género..."
        emptyText="No hay géneros"
        onClose={() => setGenreModal(false)}
        onConfirm={setSelectedGenres}
      />
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
  submitBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
