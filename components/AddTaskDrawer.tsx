import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import {
  fetchProjectUsers,
  fetchLabels,
  fetchTasks,
  createLabel,
  createTask,
  fetchBoards,
} from '@/lib/api';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SNAP_BASE = SCREEN_HEIGHT * 0.55; 
const SNAP_FULL = SCREEN_HEIGHT * 0.15; 

const priorities = [
  { label: 'Low', value: 'low', color: '#8b8b99' },
  { label: 'Medium', value: 'medium', color: '#3b82f6' },
  { label: 'High', value: 'high', color: '#f59e0b' },
  { label: 'Urgent', value: 'urgent', color: '#ef4444' },
];

interface AddTaskDrawerProps {
  visible: boolean;
  onClose: () => void;
  defaultBoardId?: string | number;
  defaultColumnId?: string | number;
  onTaskCreated?: () => void;
}

export default function AddTaskDrawer({ visible, onClose, defaultBoardId, defaultColumnId, onTaskCreated }: AddTaskDrawerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Form Initial (fast access)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('low');
  
  // States that need loading
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{ visible: boolean; mode: 'start' | 'due' }>({ visible: false, mode: 'start' });
  const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

  // Data
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [boardColumns, setBoardColumns] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);

  // Selection
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);

  // UI
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerModal, setPickerModal] = useState<'column' | 'users' | 'labels' | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Start Animation IMMEDIATELY
  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(SNAP_BASE, { duration: 250 });
      // Defer data loading slightly so it doesn't block the animation frames
      setTimeout(() => loadData(), 100);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible, defaultBoardId]);

  const loadData = async () => {
    if (!defaultBoardId) return;
    setIsContextLoading(true);
    try {
      // 1. Fetch column structure and basic board list in parallel
      const [allBoardsRes, taskRes] = await Promise.all([
        fetchBoards(),
        fetchTasks(defaultBoardId)
      ]);
      
      const allBoards = allBoardsRes?.data ?? allBoardsRes ?? [];
      const boardInfo = allBoards.find((b: any) => String(b.id) === String(defaultBoardId));
      
      const cols = taskRes?.data ?? [];
      setBoardColumns(cols);
      
      if (defaultColumnId) {
        setSelectedColumnId(Number(defaultColumnId));
      } else if (cols.length > 0) {
        setSelectedColumnId(cols[0].id);
      }

      if (boardInfo) {
        setCurrentBoard(boardInfo);
        const projectId = boardInfo.project_id || boardInfo.project?.id;
        if (projectId) {
          setSelectedProjectId(projectId);
          // 2. Secondary parallel load for project specific dependencies
          const [uRes, lRes] = await Promise.all([
            fetchProjectUsers(projectId),
            fetchLabels(projectId)
          ]);
          setUsers(uRes?.data ?? uRes ?? []);
          setLabels(lRes?.data ?? lRes ?? []);
        }
      }
    } catch (e: any) {
      console.error('[AddTaskDrawer] Load Error:', e);
    } finally {
      setIsContextLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    return users.filter(u => {
      const full = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const mail = (u.email || '').toLowerCase();
      const q = userSearch.toLowerCase();
      return full.includes(q) || mail.includes(q);
    });
  }, [users, userSearch]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (!result.canceled && result.assets) {
        setAttachments(prev => [...prev, ...result.assets]);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !selectedProjectId) return;
    setIsAddingLabel(true);
    try {
      const res = await createLabel({ name: newLabelName, color: '#3b82f6', project_id: selectedProjectId });
      const lbl = res?.data ?? res;
      setLabels(prev => [...prev, lbl]);
      setSelectedLabelIds(prev => [...prev, lbl.id]);
      setNewLabelName('');
      setIsAddingLabel(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Label Creation Failed' });
      setIsAddingLabel(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedColumnId || !defaultBoardId) {
      Toast.show({ type: 'error', text1: 'Missing fields' });
      return;
    }
    setIsSubmitting(true);
    try {
      const files = attachments.map(a => ({
        uri: Platform.OS === 'web' ? a.file : a.uri,
        name: a.name,
        type: a.mimeType || 'application/octet-stream',
      }));

      await createTask({
        title,
        descriptions: description,
        priority: selectedPriority as any,
        start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
        board_id: defaultBoardId,
        board_column_id: selectedColumnId,
        assigned_users: selectedUserIds,
        labels_ids: selectedLabelIds,
        attachments: files.length > 0 ? files : undefined,
      });

      Toast.show({ type: 'success', text1: 'Task Created' });
      resetForm();
      onClose();
      if (onTaskCreated) onTaskCreated();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAttachments([]);
    setSelectedUserIds([]);
    setSelectedLabelIds([]);
    setStartDate(null);
    setDueDate(null);
    setUserSearch('');
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newVal = e.translationY + (translateY.value < SNAP_BASE ? SNAP_FULL : SNAP_BASE);
      if (newVal > SNAP_FULL) translateY.value = newVal;
    })
    .onEnd((e) => {
      if (e.translationY < -80 || (translateY.value < (SNAP_BASE + SNAP_FULL) / 2 && e.velocityY < 0)) translateY.value = withSpring(SNAP_FULL);
      else if (e.translationY > 150) runOnJS(onClose)();
      else translateY.value = withSpring(SNAP_BASE);
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, animatedStyle, { paddingBottom: insets.bottom }]}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleArea}><View style={styles.handle} /></View>
          </GestureDetector>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{currentBoard?.name || 'Quick Task'}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close-outline" size={28} color={AppColors.textMuted} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <TextInput 
              style={styles.titleInput} 
              placeholder="Task Name" 
              placeholderTextColor={AppColors.textMuted} 
              value={title} 
              onChangeText={setTitle} 
              autoFocus={visible && Platform.OS === 'ios'}
            />
            <TextInput style={styles.descInput} placeholder="Add details..." placeholderTextColor={AppColors.textMuted} value={description} onChangeText={setDescription} multiline />

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>PHASE</Text>
              <TouchableOpacity 
                style={[styles.pickerRow, defaultColumnId && { opacity: 0.6 }]} 
                onPress={() => !defaultColumnId && setPickerModal('column')}
                disabled={!!defaultColumnId}
              >
                {isContextLoading && boardColumns.length === 0 ? <ActivityIndicator size="small" color={AppColors.accent} /> : <Ionicons name="layers-outline" size={20} color={AppColors.accent} />}
                <Text style={styles.pickerText}>{boardColumns.find(c => c.id === selectedColumnId)?.name || (isContextLoading ? 'Syncing...' : 'Select Column')}</Text>
                {!defaultColumnId && <Ionicons name="chevron-down" size={16} color={AppColors.textMuted} />}
                {defaultColumnId && <Ionicons name="lock-closed-outline" size={14} color={AppColors.textMuted} />}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>TEAM & LABELS</Text>
              <View style={styles.rowGrid}>
                <TouchableOpacity style={styles.gridBtn} onPress={() => setPickerModal('users')}>
                  <Ionicons name="people-outline" size={20} color={AppColors.success} />
                  <Text style={styles.gridBtnText}>{selectedUserIds.length || 'Assign'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridBtn} onPress={() => setPickerModal('labels')}>
                  <Ionicons name="pricetags-outline" size={20} color="#c084fc" />
                  <Text style={styles.gridBtnText}>{selectedLabelIds.length || 'Tags'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>SCHEDULE</Text>
              <View style={styles.dateRow}>
                 <TouchableOpacity style={[styles.dateBlock, showDatePicker.mode === 'start' && styles.dateBlockActive]} onPress={() => setShowDatePicker({ visible: true, mode: 'start' })}>
                    <Text style={styles.dateBlockLabel}>START</Text>
                    <Text style={styles.dateBlockValue}>{startDate?.toLocaleDateString('en-US', {month:'short', day:'numeric'}) || '--'}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.dateBlock, showDatePicker.mode === 'due' && styles.dateBlockActive]} onPress={() => setShowDatePicker({ visible: true, mode: 'due' })}>
                    <Text style={styles.dateBlockLabel}>DUE</Text>
                    <Text style={styles.dateBlockValue}>{dueDate?.toLocaleDateString('en-US', {month:'short', day:'numeric'}) || '--'}</Text>
                 </TouchableOpacity>
              </View>
              {showDatePicker.visible && (
                 <View style={styles.calendarContainer}>
                    <DateTimePicker
                      value={(showDatePicker.mode === 'start' ? startDate : dueDate) || new Date()}
                      mode="date"
                      display="inline"
                      themeVariant="dark"
                      onChange={(e, d) => {
                        if (Platform.OS === 'android') setShowDatePicker({ visible: false, mode: 'start' });
                        if (d) {
                          if (showDatePicker.mode === 'start') setStartDate(d); else setDueDate(d);
                        }
                      }}
                      style={styles.inlinePicker}
                    />
                    {Platform.OS === 'ios' && <TouchableOpacity style={styles.doneBar} onPress={() => setShowDatePicker({ visible: false, mode: 'start' })}><Text style={styles.doneText}>Save</Text></TouchableOpacity>}
                 </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>PRIORITY</Text>
              <View style={styles.priorityBar}>
                {priorities.map(p => (
                  <TouchableOpacity key={p.value} style={[styles.priorityTab, selectedPriority === p.value && { backgroundColor: p.color }]} onPress={() => setSelectedPriority(p.value)}>
                    <Text style={[styles.priorityTabText, selectedPriority === p.value && { color: '#000', fontWeight: '800' }]}>{p.label.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.groupLabel}>ATTACHMENTS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachScroll}>
                <TouchableOpacity style={styles.addAttachBtn} onPress={handlePickDocument}><Ionicons name="cloud-upload-outline" size={24} color={AppColors.textMuted} /></TouchableOpacity>
                {attachments.map((a, i) => (
                  <View key={i} style={styles.attachmentPill}>
                    <Text style={styles.attachmentName} numberOfLines={1}>{a.name}</Text>
                    <TouchableOpacity onPress={() => setAttachments(pv => pv.filter((_, x) => x !== i))}><Ionicons name="close-circle" size={16} color={AppColors.textMuted} /></TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={[styles.createBtn, (isSubmitting || !title.trim()) && { opacity: 0.5 }]} disabled={isSubmitting || !title.trim()} onPress={handleCreateTask}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>CREATE TASK</Text>}
            </TouchableOpacity>
            <View style={{height: 100}} />
          </ScrollView>
        </Animated.View>

        {/* Picker Modal Overlay */}
        <Modal visible={pickerModal !== null} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={{flex:1}} onPress={() => setPickerModal(null)} />
              <View style={styles.modalBody}>
                <View style={styles.modalHeader}>
                   <Text style={styles.modalTitle}>Select {pickerModal === 'users' ? 'Assignees' : pickerModal}</Text>
                   <TouchableOpacity onPress={() => setPickerModal(null)}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
                </View>

                {pickerModal === 'users' && (
                  <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={AppColors.textMuted} />
                    <TextInput 
                      style={styles.searchInput} 
                      placeholder="Search users..." 
                      placeholderTextColor={AppColors.textMuted} 
                      value={userSearch}
                      onChangeText={setUserSearch}
                    />
                  </View>
                )}

                {pickerModal === 'labels' && (
                  <View style={styles.labelCreator}>
                     <TextInput style={styles.labelInput} placeholder="New tag..." placeholderTextColor={AppColors.textMuted} value={newLabelName} onChangeText={setNewLabelName} />
                     <TouchableOpacity style={styles.labelBtn} onPress={handleCreateLabel} disabled={isAddingLabel}>
                       {isAddingLabel ? <ActivityIndicator size="small" /> : <Ionicons name="add" size={24} color="#fff" />}
                     </TouchableOpacity>
                  </View>
                )}

                <FlatList
                  data={pickerModal === 'column' ? boardColumns : pickerModal === 'users' ? filteredUsers : labels}
                  keyExtractor={item => String(item.id)}
                  renderItem={({ item }) => {
                    let active = false;
                    if (pickerModal === 'column') active = selectedColumnId === item.id;
                    if (pickerModal === 'users') active = selectedUserIds.includes(item.id);
                    if (pickerModal === 'labels') active = selectedLabelIds.includes(item.id);

                    return (
                      <TouchableOpacity style={styles.listRow} onPress={() => {
                        if (pickerModal === 'column') { setSelectedColumnId(item.id); setPickerModal(null); }
                        if (pickerModal === 'users') setSelectedUserIds(pv => pv.includes(item.id) ? pv.filter(id => id !== item.id) : [...pv, item.id]);
                        if (pickerModal === 'labels') setSelectedLabelIds(pv => pv.includes(item.id) ? pv.filter(id => id !== item.id) : [...pv, id !== item.id]);
                      }}>
                        <View style={styles.listRowLeft}>
                           {pickerModal === 'users' && <View style={styles.avatarCircle}><Text style={styles.avatarText}>{(item.first_name || 'U')[0]}</Text></View>}
                           <View>
                              <Text style={[styles.listRowText, active && { color: AppColors.accent, fontWeight: '700' }]}>
                                {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim()}
                              </Text>
                              {pickerModal === 'users' && <Text style={styles.listRowSub}>{item.email}</Text>}
                           </View>
                        </View>
                        {active && <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={<Text style={styles.emptyText}>{isContextLoading ? 'Syncing data...' : 'No items found'}</Text>}
                />
                <TouchableOpacity style={styles.confirmBtn} onPress={() => setPickerModal(null)}><Text style={styles.confirmBtnText}>DONE</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_HEIGHT, backgroundColor: '#0f0f12', borderTopLeftRadius: 35, borderTopRightRadius: 35, overflow: 'hidden' },
  handleArea: { width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 50, height: 6, backgroundColor: '#333', borderRadius: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 50 },
  titleInput: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 5 },
  descInput: { color: AppColors.textMuted, fontSize: 15, marginBottom: 20, minHeight: 30 },
  formGroup: { marginBottom: 18 },
  groupLabel: { color: '#555', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1e', padding: 16, borderRadius: 18, gap: 12, borderWidth: 1, borderColor: '#222' },
  pickerText: { flex: 1, color: '#eee', fontSize: 14, fontWeight: '600' },
  rowGrid: { flexDirection: 'row', gap: 12 },
  gridBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1e', padding: 16, borderRadius: 18, gap: 10, borderWidth: 1, borderColor: '#222' },
  gridBtnText: { color: '#eee', fontSize: 13, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateBlock: { flex: 1, backgroundColor: '#1a1a1e', padding: 12, borderRadius: 18, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  dateBlockActive: { borderColor: AppColors.accent, backgroundColor: '#1e1b2e' },
  dateBlockLabel: { color: '#555', fontSize: 8, fontWeight: '800', marginBottom: 1 },
  dateBlockValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  calendarContainer: { marginTop: 10, backgroundColor: '#000', borderRadius: 20, padding: 5, borderWidth: 1, borderColor: '#333' },
  inlinePicker: { height: 300, alignSelf: 'center' },
  doneBar: { alignSelf: 'center', padding: 10 },
  doneText: { color: AppColors.accent, fontWeight: '900', fontSize: 13 },
  priorityBar: { flexDirection: 'row', backgroundColor: '#1a1a1e', borderRadius: 18, padding: 4, gap: 4 },
  priorityTab: { flex: 1, paddingVertical: 10, borderRadius: 15, alignItems: 'center' },
  priorityTabText: { color: '#666', fontSize: 10, fontWeight: '700' },
  attachScroll: { gap: 12, paddingVertical: 5 },
  addAttachBtn: { width: 50, height: 50, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1e' },
  attachmentPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', paddingHorizontal: 12, borderRadius: 18, gap: 8, height: 50 },
  attachmentName: { color: '#fff', fontSize: 12, maxWidth: 100 },
  createBtn: { backgroundColor: AppColors.accent, marginTop: 25, borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalBody: { backgroundColor: '#161618', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222' },
  listRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listRowText: { color: '#ccc', fontSize: 14 },
  listRowSub: { color: '#555', fontSize: 11 },
  avatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: AppColors.accent + '15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.accent + '30' },
  avatarText: { color: AppColors.accent, fontSize: 13, fontWeight: '800' },
  confirmBtn: { backgroundColor: AppColors.accent, borderRadius: 15, paddingVertical: 16, marginTop: 15, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  labelCreator: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  labelInput: { flex: 1, backgroundColor: '#000', color: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 48, borderWidth: 1, borderColor: '#333' },
  labelBtn: { backgroundColor: AppColors.accent, width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 15, gap: 8, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  emptyText: { color: '#555', textAlign: 'center', marginTop: 30, fontSize: 13 },
});
