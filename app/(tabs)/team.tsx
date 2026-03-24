import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { teams, users, roles } from '@/constants/dummyData';

export default function TeamScreen() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number>(2); // Default to Editor

  const team = teams[0];
  const teamMembers = users.filter(u => team.members.includes(u.id));
  const contacts = users.filter(u => !team.members.includes(u.id));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Team Management</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={AppColors.white} />
          </TouchableOpacity>
        </View>

        {/* Team Card */}
        <View style={styles.teamCard}>
          <View style={styles.teamCardHeader}>
            <View>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamCreated}>Created: {team.created_at}</Text>
            </View>
            <TouchableOpacity style={styles.teamIconButton}>
              <Ionicons name="people" size={22} color={AppColors.accent} />
            </TouchableOpacity>
          </View>

          {/* Member avatars and Private badge */}
          <View style={styles.teamMeta}>
            <View style={styles.memberAvatars}>
              {teamMembers.slice(0, 4).map((user, idx) => (
                <Image
                  key={user.id}
                  source={{ uri: user.avatar }}
                  style={[styles.memberAvatar, idx > 0 && { marginLeft: -10 }]}
                />
              ))}
            </View>
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed-outline" size={14} color={AppColors.textMuted} />
              <Text style={styles.privateText}>Private</Text>
            </View>
          </View>

          {/* Invite Button */}
          <TouchableOpacity style={styles.inviteButton}>
            <Ionicons name="add" size={18} color={AppColors.accent} />
            <Text style={styles.inviteButtonText}>Invite Member</Text>
          </TouchableOpacity>
        </View>

        {/* Task Value Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Task Value</Text>
            <Text style={styles.chartDate}>Apr 07, 2026</Text>
          </View>
          <View style={styles.chartBars}>
            {team.taskValue.data.map((value, index) => (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (value / 60) * 60,
                      backgroundColor: value > 40 ? '#4CAF50' : '#2E7D32',
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Invite Member section with Avatars */}
        <View style={styles.inviteSection}>
          <View style={styles.inviteAvatarRow}>
            {teamMembers.slice(0, 3).map((user, idx) => (
              <Image
                key={user.id}
                source={{ uri: user.avatar }}
                style={[styles.inviteAvatar, idx > 0 && { marginLeft: -12 }]}
              />
            ))}
          </View>
          <Text style={styles.inviteSectionTitle}>Invite Member</Text>
        </View>

        {/* Add From Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactSectionTitle}>Add From Contact</Text>
          {users.slice(1).map((user) => (
            <View key={user.id} style={styles.contactRow}>
              <Image source={{ uri: user.avatar }} style={styles.contactAvatar} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{user.first_name} {user.last_name}</Text>
                <Text style={styles.contactRole}>{user.role || 'Team Member'}</Text>
              </View>
              {team.members.includes(user.id) ? (
                <View style={styles.addedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={AppColors.accent} />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setSelectedUserId(user.id);
                    setShowRoleModal(true);
                  }}
                >
                  <View style={styles.radioOuter}>
                    <View style={styles.radioInner} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Send Invite Button */}
          <TouchableOpacity style={styles.sendInviteButton}>
            <Text style={styles.sendInviteText}>Send 2 Invites</Text>
            <Ionicons name="send-outline" size={16} color={AppColors.background} />
          </TouchableOpacity>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Role</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color={AppColors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Assigning role for <Text style={{ fontWeight: '700' }}>
                {users.find(u => u.id === selectedUserId)?.first_name || 'User'}
              </Text>
            </Text>

            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={styles.roleRow}
                onPress={() => setSelectedRole(role.id)}
              >
                <View>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleDesc}>{role.description}</Text>
                </View>
                <View style={[
                  styles.roleRadio,
                  selectedRole === role.id && styles.roleRadioSelected,
                ]}>
                  {selectedRole === role.id && (
                    <Ionicons name="checkmark" size={16} color={AppColors.background} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  // Team Card
  teamCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  teamName: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  teamCreated: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  teamIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(170,202,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: AppColors.cardBackground,
    backgroundColor: AppColors.border,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privateText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(170,202,239,0.12)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(170,202,239,0.2)',
  },
  inviteButtonText: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  // Chart
  chartCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  chartHeader: {
    marginBottom: Spacing.lg,
  },
  chartLabel: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  chartDate: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  // Invite Section
  inviteSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  inviteAvatarRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  inviteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: AppColors.background,
    backgroundColor: AppColors.border,
  },
  inviteSectionTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Contacts
  contactSection: {
    paddingHorizontal: Spacing.xl,
  },
  contactSectionTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.cardBackground,
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  contactRole: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  addedBadge: {},
  addButton: {},
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {},
  sendInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
  },
  sendInviteText: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.cardBackground,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.xxl,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  roleName: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  roleDesc: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  roleRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleRadioSelected: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
  confirmButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  confirmButtonText: {
    color: AppColors.background,
    fontSize: 15,
    fontWeight: '700',
  },
});
