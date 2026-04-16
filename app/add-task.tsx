import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import {
  fetchProjects,
  fetchProjectUsers,
  fetchBoards,
  fetchLabels,
  createLabel,
  createTask,
} from '@/lib/api';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const priorities = [
  { label: 'Low', value: 'low', color: AppColors.accent },
  { label: 'Medium', value: 'medium', color: AppColors.warning },
  { label: 'High', value: 'high', color: AppColors.error },
  { label: 'Urgent', value: 'urgent', color: '#ff2d55' },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ defaultBoardId?: string }>();
  const defaultBoardId = params.defaultBoardId;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('low');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{ visible: boolean; mode: 'start' | 'due' }>({
    visible: false,
    mode: 'start',
  });

  const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

  // API Data State
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [boardColumns, setBoardColumns] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);

  // Selection State
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);

  // Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [modalVisible, setModalVisible] = useState<
    'project' | 'board' | 'column' | 'users' | 'labels' | null
  >(null);

  // New Label State
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ffffff');
  const colors = ['#ffffff', '#ff4d4f', '#ffa940', '#fadb14', '#52c41a', '#1890ff', '#722ed1'];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [projRes, boardRes] = await Promise.all([fetchProjects(), fetchBoards()]);
      const projData = projRes?.data ?? projRes ?? [];
      const boardData = boardRes?.data ?? boardRes ?? [];
      setProjects(projData);
      setBoards(boardData);

      const boardToSelect = defaultBoardId 
        ? boardData.find((b: any) => String(b.id) === String(defaultBoardId))
        : (boardData.length > 0 ? boardData[0] : null);

      if (boardToSelect) {
        setSelectedBoardId(boardToSelect.id);
        const cols = boardToSelect.columns || boardToSelect.board_columns || [];
        setBoardColumns(cols);
        if (cols.length > 0) setSelectedColumnId(cols[0].id);
        
        // If board has a project_id, also pre-select that project
        if (boardToSelect.project_id) {
          handleProjectSelect(boardToSelect.project_id);
        } else if (projData.length > 0) {
          handleProjectSelect(projData[0].id);
        }
      } else if (projData.length > 0) {
        handleProjectSelect(projData[0].id);
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error loading data', text2: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = async (projectId: number) => {
    setSelectedProjectId(projectId);
    setModalVisible(null);
    setSelectedUserIds([]);
    setSelectedLabelIds([]);
    
    try {
      const [usersRes, labelsRes] = await Promise.all([
        fetchProjectUsers(projectId),
        fetchLabels(projectId),
      ]);
      setUsers(usersRes?.data ?? usersRes ?? []);
      setLabels(labelsRes?.data ?? labelsRes ?? []);
    } catch (e) {
      console.error('Failed to fetch project dependencies', e);
    }
  };

  const handleSelectBoard = (boardId: number) => {
    setSelectedBoardId(boardId);
    const board = boards.find((b) => b.id === boardId);
    const cols = board?.columns || board?.board_columns || [];
    setBoardColumns(cols);
    setSelectedColumnId(cols.length > 0 ? cols[0].id : null);
    setModalVisible('column'); // auto open column select
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets) {
        setAttachments((prev) => [...prev, ...result.assets]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !selectedProjectId) return;
    setIsAddingLabel(true);
    try {
      const res = await createLabel({
        name: newLabelName,
        color: newLabelColor,
        project_id: selectedProjectId,
      });
      const lbl = res?.data ?? res;
      setLabels((prev) => [...prev, lbl]);
      setSelectedLabelIds((prev) => [...prev, lbl.id]);
      setNewLabelName('');
      setIsAddingLabel(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to create label', text2: e.message });
      setIsAddingLabel(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !selectedBoardId || !selectedColumnId) {
      Toast.show({ type: 'error', text1: 'Missing required fields' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formattedAttachments = attachments.map((a) => ({
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
        board_id: selectedBoardId,
        board_column_id: selectedColumnId,
        assigned_users: selectedUserIds,
        labels_ids: selectedLabelIds,
        attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined,
      });

      Toast.show({ type: 'success', text1: 'Task Created!' });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to create task', text2: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: Date | null) => (d ? d.toLocaleDateString() : 'Select date');

  // Helper for rendering selected items text
  const getSelectedProjectName = () => projects.find((p) => p.id === selectedProjectId)?.name || 'Select Project';
  const getSelectedBoardName = () => boards.find((b) => b.id === selectedBoardId)?.name || 'Select Board';
  const getSelectedColumnName = () => boardColumns.find((c) => c.id === selectedColumnId)?.name || 'Select Column';

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={AppColors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={AppColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Task</Text>
          <View style={{ width: 24 }} />
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

        {/* Priority */}
        <View style={styles.prioritySection}>
          <Text style={styles.fieldLabel}>Priority</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priorityRow}>
            {priorities.map((priority) => {
              const isSelected = selectedPriority === priority.value;
              return (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityChip,
                    isSelected && { backgroundColor: priority.color, borderColor: priority.color },
                  ]}
                  onPress={() => setSelectedPriority(priority.value)}
                >
                  <Text style={[styles.priorityText, isSelected && { color: AppColors.background }]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Settings Selectors */}
        <View style={styles.settingsSection}>
          
          <TouchableOpacity style={styles.settingsRow} onPress={() => setModalVisible('project')}>
            <View style={styles.settingsLeft}>
              <View style={styles.settingsIcon}><Ionicons name="folder-outline" size={20} color={AppColors.accent} /></View>
              <Text style={styles.settingsLabel}>Project</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{getSelectedProjectName()}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={() => setModalVisible('board')}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(255,167,38,0.1)' }]}><Ionicons name="grid-outline" size={20} color={AppColors.warning} /></View>
              <Text style={styles.settingsLabel}>Board & Phase</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{getSelectedBoardName()} / {getSelectedColumnName()}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={() => setModalVisible('users')} disabled={!selectedProjectId}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(76,175,80,0.1)' }]}><Ionicons name="person-outline" size={20} color={AppColors.success} /></View>
              <Text style={styles.settingsLabel}>Assignees</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{selectedUserIds.length > 0 ? `${selectedUserIds.length} users` : 'Select'}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={() => setModalVisible('labels')} disabled={!selectedProjectId}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(199,125,255,0.1)' }]}><Ionicons name="pricetag-outline" size={20} color="#C77DFF" /></View>
              <Text style={styles.settingsLabel}>Labels</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{selectedLabelIds.length > 0 ? `${selectedLabelIds.length} labels` : 'Select'}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow} onPress={() => setShowDatePicker({ visible: true, mode: 'start' })}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}><Ionicons name="calendar-outline" size={20} color={AppColors.white} /></View>
              <Text style={styles.settingsLabel}>Start Date</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{formatDate(startDate)}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow} onPress={() => setShowDatePicker({ visible: true, mode: 'due' })}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(255,82,82,0.1)' }]}><Ionicons name="time-outline" size={20} color={AppColors.error} /></View>
              <Text style={styles.settingsLabel}>Due Date</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{formatDate(dueDate)}</Text>
              <Ionicons name="chevron-forward" size={16} color={AppColors.textMuted} />
            </View>
          </TouchableOpacity>

        </View>

        {/* Attachments */}
        <View style={styles.attachmentSection}>
          <Text style={styles.fieldLabel}>Attachments</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachmentRow}>
            <TouchableOpacity style={styles.addAttachmentBtn} onPress={handlePickDocument}>
              <Ionicons name="add" size={28} color={AppColors.textMuted} />
            </TouchableOpacity>
            {attachments.map((file, idx) => (
              <View key={idx} style={styles.attachmentChip}>
                <Ionicons name="document-text-outline" size={16} color={AppColors.accent} />
                <Text style={styles.attachmentText} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeAttachment(idx)}>
                  <Ionicons name="close-circle" size={18} color={AppColors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Create Button */}
        <TouchableOpacity 
          style={[styles.createButton, isSubmitting && { opacity: 0.7 }]} 
          activeOpacity={0.8}
          onPress={handleCreateTask}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={AppColors.background} />
          ) : (
            <Text style={styles.createButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Component */}
      {showDatePicker.visible && (
        <DateTimePicker
          value={(showDatePicker.mode === 'start' ? startDate : dueDate) || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker({ visible: false, mode: 'start' });
            if (date) {
              if (showDatePicker.mode === 'start') setStartDate(date);
              else setDueDate(date);
            }
          }}
        />
      )}

      {/* Dynamic Pickers Modal Hub */}
      <Modal visible={modalVisible !== null} transparent animationType="slide" onRequestClose={() => setModalVisible(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalVisible === 'project' && 'Select Project'}
                {modalVisible === 'board' && 'Select Board'}
                {modalVisible === 'column' && 'Select Phase'}
                {modalVisible === 'users' && 'Assign Users'}
                {modalVisible === 'labels' && 'Select Labels'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={AppColors.white} />
              </TouchableOpacity>
            </View>

            {modalVisible === 'labels' && (
              <View style={styles.addLabelSection}>
                <View style={styles.addLabelRow}>
                  <TextInput
                    style={styles.addLabelInput}
                    placeholder="New label name..."
                    placeholderTextColor={AppColors.textMuted}
                    value={newLabelName}
                    onChangeText={setNewLabelName}
                  />
                  <TouchableOpacity style={styles.addLabelBtn} onPress={handleCreateLabel} disabled={isAddingLabel}>
                    {isAddingLabel ? <ActivityIndicator color={AppColors.white} size="small" /> : <Ionicons name="checkmark" size={18} color={AppColors.white} />}
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {colors.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorOption, { backgroundColor: c }, newLabelColor === c && styles.colorOptionSelected]}
                      onPress={() => setNewLabelColor(c)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <FlatList
              data={
                modalVisible === 'project' ? projects :
                modalVisible === 'board' ? boards :
                modalVisible === 'column' ? boardColumns :
                modalVisible === 'users' ? users :
                modalVisible === 'labels' ? labels : []
              }
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                let isSelected = false;
                if (modalVisible === 'project') isSelected = selectedProjectId === item.id;
                if (modalVisible === 'board') isSelected = selectedBoardId === item.id;
                if (modalVisible === 'column') isSelected = selectedColumnId === item.id;
                if (modalVisible === 'users') isSelected = selectedUserIds.includes(item.id);
                if (modalVisible === 'labels') isSelected = selectedLabelIds.includes(item.id);

                return (
                  <TouchableOpacity
                    style={styles.modalItemRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (modalVisible === 'project') handleProjectSelect(item.id);
                      if (modalVisible === 'board') handleSelectBoard(item.id);
                      if (modalVisible === 'column') {
                        setSelectedColumnId(item.id);
                        setModalVisible(null);
                      }
                      if (modalVisible === 'users') {
                        setSelectedUserIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                      }
                      if (modalVisible === 'labels') {
                        setSelectedLabelIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]);
                      }
                    }}
                  >
                    <View style={styles.modalItemLeft}>
                      {modalVisible === 'labels' && (
                        <View style={[styles.labelColorDot, { backgroundColor: item.color || '#fff' }]} />
                      )}
                      <Text style={[styles.modalItemName, isSelected && styles.modalItemNameSelected]}>
                        {item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim()}
                      </Text>
                    </View>
                    <View style={[styles.checkboxOption, isSelected && styles.checkboxOptionChecked]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color={AppColors.white} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  scrollContent: { paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  headerTitle: { color: AppColors.white, fontSize: 18, fontWeight: '700' },
  fieldGroup: { marginBottom: Spacing.xl },
  fieldLabel: { color: AppColors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  titleInput: { color: AppColors.white, fontSize: 24, fontWeight: '600', paddingVertical: Spacing.sm },
  descriptionInput: { color: AppColors.textSecondary, fontSize: 16, minHeight: 80, paddingVertical: Spacing.sm, backgroundColor: AppColors.cardBackground, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: AppColors.border },
  
  prioritySection: { marginBottom: Spacing.xl },
  priorityRow: { gap: Spacing.md, paddingBottom: 4 },
  priorityChip: { paddingHorizontal: Spacing.xl, paddingVertical: 10, borderRadius: BorderRadius.full, backgroundColor: AppColors.cardBackground, borderWidth: 1, borderColor: AppColors.border },
  priorityText: { color: AppColors.textSecondary, fontSize: 13, fontWeight: '600' },
  
  settingsSection: { marginBottom: Spacing.xl, backgroundColor: AppColors.cardBackground, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: AppColors.border },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: AppColors.border },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingsIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(170,202,239,0.1)', alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { color: AppColors.white, fontSize: 15, fontWeight: '600' },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  settingsValue: { color: AppColors.textSecondary, fontSize: 14, maxWidth: 150 },
  
  attachmentSection: { marginBottom: Spacing.xxxl },
  attachmentRow: { gap: Spacing.md, flexDirection: 'row', alignItems: 'center' },
  addAttachmentBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: AppColors.cardBackground, borderWidth: 1, borderColor: AppColors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  attachmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.cardBackground, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, borderWidth: 1, borderColor: AppColors.border },
  attachmentText: { color: AppColors.white, fontSize: 13, maxWidth: 120 },
  
  createButton: { backgroundColor: AppColors.accent, borderRadius: BorderRadius.xl, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.lg },
  createButtonText: { color: AppColors.background, fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: AppColors.background, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingHorizontal: Spacing.xl, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xl, borderBottomWidth: 1, borderBottomColor: AppColors.border },
  modalTitle: { color: AppColors.white, fontSize: 18, fontWeight: '700' },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: AppColors.cardBackground, alignItems: 'center', justifyContent: 'center' },
  
  modalItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: AppColors.cardBackground },
  modalItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  labelColorDot: { width: 14, height: 14, borderRadius: 7 },
  modalItemName: { color: AppColors.textSecondary, fontSize: 16 },
  modalItemNameSelected: { color: AppColors.white, fontWeight: '600' },
  checkboxOption: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: AppColors.textMuted, alignItems: 'center', justifyContent: 'center' },
  checkboxOptionChecked: { backgroundColor: AppColors.accent, borderColor: AppColors.accent },

  addLabelSection: { paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: AppColors.border },
  addLabelRow: { flexDirection: 'row', gap: Spacing.md },
  addLabelInput: { flex: 1, backgroundColor: AppColors.cardBackground, color: AppColors.white, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AppColors.border },
  addLabelBtn: { backgroundColor: AppColors.accent, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md },
  colorOption: { width: 32, height: 32, borderRadius: 16, marginRight: Spacing.md, borderWidth: 2, borderColor: 'transparent' },
  colorOptionSelected: { borderColor: AppColors.white },
});
