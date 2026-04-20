import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchProfile, updateProfile, getToken, isHydrated, hydrateToken } from '@/lib/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const resp = await fetchProfile();
      const user = resp?.data || resp;
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });
      if (user?.avatar) {
        setAvatarUri(user.avatar);
      }
    } catch (e) {
      console.error('Load profile error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill required fields' });
      return;
    }

    setSaving(true);
    try {
      const payload: any = { ...formData };
      
      if (avatarUri && !avatarUri.startsWith('http')) {
        payload.avatar = {
          uri: avatarUri,
          name: avatarUri.split('/').pop() || 'avatar.jpg',
          type: 'image/jpeg',
        };
      }

      await updateProfile(payload);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully' });
      router.back();
    } catch (e: any) {
      console.error('Update profile error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={AppColors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={AppColors.background} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Picker */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUri || 'https://ui-avatars.com/api/?name=' + (formData.first_name || 'User') }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
              <Ionicons name="camera" size={20} color={AppColors.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changeAvatarText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FIRST NAME</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            placeholder="First Name"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LAST NAME</Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            placeholder="Last Name"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            placeholderTextColor={AppColors.textMuted}
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  centerScreen: {
    flex: 1,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: AppColors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.cardBackground,
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: AppColors.accent,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.background,
  },
  changeAvatarText: {
    color: AppColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    color: AppColors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
});
