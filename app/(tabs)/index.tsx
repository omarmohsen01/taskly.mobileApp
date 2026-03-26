import { currentUser, folders, labels, lists, myTaskTabs, spaces, taskProgress, tasks, users, workspaces } from '@/constants/dummyData';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0]?.id);
  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<number, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});

  const toggleSpace = (id: number) =>
    setExpandedSpaces(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFolder = (id: number) =>
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const todayTasks = tasks.filter(t => t.board_column_id !== 3);
  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspaceId) || workspaces[0];

  const handleSelectWorkspace = (id: number) => {
    setSelectedWorkspaceId(id);
    setShowWorkspaceModal(false);
  };

  const handleCreateWorkspace = () => {
    setShowWorkspaceModal(false);
    router.push('/packages');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Workspace Selector Bar */}
        <TouchableOpacity
          style={styles.workspaceBar}
          activeOpacity={0.7}
          onPress={() => setShowWorkspaceModal(true)}
        >
          <View style={styles.workspaceLeft}>
            <View style={styles.workspaceIcon}>
              <Text style={styles.workspaceIconText}>
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.workspaceName} numberOfLines={1}>
              {currentWorkspace.name}
            </Text>
            <Ionicons name="chevron-down" size={16} color={AppColors.textMuted} />
          </View>
          <View style={styles.workspaceRight}>
            <TouchableOpacity style={styles.workspaceAction}>
              <Ionicons name="notifications-outline" size={18} color={AppColors.textMuted} />
            </TouchableOpacity>
            <Image
              source={{ uri: currentUser.avatar }}
              style={styles.workspaceAvatar}
            />
          </View>
        </TouchableOpacity>

        {/* Notification Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notifCardsRow}
        >
          <TouchableOpacity style={styles.notifCard} activeOpacity={0.7}>
            <Ionicons name="arrow-undo-outline" size={20} color={AppColors.white} />
            <Text style={styles.notifCardTitle}>Replies</Text>
            <Text style={styles.notifCardSub}>0 new</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifCard} activeOpacity={0.7}>
            <Ionicons name="checkbox-outline" size={20} color={AppColors.white} />
            <Text style={styles.notifCardTitle}>Assigned</Text>
            <Text style={styles.notifCardSub}>0 comments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifCard} activeOpacity={0.7}>
            <Ionicons name="at-outline" size={20} color={AppColors.white} />
            <Text style={styles.notifCardTitle}>Activity</Text>
            <Text style={styles.notifCardSub}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notifCard} activeOpacity={0.7}>
            <Ionicons name="mail-outline" size={20} color={AppColors.white} />
            <Text style={styles.notifCardTitle}>Inbox</Text>
            <Text style={styles.notifCardSub}>0 unread</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Spaces Section */}
        <View style={styles.spacesSection}>
          <TouchableOpacity
            style={styles.spacesHeader}
            activeOpacity={0.7}
            onPress={() => setSpacesExpanded(!spacesExpanded)}
          >
            <Text style={styles.spacesTitle}>Spaces</Text>
            <View style={styles.spacesHeaderRight}>
              <TouchableOpacity
                style={styles.spacesAddBtn}
                activeOpacity={0.7}
                onPress={() => router.push('/create-space')}
              >
                <Ionicons name="add" size={18} color={AppColors.textMuted} />
              </TouchableOpacity>
              <Ionicons
                name={spacesExpanded ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color={AppColors.textMuted}
              />
            </View>
          </TouchableOpacity>

          {spacesExpanded && (
            <View style={styles.spacesListContainer}>
              {/* All Tasks */}
              <TouchableOpacity style={styles.spacesItem} activeOpacity={0.7}>
                <View style={styles.spacesItemLeft}>
                  <View style={styles.spacesItemIconWrap}>
                    <Ionicons name="grid-outline" size={16} color={AppColors.textMuted} />
                  </View>
                  <Text style={styles.spacesItemText}>
                    All Tasks <Text style={styles.spacesItemSub}>- #{currentWorkspace.name}</Text>
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Shared with me */}
              <TouchableOpacity style={styles.spacesItem} activeOpacity={0.7}>
                <View style={styles.spacesItemLeft}>
                  <View style={styles.spacesItemIconWrap}>
                    <Ionicons name="share-social-outline" size={16} color={AppColors.textMuted} />
                  </View>
                  <Text style={styles.spacesItemText}>Shared with me</Text>
                </View>
              </TouchableOpacity>

              {/* Dynamic Spaces */}
              {spaces
                .filter(s => s.workspace_id === selectedWorkspaceId)
                .map((space) => {
                  const isSpaceOpen = !!expandedSpaces[space.id];
                  const spaceFolders = folders.filter(f => f.space_id === space.id);
                  const spaceLists = lists.filter(l => l.space_id === space.id && l.folder_id === null);

                  return (
                    <View key={space.id}>
                      {/* Space Row */}
                      <TouchableOpacity
                        style={styles.spacesItem}
                        activeOpacity={0.7}
                        onPress={() => toggleSpace(space.id)}
                      >
                        <View style={styles.spacesItemLeft}>
                          <View style={[styles.spacesItemBadge, { backgroundColor: space.color || AppColors.textMuted }]}>
                            <Text style={styles.spacesItemBadgeText}>
                              {space.name.charAt(0).toLowerCase()}
                            </Text>
                          </View>
                          <Text style={styles.spacesItemText}>{space.name}</Text>
                        </View>
                        <View style={styles.spaceActions}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.push({ pathname: '/create-folder', params: { spaceId: space.id, spaceName: space.name } })}
                          >
                            <Ionicons name="add" size={18} color={AppColors.textMuted} />
                          </TouchableOpacity>
                          <Ionicons name="expand-outline" size={16} color={AppColors.textMuted} />
                          <Ionicons
                            name={isSpaceOpen ? 'chevron-down' : 'chevron-forward'}
                            size={16}
                            color={AppColors.textMuted}
                          />
                        </View>
                      </TouchableOpacity>

                      {/* Space Children */}
                      {isSpaceOpen && (
                        <View style={styles.nestedContainer}>
                          {/* Folders */}
                          {spaceFolders.map(folder => {
                            const isFolderOpen = !!expandedFolders[folder.id];
                            const folderLists = lists.filter(l => l.folder_id === folder.id);

                            return (
                              <View key={`f-${folder.id}`}>
                                {/* Folder Row */}
                                <TouchableOpacity
                                  style={styles.folderItem}
                                  activeOpacity={0.7}
                                  onPress={() => toggleFolder(folder.id)}
                                >
                                  <View style={styles.spacesItemLeft}>
                                    <Ionicons name="folder-outline" size={18} color={AppColors.textMuted} />
                                    <Text style={styles.folderText}>{folder.name}</Text>
                                  </View>
                                  <View style={styles.spaceActions}>
                                    <TouchableOpacity activeOpacity={0.7}>
                                      <Ionicons name="add" size={16} color={AppColors.textMuted} />
                                    </TouchableOpacity>
                                    <Ionicons name="expand-outline" size={14} color={AppColors.textMuted} />
                                    <Ionicons
                                      name={isFolderOpen ? 'chevron-down' : 'chevron-forward'}
                                      size={14}
                                      color={AppColors.textMuted}
                                    />
                                  </View>
                                </TouchableOpacity>

                                {/* Folder Lists */}
                                {isFolderOpen && folderLists.map(list => (
                                  <TouchableOpacity
                                    key={`fl-${list.id}`}
                                    style={styles.listItem}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="list-outline" size={16} color={AppColors.textMuted} />
                                    <Text style={styles.listText}>{list.name}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            );
                          })}

                          {/* Space-level Lists */}
                          {spaceLists.map(list => (
                            <TouchableOpacity
                              key={`sl-${list.id}`}
                              style={styles.spaceListItem}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="list-outline" size={16} color={AppColors.textMuted} />
                              <Text style={styles.listText}>{list.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
            </View>
          )}
        </View>

        {/* Daily Productivity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Productivity</Text>
          <Text style={styles.sectionDate}>Wednesday, May 15</Text>
        </View>

        {/* Priority Task Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Priority Task Progress</Text>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color={AppColors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBody}>
            <Text style={styles.progressSubtitle}>
              {taskProgress.completed}/{taskProgress.total} is Completed
            </Text>
            <View style={styles.progressBarRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${taskProgress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>{taskProgress.percentage.toFixed(2)}%</Text>
            </View>
          </View>
        </View>

        {/* My Task Section */}
        <View style={styles.myTaskSection}>
          <Text style={styles.myTaskTitle}>My Task</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {myTaskTabs.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === index && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab(index)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === index && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Today's Task */}
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today's Task</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {todayTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              activeOpacity={0.7}
              onPress={() => router.push('/task-details')}
            >
              {/* Labels */}
              <View style={styles.labelRow}>
                {task.labels.map((labelId) => {
                  const label = labels.find(l => l.id === labelId);
                  if (!label) return null;
                  return (
                    <View key={label.id} style={styles.labelChip}>
                      <Text style={styles.labelText}>{label.name}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Task Title */}
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>{task.descriptions}</Text>

              {/* Assignees + Edit */}
              <View style={styles.taskFooter}>
                <View style={styles.assigneeRow}>
                  {task.assignees.slice(0, 3).map((userId, idx) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <Image
                        key={userId}
                        source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }}
                        style={[styles.assigneeAvatar, idx > 0 && { marginLeft: -10 }]}
                      />
                    );
                  })}
                  {task.assignees.length > 3 && (
                    <View style={[styles.assigneeMore, { marginLeft: -10 }]}>
                      <Text style={styles.assigneeMoreText}>+{task.assignees.length - 3}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={[styles.addAssignee, { marginLeft: -10 }]}>
                    <Ionicons name="add" size={14} color={AppColors.accent} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={18} color={AppColors.accent} />
                </TouchableOpacity>
              </View>

              {/* Task Metadata */}
              <View style={styles.taskMeta}>
                <Text style={styles.metaText}>{task.projectName}</Text>
                <Text style={styles.metaText}>Prototype</Text>
                <Text style={styles.metaText}>15 Sept</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Workspace Selector Modal */}
      <Modal
        visible={showWorkspaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWorkspaceModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowWorkspaceModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalSheet}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Workspaces</Text>
                  <TouchableOpacity
                    onPress={() => setShowWorkspaceModal(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={22} color={AppColors.white} />
                  </TouchableOpacity>
                </View>

                {/* Workspace List */}
                <View style={styles.workspaceList}>
                  {workspaces.map((ws) => (
                    <TouchableOpacity
                      key={ws.id}
                      style={styles.workspaceItem}
                      activeOpacity={0.7}
                      onPress={() => handleSelectWorkspace(ws.id)}
                    >
                      <View style={styles.workspaceItemLeft}>
                        <View style={[
                          styles.workspaceItemIcon,
                          { backgroundColor: ws.id === selectedWorkspaceId ? AppColors.accent : AppColors.textMuted },
                        ]}>
                          <Text style={styles.workspaceItemIconText}>
                            {ws.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.workspaceItemInfo}>
                          <Text style={[
                            styles.workspaceItemName,
                            ws.id === selectedWorkspaceId && styles.workspaceItemNameActive,
                          ]}>
                            {ws.name}
                          </Text>
                          <Text style={styles.workspaceItemMeta}>
                            {ws.members} {ws.members === 1 ? 'member' : 'members'} • {ws.role}
                          </Text>
                        </View>
                      </View>
                      {ws.id === selectedWorkspaceId && (
                        <Ionicons name="checkmark" size={24} color={AppColors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Create Workspace Button */}
                <TouchableOpacity
                  style={styles.createWorkspaceBtn}
                  activeOpacity={0.8}
                  onPress={handleCreateWorkspace}
                >
                  <Ionicons name="add" size={22} color={AppColors.white} />
                  <Text style={styles.createWorkspaceBtnText}>Create Workspace</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingTop: 50,
  },
  // Workspace Bar
  workspaceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  workspaceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  workspaceIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceIconText: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  workspaceName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  workspaceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  workspaceAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  workspaceAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: AppColors.success,
  },
  // Header
  notifCardsRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  notifCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    minWidth: 130,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: Spacing.xs,
  },
  notifCardTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  notifCardSub: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  // Spaces Section
  spacesSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  spacesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  spacesTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  spacesHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  spacesAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacesListContainer: {
    marginTop: Spacing.xs,
  },
  spacesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  spacesItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  spacesItemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacesItemBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacesItemBadgeText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  spacesItemText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  spacesItemSub: {
    color: AppColors.textMuted,
    fontWeight: '400',
  },
  spaceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nestedContainer: {
    paddingLeft: Spacing.xl,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.md,
  },
  folderText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.xxxl + Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: AppColors.border,
    marginLeft: Spacing.lg,
  },
  spaceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    gap: Spacing.sm,
  },
  listText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  // Daily Productivity
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionDate: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  // Progress Card
  progressCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  progressBody: {},
  progressSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBarBg: {
    flex: 1,
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
  progressPercent: {
    color: AppColors.white,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 55,
    textAlign: 'right',
  },
  // My Task
  myTaskSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  myTaskTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  tabsContainer: {
    gap: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.cardBackground,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  tabButtonActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  tabText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: AppColors.background,
  },
  // Today's Task
  todaySection: {
    paddingHorizontal: Spacing.xl,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  todayTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  // Task Card
  taskCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  labelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  labelChip: {
    backgroundColor: 'rgba(170,202,239,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  labelText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  taskTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskDesc: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    backgroundColor: AppColors.border,
  },
  assigneeMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.border,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeMoreText: {
    color: AppColors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  addAssignee: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(170,202,239,0.15)',
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(170,202,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metaText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  // Workspace Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceList: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  workspaceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  workspaceItemIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceItemIconText: {
    color: AppColors.background,
    fontSize: 18,
    fontWeight: '800',
  },
  workspaceItemInfo: {
    flex: 1,
  },
  workspaceItemName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  workspaceItemNameActive: {
    color: AppColors.white,
  },
  workspaceItemMeta: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  createWorkspaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    paddingVertical: 16,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
  },
  createWorkspaceBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
