import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { createBoard } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function CreateBoardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string; projectName: string }>();
  const { projectId, projectName } = params;

  const [boardName, setBoardName] = useState('');
  const [boardType, setBoardType] = useState<'kanban' | 'list'>('kanban');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!boardName.trim() || !projectId) return;

    setIsSubmitting(true);
    try {
      await createBoard({
        project_id: projectId,
        name: boardName,
        type: boardType,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Board created successfully!',
      });
      router.back();
    } catch (e: any) {
      console.error('Create board error:', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e.message || 'Failed to create board',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Board</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isSubmitting || !boardName.trim()}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={AppColors.accent} />
          ) : (
            <Text style={[styles.createText, !boardName.trim() && styles.createTextDisabled]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.body}>
          {/* Context Info */}
          <View style={styles.infoRow}>
            <Ionicons name="folder-open-outline" size={16} color={AppColors.textMuted} />
            <Text style={styles.infoText}>In Project: </Text>
            <Text style={styles.infoTextBold}>{projectName || 'Selected Project'}</Text>
          </View>

          {/* Board Name Label & Input */}
          <Text style={styles.sectionLabel}>Board name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Design Backlog"
              placeholderTextColor={AppColors.textMuted}
              value={boardName}
              onChangeText={setBoardName}
              autoFocus
            />
          </View>

          {/* Board Type Selection */}
          <Text style={styles.sectionLabel}>Board type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeOption, boardType === 'kanban' && styles.typeOptionActive]}
              activeOpacity={0.7}
              onPress={() => setBoardType('kanban')}
            >
              <View style={[styles.iconWrap, boardType === 'kanban' && styles.iconWrapActive]}>
                <Ionicons name="apps-outline" size={24} color={boardType === 'kanban' ? AppColors.white : AppColors.textMuted} />
              </View>
              <Text style={[styles.typeLabel, boardType === 'kanban' && styles.typeLabelActive]}>Kanban</Text>
              <Text style={styles.typeDesc}>Visual card board</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, boardType === 'list' && styles.typeOptionActive]}
              activeOpacity={0.7}
              onPress={() => setBoardType('list')}
            >
              <View style={[styles.iconWrap, boardType === 'list' && styles.iconWrapActive]}>
                <Ionicons name="list-outline" size={24} color={boardType === 'list' ? AppColors.white : AppColors.textMuted} />
              </View>
              <Text style={[styles.typeLabel, boardType === 'list' && styles.typeLabelActive]}>List</Text>
              <Text style={styles.typeDesc}>Standard list view</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    color: AppColors.textMuted,
    fontSize: 16,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  createText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  createTextDisabled: {
    opacity: 0.4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  body: {
    padding: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginHorizontal: Spacing.xs,
  },
  infoText: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  infoTextBold: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputWrap: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  input: {
    color: AppColors.white,
    fontSize: 16,
    paddingVertical: 14,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  typeOption: {
    flex: 1,
    backgroundColor: AppColors.cardBackground,
    borderWidth: 2,
    borderColor: AppColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconWrapActive: {
    backgroundColor: AppColors.accent,
  },
  typeLabel: {
    color: AppColors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  typeLabelActive: {
    color: AppColors.white,
  },
  typeDesc: {
    color: AppColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
