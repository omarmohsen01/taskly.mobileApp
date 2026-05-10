import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchNotifications, acceptInvitation, rejectInvitation } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  data: {
    invitation_id: number;
    workspace_name: string;
    sender_name: string;
    message: string;
    type: string;
  };
  read_at: string | null;
  created_at: string;
}

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const resp = await fetchNotifications();
      // Handle different response structures
      const list = Array.isArray(resp) ? resp : (resp?.data || []);
      setNotifications(list);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleAccept = async (notification: Notification) => {
    setProcessingId(notification.id);
    try {
      await acceptInvitation(notification.data.invitation_id);
      alert('Invitation accepted!');
      loadNotifications();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notification: Notification) => {
    setProcessingId(notification.id);
    try {
      await rejectInvitation(notification.data.invitation_id);
      alert('Invitation rejected.');
      loadNotifications();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isInvitation = item.data?.type === 'workspace_invitation';

    return (
      <View style={[styles.card, !item.read_at && styles.unreadCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isInvitation ? "people-outline" : "notifications-outline"}
              size={24}
              color={AppColors.accent}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.message}>{item.data?.message || 'New notification'}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {isInvitation && !item.read_at && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => handleAccept(item)}
              disabled={processingId === item.id}
            >
              {processingId === item.id ? (
                <ActivityIndicator size="small" color={AppColors.background} />
              ) : (
                <Text style={styles.acceptBtnText}>Approve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReject(item)}
              disabled={processingId === item.id}
            >
              <Text style={styles.rejectBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Notifications',
          headerStyle: { backgroundColor: AppColors.background },
          headerTintColor: AppColors.white,
          headerShadowVisible: false,
        }}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={AppColors.accent} size="large" />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              tintColor={AppColors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={64} color={AppColors.textMuted} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  unreadCard: {
    borderColor: AppColors.accent + '60',
    backgroundColor: AppColors.cardBackground + 'E0',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: AppColors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  date: {
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: AppColors.accent,
  },
  acceptBtnText: {
    color: AppColors.background,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  rejectBtnText: {
    color: AppColors.white,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: AppColors.textMuted,
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
