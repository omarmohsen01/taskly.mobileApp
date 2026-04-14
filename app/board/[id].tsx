import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { fetchTasks } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLOR_PALETTE = ['#8b8b99', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function BoardScreen() {
  const router = useRouter();
  const { id, boardName, boardType } = useLocalSearchParams<{ id: string, boardName: string, boardType: string }>();
  
  // Default to kanban if not passed
  const type = boardType || 'kanban'; 

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [activeSheet, setActiveSheet] = useState<null | 'status' | 'assignee' | 'tags' | 'priority' | 'attachment'>(null);
  
  const [columns, setColumns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBoardData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetchTasks(id);
      if (res?.data) {
        setColumns(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadBoardData();
    }, [loadBoardData])
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <View style={styles.headerAppIcon}>
          <View style={styles.headerAppIconInner} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Taskly</Text>
          <View style={styles.headerSubtitleRow}>
            <Ionicons name={type === 'list' ? 'list' : 'grid'} size={12} color={AppColors.textMuted} />
            <Text style={styles.headerSubtitle}>{boardName || 'Board'} ▾</Text>
          </View>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={22} color={AppColors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="chatbubble-outline" size={22} color={AppColors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={AppColors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderKanban = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.85 + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.kanbanScroll}
      >
        {columns.map((col, idx) => {
          const colTasks = col.tasks || [];
          const colColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
          return (
            <View key={`col-${col.id}`} style={styles.kanbanColumn}>
              <View style={styles.colHeaderRow}>
                <View style={[styles.colHeaderBadge, { backgroundColor: colColor + '33' }]}>
                  <Text style={[styles.colHeaderText, { color: colColor }]}>
                    {col.name?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.colHeaderActions}>
                  <TouchableOpacity style={styles.colBtn}><Ionicons name="add" size={20} color={AppColors.textMuted}/></TouchableOpacity>
                  <TouchableOpacity style={styles.colBtn}><Ionicons name="ellipsis-horizontal" size={20} color={AppColors.textMuted}/></TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.kanbanList}>
                {colTasks.map((task: any) => (
                  <TouchableOpacity key={`task-${task.id}`} style={styles.taskCardItem} activeOpacity={0.8}>
                     <View style={[styles.taskCheckbox, { backgroundColor: colColor }]} />
                     <Text style={styles.taskCardText} numberOfLines={2}>{task.title}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity style={styles.addTaskBtn} onPress={() => setIsTaskModalVisible(true)}>
                   <Ionicons name="add" size={18} color={AppColors.textMuted} />
                   <Text style={styles.addTaskText}>Add Task</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderList = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
        <View style={styles.listTopTitleRow}>
            <Ionicons name="chevron-down" size={18} color={AppColors.white} />
            <View style={styles.headerAppIconSmall}>
              <View style={styles.headerAppIconInnerSmall} />
            </View>
            <Text style={styles.listTopTitle}>Taskly</Text>
        </View>

        {columns.map((col, idx) => {
          const colTasks = col.tasks || [];
          const colColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
          if (colTasks.length === 0) return null;
          
          return (
            <View key={`list-col-${col.id}`} style={styles.listSection}>
               <View style={styles.listSectionHeader}>
                  <Ionicons name="caret-down" size={14} color={AppColors.textMuted} style={{marginRight: Spacing.sm}} />
                  <View style={[styles.listColBadge, { backgroundColor: colColor }]}>
                     <Text style={styles.listColBadgeText}>{col.name?.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.listTaskCount}>{colTasks.length} Tasks</Text>
               </View>

               {colTasks.map((task: any, index: number) => (
                 <TouchableOpacity key={`list-task-${task.id}`} style={[styles.listRow, index === colTasks.length - 1 && { borderBottomWidth: 0 }]} activeOpacity={0.7}>
                    <View style={styles.listRowLeft}>
                      <View style={[styles.taskCheckbox, { backgroundColor: colColor, width: 14, height: 14, borderRadius: 2 }]} />
                      <Text style={styles.listRowText} numberOfLines={1}>{task.title}</Text>
                    </View>
                    <View style={styles.listRowRight}>
                       {task.creator?.full_name ? (
                          <View style={styles.avatarCircle}>
                             <Text style={styles.avatarText}>{task.creator.first_name?.[0]}{task.creator.last_name?.[0] || ''}</Text>
                          </View>
                       ) : null}
                    </View>
                 </TouchableOpacity>
               ))}
               
               <TouchableOpacity 
                 style={[styles.listRow, { borderBottomWidth: 0, marginTop: Spacing.xs }]}
                 onPress={() => setIsTaskModalVisible(true)}
               >
                  <View style={styles.listRowLeft}>
                    <Ionicons name="add" size={18} color={AppColors.textMuted} />
                    <Text style={styles.addTaskTextList}>Add Task</Text>
                  </View>
               </TouchableOpacity>

            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      {renderHeader()}
      <View style={styles.contentArea}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <ActivityIndicator size="large" color={AppColors.accent} />
          </View>
        ) : (
          type === 'kanban' ? renderKanban() : renderList()
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setIsTaskModalVisible(true)}>
        <Ionicons name="add" size={28} color={AppColors.white} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={isTaskModalVisible} animationType="slide" transparent onRequestClose={() => setIsTaskModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          {/* Backdrop Click-to-Close Intercept */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsTaskModalVisible(false)} />
          
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            {/* Pull Bar indicator for visual cue */}
            <View style={{width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginVertical: 8}} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
               <TouchableOpacity style={styles.modalContextBtn}>
                  <Text style={styles.modalContextText}>In Taskly</Text>
                  <Ionicons name="caret-down" size={12} color={AppColors.textMuted} style={{marginLeft: 4}} />
               </TouchableOpacity>
               <View style={styles.modalHeaderRight}>
                  <TouchableOpacity style={styles.modalIconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalIconBtn} onPress={() => setIsTaskModalVisible(false)}>
                    <Ionicons name="close" size={20} color={AppColors.textMuted} />
                  </TouchableOpacity>
               </View>
            </View>

            {/* Inputs */}
            <TextInput
              style={styles.modalTitleInput}
              placeholder="Untitled Task"
              placeholderTextColor={AppColors.textMuted}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />
            <TextInput
              style={styles.modalDescInput}
              placeholder="Tap to add a description..."
              placeholderTextColor={AppColors.textMuted}
              value={taskDesc}
              onChangeText={setTaskDesc}
            />

            {/* Meta Rows */}
            <TouchableOpacity style={styles.metaRow} activeOpacity={0.7} onPress={() => setActiveSheet('assignee')}>
               <View style={styles.metaIconWrap}>
                 <Ionicons name="person-outline" size={20} color={AppColors.textMuted} />
               </View>
               <View style={{flex: 1}}>
                 <Text style={styles.metaLabel}>Assignee</Text>
                 <Text style={styles.metaValue}>Omar mohsen</Text>
               </View>
               <View style={[styles.avatarCircle, { width: 24, height: 24, borderRadius: 12 }]}>
                 <Text style={[styles.avatarText, { fontSize: 8 }]}>OM</Text>
               </View>
            </TouchableOpacity>

            <View style={[styles.metaRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
               <View style={styles.metaIconWrap}>
                 <Ionicons name="calendar-outline" size={20} color={AppColors.textMuted} />
               </View>
               <Text style={[styles.metaValue, { color: AppColors.textMuted }]}>Set dates</Text>
            </View>

            {/* Action Bar */}
            <View style={styles.modalActionBar}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  <TouchableOpacity style={styles.actionPill} onPress={() => setActiveSheet('status')}>
                     <Ionicons name="ellipse-outline" size={14} color={AppColors.textMuted} style={{marginRight: 4}}/>
                     <Text style={styles.actionPillText}>TO DO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveSheet('priority')}>
                     <Ionicons name="flag-outline" size={20} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveSheet('attachment')}>
                     <Ionicons name="attach-outline" size={24} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveSheet('tags')}>
                     <Ionicons name="pricetag-outline" size={20} color={AppColors.textMuted} />
                  </TouchableOpacity>
               </View>
               
               <TouchableOpacity 
                 style={[styles.createTaskBtn, taskTitle.trim() && styles.createTaskBtnActive]}
                 disabled={!taskTitle.trim()}
                 onPress={() => {
                   setIsTaskModalVisible(false);
                   setTaskTitle('');
                   setTaskDesc('');
                 }}
               >
                  <Text style={[styles.createTaskBtnText, taskTitle.trim() && { color: AppColors.white }]}>Create</Text>
               </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sub-modals for context actions */}
      <Modal visible={!!activeSheet} animationType="slide" transparent onRequestClose={() => setActiveSheet(null)}>
         <View style={styles.modalOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveSheet(null)} />
            <View style={[styles.modalContent, styles.subSheetContent]}>
               {/* ---------------- PRIORITY SHEET ---------------- */}
               {activeSheet === 'priority' && (
                  <View>
                     <View style={styles.subSheetHeader}>
                        <View style={{width: 32}} />
                        <Text style={styles.headerTitle}>Priority</Text>
                        <TouchableOpacity style={styles.modalIconBtn} onPress={() => setActiveSheet(null)}>
                           <Ionicons name="close" size={20} color={AppColors.textMuted} />
                        </TouchableOpacity>
                     </View>
                     <View style={styles.subSheetBody}>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="flag" size={20} color="#ef4444" style={{marginRight: 12}} />
                           <Text style={styles.metaValue}>Urgent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="flag" size={20} color="#f59e0b" style={{marginRight: 12}} />
                           <Text style={styles.metaValue}>High</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="flag" size={20} color="#3b82f6" style={{marginRight: 12}} />
                           <Text style={styles.metaValue}>Medium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="flag" size={20} color="#8b8b99" style={{marginRight: 12}} />
                           <Text style={styles.metaValue}>Low</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.clearBtn} onPress={() => setActiveSheet(null)}>
                           <Text style={styles.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               )}

               {/* ---------------- TAGS SHEET ---------------- */}
               {activeSheet === 'tags' && (
                  <View>
                     <View style={styles.subSheetHeader}>
                        <View style={{width: 32}} />
                        <Text style={styles.headerTitle}>Tags</Text>
                        <TouchableOpacity style={styles.modalIconBtn} onPress={() => setActiveSheet(null)}>
                           <Ionicons name="close" size={20} color={AppColors.textMuted} />
                        </TouchableOpacity>
                     </View>
                     <View style={styles.subSheetBody}>
                        <View style={styles.searchBar}>
                           <Ionicons name="search" size={16} color={AppColors.textMuted} />
                           <TextInput placeholder="Search or create tags" placeholderTextColor={AppColors.textMuted} style={styles.searchInput} />
                        </View>
                        <ScrollView style={{maxHeight: 400}}>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#18181b' }]}><Text style={styles.metaValue}>ad.review</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#2e1065' }]}><Text style={styles.metaValue}>b2b</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#312e81' }]}><Text style={styles.metaValue}>car.part</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#1e3a8a' }]}><Text style={styles.metaValue}>car.rent</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#0f4a6e' }]}><Text style={styles.metaValue}>car.transfer</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#064e3b' }]}><Text style={styles.metaValue}>crm</Text></View>
                           <View style={[styles.coloredTagRow, { backgroundColor: '#78350f' }]}><Text style={styles.metaValue}>fahsy</Text></View>
                        </ScrollView>
                     </View>
                  </View>
               )}

               {/* ---------------- STATUS SHEET ---------------- */}
               {activeSheet === 'status' && (
                  <View>
                     <View style={styles.subSheetHeader}>
                        <View style={{width: 32}} />
                        <Text style={styles.headerTitle}>Status & Task Type</Text>
                        <TouchableOpacity onPress={() => setActiveSheet(null)}>
                           <Text style={[styles.createText, { color: '#8b5cf6' }]}>Done</Text>
                        </TouchableOpacity>
                     </View>
                     <View style={styles.subSheetBody}>
                        <View style={styles.searchBar}>
                           <Ionicons name="search" size={16} color={AppColors.textMuted} />
                           <TextInput placeholder="Search..." placeholderTextColor={AppColors.textMuted} style={styles.searchInput} />
                        </View>
                        <View style={styles.tabRow}>
                           <Text style={[styles.metaValue, { borderBottomWidth: 1, borderColor: AppColors.white, paddingBottom: 8 }]}>Status</Text>
                           <Text style={[styles.metaValue, { color: AppColors.textMuted, paddingBottom: 8 }]}>Task Type</Text>
                        </View>
                        <ScrollView style={{maxHeight: 400}}>
                           <Text style={[styles.metaLabel, {marginTop: Spacing.md}]}>Not started</Text>
                           <TouchableOpacity style={[styles.iconRowItem, styles.rowItemBordered]}>
                              <Ionicons name="ellipse-outline" size={20} color={AppColors.textMuted} style={{marginRight: 12, borderStyle: 'dotted', borderWidth: 1, borderRadius: 10}} />
                              <Text style={[styles.metaValue, { flex: 1 }]}>TO DO</Text>
                              <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                           </TouchableOpacity>

                           <Text style={[styles.metaLabel, {marginTop: Spacing.md}]}>Active</Text>
                           <TouchableOpacity style={styles.iconRowItem}>
                              <Ionicons name="play-circle-outline" size={20} color="#fca5a5" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>ISSUE</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.iconRowItem}>
                              <Ionicons name="play-circle-outline" size={20} color="#3b82f6" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>IN PROGRESS</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.iconRowItem}>
                              <Ionicons name="play-circle-outline" size={20} color="#f97316" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>BUGS</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={[styles.iconRowItem, styles.rowItemBordered]}>
                              <Ionicons name="play-circle-outline" size={20} color="#f59e0b" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>PENDING</Text>
                           </TouchableOpacity>

                           <Text style={[styles.metaLabel, {marginTop: Spacing.md}]}>Done</Text>
                           <TouchableOpacity style={[styles.iconRowItem, styles.rowItemBordered]}>
                              <Ionicons name="checkmark-circle-outline" size={20} color="#d946ef" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>REVIEW</Text>
                           </TouchableOpacity>

                           <Text style={[styles.metaLabel, {marginTop: Spacing.md}]}>Closed</Text>
                           <TouchableOpacity style={styles.iconRowItem}>
                              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" style={{marginRight: 12}} />
                              <Text style={styles.metaValue}>COMPLETE</Text>
                           </TouchableOpacity>
                        </ScrollView>
                     </View>
                  </View>
               )}

               {/* ---------------- ASSIGNEE SHEET ---------------- */}
               {activeSheet === 'assignee' && (
                  <View>
                     <View style={styles.subSheetHeader}>
                        <View style={{width: 32}} />
                        <Text style={styles.headerTitle}>Assignees</Text>
                        <TouchableOpacity style={styles.modalIconBtn} onPress={() => setActiveSheet(null)}>
                           <Ionicons name="close" size={20} color={AppColors.textMuted} />
                        </TouchableOpacity>
                     </View>
                     <View style={styles.subSheetBody}>
                        <View style={styles.searchBar}>
                           <Ionicons name="search" size={16} color={AppColors.textMuted} />
                           <TextInput placeholder="Search people and teams..." placeholderTextColor={AppColors.textMuted} style={styles.searchInput} />
                        </View>
                        <View style={styles.chipRow}>
                           <View style={styles.activeChip}>
                              <View style={[styles.avatarCircle, { width: 16, height: 16, borderRadius: 8, marginRight: 6 }]}>
                                 <Text style={[styles.avatarText, { fontSize: 8 }]}>OM</Text>
                              </View>
                              <Text style={[styles.metaValue, { fontSize: 13, marginRight: 6 }]}>Omar mohsen</Text>
                              <Ionicons name="close" size={12} color={AppColors.textMuted} />
                           </View>
                        </View>
                     </View>
                  </View>
               )}

               {/* ---------------- ATTACHMENT SHEET ---------------- */}
               {activeSheet === 'attachment' && (
                  <View>
                     <View style={styles.subSheetHeaderContainerLess}>
                        <TouchableOpacity onPress={() => setActiveSheet(null)} style={{alignSelf: 'flex-end', paddingBottom: Spacing.md}}>
                           <Text style={[styles.createText, { color: '#8b5cf6' }]}>Done</Text>
                        </TouchableOpacity>
                     </View>
                     <View style={styles.subSheetBody}>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="camera-outline" size={20} color={AppColors.white} style={{marginRight: 16}} />
                           <Text style={styles.metaValue}>Take photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="image-outline" size={20} color={AppColors.white} style={{marginRight: 16}} />
                           <Text style={styles.metaValue}>Select image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="folder-outline" size={20} color={AppColors.white} style={{marginRight: 16}} />
                           <Text style={styles.metaValue}>Upload file</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconRowItem}>
                           <Ionicons name="videocam-outline" size={20} color={AppColors.white} style={{marginRight: 16}} />
                           <Text style={styles.metaValue}>Add video</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               )}
            </View>
         </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: Spacing.sm,
  },
  headerAppIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerAppIconInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
  },
  
  // Kanban Styles
  kanbanScroll: {
    padding: Spacing.md,
    paddingRight: Spacing.xl,
  },
  kanbanColumn: {
    width: SCREEN_WIDTH * 0.85,
    marginRight: Spacing.md,
  },
  colHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  colHeaderBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  colHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  colHeaderActions: {
    flexDirection: 'row',
  },
  colBtn: {
    paddingHorizontal: Spacing.sm,
  },
  kanbanList: {
    flex: 1,
  },
  taskCardItem: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  taskCardText: {
    color: AppColors.white,
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: BorderRadius.md,
  },
  addTaskText: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },

  // List Styles
  listScroll: {
    paddingBottom: 100,
  },
  listTopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headerAppIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerAppIconInnerSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  listTopTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  listSection: {
    marginBottom: Spacing.sm,
  },
  listSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  listColBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 4,
  },
  listColBadgeText: {
    color: AppColors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listTaskCount: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginLeft: Spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listRowText: {
    color: AppColors.white,
    fontSize: 15,
    marginLeft: Spacing.md,
  },
  listRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: AppColors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  addTaskTextList: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },

  // Shared
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  
  // Custom Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161618',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalContextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContextText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modalHeaderRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleInput: {
    color: AppColors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  modalDescInput: {
    color: AppColors.textMuted,
    fontSize: 15,
    marginBottom: Spacing.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  metaIconWrap: {
    width: 40,
    alignItems: 'flex-start',
  },
  metaLabel: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    color: AppColors.white,
    fontSize: 15,
  },
  modalActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  actionPillText: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  createTaskBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  createTaskBtnActive: {
    backgroundColor: AppColors.accent,
  },
  createTaskBtnText: {
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '700',
    fontSize: 14,
  },
  createText: {
    color: AppColors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  
  // Dynamic Sub-Sheets Models
  subSheetContent: {
    paddingBottom: Spacing.xxl + 40,
    backgroundColor: '#0a0a0c', // Darker to contrast
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  subSheetHeaderContainerLess: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  subSheetBody: {
    paddingBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    color: AppColors.white,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  iconRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rowItemBordered: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
  },
  clearBtnText: {
    color: AppColors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  coloredTagRow: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    marginBottom: Spacing.sm,
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)', // Purple tint
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  }
});
