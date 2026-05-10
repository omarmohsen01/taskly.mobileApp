import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);

  const securityItems = [
    {
      title: 'Password',
      subtitle: 'Last changed 3 months ago',
      icon: 'key-outline' as const,
      type: 'link',
    },
    {
      title: 'Two-Factor Authentication',
      subtitle: 'Secure your account with 2FA',
      icon: 'shield-checkmark-outline' as const,
      type: 'switch',
      value: twoFactorEnabled,
      onValueChange: setTwoFactorEnabled,
    },
    {
      title: 'Biometric Login',
      subtitle: 'Face ID or Fingerprint',
      icon: 'finger-print-outline' as const,
      type: 'switch',
      value: biometricEnabled,
      onValueChange: setBiometricEnabled,
    },
  ];

  const privacyItems = [
    {
      title: 'Account Visibility',
      subtitle: 'Everyone can see your profile',
      icon: 'eye-outline' as const,
    },
    {
      title: 'Data Sharing',
      subtitle: 'Manage how your data is used',
      icon: 'share-social-outline' as const,
    },
    {
      title: 'Blocked Users',
      subtitle: '0 users blocked',
      icon: 'person-remove-outline' as const,
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            {securityItems.map((item, index) => (
              <View key={index}>
                <View style={styles.itemRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={20} color={AppColors.accent} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: AppColors.border, true: AppColors.accent }}
                      thumbColor={AppColors.white}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                  )}
                </View>
                {index < securityItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            {privacyItems.map((item, index) => (
              <TouchableOpacity key={index}>
                <View style={styles.itemRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={20} color={AppColors.accent} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
                </View>
                {index < privacyItems.length - 1 && <View style={styles.divider} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

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
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(170,202,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  deleteButton: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  deleteText: {
    color: AppColors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
