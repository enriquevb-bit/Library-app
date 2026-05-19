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
import { getBooks, getMembers, getLoans, getMyLoans } from '@/services/api';
import { colors } from '@/constants/theme';
import { useRole } from '@/services/role';

export default function HomeScreen() {
  const router = useRouter();
  const role = useRole();
  const isAdmin = role === 'ADMIN';
  const [stats, setStats] = useState({ books: 0, members: 0, loans: 0, activeLoans: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (role) loadStats(role === 'ADMIN');
    }, [role])
  );

  const loadStats = async (admin: boolean) => {
    setLoading(true);
    try {
      if (admin) {
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
      } else {
        const [booksData, myLoansData, myActiveData] = await Promise.all([
          getBooks({ pageSize: 1 }),
          getMyLoans({ pageSize: 1 }),
          getMyLoans({ loanState: 'ACTIVE', pageSize: 1 }),
        ]);
        setStats({
          books: booksData.totalElements,
          members: 0,
          loans: myLoansData.totalElements,
          activeLoans: myActiveData.totalElements,
        });
      }
    } catch {
      // silently fail, show 0s
    } finally {
      setLoading(false);
    }
  };

  const shortcuts = isAdmin
    ? [
        { label: 'Nuevo libro', icon: 'add-circle' as const, route: '/books/form', color: colors.primary },
        { label: 'Nuevo miembro', icon: 'person-add' as const, route: '/members/form', color: colors.accent },
        { label: 'Nuevo préstamo', icon: 'swap-horizontal' as const, route: '/loans/create', color: colors.warning },
      ]
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="library" size={48} color={colors.primary} />
        <Text style={styles.heroTitle}>Biblioteca</Text>
        <Text style={styles.heroSubtitle}>{isAdmin ? 'Panel de gestión' : 'Mi biblioteca'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/books')}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.books}</Text>
            <Text style={styles.statLabel}>Libros</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/members')}>
              <Ionicons name="people" size={28} color={colors.accent} />
              <Text style={styles.statNumber}>{stats.members}</Text>
              <Text style={styles.statLabel}>Miembros</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/loans')}>
            <Ionicons name="swap-horizontal" size={28} color={colors.warning} />
            <Text style={styles.statNumber}>{stats.loans}</Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Préstamos' : 'Mis préstamos'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/loans')}>
            <Ionicons name="time" size={28} color={colors.error} />
            <Text style={styles.statNumber}>{stats.activeLoans}</Text>
            <Text style={styles.statLabel}>{isAdmin ? 'Activos' : 'Mis activos'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {shortcuts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.shortcuts}>
            {shortcuts.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={styles.shortcutBtn}
            onPress={() => router.push(s.route as any)}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: s.color + '20' }]}>
              <Ionicons name={s.icon} size={24} color={s.color} />
            </View>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
            ))}
          </View>
        </>
      )}
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
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
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
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
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
  shortcutLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
});
