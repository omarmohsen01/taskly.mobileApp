import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const priorities = [
  { label: 'Low', color: AppColors.accent },
  { label: 'Medium', color: AppColors.warning },
  { label: 'High', color: AppColors.error },
];

const settingsItems: { icon: IoniconsName; label: string; value: string }[] = [
  { icon: 'calendar-outline', label: 'Date & Time', value: 'Today' },
  { icon: 'folder-outline', label: 'Project', value: 'Mobile App' },
  { icon: 'person-outline', label: 'Assignee', value: 'Mark Johnson' },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(0);

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
          <Text style={styles.headerTitle}>Add New Task</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        {/* Task Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Task Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            placeholderTextColor={AppColors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add more details..."
            placeholderTextColor={AppColors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Today badge */}
        <View style={styles.todayBadge}>
          <Text style={styles.todayText}>Today</Text>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.settingsRow}>
              <View style={styles.settingsLeft}>
                <View style={styles.settingsIcon}>
                  <Ionicons name={item.icon} size={20} color={AppColors.accent} />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
              </View>
              <View style={styles.settingsRight}>
                <Text style={styles.settingsValue}>{item.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority */}
        <View style={styles.prioritySection}>
          <Text style={styles.priorityTitle}>Priority</Text>
          <View style={styles.priorityRow}>
            {priorities.map((priority, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.priorityChip,
                  selectedPriority === index && {
                    backgroundColor: priority.color,
                    borderColor: priority.color,
                  },
                ]}
                onPress={() => setSelectedPriority(index)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    selectedPriority === index && { color: AppColors.background },
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
          <Text style={styles.createButtonText}>Create Task</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: Spacing.xxl,
  },
  fieldLabel: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  titleInput: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: Spacing.md,
  },
  descriptionInput: {
    color: AppColors.white,
    fontSize: 15,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: Spacing.md,
    minHeight: 60,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(170,202,239,0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xxl,
  },
  todayText: {
    color: AppColors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: Spacing.xxl,
  },
  settingsTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(170,202,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingsValue: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  prioritySection: {
    marginBottom: Spacing.xxxl,
  },
  priorityTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  priorityChip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  priorityText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  createButtonText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
