import { packages } from '@/constants/dummyData';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PackagesScreen() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const handleSelectPackage = (pkgId: number) => {
    setSelectedPackage(pkgId);
  };

  const handleSubscribe = () => {
    setShowSubscribeModal(true);
  };

  const handleSubscribeConfirm = () => {
    setShowSubscribeModal(false);
    router.push('/subscription-success');
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

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
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Select the plan that fits your needs. Upgrade anytime.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Package Cards */}
        {packages.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const isPopular = (pkg as any).popular;

          return (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                isSelected && styles.packageCardSelected,
                isPopular && styles.packageCardPopular,
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectPackage(pkg.id)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={12} color={AppColors.background} />
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}

              {/* Package Header */}
              <View style={styles.packageHeader}>
                <View style={styles.packageTitleRow}>
                  <View style={[
                    styles.packageIcon,
                    pkg.id === 1 && { backgroundColor: '#C0C0C0' },
                    pkg.id === 2 && { backgroundColor: '#FFD700' },
                    pkg.id === 3 && { backgroundColor: '#E5E4E2' },
                  ]}>
                    <Ionicons
                      name={
                        pkg.id === 1 ? 'shield-outline' :
                        pkg.id === 2 ? 'diamond-outline' :
                        'rocket-outline'
                      }
                      size={20}
                      color={AppColors.background}
                    />
                  </View>
                  <View style={styles.packageTitleInfo}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <Text style={styles.packageDesc}>{pkg.description}</Text>
                  </View>
                </View>
              </View>

              {/* Price */}
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>${pkg.price_per_year}</Text>
                <Text style={styles.priceLabel}> / year</Text>
              </View>

              {/* Features */}
              <View style={styles.featuresList}>
                {pkg.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <View style={[
                      styles.featureCheck,
                      isSelected && styles.featureCheckSelected,
                    ]}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={isSelected ? AppColors.background : AppColors.accent}
                      />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Selection Indicator */}
              <View style={styles.selectIndicator}>
                <View style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.selectText,
                  isSelected && styles.selectTextActive,
                ]}>
                  {isSelected ? 'Selected' : 'Select this plan'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Subscribe Button */}
      {selectedPackage && (
        <View style={styles.subscribeBar}>
          <TouchableOpacity
            style={styles.subscribeBtn}
            activeOpacity={0.85}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeBtnText}>
              Subscribe to {selectedPkg?.name}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={AppColors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Subscribe Confirmation Modal */}
      <Modal
        visible={showSubscribeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubscribeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSubscribeModal(false)}>
          <View style={styles.confirmOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.confirmSheet}>
                {/* Package Icon */}
                <View style={[
                  styles.confirmIcon,
                  selectedPkg?.id === 1 && { backgroundColor: '#C0C0C0' },
                  selectedPkg?.id === 2 && { backgroundColor: '#FFD700' },
                  selectedPkg?.id === 3 && { backgroundColor: '#E5E4E2' },
                ]}>
                  <Ionicons
                    name={
                      selectedPkg?.id === 1 ? 'shield-outline' :
                      selectedPkg?.id === 2 ? 'diamond-outline' :
                      'rocket-outline'
                    }
                    size={36}
                    color={AppColors.background}
                  />
                </View>

                <Text style={styles.confirmTitle}>Confirm Subscription</Text>
                <Text style={styles.confirmDesc}>
                  You're subscribing to <Text style={{ fontWeight: '800', color: AppColors.accent }}>{selectedPkg?.name}</Text> for{' '}
                  <Text style={{ fontWeight: '800', color: AppColors.white }}>${selectedPkg?.price_per_year}/year</Text>
                </Text>

                {/* Summary */}
                <View style={styles.confirmSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Workspaces</Text>
                    <Text style={styles.summaryValue}>
                      {selectedPkg?.max_workspaces === -1 ? 'Unlimited' : `Up to ${selectedPkg?.max_workspaces}`}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Spaces</Text>
                    <Text style={styles.summaryValue}>
                      {selectedPkg?.max_spaces === -1 ? 'Unlimited' : `Up to ${selectedPkg?.max_spaces}`}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Billing</Text>
                    <Text style={styles.summaryValue}>Annual</Text>
                  </View>
                </View>

                {/* Buttons */}
                <TouchableOpacity
                  style={styles.confirmBtn}
                  activeOpacity={0.85}
                  onPress={handleSubscribeConfirm}
                >
                  <Ionicons name="card-outline" size={20} color={AppColors.white} />
                  <Text style={styles.confirmBtnText}>Subscribe Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowSubscribeModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  subtitleContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  // Package Card
  packageCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  packageCardSelected: {
    borderColor: AppColors.accent,
    backgroundColor: 'rgba(170,202,239,0.06)',
  },
  packageCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FFD700',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  popularBadgeText: {
    color: AppColors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  packageHeader: {
    marginBottom: Spacing.md,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  packageIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageTitleInfo: {
    flex: 1,
  },
  packageName: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  packageDesc: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  priceAmount: {
    color: AppColors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  priceLabel: {
    color: AppColors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  featuresList: {
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(170,202,239,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheckSelected: {
    backgroundColor: AppColors.accent,
  },
  featureText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: AppColors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.accent,
  },
  selectText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  selectTextActive: {
    color: AppColors.accent,
  },
  // Subscribe Bar
  subscribeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 36,
    backgroundColor: AppColors.background,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
  },
  subscribeBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Confirm Modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  confirmSheet: {
    width: '100%',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  confirmTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  confirmDesc: {
    color: AppColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  confirmSummary: {
    width: '100%',
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  confirmBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    color: AppColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
