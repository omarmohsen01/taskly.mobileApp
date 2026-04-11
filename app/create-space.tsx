import { spaceColors, statusTemplates } from '@/constants/dummyData';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { createSpace, fetchWorkspaces, fetchProfile } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateSpaceScreen() {
  const router = useRouter();
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  
  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'workspace' | 'private'>('workspace');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedStatusTemplate, setSelectedStatusTemplate] = useState('Space Statuses');

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      loadMembers();
    }
  }, [workspaceId]);

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const [wsResp, profResp] = await Promise.all([fetchWorkspaces(), fetchProfile()]);
      
      const workspaces = wsResp?.data ?? wsResp?.workspaces ?? (Array.isArray(wsResp) ? wsResp : []);
      const currentWs = workspaces.find((w: any) => String(w.id) === String(workspaceId));
      const allMembers = currentWs?.members ?? [];
      
      const authUser = profResp?.data ?? profResp ?? {};
      const authUserId = authUser.id;

      // Filter out the authenticated user
      const otherMembers = allMembers.filter((m: any) => String(m.id) !== String(authUserId));
      setMembers(otherMembers);
    } catch (e) {
      console.error('Failed to load members:', e);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!spaceName.trim() || !workspaceId) return;
    
    setIsSubmitting(true);
    try {
      await createSpace({
        workspace_id: workspaceId,
        name: spaceName,
        description: description,
        users: selectedUserIds
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Space created successfully!',
      });
      router.back();
    } catch (e: any) {
      console.error('Create space error:', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: e.message || 'Failed to create space',
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
        <Text style={styles.headerTitle}>Create Space</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isSubmitting || !spaceName.trim()}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={AppColors.accent} />
          ) : (
            <Text style={[styles.createText, !spaceName.trim() && styles.createTextDisabled]}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Space name */}
        <Text style={styles.sectionLabel}>Space name</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Enter Space name"
            placeholderTextColor={AppColors.textMuted}
            value={spaceName}
            onChangeText={setSpaceName}
          />
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Space description"
            placeholderTextColor={AppColors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.privacyRow}>
          <TouchableOpacity
            style={[styles.privacyOption, privacy === 'workspace' && styles.privacyOptionActive]}
            activeOpacity={0.7}
            onPress={() => setPrivacy('workspace')}
          >
            <Ionicons name="people-outline" size={18} color={privacy === 'workspace' ? AppColors.white : AppColors.textMuted} />
            <Text style={[styles.privacyText, privacy === 'workspace' && styles.privacyTextActive]}>Workspace</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.privacyOption, privacy === 'private' && styles.privacyOptionActive]}
            activeOpacity={0.7}
            onPress={() => setPrivacy('private')}
          >
            <Ionicons name="lock-closed-outline" size={18} color={privacy === 'private' ? AppColors.white : AppColors.textMuted} />
            <Text style={[styles.privacyText, privacy === 'private' && styles.privacyTextActive]}>Private</Text>
          </TouchableOpacity>
        </View>

        {/* Members */}
        <Text style={styles.sectionLabel}>Add Members</Text>
        {isLoadingMembers ? (
          <ActivityIndicator color={AppColors.accent} style={{ marginVertical: 10 }} />
        ) : members.length === 0 ? (
          <Text style={{ color: AppColors.textMuted, fontSize: 13, marginLeft: 5 }}>No other members in this workspace</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersRow}>
            {members.map((member) => {
              const isSelected = selectedUserIds.includes(member.id);
              return (
                <TouchableOpacity
                  key={member.id}
                  style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => toggleUser(member.id)}
                >
                  <View style={styles.memberAvatarWrap}>
                    <Text style={styles.memberAvatarText}>
                      {(member.first_name?.[0] || member.name?.[0] || '?').toUpperCase()}
                    </Text>
                    {isSelected && (
                      <View style={styles.memberCheckBadge}>
                        <Ionicons name="checkmark" size={10} color={AppColors.white} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.memberName, isSelected && styles.memberNameSelected]} numberOfLines={1}>
                    {member.first_name || member.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Space settings */}
        <Text style={styles.sectionLabel}>Space settings</Text>
        <View style={styles.settingsCard}>
          {/* Statuses */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setShowStatusModal(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="copy-outline" size={18} color={AppColors.textMuted} />
            </View>
            <Text style={styles.settingLabel}>Statuses</Text>
            <View style={styles.settingValueRow}>
              <View style={[styles.statusDot, { backgroundColor: AppColors.textMuted }]} />
              <View style={[styles.statusDot, { backgroundColor: AppColors.success }]} />
            </View>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* Color */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setShowColorPicker(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="brush-outline" size={18} color={AppColors.textMuted} />
            </View>
            <Text style={styles.settingLabel}>Color</Text>
            {selectedColor ? (
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
            ) : (
              <Ionicons name="add" size={18} color={AppColors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="slide" onRequestClose={() => setShowStatusModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Statuses</Text>
                  <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.modalSearch}>
                  <Ionicons name="search" size={18} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Search"
                    placeholderTextColor={AppColors.textMuted}
                  />
                </View>

                <View style={styles.modalDivider} />

                <ScrollView>
                  {/* Default Statuses */}
                  <Text style={styles.statusSectionLabel}>Default Statuses</Text>
                  <View style={styles.statusDivider} />

                  <TouchableOpacity style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />
                    <Text style={styles.statusRowText}>
                      Space Statuses <Text style={styles.statusRowSub}>(space 1)</Text>
                    </Text>
                    <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <View style={styles.statusDivider} />

                  <TouchableOpacity style={styles.statusRow}>
                    <Text style={styles.statusRowText}>Custom Statuses</Text>
                    <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <View style={styles.statusDivider} />

                  {/* Templates */}
                  <View style={styles.templateHeader}>
                    <Text style={styles.statusSectionLabel}>Templates ({statusTemplates.length})</Text>
                    <TouchableOpacity>
                      <Ionicons name="add" size={20} color={AppColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statusDivider} />

                  {statusTemplates.map(t => (
                    <View key={t.id}>
                      <TouchableOpacity style={styles.statusRow}>
                        <Text style={styles.statusRowText}>{t.name}</Text>
                        <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                      </TouchableOpacity>
                      <View style={styles.statusDivider} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Color Picker Modal */}
      <Modal visible={showColorPicker} transparent animationType="slide" onRequestClose={() => setShowColorPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowColorPicker(false)}>
          <View style={styles.colorModalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.colorModalSheet}>
                <View style={styles.colorModalHeader}>
                  <Text style={styles.colorModalTitle}>Pick a color</Text>
                  <TouchableOpacity onPress={() => setShowColorPicker(false)}>
                    <Text style={styles.modalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.colorGrid}>
                  {spaceColors.map((color, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.colorCircle,
                        color ? { backgroundColor: color } : styles.colorCircleNone,
                        selectedColor === color && styles.colorCircleSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => { setSelectedColor(color); setShowColorPicker(false); }}
                    >
                      {!color && <Ionicons name="ban-outline" size={22} color={AppColors.textMuted} />}
                    </TouchableOpacity>
                  ))}
                </View>
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
  // Privacy
  privacyRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  privacyOptionActive: {
    backgroundColor: AppColors.border,
  },
  privacyText: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  privacyTextActive: {
    color: AppColors.white,
  },
  // Settings card
  settingsCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  settingValueRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  settingDivider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: Spacing.lg + 36 + Spacing.md,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  // Status Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  modalSheet: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  modalDone: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalSearchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 15,
  },
  modalDivider: {
    height: 1,
    backgroundColor: AppColors.accent,
    marginBottom: Spacing.lg,
  },
  statusSectionLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  statusDivider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: Spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statusRowText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusRowSub: {
    color: AppColors.textMuted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: Spacing.xl,
  },
  // Color Picker Modal
  colorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  colorModalSheet: {
    backgroundColor: AppColors.cardBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  colorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  colorModalTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleNone: {
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: AppColors.white,
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
});
