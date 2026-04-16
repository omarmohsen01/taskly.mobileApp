import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import {
  fetchTaskDetails,
  createComment,
  updateTask,
  fetchBoards,
  fetchProjectUsers,
  fetchLabels,
} from '@/lib/api';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import AddTaskDrawer from './AddTaskDrawer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_TOP = SCREEN_HEIGHT * 0.1; // Opens to 90% height

interface TaskDetailsDrawerProps {
  visible: boolean;
  taskId: string | number | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

type Tab = 'Details' | 'Activity';

export default function TaskDetailsDrawer({ visible, taskId, onClose, onTaskUpdated }: TaskDetailsDrawerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const containerHeight = useSharedValue(SCREEN_HEIGHT - SNAP_TOP);

  const [activeTab, setActiveTab] = useState<Tab>('Details');
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  
  // Subtask creation
  const [isSubtaskDrawerVisible, setIsSubtaskDrawerVisible] = useState(false);
  
  // Editing state
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [isStatusPickerVisible, setIsStatusPickerVisible] = useState(false);
  const [isPriorityPickerVisible, setIsPriorityPickerVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState<'start' | 'due'>('start');
  
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [projectLabels, setProjectLabels] = useState<any[]>([]);
  const [isAssigneePickerVisible, setIsAssigneePickerVisible] = useState(false);
  const [isLabelPickerVisible, setIsLabelPickerVisible] = useState(false);

  useEffect(() => {
    if (visible && taskId) {
      translateY.value = withTiming(SNAP_TOP, { duration: 300 });
      loadTaskData();
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      setTask(null);
      setActiveTab('Details');
    }
  }, [visible, taskId]);

  const loadTaskData = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await fetchTaskDetails(taskId);
      const data = res?.data ?? res;
      setTask(data);
      setEditingTitle(data.title);
      setEditingDesc(data.descriptions || '');
      setComments(data.comments || []);
      
      // Fetch board columns for status picker
      if (data.board_id) {
        const boardsRes = await fetchBoards();
        const boards = boardsRes?.data ?? boardsRes;
        const currentBoard = boards.find((b: any) => b.id === data.board_id);
        if (currentBoard) {
          setColumns(currentBoard.columns || []);
          
          // Also load users and labels if we have projectId (often board.project_id)
          const projId = currentBoard.project_id;
          if (projId) {
            const [uRes, lRes] = await Promise.all([
               fetchProjectUsers(projId),
               fetchLabels(projId)
            ]);
            setProjectUsers(uRes?.data ?? uRes);
            setProjectLabels(lRes?.data ?? lRes);
          }
        }
      }
    } catch (e: any) {
      console.error('[TaskDetails] Load Error:', e);
      Toast.show({ type: 'error', text1: 'Load Error', text2: e.message || 'Could not fetch task details' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !taskId) return;
    setPostingComment(true);
    try {
      await createComment({ task_id: taskId, comments: newComment });
      setNewComment('');
      loadTaskData(); // Refresh to see the new comment
    } catch (e) {
      console.error('[TaskDetails] Comment Error:', e);
    } finally {
      setPostingComment(false);
    }
  };

  const handleUpdateField = async (payload: any) => {
    if (!taskId) return;
    setIsUpdating(true);
    try {
      await updateTask(taskId, payload);
      loadTaskData();
      if (onTaskUpdated) onTaskUpdated();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newVal = e.translationY + SNAP_TOP;
      if (newVal >= 0 && newVal <= SCREEN_HEIGHT - 100) translateY.value = newVal;
    })
    .onEnd((e) => {
      if (e.translationY > 150 || e.velocityY > 500) runOnJS(onClose)();
      else if (e.translationY < -100 || e.velocityY < -500) translateY.value = withSpring(0);
      else translateY.value = withSpring(SNAP_TOP);
    });

  const animatedStyle = useAnimatedStyle(() => ({ 
    transform: [{ translateY: translateY.value }],
    height: SCREEN_HEIGHT,
    backgroundColor: AppColors.background,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: SCREEN_HEIGHT - translateY.value,
  }));

  const renderDetails = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Title & Hierarchy */}
      <View style={styles.breadcrumbRow}>
        <View style={styles.workspaceIcon}><Text style={styles.workspaceText}>T</Text></View>
        <Text style={styles.breadcrumbText}>Team Space / P... / </Text>
        <Ionicons name="git-branch-outline" size={14} color="#888" />
        <Text style={styles.breadcrumbText}> Taskly</Text>
        <View style={{flex:1}} />
        <TouchableOpacity><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
      </View>

      <TextInput
        style={styles.taskTitle}
        value={editingTitle}
        onChangeText={setEditingTitle}
        onBlur={() => {
          if (editingTitle !== task.title) handleUpdateField({ title: editingTitle });
        }}
        multiline
      />

      {/* Meta Grid */}
      <View style={styles.metaContainer}>
        <TouchableOpacity style={styles.metaRow} onPress={() => setIsStatusPickerVisible(true)}>
          <View style={styles.metaIcon}>
            {isUpdating ? <ActivityIndicator size="small" color={AppColors.accent} /> : <Ionicons name="ellipse-outline" size={20} color={AppColors.accent} />}
          </View>
          <View>
            <Text style={styles.metaLabel}>Status & Type</Text>
            <Text style={styles.metaValue}>{task?.board_column?.name?.toUpperCase() || 'IN PROGRESS'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaRow} onPress={() => setIsPriorityPickerVisible(true)}>
          <View style={styles.metaIcon}><Ionicons name="flag-outline" size={20} color={AppColors.accent} /></View>
          <View>
            <Text style={styles.metaLabel}>Priority</Text>
            <Text style={styles.metaValue}>{task?.priority?.toUpperCase() || 'LOW'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaRow} onPress={() => setIsAssigneePickerVisible(true)}>
          <View style={styles.metaIcon}><Ionicons name="person-outline" size={20} color="#888" /></View>
          <View style={styles.metaValueRow}>
            <Text style={styles.metaValueText}>Assignees</Text>
            <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>
               {task?.assigned_users?.length > 0 ? task.assigned_users[0].first_name[0] : 'U'}
            </Text></View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaRow} onPress={() => setIsLabelPickerVisible(true)}>
          <View style={styles.metaIcon}><Ionicons name="pricetag-outline" size={20} color="#888" /></View>
          <Text style={styles.metaValueText}>
             {task?.labels?.length > 0 ? task.labels.map((l: any) => l.name).join(', ') : 'Add Labels'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metaRow} 
          onPress={() => {
            setDateType('due');
            setIsDatePickerVisible(true);
          }}
        >
          <View style={styles.metaIcon}><Ionicons name="calendar-outline" size={20} color="#888" /></View>
          <Text style={styles.metaValueText}>
            {task?.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'Add Dates'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaRow}>
          <View style={styles.metaIcon}><Ionicons name="add" size={24} color="#6366f1" /></View>
          <Text style={styles.addPropertyText}>Add property</Text>
        </TouchableOpacity>
      </View>

      {/* Description Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </View>
      <View style={styles.descBox}>
        <TextInput
          style={styles.descInput}
          value={editingDesc}
          onChangeText={setEditingDesc}
          placeholder="Tap to add a description"
          placeholderTextColor="#555"
          multiline
          onBlur={() => {
            if (editingDesc !== (task.descriptions || '')) handleUpdateField({ descriptions: editingDesc });
          }}
        />
      </View>

      {/* Subtasks Section */}
      <View style={styles.sectionDivider} />
      <Text style={styles.sectionTitleSmall}>Subtasks</Text>
      
      {task?.subtasks?.map((st: any) => (
        <View key={st.id} style={styles.subtaskItem}>
           <Ionicons name="checkmark-circle-outline" size={18} color="#555" />
           <Text style={styles.subtaskText}>{st.title}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addSubtaskBtn} onPress={() => setIsSubtaskDrawerVisible(true)}>
        <Ionicons name="add" size={22} color={AppColors.accent} />
        <Text style={styles.addSubtaskText}>Add Subtask</Text>
      </TouchableOpacity>

      {/* Attachments Section */}
      <View style={styles.sectionDivider} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </View>
      <TouchableOpacity style={styles.addSubtaskBtn}>
        <Ionicons name="add" size={22} color={AppColors.accent} />
        <Text style={styles.addSubtaskText}>Upload Attachment</Text>
      </TouchableOpacity>

      <View style={{height: 100}} />
    </ScrollView>
  );

  const renderActivity = () => (
    <View style={{flex:1}}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
         <TouchableOpacity style={styles.updateExpand}>
            <Ionicons name="stats-chart-outline" size={18} color="#888" />
            <Text style={styles.updateExpandText}>Show {task?.activities?.length || 2} updates</Text>
            <Ionicons name="chevron-down" size={18} color="#888" />
         </TouchableOpacity>

         {/* Activity Log Example */}
         <View style={styles.logCard}>
            <View style={styles.logRow}>
               <Ionicons name="person-outline" size={14} color="#888" />
               <Text style={styles.logText}>You assigned task to you</Text>
            </View>
            <View style={[styles.logRow, {marginTop: 10}]}>
               <Ionicons name="ellipse-outline" size={14} color="#888" />
               <View>
                  <Text style={styles.logText}>You changed status to</Text>
                  <View style={styles.statusChangeRow}>
                     <Ionicons name="radio-button-off" size={12} color={AppColors.textMuted} />
                     <Text style={styles.statusTextOld}> TO DO</Text>
                     <Ionicons name="arrow-forward" size={12} color={AppColors.textMuted} style={{marginHorizontal:5}} />
                     <Text style={styles.statusTextNew}><Text style={{color: AppColors.accent}}>●</Text> IN PROGRESS</Text>
                  </View>
               </View>
            </View>
         </View>

         {/* Comment Example */}
         <View style={styles.commentItem}>
            <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>OM</Text></View>
            <View style={styles.commentBody}>
               <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>Omar mohsen</Text>
                  <Text style={styles.commentTime}>now</Text>
               </View>
               <Text style={styles.commentText}>It will fix</Text>
            </View>
         </View>

         {comments.map((c: any, i: number) => {
            const userName = c.user?.full_name || 'User';
            const initial = c.user?.first_name?.[0] || 'U';
            return (
              <View key={c.id || i} style={styles.commentItem}>
                 <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{initial}</Text></View>
                 <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                       <Text style={styles.commentAuthor}>{userName}</Text>
                       <Text style={styles.commentTime}>now</Text>
                       <View style={{flex:1}} />
                       <Image 
                         source={{ uri: 'https://img.icons8.com/color/48/rainbow.png' }} 
                         style={{ width: 14, height: 14, opacity: 0.8 }} 
                       />
                    </View>
                    <Text style={styles.commentText}>{c.comments}</Text>
                 </View>
              </View>
            );
         })}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.commentInputBar, { paddingBottom: Math.max(insets.bottom, 15) }]}>
           <TouchableOpacity style={styles.commentAttach}><Ionicons name="add" size={24} color="#888" /></TouchableOpacity>
           <TextInput 
             style={styles.commentInput} 
             placeholder="Write a comment" 
             placeholderTextColor="#555" 
             value={newComment}
             onChangeText={setNewComment}
             multiline
             autoFocus={false}
           />
           {newComment.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handlePostComment}>
                 <Ionicons name="send" size={20} color={AppColors.background} />
              </TouchableOpacity>
           ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <Animated.View style={[{flex: 1}, animatedContentStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.headerTop}>
                   <TouchableOpacity onPress={onClose}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
                   <View style={styles.headerIcons}>
                      <TouchableOpacity><Ionicons name="time-outline" size={24} color="#fff" /></TouchableOpacity>
                      <TouchableOpacity><Ionicons name="share-social-outline" size={24} color="#fff" /></TouchableOpacity>
                      <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={24} color="#fff" /></TouchableOpacity>
                   </View>
                </View>
                <View style={styles.tabContainer}>
                   <TouchableOpacity style={[styles.tab, activeTab === 'Details' && styles.activeTab]} onPress={() => setActiveTab('Details')}>
                      <Text style={[styles.tabText, activeTab === 'Details' && styles.activeTabText]}>Details</Text>
                   </TouchableOpacity>
                   <TouchableOpacity style={[styles.tab, activeTab === 'Activity' && styles.activeTab]} onPress={() => setActiveTab('Activity')}>
                      <Text style={[styles.tabText, activeTab === 'Activity' && styles.activeTabText]}>Activity</Text>
                   </TouchableOpacity>
                </View>
              </View>
            </GestureDetector>

            <View style={{flex: 1}}>
              {activeTab === 'Details' ? renderDetails() : renderActivity()}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Subtask Drawer Integration */}
        {task && (
          <AddTaskDrawer
            visible={isSubtaskDrawerVisible}
            onClose={() => setIsSubtaskDrawerVisible(false)}
            defaultBoardId={task.board_id}
            defaultColumnId={task.board_column_id}
            parentId={task.id}
            onTaskCreated={() => {
              setIsSubtaskDrawerVisible(false);
              loadTaskData();
              if (onTaskUpdated) onTaskUpdated();
            }}
          />
        )}

        {/* Status Picker Modal */}
        {isStatusPickerVisible && (
          <Modal transparent visible={isStatusPickerVisible} animationType="fade">
            <TouchableOpacity 
              style={styles.statusPickerOverlay} 
              activeOpacity={1} 
              onPress={() => setIsStatusPickerVisible(false)}
            >
              <View style={styles.statusPickerContent}>
                <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Move to Phase</Text>
                <ScrollView>
                  {columns.map((col) => (
                    <TouchableOpacity 
                      key={col.id} 
                      style={styles.statusOption}
                      onPress={() => {
                        handleUpdateField({ board_column_id: col.id });
                        setIsStatusPickerVisible(false);
                      }}
                    >
                      <Text style={styles.statusOptionText}>{col.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Priority Picker Modal */}
        {isPriorityPickerVisible && (
          <Modal transparent visible={isPriorityPickerVisible} animationType="fade">
            <TouchableOpacity style={styles.statusPickerOverlay} activeOpacity={1} onPress={() => setIsPriorityPickerVisible(false)}>
              <View style={styles.statusPickerContent}>
                <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Set Priority</Text>
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <TouchableOpacity 
                    key={p} 
                    style={styles.statusOption}
                    onPress={() => {
                      handleUpdateField({ priority: p });
                      setIsPriorityPickerVisible(false);
                    }}
                  >
                    <Text style={styles.statusOptionText}>{p.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Date Picker */}
        {isDatePickerVisible && (
          <DateTimePicker
            value={new Date(task?.due_date || Date.now())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setIsDatePickerVisible(false);
              if (selectedDate) {
                handleUpdateField({ [dateType === 'start' ? 'start_date' : 'due_date']: selectedDate.toISOString().split('T')[0] });
              }
            }}
          />
        )}

        {/* Assignee Picker */}
        {isAssigneePickerVisible && (
          <Modal transparent visible={isAssigneePickerVisible} animationType="fade">
            <TouchableOpacity style={styles.statusPickerOverlay} activeOpacity={1} onPress={() => setIsAssigneePickerVisible(false)}>
              <View style={styles.statusPickerContent}>
                <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Assign Users</Text>
                <ScrollView style={{maxHeight: 300}}>
                  {projectUsers.map((u) => {
                    const isSelected = task?.assigned_users?.some((au: any) => au.id === u.id);
                    return (
                      <TouchableOpacity 
                        key={u.id} 
                        style={styles.statusOption}
                        onPress={() => {
                          let newIds = task?.assigned_users?.map((au: any) => au.id) || [];
                          if (isSelected) newIds = newIds.filter((id: number) => id !== u.id);
                          else newIds.push(u.id);
                          handleUpdateField({ assigned_users: newIds });
                        }}
                      >
                         <Text style={[styles.statusOptionText, isSelected && { color: AppColors.accent }]}>
                           {u.full_name} {isSelected ? '✓' : ''}
                         </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Label Picker */}
        {isLabelPickerVisible && (
          <Modal transparent visible={isLabelPickerVisible} animationType="fade">
            <TouchableOpacity style={styles.statusPickerOverlay} activeOpacity={1} onPress={() => setIsLabelPickerVisible(false)}>
              <View style={styles.statusPickerContent}>
                <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Select Labels</Text>
                <ScrollView style={{maxHeight: 300}}>
                  {projectLabels.map((l) => {
                    const isSelected = task?.labels?.some((al: any) => al.id === l.id);
                    return (
                      <TouchableOpacity 
                        key={l.id} 
                        style={styles.statusOption}
                        onPress={() => {
                          let newIds = task?.labels?.map((al: any) => al.id) || [];
                          if (isSelected) newIds = newIds.filter((id: number) => id !== l.id);
                          else newIds.push(l.id);
                          handleUpdateField({ labels_ids: newIds });
                        }}
                      >
                         <Text style={[styles.statusOptionText, isSelected && { color: l.color || AppColors.accent }]}>
                           {l.name} {isSelected ? '✓' : ''}
                         </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_HEIGHT, backgroundColor: AppColors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  handleArea: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerIcons: { flexDirection: 'row', gap: 20 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: AppColors.border },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: AppColors.accent },
  tabText: { color: AppColors.textMuted, fontSize: 16, fontWeight: '700' },
  activeTabText: { color: AppColors.white },
  tabContent: { padding: 20 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  workspaceIcon: { width: 22, height: 22, backgroundColor: '#2563eb', borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  workspaceText: { color: AppColors.white, fontSize: 12, fontWeight: '800' },
  breadcrumbText: { color: AppColors.textMuted, fontSize: 14 },
  taskTitle: { color: AppColors.white, fontSize: 32, fontWeight: '800', marginBottom: 30 },
  metaContainer: { gap: 20, marginBottom: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  metaIcon: { width: 40, alignItems: 'center' },
  metaLabel: { color: AppColors.textMuted, fontSize: 11, textTransform: 'uppercase', fontWeight: '800' },
  metaValue: { color: AppColors.white, fontSize: 14, fontWeight: '700' },
  metaValueRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaValueText: { color: AppColors.white, fontSize: 15, fontWeight: '600' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { color: AppColors.background, fontSize: 9, fontWeight: '800' },
  addPropertyText: { color: AppColors.accent, fontSize: 15, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sectionTitle: { color: AppColors.textMuted, fontSize: 15, fontWeight: '700' },
  sectionTitleSmall: { color: AppColors.textMuted, fontSize: 14, fontWeight: '700', marginBottom: 15 },
  descBox: { marginTop: 10, marginBottom: 20 },
  descPlaceholder: { color: '#555', fontSize: 15 },
  sectionDivider: { height: 1.5, backgroundColor: AppColors.cardBackground, marginVertical: 25 },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: AppColors.cardBackground },
  subtaskText: { color: AppColors.white, fontSize: 14 },
  addSubtaskBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 },
  addSubtaskText: { color: AppColors.white, fontSize: 15, fontWeight: '600' },
  updateExpand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  updateExpandText: { color: AppColors.textMuted, fontWeight: '700', flex: 1 },
  logCard: { backgroundColor: AppColors.cardBackground, borderRadius: 12, padding: 15, marginBottom: 25, borderWidth: 1, borderColor: AppColors.border },
  logRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  logText: { color: AppColors.textMuted, fontSize: 13 },
  statusChangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statusTextOld: { color: '#666', fontSize: 11, fontWeight: '800' },
  statusTextNew: { color: AppColors.white, fontSize: 11, fontWeight: '800' },
  commentItem: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: AppColors.accent, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: AppColors.background, fontSize: 13, fontWeight: '800' },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  commentAuthor: { color: AppColors.white, fontSize: 13, fontWeight: '800' },
  commentTime: { color: AppColors.textMuted, fontSize: 12, marginLeft: 8 },
  commentText: { color: AppColors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  commentInputBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: AppColors.surface, 
    borderTopWidth: 1, 
    borderTopColor: AppColors.border, 
    padding: 10,
    minHeight: 65
  },
  commentAttach: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  commentInput: { flex: 1, color: AppColors.white, fontSize: 14, minHeight: 40, paddingHorizontal: 10 },
  sendBtn: { width: 40, height: 40, backgroundColor: AppColors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  descInput: { color: AppColors.white, fontSize: 15, paddingVertical: 10, minHeight: 60 },
  statusPickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  statusPickerContent: { backgroundColor: AppColors.background, borderRadius: 20, padding: 20, borderSize: 1, borderColor: AppColors.border },
  statusOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: AppColors.cardBackground },
  statusOptionText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
});
