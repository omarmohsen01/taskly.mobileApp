import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: TabIconName; inactive: TabIconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  calendar: { active: 'calendar', inactive: 'calendar-outline' },
  'ai-assistant': { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  team: { active: 'grid', inactive: 'grid-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

type MoreItem = {
  icon: TabIconName;
  label: string;
  color: string;
};

const MORE_ITEMS: MoreItem[] = [
  { icon: 'document-text', label: 'Docs', color: '#4285F4' },
  { icon: 'play-circle', label: 'Clips', color: '#FF0000' },
  { icon: 'bar-chart', label: 'Dashboards', color: '#9C27B0' },
  { icon: 'checkbox', label: 'Forms', color: '#2196F3' },
  { icon: 'sparkles', label: 'Brain', color: '#FF6B6B' },
  { icon: 'planet', label: 'Spaces', color: '#7C4DFF' },
  { icon: 'reader', label: 'Notepad', color: '#FF9800' },
  { icon: 'calendar-number', label: 'Planner', color: '#E91E63' },
  { icon: 'chatbubbles', label: 'Chats', color: '#00897B' },
];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const centerIndex = 2; // AI Assistant is the center tab
  const [showMoreGrid, setShowMoreGrid] = useState(false);

  return (
    <>
      {/* More Grid Overlay */}
      {showMoreGrid && (
        <Modal transparent animationType="fade" visible={showMoreGrid} onRequestClose={() => setShowMoreGrid(false)}>
          <TouchableWithoutFeedback onPress={() => setShowMoreGrid(false)}>
            <View style={styles.moreOverlay}>
              <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                <View style={styles.moreGrid}>
                  {MORE_ITEMS.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.moreItem}
                      activeOpacity={0.7}
                      onPress={() => setShowMoreGrid(false)}
                    >
                      <View style={styles.moreIconWrap}>
                        <Ionicons name={item.icon} size={26} color={item.color} />
                      </View>
                      <Text style={styles.moreItemLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = index === centerIndex;
            const isMore = route.name === 'team';

            const onPress = () => {
              if (isMore) {
                setShowMoreGrid(prev => !prev);
                return;
              }
              setShowMoreGrid(false);

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const iconSet = TAB_ICONS[route.name] || { active: 'help-circle', inactive: 'help-circle-outline' };
            const iconName = isFocused ? iconSet.active : iconSet.inactive;

            if (isCenter) {
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  activeOpacity={0.8}
                  style={styles.centerButtonWrapper}
                >
                  <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                    <Ionicons
                      name={iconName}
                      size={26}
                      color={isFocused ? AppColors.background : AppColors.white}
                    />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.7}
                style={styles.tabButton}
              >
                <Ionicons
                  name={isMore && showMoreGrid ? iconSet.active : iconName}
                  size={24}
                  color={(isMore && showMoreGrid) ? AppColors.accent : (isFocused ? AppColors.accent : AppColors.textMuted)}
                />
                {(isFocused || (isMore && showMoreGrid)) && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: AppColors.tabBar,
    marginHorizontal: 16,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: AppColors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.accent,
    marginTop: 4,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.border,
    ...Platform.select({
      ios: {
        shadowColor: AppColors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButtonActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  // More grid overlay
  moreOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 90,
  },
  moreGrid: {
    backgroundColor: AppColors.cardBackground,
    marginHorizontal: 16,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  moreItem: {
    width: '28%',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  moreIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  moreItemLabel: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
