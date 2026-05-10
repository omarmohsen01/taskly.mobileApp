import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Spacing } from '@/constants/theme';
import { fetchNoteDetails, updateNote } from '@/lib/api';
import Toast from 'react-native-toast-message';

export default function NoteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  const initialDataLoaded = useRef(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const resp = await fetchNoteDetails(id);
      const note = resp?.data;
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setIsPinned(!!note.is_pinned);
        initialDataLoaded.current = true;
      }
    } catch (e) {
      console.error('Load note error:', e);
      Alert.alert('Error', 'Could not load note');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (newTitle: string, newContent: string, newPinned: boolean, showToast = false) => {
    if (!initialDataLoaded.current) return;
    
    setSaving(true);
    try {
      await updateNote(id, {
        title: newTitle,
        content: newContent,
        is_pinned: newPinned,
      });
      if (showToast) {
        Toast.show({
          type: 'success',
          text1: 'Saved',
          text2: 'Note saved successfully',
        });
      }
    } catch (e: any) {
      console.error('Save error:', e);
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: e.message || 'Failed to save note',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    saveNote(title, content, isPinned, true);
  };

  // Auto-save logic
  useEffect(() => {
    if (!initialDataLoaded.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      saveNote(title, content, isPinned);
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, isPinned]);

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={AppColors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={async () => {
            await saveNote(title, content, isPinned);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={28} color={AppColors.accent} />
          <Text style={styles.backText}>Notes</Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {saving && <ActivityIndicator size="small" color={AppColors.accent} style={{ marginRight: 10 }} />}
          <TouchableOpacity onPress={togglePin} style={styles.actionBtn}>
            <Ionicons 
              name={isPinned ? "pin" : "pin-outline"} 
              size={22} 
              color={isPinned ? AppColors.accent : AppColors.white} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManualSave} style={styles.saveHeaderBtn}>
            <Text style={styles.saveHeaderText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={AppColors.textMuted}
          value={title}
          onChangeText={setTitle}
          multiline
        />
        <Text style={styles.dateText}>
          {new Date().toLocaleString([], { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing..."
          placeholderTextColor={AppColors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerScreen: {
    flex: 1,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: AppColors.accent,
    fontSize: 17,
    marginLeft: -4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  saveHeaderBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: Spacing.md,
  },
  saveHeaderText: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
  },
  titleInput: {
    color: AppColors.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  dateText: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.xl,
  },
  contentInput: {
    color: AppColors.white,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 400,
  },
});
