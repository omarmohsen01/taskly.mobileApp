import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { searchUsers, sendInvitations, fetchSpaces } from '@/lib/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

interface Space {
  id: number;
  name: string;
  projects?: { id: number; name: string }[];
}

interface ShareWorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  workspaceId: number;
  workspaceName: string;
}

export default function ShareWorkspaceModal({
  visible,
  onClose,
  workspaceId,
  workspaceName,
}: ShareWorkspaceModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (visible && workspaceId) {
      loadSpaces();
    }
  }, [visible, workspaceId]);

  const loadSpaces = async () => {
    setIsLoadingSpaces(true);
    try {
      const resp = await fetchSpaces(workspaceId);
      setSpaces(resp?.data || resp?.spaces || []);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(text);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const toggleSpaceSelection = (spaceId: number) => {
    if (selectedSpaces.includes(spaceId)) {
      setSelectedSpaces(selectedSpaces.filter((id) => id !== spaceId));
      // Also deselect projects in this space
      const space = spaces.find(s => s.id === spaceId);
      if (space?.projects) {
        const projectIds = space.projects.map(p => p.id);
        setSelectedProjects(selectedProjects.filter(id => !projectIds.includes(id)));
      }
    } else {
      setSelectedSpaces([...selectedSpaces, spaceId]);
    }
  };

  const toggleProjectSelection = (projectId: number, spaceId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
      // Also select the space if not selected
      if (!selectedSpaces.includes(spaceId)) {
        setSelectedSpaces([...selectedSpaces, spaceId]);
      }
    }
  };

  const handleSendInvite = async () => {
    if (selectedUsers.length === 0) return;

    setIsSending(true);
    try {
      await sendInvitations({
        workspace_id: workspaceId,
        user_ids: selectedUsers.map((u) => u.id),
        space_ids: selectedSpaces,
        project_ids: selectedProjects,
      });
      alert('Invitations sent successfully!');
      onClose();
      // Reset state
      setSelectedUsers([]);
      setSelectedSpaces([]);
      setSelectedProjects([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Share Workspace</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={AppColors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                <Text style={styles.sectionTitle}>Invite Users</Text>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    placeholderTextColor={AppColors.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {isSearching && <ActivityIndicator size="small" color={AppColors.accent} />}
                </View>

                {searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={styles.userItem}
                        onPress={() => toggleUserSelection(user)}
                      >
                        <Image
                          source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}` }}
                          style={styles.userAvatar}
                        />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                          <Text style={styles.userEmail}>{user.email}</Text>
                        </View>
                        <Ionicons
                          name={selectedUsers.find(u => u.id === user.id) ? "checkbox" : "square-outline"}
                          size={24}
                          color={selectedUsers.find(u => u.id === user.id) ? AppColors.accent : AppColors.textMuted}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedUsers.length > 0 && (
                  <View style={styles.selectedUsersRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedUsers.map((user) => (
                        <View key={user.id} style={styles.selectedUserChip}>
                          <Text style={styles.selectedUserText}>{user.first_name}</Text>
                          <TouchableOpacity onPress={() => toggleUserSelection(user)}>
                            <Ionicons name="close-circle" size={16} color={AppColors.white} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Select Spaces & Projects</Text>
                {isLoadingSpaces ? (
                  <ActivityIndicator color={AppColors.accent} />
                ) : (
                  <View style={styles.spacesContainer}>
                    {spaces.map((space) => (
                      <View key={space.id} style={styles.spaceWrapper}>
                        <TouchableOpacity
                          style={styles.spaceItem}
                          onPress={() => toggleSpaceSelection(space.id)}
                        >
                          <Ionicons
                            name={selectedSpaces.includes(space.id) ? "checkbox" : "square-outline"}
                            size={20}
                            color={selectedSpaces.includes(space.id) ? AppColors.accent : AppColors.textMuted}
                          />
                          <Text style={styles.spaceName}>{space.name}</Text>
                        </TouchableOpacity>
                        
                        {space.projects && space.projects.length > 0 && (
                          <View style={styles.projectsList}>
                            {space.projects.map((project) => (
                              <TouchableOpacity
                                key={project.id}
                                style={styles.projectItem}
                                onPress={() => toggleProjectSelection(project.id, space.id)}
                              >
                                <Ionicons
                                  name={selectedProjects.includes(project.id) ? "checkbox" : "square-outline"}
                                  size={18}
                                  color={selectedProjects.includes(project.id) ? AppColors.accent : AppColors.textMuted}
                                />
                                <Text style={styles.projectName}>{project.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.sendBtn, selectedUsers.length === 0 && styles.disabledBtn]}
                  disabled={selectedUsers.length === 0 || isSending}
                  onPress={handleSendInvite}
                >
                  {isSending ? (
                    <ActivityIndicator color={AppColors.background} />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color={AppColors.background} />
                      <Text style={styles.sendBtnText}>Send Invitations</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: AppColors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    height: SCREEN_HEIGHT * 0.8,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  searchResults: {
    maxHeight: 200,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  selectedUsersRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accent + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  selectedUserText: {
    color: AppColors.white,
    fontSize: 13,
  },
  spacesContainer: {
    gap: Spacing.md,
  },
  spaceWrapper: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  spaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spaceName: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  projectsList: {
    marginTop: Spacing.md,
    paddingLeft: Spacing.xl,
    gap: Spacing.sm,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  projectName: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  sendBtn: {
    backgroundColor: AppColors.accent,
    height: 54,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: AppColors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
