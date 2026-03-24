import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { calendarTasks } from '@/constants/dummyData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [currentMonth] = useState(1); // February
  const [currentYear] = useState(2026);

  // Generate dates for the week view
  const weekDates = [
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13 },
    { day: 'Wed', date: 14 },
    { day: 'Thu', date: 15 },
    { day: 'Fri', date: 16 },
    { day: 'Sat', date: 17 },
    { day: 'Sun', date: 18 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={22} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <Ionicons name="chevron-down" size={18} color={AppColors.textMuted} />
        </View>

        {/* Week View */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekContainer}
        >
          {weekDates.map((item) => (
            <TouchableOpacity
              key={item.date}
              style={[
                styles.dayCard,
                selectedDate === item.date && styles.dayCardSelected,
              ]}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === item.date && styles.dayTextSelected,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item.date && styles.dateTextSelected,
                ]}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timeline */}
        <View style={styles.timeline}>
          {calendarTasks.map((task, index) => (
            <View key={task.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timeText}>{task.time}</Text>
              </View>
              <View style={styles.timelineDotColumn}>
                <View style={[
                  styles.timelineDot,
                  index === 0 && { backgroundColor: AppColors.accent },
                ]} />
                {index < calendarTasks.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineCard}>
                <Text style={styles.timelineTaskTitle}>{task.title}</Text>
                <Text style={styles.timelineTaskDesc}>{task.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Floating Task Pill */}
        <View style={styles.floatingPill}>
          <View style={styles.pillAccent} />
          <View style={styles.pillContent}>
            <Text style={styles.pillTitle}>Design Landing Page</Text>
            <Text style={styles.pillDesc}>Design and share on dribbble</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  monthText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  weekContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dayCard: {
    width: 48,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  dayCardSelected: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  dayText: {
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: AppColors.background,
  },
  dateText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  dateTextSelected: {
    color: AppColors.background,
  },
  // Timeline
  timeline: {
    paddingHorizontal: Spacing.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  timelineLeft: {
    width: 60,
    paddingTop: 4,
  },
  timeText: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  timelineDotColumn: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.border,
    marginTop: 6,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: AppColors.border,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginLeft: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  timelineTaskTitle: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTaskDesc: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  // Floating Pill
  floatingPill: {
    marginHorizontal: Spacing.xl,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  pillAccent: {
    width: 5,
    backgroundColor: '#7BA4D4',
  },
  pillContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pillTitle: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  pillDesc: {
    color: 'rgba(39,41,42,0.7)',
    fontSize: 12,
  },
});
