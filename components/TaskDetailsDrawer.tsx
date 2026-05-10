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
const SNAP_TOP = SCREEN_HEIGHT * 0.05; // Opens to 95% height

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
  const [userSearch, setUserSearch] = useState('');
  const [labelSearch, setLabelSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!userSearch) return projectUsers;
    return projectUsers.filter(u => 
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [projectUsers, userSearch]);

  const filteredLabels = useMemo(() => {
    if (!labelSearch) return projectLabels;
    return projectLabels.filter(l => 
      l.name?.toLowerCase().includes(labelSearch.toLowerCase())
    );
  }, [projectLabels, labelSearch]);

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
            <View style={styles.avatarList}>
               {task?.assigned_users?.length > 0 ? (
                 task.assigned_users.slice(0, 3).map((u: any, idx: number) => (
                    <View key={u.id} style={[styles.miniAvatar, { marginLeft: idx > 0 ? -10 : 0, zIndex: 10 - idx }]}>
                      <Text style={styles.miniAvatarText}>{(u.first_name || 'U')[0]}</Text>
                    </View>
                 ))
               ) : (
                 <View style={styles.miniAvatar}><Text style={styles.miniAvatarText}>+</Text></View>
               )}
               {task?.assigned_users?.length > 3 && (
                 <View style={[styles.miniAvatar, { marginLeft: -10, zIndex: 0, backgroundColor: '#333' }]}>
                   <Text style={[styles.miniAvatarText, { color: '#fff' }]}>+{task.assigned_users.length - 3}</Text>
                 </View>
               )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaRow} onPress={() => setIsLabelPickerVisible(true)}>
          <View style={styles.metaIcon}><Ionicons name="pricetag-outline" size={20} color="#888" /></View>
          <View style={styles.metaValueRow}>
             <Text style={styles.metaValueText}>Labels</Text>
             <View style={styles.labelPillList}>
                {task?.labels?.length > 0 ? task.labels.map((l: any) => (
                  <View key={l.id} style={[styles.miniLabel, { backgroundColor: (l.color || AppColors.accent) + '22' }]}>
                    <Text style={[styles.miniLabelText, { color: l.color || AppColors.accent }]}>{l.name}</Text>
                  </View>
                )) : <Text style={styles.metaValueTextMuted}>Add Labels</Text>}
             </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metaRow} 
          onPress={() => {
            setDateType('due');
            setIsDatePickerVisible(true);
          }}
        >
          <View style={styles.metaIcon}><Ionicons name="calendar-outline" size={20} color="#888" /></View>
          <View>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>
              {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'Set Due Date'}
            </Text>
          </View>
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

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderActivity = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.tabContent, { paddingBottom: 20 }]}
      >
         {/* Timeline / Activity Logs */}
         <View style={styles.timelineContainer}>
            {task?.activities?.map((activity: any, i: number) => (
              <View key={`activity-${activity.id || i}`} style={styles.timelineItem}>
                 <View style={styles.timelineLine}>
                    <View style={styles.timelineDot} />
                    {i < (task?.activities?.length - 1 || 0) && <View style={styles.timelineConnector} />}
                 </View>
                 <View style={styles.timelineBody}>
                    <Text style={styles.logText}>{activity.description}</Text>
                    <Text style={styles.logTime}>{formatRelativeTime(activity.created_at)}</Text>
                 </View>
              </View>
            ))}
         </View>

         {/* Comments Section */}
         {comments.length > 0 && <Text style={styles.activityHeading}>Comments</Text>}
         {comments.map((c: any, i: number) => {
            const userName = c.user?.full_name || 'User';
            const initial = c.user?.first_name?.[0] || 'U';
            return (
              <View key={c.id || i} style={styles.commentItem}>
                 <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{initial}</Text></View>
                 <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                       <Text style={styles.commentAuthor}>{userName}</Text>
                       <Text style={styles.commentTime}>{formatRelativeTime(c.created_at)}</Text>
                    </View>
                    <View style={styles.commentBubble}>
                       <Text style={styles.commentText}>{c.comments}</Text>
                    </View>
                 </View>
              </View>
            );
         })}

         {(!task?.activities || task.activities.length === 0) && comments.length === 0 && (
           <View style={{padding: 60, alignItems: 'center'}}>
             <View style={styles.emptyActivityCircle}>
                <Ionicons name="chatbubbles-outline" size={32} color="#444" />
             </View>
             <Text style={{color: '#555', marginTop: 15, fontSize: 14, fontWeight: '600'}}>No activity record</Text>
           </View>
         )}
      </ScrollView>

      <View style={[styles.commentInputBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
         <View style={styles.commentInputWrapper}>
           <TextInput 
             style={styles.commentInput} 
             placeholder="Write a comment..." 
             placeholderTextColor="#888" 
             value={newComment}
             onChangeText={setNewComment}
             multiline
             autoFocus={false}
           />
           {newComment.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handlePostComment}>
                 <Ionicons name="send" size={18} color={AppColors.background} />
              </TouchableOpacity>
           ) : (
             <View style={{ width: 32 }} /> // Placeholder for send button space
           )}
         </View>
      </View>
    </KeyboardAvoidingView>
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
          <Modal transparent visible={isAssigneePickerVisible} animationType="slide">
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>Assign Users</Text>
                  <TouchableOpacity onPress={() => { setIsAssigneePickerVisible(false); setUserSearch(''); }}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color="#555" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    placeholderTextColor="#555"
                    value={userSearch}
                    onChangeText={setUserSearch}
                  />
                </View>

                <ScrollView style={{maxHeight: 400}}>
                  {filteredUsers.map((u) => {
                    const isSelected = task?.assigned_users?.some((au: any) => au.id === u.id);
                    return (
                      <TouchableOpacity 
                        key={u.id} 
                        style={styles.pickerItem}
                        onPress={() => {
                          let newIds = task?.assigned_users?.map((au: any) => au.id) || [];
                          if (isSelected) newIds = newIds.filter((id: number) => id !== u.id);
                          else newIds.push(u.id);
                          handleUpdateField({ assigned_users: newIds });
                        }}
                      >
                         <View style={styles.pickerItemLeft}>
                            <View style={styles.pickerAvatar}>
                               <Text style={styles.pickerAvatarText}>{(u.full_name || 'U')[0]}</Text>
                            </View>
                            <View>
                               <Text style={[styles.pickerItemText, isSelected && { color: AppColors.accent, fontWeight: '700' }]}>
                                 {u.full_name}
                               </Text>
                               <Text style={styles.pickerItemSubtext}>{u.email}</Text>
                            </View>
                         </View>
                         {isSelected && <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity 
                  style={styles.confirmBtn} 
                  onPress={() => { setIsAssigneePickerVisible(false); setUserSearch(''); }}
                >
                  <Text style={styles.confirmBtnText}>DONE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Label Picker */}
        {isLabelPickerVisible && (
          <Modal transparent visible={isLabelPickerVisible} animationType="slide">
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>Select Labels</Text>
                  <TouchableOpacity onPress={() => { setIsLabelPickerVisible(false); setLabelSearch(''); }}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color="#555" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search labels..."
                    placeholderTextColor="#555"
                    value={labelSearch}
                    onChangeText={setLabelSearch}
                  />
                </View>

                <ScrollView style={{maxHeight: 400}}>
                  {filteredLabels.map((l) => {
                    const isSelected = task?.labels?.some((al: any) => al.id === l.id);
                    return (
                      <TouchableOpacity 
                        key={l.id} 
                        style={styles.pickerItem}
                        onPress={() => {
                          let newIds = task?.labels?.map((al: any) => al.id) || [];
                          if (isSelected) newIds = newIds.filter((id: number) => id !== l.id);
                          else newIds.push(l.id);
                          handleUpdateField({ labels_ids: newIds });
                        }}
                      >
                         <View style={styles.pickerItemLeft}>
                            <View style={[styles.labelDot, { backgroundColor: l.color || AppColors.accent }]} />
                            <Text style={[styles.pickerItemText, isSelected && { color: l.color || AppColors.accent, fontWeight: '700' }]}>
                              {l.name}
                            </Text>
                         </View>
                         {isSelected && <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity 
                  style={styles.confirmBtn} 
                  onPress={() => { setIsLabelPickerVisible(false); setLabelSearch(''); }}
                >
                  <Text style={styles.confirmBtnText}>DONE</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: AppColors.background, 
    borderTopWidth: 1, 
    borderTopColor: AppColors.border, 
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  commentInput: { 
    flex: 1, 
    color: AppColors.white, 
    fontSize: 14, 
    minHeight: 40, 
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: { 
    width: 32, 
    height: 32, 
    backgroundColor: AppColors.accent, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 10 
  },
  descInput: { color: AppColors.white, fontSize: 15, paddingVertical: 10, minHeight: 60 },
  statusPickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  statusPickerContent: { backgroundColor: AppColors.background, borderRadius: 20, padding: 20, borderSize: 1, borderColor: AppColors.border },
  statusOptionText: { color: AppColors.white, fontSize: 16, fontWeight: '700' },
  avatarList: { flexDirection: 'row', alignItems: 'center' },
  metaValueTextMuted: { color: AppColors.textMuted, fontSize: 15, fontWeight: '600' },
  labelPillList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, justifyContent: 'flex-end' },
  miniLabel: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  miniLabelText: { fontSize: 11, fontWeight: '700' },
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  pickerModalContent: { backgroundColor: '#161618', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  pickerModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerModalTitle: { color: AppColors.white, fontSize: 18, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 15, gap: 8, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, color: AppColors.white, fontSize: 14 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222' },
  pickerItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickerItemText: { color: '#ccc', fontSize: 15 },
  pickerItemSubtext: { color: '#555', fontSize: 12 },
  pickerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: AppColors.accent + '22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.accent + '44' },
  pickerAvatarText: { color: AppColors.accent, fontSize: 13, fontWeight: '800' },
  labelDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  confirmBtn: { backgroundColor: AppColors.accent, borderRadius: 15, paddingVertical: 16, marginTop: 15, alignItems: 'center' },
  confirmBtnText: { color: AppColors.background, fontSize: 15, fontWeight: '800' },
  timelineContainer: { paddingLeft: 10, marginBottom: 30 },
  timelineItem: { flexDirection: 'row', minHeight: 60 },
  timelineLine: { width: 30, alignItems: 'center' },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.accent, marginTop: 8 },
  timelineConnector: { width: 2, flex: 1, backgroundColor: '#222', marginVertical: 4 },
  timelineBody: { flex: 1, paddingBottom: 20 },
  logTime: { color: '#555', fontSize: 11, marginTop: 4, fontWeight: '700' },
  activityHeading: { color: AppColors.white, fontSize: 16, fontWeight: '800', marginBottom: 20, marginTop: 10 },
  commentBubble: { backgroundColor: AppColors.cardBackground, padding: 12, borderRadius: 15, marginTop: 5, borderWidth: 1, borderColor: '#222' },
  emptyActivityCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a1a1e', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
});
