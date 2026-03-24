import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { currentUser, tasks, labels, users, taskProgress, myTaskTabs } from '@/constants/dummyData';

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const todayTasks = tasks.filter(t => t.board_column_id !== 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: currentUser.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{currentUser.first_name} {currentUser.last_name}</Text>
              <Text style={styles.greeting}>Good Morning</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="search-outline" size={22} color={AppColors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={22} color={AppColors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Productivity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Productivity</Text>
          <Text style={styles.sectionDate}>Wednesday, May 15</Text>
        </View>

        {/* Priority Task Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Priority Task Progress</Text>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color={AppColors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBody}>
            <Text style={styles.progressSubtitle}>
              {taskProgress.completed}/{taskProgress.total} is Completed
            </Text>
            <View style={styles.progressBarRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${taskProgress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>{taskProgress.percentage.toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        {/* My Task Section */}
        <View style={styles.myTaskSection}>
          <Text style={styles.myTaskTitle}>My Task</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {myTaskTabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === index && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab(index)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Today's Task */}
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today's Task</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {todayTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              activeOpacity={0.7}
              onPress={() => router.push('/task-details')}
            >
              {/* Labels */}
              <View style={styles.labelRow}>
                {task.labels.map((labelId) => {
                  const label = labels.find(l => l.id === labelId);
                  if (!label) return null;
                  return (
                    <View key={label.id} style={styles.labelChip}>
                      <Text style={styles.labelText}>{label.name}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Task Title */}
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>{task.descriptions}</Text>

              {/* Assignees + Edit */}
              <View style={styles.taskFooter}>
                <View style={styles.assigneeRow}>
                  {task.assignees.slice(0, 3).map((userId, idx) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <Image
                        key={userId}
                        source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }}
                        style={[styles.assigneeAvatar, idx > 0 && { marginLeft: -10 }]}
                      />
                    );
                  })}
                  {task.assignees.length > 3 && (
                    <View style={[styles.assigneeMore, { marginLeft: -10 }]}>
                      <Text style={styles.assigneeMoreText}>+{task.assignees.length - 3}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={[styles.addAssignee, { marginLeft: -10 }]}>
                    <Ionicons name="add" size={14} color={AppColors.accent} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={18} color={AppColors.accent} />
                </TouchableOpacity>
              </View>

              {/* Task Metadata */}
              <View style={styles.taskMeta}>
                <Text style={styles.metaText}>{task.projectName}</Text>
                <Text style={styles.metaText}>Prototype</Text>
                <Text style={styles.metaText}>15 Sept</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingTop: 60,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.cardBackground,
  },
  userName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  greeting: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  // Daily Productivity
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionDate: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  // Progress Card
  progressCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  progressBody: {},
  progressSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: AppColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: 4,
  },
  progressPercent: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 55,
    textAlign: 'right',
  },
  // My Task
  myTaskSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  myTaskTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  tabsContainer: {
    gap: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  tabButtonActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  tabText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: AppColors.background,
  },
  // Today's Task
  todaySection: {
    paddingHorizontal: Spacing.xl,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  todayTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  // Task Card
  taskCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  labelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  labelChip: {
    backgroundColor: 'rgba(170,202,239,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  labelText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  taskTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskDesc: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    backgroundColor: AppColors.border,
  },
  assigneeMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.border,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeMoreText: {
    color: AppColors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  addAssignee: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(170,202,239,0.15)',
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(170,202,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metaText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
});
