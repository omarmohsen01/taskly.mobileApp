import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { createProject, fetchWorkspaces, fetchRoles } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreateProjectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ spaceId: string, spaceName: string, workspaceId: string }>();
  const { spaceId, spaceName, workspaceId } = params;

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('1'); // Default status
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accessMode, setAccessMode] = useState<'inherit' | 'restricted'>('inherit');
  
  const [spaceMembers, setSpaceMembers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, number>>({});
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [activeRoleUserId, setActiveRoleUserId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceId && spaceId) {
      loadData();
    }
  }, [workspaceId, spaceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wsResp, rolesResp] = await Promise.all([fetchWorkspaces(), fetchRoles()]);
      const workspaces = wsResp?.data || wsResp?.workspaces || (Array.isArray(wsResp) ? wsResp : []);
      const currentWs = workspaces.find((w: any) => String(w.id) === String(workspaceId));
      
      const loadedRoles = rolesResp?.data || rolesResp || [];
      setRoles(loadedRoles);

      const members = currentWs?.members || [];
      setSpaceMembers(members);

      // Initialize default role
      const defaultRoleId = loadedRoles.length > 0 ? loadedRoles[0].id : 1;
      const initialRoles: Record<number, number> = {};
      members.forEach((m: any) => {
        initialRoles[m.id] = defaultRoleId;
      });
      setUserRoles(initialRoles);

      if (accessMode === 'inherit') {
        setSelectedUserIds(members.map((m: any) => m.id));
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessMode === 'inherit') {
      setSelectedUserIds(spaceMembers.map((m: any) => m.id));
    }
  }, [accessMode, spaceMembers]);

  const toggleUser = (userId: number) => {
    if (accessMode === 'inherit') return; // Disabled in inherit mode
    
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!projectName.trim() || !spaceId) return;

    setIsSubmitting(true);
    try {
      await createProject({
        space_id: spaceId,
        name: projectName,
        description: description,
        status: status,
        start_date: startDate,
        end_date: endDate,
        access_mode: accessMode,
        users: selectedUserIds.map(id => ({ user_id: id, role_id: userRoles[id] || 1 }))
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Project created successfully!',
      });
      router.back();
    } catch (e: any) {
      console.error('Create project error:', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e.message || 'Failed to create project',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Project</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isSubmitting || !projectName.trim()}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={AppColors.accent} />
          ) : (
            <Text style={[styles.createText, !projectName.trim() && styles.createTextDisabled]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Project Name */}
        <Text style={styles.sectionLabel}>Project name</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Enter Project name"
            placeholderTextColor={AppColors.textMuted}
            value={projectName}
            onChangeText={setProjectName}
          />
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Project description"
            placeholderTextColor={AppColors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Space Context */}
        <Text style={styles.sectionLabel}>Space</Text>
        <View style={styles.infoCard}>
           <Ionicons name="planet-outline" size={18} color={AppColors.accent} />
           <Text style={styles.infoText}>{spaceName || 'Selected Space'}</Text>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Start Date</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={AppColors.textMuted}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
          </View>
          <View style={{ width: Spacing.lg }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>End Date</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={AppColors.textMuted}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </View>

        {/* Access Mode */}
        <Text style={styles.sectionLabel}>Access Mode</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioOption, accessMode === 'inherit' && styles.radioOptionActive]}
            onPress={() => setAccessMode('inherit')}
          >
            <Ionicons 
              name={accessMode === 'inherit' ? 'radio-button-on' : 'radio-button-off'} 
              size={18} 
              color={accessMode === 'inherit' ? AppColors.accent : AppColors.textMuted} 
            />
            <View>
              <Text style={styles.radioLabel}>Inherit from Space</Text>
              <Text style={styles.radioSub}>Auto-assigns all space members</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.radioOption, accessMode === 'restricted' && styles.radioOptionActive]}
            onPress={() => setAccessMode('restricted')}
          >
            <Ionicons 
              name={accessMode === 'restricted' ? 'radio-button-on' : 'radio-button-off'} 
              size={18} 
              color={accessMode === 'restricted' ? AppColors.accent : AppColors.textMuted} 
            />
            <View>
              <Text style={styles.radioLabel}>Restricted</Text>
              <Text style={styles.radioSub}>Manually select members</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Members */}
        <Text style={styles.sectionLabel}>Project Members</Text>
        {isLoading ? (
          <ActivityIndicator color={AppColors.accent} style={{ marginVertical: 20 }} />
        ) : spaceMembers.length === 0 ? (
          <Text style={styles.emptyText}>No users found in this space.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
            {spaceMembers.map((member) => {
              const isSelected = selectedUserIds.includes(member.id);
              const isDisabled = accessMode === 'inherit';
              
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberCard, 
                    isSelected && styles.memberCardSelected,
                    isDisabled && { opacity: 0.8 }
                  ]}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  onPress={() => toggleUser(member.id)}
                >
                  <View style={[styles.memberAvatarWrap, isDisabled && { backgroundColor: AppColors.border }]}>
                    <Text style={styles.memberAvatarText}>
                      {(member.first_name?.[0] || member.name?.[0] || '?').toUpperCase()}
                    </Text>
                    {isSelected && (
                      <View style={[styles.memberCheckBadge, isDisabled && { backgroundColor: AppColors.textMuted }]}>
                        <Ionicons name="checkmark" size={10} color={AppColors.white} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.memberName, isSelected && styles.memberNameSelected]} numberOfLines={1}>
                    {member.first_name || member.name}
                  </Text>

                  {isSelected && (
                    <TouchableOpacity
                      style={styles.selectedRoleBadge}
                      disabled={isDisabled}
                      onPress={() => {
                        if (!isDisabled) {
                          setActiveRoleUserId(member.id);
                          setRoleModalVisible(true);
                        }
                      }}
                    >
                      <Text style={styles.selectedRoleText} numberOfLines={1}>
                        {roles.find(r => r.id === userRoles[member.id])?.name || 'Role'}
                      </Text>
                      {!isDisabled && (
                        <Ionicons name="chevron-down" size={10} color={AppColors.accent} style={{marginLeft: 2}}/>
                      )}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Role Picker Modal */}
      <Modal visible={roleModalVisible} transparent animationType="fade" onRequestClose={() => setRoleModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setRoleModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.roleModalSheet}>
                <Text style={styles.modalTitle}>Select Role</Text>
                {roles.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.roleOption}
                    onPress={() => {
                      if (activeRoleUserId !== null) {
                        setUserRoles(prev => ({ ...prev, [activeRoleUserId]: r.id }));
                      }
                      setRoleModalVisible(false);
                    }}
                  >
                    <Ionicons 
                      name={userRoles[activeRoleUserId!] === r.id ? 'radio-button-on' : 'radio-button-off'} 
                      size={20} 
                      color={AppColors.accent} 
                    />
                    <Text style={styles.roleOptionText}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
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
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    color: AppColors.textMuted,
    fontSize: 16,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  createText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  createTextDisabled: {
    opacity: 0.4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: AppColors.accent,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  inputWrap: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: {
    color: AppColors.white,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: AppColors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  infoText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  radioGroup: {
    gap: Spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: AppColors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  radioOptionActive: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.border,
  },
  radioLabel: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  radioSub: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  membersRow: {
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  memberCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: Spacing.md,
    alignItems: 'center',
    width: 80,
    gap: Spacing.xs,
  },
  memberCardSelected: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.border,
  },
  memberAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memberAvatarText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  memberCheckBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AppColors.accent,
    borderWidth: 2,
    borderColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  memberNameSelected: {
    color: AppColors.white,
    fontWeight: '700',
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  selectedRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  selectedRoleText: {
    color: AppColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  roleModalSheet: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: 400,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  roleOptionText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '500',
  }
});
