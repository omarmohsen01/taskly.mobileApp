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
import { taskDetails, users } from '@/constants/dummyData';

export default function TaskDetailsScreen() {
  const router = useRouter();
  const [subtasks, setSubtasks] = useState(taskDetails.subtasks);

  const toggleSubtask = (id: number) => {
    setSubtasks(prev =>
      prev.map(st =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        {/* Task Title & Priority */}
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{taskDetails.title}</Text>
          <View style={styles.priorityBadge}>
            <Ionicons name="flag" size={14} color={AppColors.warning} />
            <Text style={styles.priorityText}>{taskDetails.priority}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Assignees */}
        <View style={styles.assigneesSection}>
          <Text style={styles.sectionLabel}>Assignees</Text>
          <View style={styles.assigneeRow}>
            {users.slice(0, 4).map((user, idx) => (
              <Image
                key={user.id}
                source={{ uri: user.avatar }}
                style={[styles.assigneeAvatar, idx > 0 && { marginLeft: -10 }]}
              />
            ))}
            <TouchableOpacity style={[styles.addAssignee, { marginLeft: -10 }]}>
              <Ionicons name="add" size={16} color={AppColors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{taskDetails.descriptions}</Text>
        </View>

        {/* Subtasks */}
        <View style={styles.subtasksSection}>
          <View style={styles.subtasksHeader}>
            <Text style={styles.sectionLabel}>
              Subtasks ({completedCount}/{subtasks.length})
            </Text>
            <TouchableOpacity>
              <Ionicons name="add-circle-outline" size={22} color={AppColors.accent} />
            </TouchableOpacity>
          </View>

          {subtasks.map((subtask) => (
            <TouchableOpacity
              key={subtask.id}
              style={styles.subtaskRow}
              onPress={() => toggleSubtask(subtask.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  subtask.completed && styles.checkboxChecked,
                ]}
              >
                {subtask.completed && (
                  <Ionicons name="checkmark" size={14} color={AppColors.background} />
                )}
              </View>
              <Text
                style={[
                  styles.subtaskText,
                  subtask.completed && styles.subtaskTextCompleted,
                ]}
              >
                {subtask.title}
              </Text>
              <View
                style={[
                  styles.subtaskStatus,
                  subtask.completed
                    ? { backgroundColor: 'rgba(76,175,80,0.15)' }
                    : { backgroundColor: 'rgba(255,167,38,0.15)' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: subtask.completed ? AppColors.success : AppColors.warning },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionLabel}>Comments</Text>
          <View style={styles.commentCard}>
            <Image
              source={{ uri: users[0].avatar }}
              style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>
                {users[0].first_name} {users[0].last_name}
              </Text>
              <Text style={styles.commentText}>
                Great progress on this task! Let's discuss the next steps.
              </Text>
              <Text style={styles.commentTime}>2 hours ago</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
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
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  taskHeader: {
    marginBottom: Spacing.xxl,
  },
  taskTitle: {
    color: AppColors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,167,38,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  priorityText: {
    color: AppColors.warning,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressSection: {
    marginBottom: Spacing.xxl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
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
  assigneesSection: {
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: AppColors.background,
    backgroundColor: AppColors.border,
  },
  addAssignee: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(170,202,239,0.15)',
    borderWidth: 2,
    borderColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionSection: {
    marginBottom: Spacing.xxl,
  },
  descriptionText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  subtasksSection: {
    marginBottom: Spacing.xxl,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: AppColors.success,
    borderColor: AppColors.success,
  },
  subtaskText: {
    flex: 1,
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  subtaskTextCompleted: {
    color: AppColors.textMuted,
    textDecorationLine: 'line-through',
  },
  subtaskStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  commentsSection: {
    marginBottom: Spacing.xxl,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.border,
    marginRight: Spacing.md,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  commentTime: {
    color: AppColors.textMuted,
    fontSize: 11,
  },
});
