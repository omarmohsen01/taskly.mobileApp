import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';

export default function HelpSupportScreen() {
  const router = useRouter();

  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'Tap the "+" button on the home screen or inside any project.',
    },
    {
      question: 'Can I share my workspace?',
      answer: 'Yes, go to workspace settings and click "Invite Members".',
    },
    {
      question: 'How to reset my password?',
      answer: 'Go to Privacy & Security settings to change your password.',
    },
  ];

  const supportOptions = [
    {
      title: 'Contact Support',
      subtitle: 'Talk to our team',
      icon: 'chatbubbles-outline' as const,
      color: AppColors.accent,
    },
    {
      title: 'Email Us',
      subtitle: 'support@taskly.com',
      icon: 'mail-outline' as const,
      color: '#4CAF50',
    },
    {
      title: 'Feedback',
      subtitle: 'Tell us what you think',
      icon: 'star-outline' as const,
      color: '#FFC107',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={AppColors.textMuted} />
            <TextInput
              placeholder="Search help articles..."
              placeholderTextColor={AppColors.textMuted}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Options</Text>
          <View style={styles.supportGrid}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity key={index} style={styles.supportCard}>
                <View style={[styles.supportIconContainer, { backgroundColor: `${option.color}15` }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.supportCardTitle}>{option.title}</Text>
                <Text style={styles.supportCardSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity key={index} style={styles.faqItem}>
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={AppColors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color={AppColors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={AppColors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  searchSection: {
    marginBottom: Spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    marginLeft: Spacing.sm,
    fontSize: 15,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  supportCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
  },
  supportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  supportCardTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  supportCardSubtitle: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  faqContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  faqQuestion: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqAnswer: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  legalLinkText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
