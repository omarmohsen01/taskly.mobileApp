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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function CalendarScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(today));
  const [baseDate, setBaseDate] = useState(today);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Generate week dates centered around baseDate
  const weekDates = useMemo(() => {
    const dates = [];
    // We show a 7-day window. baseDate is the reference.
    // To make it feel natural, we find the start of the "view" (3 days before baseDate)
    const viewStart = new Date(baseDate);
    viewStart.setDate(baseDate.getDate() - 3);

    for (let i = 0; i < 7; i++) {
       const d = new Date(viewStart);
       d.setDate(viewStart.getDate() + i);
       dates.push({
         dayName: DAYS[d.getDay()],
         dateNum: d.getDate(),
         fullDate: getLocalDateString(d)
       });
    }
    return dates;
  }, [baseDate]);

  const currentMonthName = useMemo(() => {
    const d = parseLocalDateString(selectedDate);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, [selectedDate]);

  const moveWeek = (weeks: number) => {
    const newBase = new Date(baseDate);
    newBase.setDate(newBase.getDate() + weeks * 7);
    setBaseDate(newBase);
    
    // Also update selected date to keep it in sync with the center of the view if possible
    const newSelected = parseLocalDateString(selectedDate);
    newSelected.setDate(newSelected.getDate() + weeks * 7);
    setSelectedDate(getLocalDateString(newSelected));
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setBaseDate(date);
      setSelectedDate(getLocalDateString(date));
    }
  };

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
      
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={22} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity 
            style={styles.monthSelector}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.monthText}>{currentMonthName}</Text>
            <Ionicons name="chevron-down" size={18} color={AppColors.textMuted} />
          </TouchableOpacity>

          <View style={styles.weekNav}>
            <TouchableOpacity onPress={() => moveWeek(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={AppColors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveWeek(1)} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={AppColors.white} />
            </TouchableOpacity>
          </View>
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

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
                    <Text style={styles.timeText}>{task.start_date?.includes(' ') ? task.start_date.split(' ')[1].slice(0, 5) : 'All Day'}</Text>
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

      </ScrollView>

      {showPicker && (
        <DateTimePicker
          value={parseLocalDateString(selectedDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Details Drawer */}
      <TaskDetailsDrawer 
        visible={isDetailsVisible}
        taskId={selectedTaskId}
        onClose={() => setIsDetailsVisible(false)}
        onTaskUpdated={loadTasks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  fixedHeader: {
    paddingTop: 60,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingTop: Spacing.md,
    paddingBottom: 100,
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
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  monthText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  weekNav: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
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
