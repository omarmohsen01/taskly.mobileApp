import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SubscriptionSuccessScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animate the check icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push('/create-workspace');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      <View style={styles.content}>
        {/* Animated Check Circle */}
        <Animated.View style={[styles.checkCircleOuter, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.checkCircleMiddle}>
            <View style={styles.checkCircleInner}>
              <Ionicons name="checkmark" size={48} color={AppColors.white} />
            </View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsSubtitle}>
            Your subscription is now active.
          </Text>
          <Text style={styles.congratsDesc}>
            You've successfully subscribed to your plan. Now let's create your first workspace — that's where all the work happens!
          </Text>

          {/* Feature highlights */}
          <View style={styles.highlightsContainer}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Ionicons name="briefcase-outline" size={20} color={AppColors.accent} />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>Workspace Ready</Text>
                <Text style={styles.highlightDesc}>Create and organize your workspace</Text>
              </View>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Ionicons name="people-outline" size={20} color={AppColors.accent} />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>Invite Your Team</Text>
                <Text style={styles.highlightDesc}>Collaborate with your teammates</Text>
              </View>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.highlightIcon}>
                <Ionicons name="rocket-outline" size={20} color={AppColors.accent} />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightTitle}>Start Building</Text>
                <Text style={styles.highlightDesc}>Create projects, boards and tasks</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <Animated.View style={[styles.bottomBar, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Create Your Workspace</Text>
          <Ionicons name="arrow-forward" size={20} color={AppColors.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  // Animated Check Circle
  checkCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(170,202,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  checkCircleMiddle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(170,202,239,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Text Content
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  congratsTitle: {
    color: AppColors.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  congratsSubtitle: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  congratsDesc: {
    color: AppColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.md,
  },
  // Highlights
  highlightsContainer: {
    width: '100%',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(170,202,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
  },
  highlightTitle: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  highlightDesc: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  // Bottom Bar
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
  },
  continueBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
