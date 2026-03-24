import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      {/* Top Section - Task Cards Preview */}
      <View style={styles.previewSection}>
        {/* First preview card */}
        <View style={styles.previewCard}>
          <View style={styles.previewCardHeader}>
            <View style={styles.previewChipRow}>
              <View style={styles.previewChip}>
                <Text style={styles.previewChipText}>Mobile App</Text>
              </View>
              <View style={styles.previewChip}>
                <Text style={styles.previewChipText}>Prototype</Text>
              </View>
              <View style={styles.previewChip}>
                <Text style={styles.previewChipText}>15 Sept</Text>
              </View>
            </View>
          </View>
          <Text style={styles.previewCardTitle}>Complete Landing Page</Text>
          <Text style={styles.previewCardDesc}>Design and share on dribbble</Text>
          <View style={styles.previewAvatarRow}>
            <View style={[styles.miniAvatar, { backgroundColor: '#AACAEF' }]} />
            <View style={[styles.miniAvatar, { backgroundColor: '#E8B4B8', marginLeft: -8 }]} />
            <View style={[styles.miniAvatar, { backgroundColor: '#B8E8C1', marginLeft: -8 }]} />
          </View>
        </View>

        {/* Second preview card */}
        <View style={[styles.previewCard, { marginTop: 12 }]}>
          <View style={styles.previewChipRow}>
            <View style={[styles.previewChipSmall, { backgroundColor: 'rgba(170,202,239,0.15)' }]}>
              <Text style={[styles.previewChipText, { fontSize: 11 }]}>Landing</Text>
            </View>
            <View style={[styles.previewChipSmall, { backgroundColor: 'rgba(170,202,239,0.15)' }]}>
              <Text style={[styles.previewChipText, { fontSize: 11 }]}>Website</Text>
            </View>
            <View style={[styles.previewChipSmall, { backgroundColor: 'rgba(170,202,239,0.15)' }]}>
              <Text style={[styles.previewChipText, { fontSize: 11 }]}>Animation</Text>
            </View>
          </View>
          <Text style={styles.previewCardTitle}>Learn 3D Modeling{'\n'}in Cinema</Text>
          <Text style={styles.previewCardDesc}>Design and share on dribbble</Text>
          <View style={styles.previewAvatarRow}>
            <View style={[styles.miniAvatar, { backgroundColor: '#AACAEF' }]} />
            <View style={[styles.miniAvatar, { backgroundColor: '#E8B4B8', marginLeft: -8 }]} />
            <View style={[styles.miniAvatar, { backgroundColor: '#FFD700', marginLeft: -8 }]} />
            <View style={[styles.miniAvatarPlus, { marginLeft: -8 }]}>
              <Ionicons name="add" size={10} color={AppColors.white} />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.headline}>Get Things Done,{'\n'}One Task at a Time</Text>
        <Text style={styles.subtitle}>
          Organize your tasks, set priorities, and{'\n'}track progress easily.
        </Text>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color={AppColors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 60,
  },
  previewSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  previewCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  previewCardHeader: {
    marginBottom: Spacing.sm,
  },
  previewChipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  previewChip: {
    backgroundColor: 'rgba(170,202,239,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  previewChipSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  previewChipText: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  previewCardTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewCardDesc: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  previewAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
  },
  miniAvatarPlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.border,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
  },
  headline: {
    color: AppColors.white,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  getStartedButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  getStartedText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
