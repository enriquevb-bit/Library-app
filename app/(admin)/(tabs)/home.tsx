import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBooks, getMembers, getLoans } from '@/services/api';
import { colors } from '@/constants/theme';

export default function AdminHomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ books: 0, members: 0, loans: 0, activeLoans: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    setLoading(true);
    try {
      const [booksData, membersData, loansData, activeLoansData] = await Promise.all([
        getBooks({ pageSize: 1 }),
        getMembers({ pageSize: 1 }),
        getLoans({ pageSize: 1 }),
        getLoans({ loanState: 'ACTIVE', pageSize: 1 }),
      ]);
      setStats({
        books: booksData.totalElements,
        members: membersData.totalElements,
        loans: loansData.totalElements,
        activeLoans: activeLoansData.totalElements,
      });
    } catch {
      // silently fail, show 0s
    } finally {
      setLoading(false);
    }
  };

  const shortcuts: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string; color: string }[] = [
    { label: 'Nuevo libro', icon: 'add-circle', route: '/books/form', color: colors.primary },
    { label: 'Nuevo miembro', icon: 'person-add', route: '/members/form', color: colors.accent },
    { label: 'Nuevo préstamo', icon: 'swap-horizontal', route: '/loans/create', color: colors.warning },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="library" size={48} color={colors.primary} />
        <Text style={styles.heroTitle}>Biblioteca</Text>
        <Text style={styles.heroSubtitle}>Panel de gestión</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.books}</Text>
            <Text style={styles.statLabel}>Libros</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color={colors.accent} />
            <Text style={styles.statNumber}>{stats.members}</Text>
            <Text style={styles.statLabel}>Miembros</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="swap-horizontal" size={28} color={colors.warning} />
            <Text style={styles.statNumber}>{stats.loans}</Text>
            <Text style={styles.statLabel}>Préstamos</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color={colors.error} />
            <Text style={styles.statNumber}>{stats.activeLoans}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.shortcuts}>
        {shortcuts.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={styles.shortcutBtn}
            onPress={() => router.push(s.route as never)}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: s.color + '20' }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
            </View>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: colors.text, marginTop: 12 },
  heroSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginTop: 8 },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  shortcuts: {
    marginHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  shortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shortcutLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
});
