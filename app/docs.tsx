import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchAttachments } from '@/lib/api';
import TaskDetailsDrawer from '@/components/TaskDetailsDrawer';

interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  task_id: number;
  task?: {
    id: number;
    title: string;
  };
  created_at: string;
}

export default function DocsScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const loadDocs = async () => {
    try {
      const resp = await fetchAttachments();
      setDocs(resp?.data || []);
    } catch (e) {
      console.error('Load docs error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDocs();
  };

  const filteredDocs = docs.filter(doc => 
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.task?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return 'image-outline';
    if (mime.includes('pdf')) return 'document-text-outline';
    if (mime.includes('word') || mime.includes('text')) return 'document-outline';
    return 'file-tray-full-outline';
  };

  const handleDocPress = (doc: Attachment) => {
    if (doc.task_id) {
      setSelectedTaskId(doc.task_id);
      setIsDrawerVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.accent} />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={AppColors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search documents..."
            placeholderTextColor={AppColors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={AppColors.accent} style={{ marginTop: 40 }} />
        ) : filteredDocs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color={AppColors.border} />
            <Text style={styles.emptyText}>No Documents Found</Text>
          </View>
        ) : (
          <View style={styles.docsList}>
            {filteredDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                onPress={() => handleDocPress(doc)}
              >
                <View style={styles.docIconWrap}>
                  <Ionicons name={getFileIcon(doc.mime_type)} size={28} color={AppColors.accent} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>{doc.file_name}</Text>
                  <Text style={styles.docMeta}>
                    {formatFileSize(doc.file_size)} • {doc.task?.title || 'Unknown Task'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Task Details Drawer Integration */}
      <TaskDetailsDrawer
        visible={isDrawerVisible}
        taskId={selectedTaskId}
        onClose={() => setIsDrawerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 16,
  },
  docsList: {
    gap: Spacing.md,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  docIconWrap: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(170,202,239,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    color: AppColors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  docMeta: {
    color: AppColors.textMuted,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
