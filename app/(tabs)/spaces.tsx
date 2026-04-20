import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { fetchWorkspaces, fetchSpaces } from '@/lib/api';

interface Board {
  id: number;
  name: string;
  type: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  boards?: Board[];
}

interface Space {
  id: number;
  name: string;
  description?: string;
  workspaceName?: string;
  projects?: Project[];
}

export default function SpacesScreen() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<number, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});

  const toggleSpace = (id: number) =>
    setExpandedSpaces(prev => ({ ...prev, [id]: !prev[id] }));
  
  const toggleFolder = (id: number) =>
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));

  const loadAllSpaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const wsResp = await fetchWorkspaces();
      const workspaces = wsResp?.data ?? wsResp?.workspaces ?? (Array.isArray(wsResp) ? wsResp : []);
      
      let allSpaces: Space[] = [];

      for (const ws of workspaces) {
        try {
          const spResp = await fetchSpaces(ws.id);
          const list = spResp?.data ?? spResp?.spaces ?? (Array.isArray(spResp) ? spResp : []);
          
          const spacesWithWsName = list.map((s: any) => ({
            ...s,
            workspaceName: ws.name,
          }));
          
          allSpaces = [...allSpaces, ...spacesWithWsName];
        } catch (e) {
          console.error(`Error loading spaces for workspace ${ws.id}`, e);
        }
      }
      
      setSpaces(allSpaces);
    } catch (e) {
      console.error('Error loading workspaces', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSpaces();
  }, [loadAllSpaces]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Spaces</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerScreen}>
          <ActivityIndicator size="large" color={AppColors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {spaces.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="planet-outline" size={48} color={AppColors.textMuted} />
              <Text style={styles.emptyTitle}>No Spaces Found</Text>
              <Text style={styles.emptySubtitle}>You don't have any spaces yet.</Text>
            </View>
          ) : (
            <View style={styles.spacesListContainer}>
               {spaces.map((space) => {
                const isSpaceOpen = !!expandedSpaces[space.id];
                const projects = space.projects || [];

                return (
                  <View key={space.id}>
                    <TouchableOpacity
                      style={styles.spacesItem}
                      activeOpacity={0.7}
                      onPress={() => toggleSpace(space.id)}
                    >
                      <View style={styles.spacesItemLeft}>
                        <View style={[styles.spacesItemBadge, { backgroundColor: AppColors.accent }]}>
                          <Text style={styles.spacesItemBadgeText}>
                            {space.name.charAt(0).toLowerCase()}
                          </Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.spacesItemText}>{space.name}</Text>
                            <Text style={styles.workspaceSubtitle}>{space.workspaceName}</Text>
                        </View>
                      </View>
                      <View style={styles.spaceActions}>
                        <TouchableOpacity 
                          activeOpacity={0.7}
                          onPress={() => router.push({ 
                            pathname: '/create-project', 
                            params: { 
                              spaceId: space.id, 
                              spaceName: space.name
                            } 
                          })}
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

                    {isSpaceOpen && (
                      <View style={styles.nestedContainer}>
                        {projects.length === 0 ? (
                            <Text style={styles.emptyNestedText}>No projects in this space</Text>
                        ) : projects.map(project => {
                          const isProjectOpen = !!expandedFolders[project.id];
                          const boards = project.boards || [];

                          return (
                            <View key={`p-${project.id}`}>
                              <TouchableOpacity
                                style={styles.folderItem}
                                activeOpacity={0.7}
                                onPress={() => toggleFolder(project.id)}
                              >
                                <View style={styles.spacesItemLeft}>
                                  <Ionicons name="folder-outline" size={18} color={AppColors.textMuted} />
                                  <Text style={styles.folderText}>{project.name}</Text>
                                </View>
                                <View style={styles.spaceActions}>
                                  <TouchableOpacity 
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                      pathname: '/create-board',
                                      params: { projectId: project.id, projectName: project.name }
                                    })}
                                  >
                                    <Ionicons name="add" size={16} color={AppColors.textMuted} />
                                  </TouchableOpacity>
                                  <Ionicons name="expand-outline" size={14} color={AppColors.textMuted} />
                                  <Ionicons
                                    name={isProjectOpen ? 'chevron-down' : 'chevron-forward'}
                                    size={14}
                                    color={AppColors.textMuted}
                                  />
                                </View>
                              </TouchableOpacity>

                              {isProjectOpen && (
                                boards.length === 0 ? (
                                    <View style={[styles.listItem, { borderLeftWidth: 0 }]}>
                                        <Text style={styles.emptyNestedText}>No boards</Text>
                                    </View>
                                ) : boards.map(board => (
                                    <TouchableOpacity
                                    key={`b-${board.id}`}
                                    style={styles.listItem}
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: `/board/${board.id}`,
                                        params: { boardName: board.name, boardType: board.type || 'kanban' }
                                    })}
                                    >
                                    <Ionicons name={board.type === 'list' ? "list-outline" : "grid-outline"} size={16} color={AppColors.textMuted} />
                                    <Text style={styles.listText}>{board.name}</Text>
                                    </TouchableOpacity>
                                ))
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.xl,
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
  },
  workspaceSubtitle: {
    color: AppColors.textMuted,
    fontSize: 11,
    marginTop: 2,
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
    paddingLeft: Spacing.xl + Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: AppColors.border,
    marginLeft: Spacing.lg,
  },
  listText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    color: AppColors.textMuted,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  emptyNestedText: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
  }
});
