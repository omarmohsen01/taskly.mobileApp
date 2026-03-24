import { currentUser } from '@/constants/dummyData';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateWorkspaceScreen() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState(`${currentUser.first_name}'s Workspace`);

  const handleCreate = () => {
    if (workspaceName.trim()) {
      // In production, this would call the API to create the workspace
      // For now, navigate back to the home/tabs
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Workspace</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.body}
      >
        {/* Description */}
        <View style={styles.descContainer}>
          <Text style={styles.descText}>
            Give a name to your workspace – that's where{'\n'}all the work happens!
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Workspace name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={workspaceName}
              onChangeText={setWorkspaceName}
              placeholder="Enter workspace name"
              placeholderTextColor={AppColors.textMuted}
              autoFocus={false}
              selectionColor={AppColors.accent}
            />
            {workspaceName.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setWorkspaceName('')}
              >
                <Ionicons name="close-circle" size={20} color={AppColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Create Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.createBtn,
              !workspaceName.trim() && styles.createBtnDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleCreate}
            disabled={!workspaceName.trim()}
          >
            <Text style={[
              styles.createBtnText,
              !workspaceName.trim() && styles.createBtnTextDisabled,
            ]}>
              Create Workspace
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  descContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
    marginTop: Spacing.lg,
  },
  descText: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: Spacing.xxl,
  },
  inputLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 16,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  bottomBar: {
    paddingBottom: 40,
  },
  createBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
  },
  createBtnDisabled: {
    backgroundColor: AppColors.border,
  },
  createBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  createBtnTextDisabled: {
    color: AppColors.textMuted,
  },
});
