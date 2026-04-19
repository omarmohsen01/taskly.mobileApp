import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchCalendarTasks } from '@/lib/api';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  // Generate week dates centered around today
  const weekDates = useMemo(() => {
    const dates = [];
    const current = new Date();
    // Start from 3 days ago to 3 days ahead
    for (let i = -3; i <= 3; i++) {
       const d = new Date();
       d.setDate(current.getDate() + i);
       dates.push({
         dayName: DAYS[d.getDay()],
         dateNum: d.getDate(),
         fullDate: d.toISOString().split('T')[0]
       });
    }
    return dates;
  }, []);

  const currentMonthName = useMemo(() => {
    const d = new Date(selectedDate);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, [selectedDate]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetchCalendarTasks(selectedDate);
      setTasks(res?.data ?? res);
    } catch (e) {
      console.error('[Calendar] Load Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

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
          <Text style={styles.monthText}>{currentMonthName}</Text>
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
              key={item.fullDate}
              style={[
                styles.dayCard,
                selectedDate === item.fullDate && styles.dayCardSelected,
              ]}
              onPress={() => setSelectedDate(item.fullDate)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === item.fullDate && styles.dayTextSelected,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item.fullDate && styles.dateTextSelected,
                ]}
              >
                {item.dateNum}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timeline */}
        {loading ? (
          <ActivityIndicator size="large" color={AppColors.accent} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.timeline}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={AppColors.textMuted} />
                <Text style={styles.emptyText}>No tasks for this day</Text>
              </View>
            ) : (
              tasks.map((task, index) => (
                <TouchableOpacity 
                   key={task.id} 
                   style={styles.timelineItem}
                   onPress={() => {
                     setSelectedTaskId(task.id);
                     setIsDetailsVisible(true);
                   }}
                >
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timeText}>{task.start_date?.split('-').slice(1).join('/') || '10:00'}</Text>
                  </View>
                  <View style={styles.timelineDotColumn}>
                    <View style={[
                      styles.timelineDot,
                      index === 0 && { backgroundColor: AppColors.accent, shadowColor: AppColors.accent, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5 },
                    ]} />
                    {index < tasks.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineTaskTitle}>{task.title}</Text>
                    <Text style={styles.timelineTaskDesc} numberOfLines={2}>
                      {task.descriptions || 'Plan and execute this task to perfection.'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Floating Task Header Pill (Matches Design Sidebar) */}
        {!loading && tasks.length > 0 && (
          <View style={styles.floatingPill}>
            <View style={styles.pillAccent} />
            <View style={styles.pillContent}>
              <Text style={styles.pillTitle}>{tasks[0].title}</Text>
              <Text style={styles.pillDesc}>{tasks[0].descriptions || 'Focus on your priority'}</Text>
            </View>
          </View>
        )}

        {/* Details Drawer */}
        <TaskDetailsDrawer 
          visible={isDetailsVisible}
          taskId={selectedTaskId}
          onClose={() => setIsDetailsVisible(false)}
          onTaskUpdated={loadTasks}
        />

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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  timelineTaskDesc: {
    color: AppColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
