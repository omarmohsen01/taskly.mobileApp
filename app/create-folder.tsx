import { spaces, spaceColors, statusTemplates, users, currentUser } from '@/constants/dummyData';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CreateFolderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ spaceId?: string; spaceName?: string }>();
  const initialSpaceId = params.spaceId ? Number(params.spaceId) : spaces[0]?.id;
  const initialSpaceName = params.spaceName || spaces[0]?.name || 'space 1';

  const [folderName, setFolderName] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState(initialSpaceId);
  const [selectedSpaceName, setSelectedSpaceName] = useState(initialSpaceName);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCreate = () => {
    if (!folderName.trim()) return;
    // TODO: API call to create folder
    router.back();
  };

  const currentSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Folder</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.createText, !folderName.trim() && styles.createTextDisabled]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Folder name */}
        <Text style={styles.sectionLabel}>Folder name</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Enter folder name"
            placeholderTextColor={AppColors.textMuted}
            value={folderName}
            onChangeText={setFolderName}
          />
        </View>

        {/* Folder settings */}
        <Text style={styles.sectionLabel}>Folder settings</Text>
        <View style={styles.settingsCard}>
          {/* Location */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setShowLocationModal(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="folder-open-outline" size={18} color={AppColors.textMuted} />
            </View>
            <Text style={styles.settingLabel}>Location</Text>
            <View style={styles.settingValueRow}>
              <View style={[styles.spaceBadgeSmall, { backgroundColor: currentSpace?.color || AppColors.textMuted }]}>
                <Text style={styles.spaceBadgeSmallText}>{selectedSpaceName.charAt(0).toLowerCase()}</Text>
              </View>
              <Text style={styles.settingValueText}>{selectedSpaceName}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingDividerFull} />

          {/* Share with */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setShowShareModal(true)}
          >
            <View style={styles.settingIconWrap}>
              <Ionicons name="share-social-outline" size={18} color={AppColors.textMuted} />
            </View>
            <Text style={styles.settingLabel}>Share with</Text>
            <View style={styles.shareValueRow}>
              <Ionicons name="eye-outline" size={14} color={AppColors.textMuted} />
              <Text style={styles.settingValueText}>{selectedSpaceName} | </Text>
              <Ionicons name="person-outline" size={14} color={AppColors.textMuted} />
              <Text style={styles.settingValueText}>1</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingDividerFull} />

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
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>Parent Space Statuses</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingDividerFull} />

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

        <Text style={styles.inheritNote}>
          This folder will inherit the Space's statuses and sharing settings.
        </Text>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowLocationModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.locationSheet}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationTitle}>Add to location</Text>
                  <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                    <Ionicons name="close" size={22} color={AppColors.white} />
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.locationSearch}>
                  <Ionicons name="search" size={18} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search"
                    placeholderTextColor={AppColors.textMuted}
                  />
                </View>

                {/* Personal List */}
                <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
                  <View style={[styles.locationBadge, { backgroundColor: AppColors.accent }]}>
                    <Text style={styles.locationBadgeText}>O</Text>
                  </View>
                  <Ionicons name="lock-closed-outline" size={16} color={AppColors.textMuted} />
                  <Text style={styles.locationRowText}>Personal List</Text>
                </TouchableOpacity>

                {/* Spaces */}
                {spaces.map(space => (
                  <TouchableOpacity
                    key={space.id}
                    style={styles.locationRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedSpaceId(space.id);
                      setSelectedSpaceName(space.name);
                      setShowLocationModal(false);
                    }}
                  >
                    <View style={[styles.locationBadge, { backgroundColor: space.color || AppColors.textMuted }]}>
                      <Text style={styles.locationBadgeText}>{space.name.charAt(0).toLowerCase()}</Text>
                    </View>
                    <Text style={styles.locationRowText}>{space.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Share / Users Modal */}
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowShareModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.usersSheet}>
                <View style={styles.usersHeader}>
                  <Text style={styles.usersTitle}>Users</Text>
                  <TouchableOpacity onPress={() => setShowShareModal(false)}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.locationSearch}>
                  <Ionicons name="search" size={18} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search"
                    placeholderTextColor={AppColors.textMuted}
                  />
                </View>

                <View style={styles.userDivider} />

                <Text style={styles.peopleSectionLabel}>People</Text>
                <TouchableOpacity style={styles.userRow} activeOpacity={0.7}>
                  <View style={[styles.userAvatar, { backgroundColor: AppColors.accent }]}>
                    <Text style={styles.userAvatarText}>
                      {currentUser.first_name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.userRowText}>{currentUser.first_name.toLowerCase()}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Statuses Modal */}
      <Modal visible={showStatusModal} transparent animationType="slide" onRequestClose={() => setShowStatusModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.statusSheet}>
                <View style={styles.usersHeader}>
                  <Text style={styles.usersTitle}>Statuses</Text>
                  <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.locationSearch}>
                  <Ionicons name="search" size={18} color={AppColors.textMuted} />
                  <TextInput
                    style={styles.locationSearchInput}
                    placeholder="Search"
                    placeholderTextColor={AppColors.textMuted}
                  />
                </View>

                <View style={styles.userDivider} />

                <ScrollView>
                  <Text style={styles.statusSectionLabel}>Default Statuses</Text>
                  <View style={styles.statusDivider} />

                  <TouchableOpacity style={styles.statusModalRow}>
                    <Ionicons name="checkmark-circle" size={22} color={AppColors.accent} />
                    <Text style={styles.statusModalRowText}>
                      Space Statuses <Text style={styles.statusModalRowSub}>({selectedSpaceName})</Text>
                    </Text>
                    <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <View style={styles.statusDivider} />

                  <TouchableOpacity style={styles.statusModalRow}>
                    <Text style={styles.statusModalRowText}>Custom Statuses</Text>
                    <Ionicons name="ellipsis-horizontal" size={18} color={AppColors.textMuted} />
                  </TouchableOpacity>
                  <View style={styles.statusDivider} />

                  <View style={styles.templateHeader}>
                    <Text style={styles.statusSectionLabel}>Templates ({statusTemplates.length})</Text>
                    <TouchableOpacity>
                      <Ionicons name="add" size={20} color={AppColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statusDivider} />

                  {statusTemplates.map(t => (
                    <View key={t.id}>
                      <TouchableOpacity style={styles.statusModalRow}>
                        <Text style={styles.statusModalRowText}>{t.name}</Text>
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
                    <Text style={styles.doneText}>Done</Text>
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
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingValueText: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  settingDividerFull: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  spaceBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBadgeSmallText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  shareValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusChip: {
    backgroundColor: AppColors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusChipText: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  inheritNote: {
    color: AppColors.textMuted,
    fontSize: 13,
    marginTop: Spacing.lg,
    lineHeight: 20,
  },
  // Location Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  locationSheet: {
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  locationTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  locationSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  locationSearchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  locationBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBadgeText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  locationRowText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  // Users Modal
  usersSheet: {
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  usersTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  doneText: {
    color: AppColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  userDivider: {
    height: 1,
    backgroundColor: AppColors.accent,
    marginBottom: Spacing.lg,
  },
  peopleSectionLabel: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: AppColors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  userRowText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  // Status Modal
  statusSheet: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  statusSectionLabel: {
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: Spacing.md,
  },
  statusDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  statusModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statusModalRowText: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusModalRowSub: {
    color: AppColors.textMuted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
