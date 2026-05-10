import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchNotes, createNote } from '@/lib/api';

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  is_pinned: boolean;
  updated_at: string;
}

export default function NotepadScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadNotes = async () => {
    try {
      const resp = await fetchNotes();
      setNotes(resp?.data || []);
    } catch (e) {
      console.error('Load notes error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleCreateNote = async () => {
    try {
      const resp = await createNote({ title: '', content: '' });
      const newNote = resp?.data;
      if (newNote) {
        router.push(`/notepad/${newNote.id}`);
      }
    } catch (e) {
      console.error('Create note error:', e);
    }
  };

  const filteredNotes = notes.filter(note => 
    (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     note.content?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const otherNotes = filteredNotes.filter(n => !n.is_pinned);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderNoteCard = (note: Note) => (
    <TouchableOpacity
      key={note.id}
      style={styles.noteCard}
      onPress={() => router.push(`/notepad/${note.id}`)}
    >
      <View style={styles.noteCardContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title || 'New Note'}
        </Text>
        <View style={styles.noteMeta}>
          <Text style={styles.noteDate}>{formatDate(note.updated_at)}</Text>
          <Text style={styles.noteSnippet} numberOfLines={1}>
            {note.content?.replace(/\n/g, ' ') || 'No additional text'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateNote}>
          <Ionicons name="add" size={24} color={AppColors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.accent} />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={AppColors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={AppColors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={AppColors.accent} style={{ marginTop: 40 }} />
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={AppColors.border} />
            <Text style={styles.emptyText}>No Notes Found</Text>
          </View>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pinned</Text>
                <View style={styles.notesList}>
                  {pinnedNotes.map(renderNoteCard)}
                </View>
              </View>
            )}

            <View style={styles.section}>
              {pinnedNotes.length > 0 && <Text style={styles.sectionTitle}>Notes</Text>}
              <View style={styles.notesList}>
                {otherNotes.map(renderNoteCard)}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Ionicons name="create-outline" size={28} color={AppColors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  addBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 16,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  notesList: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  noteCardContent: {
    flex: 1,
  },
  noteTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteDate: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  noteSnippet: {
    color: AppColors.textMuted,
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    opacity: 0.5,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 16,
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
