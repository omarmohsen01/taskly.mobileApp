import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { sendMessageToAI, fetchAISessions } from '@/lib/api';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Message {
  id: string | number;
  role: 'user' | 'model';
  content: string;
}

interface AIChatAssistantProps {
  visible: boolean;
  onClose: () => void;
  mode: 'modal' | 'fullscreen';
  initialSessionId?: number | null;
}

export default function AIChatAssistant({ visible, onClose, mode, initialSessionId }: AIChatAssistantProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(initialSessionId || null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'fullscreen') {
        translateY.value = withTiming(0, { duration: 300 });
      } else {
        const targetVal = SCREEN_HEIGHT * 0.1;
        translateY.value = withSpring(targetVal, { damping: 20 });
      }
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      setShowChat(false);
    }
  }, [visible, mode]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await sendMessageToAI(userMsg.content, sessionId || undefined);
      
      if (res.session_id) setSessionId(res.session_id);
      
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'model',
        content: res.response || 'I processed your request.'
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'model', 
        content: "Sorry, I'm having trouble connecting right now." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: SCREEN_HEIGHT,
  }));

  const renderMessage = ({ item }: { item: Message }) => {
    const isAi = item.role === 'model';
    return (
      <View style={[styles.messageRow, isAi ? styles.aiRow : styles.userRow]}>
        {isAi && (
          <LinearGradient
            colors={[AppColors.aiGradientStart, AppColors.aiGradientEnd]}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose} animationType="none">
      <View style={styles.container}>
        <Animated.View style={[styles.sheet, animatedStyle, { paddingBottom: insets.bottom }]}>
          {!showChat ? (
            // Landing Screen
            <>
              {/* Header */}
              <LinearGradient
                colors={[AppColors.cardBackground, AppColors.background]}
                style={styles.landingHeader}
              >
                <View style={styles.landingHeaderContent}>
                  <View style={styles.userAvatarSection}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarInitial}>J</Text>
                    </View>
                  </View>
                  <View style={styles.headerTitleRow}>
                    <Text style={styles.aiTitle}>AI Assistant</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeBtn}
                    onPress={onClose}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Content */}
              <ScrollView 
                style={styles.landingContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Greeting */}
                <View style={styles.greetingSection}>
                  <Text style={styles.greetingText}>How Can I Assist</Text>
                  <Text style={styles.greetingText}>You Today?</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setInputText("Create a task");
                      setShowChat(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={AppColors.accent} />
                    <Text style={styles.actionText}>Create a task</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setInputText("Help me organize tasks");
                      setShowChat(true);
                    }}
                  >
                    <Ionicons name="layers-outline" size={24} color={AppColors.accent} />
                    <Text style={styles.actionText}>Organize tasks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setInputText("Set reminders for me");
                      setShowChat(true);
                    }}
                  >
                    <Ionicons name="notifications-outline" size={24} color={AppColors.accent} />
                    <Text style={styles.actionText}>Set reminders</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setInputText("Show today's priorities");
                      setShowChat(true);
                    }}
                  >
                    <Ionicons name="star-outline" size={24} color={AppColors.accent} />
                    <Text style={styles.actionText}>Today's priorities</Text>
                  </TouchableOpacity>
                </View>

                {/* AI Response Types */}
                <View style={styles.aiResponseSection}>
                  <Text style={styles.responseTypesTitle}>AI Response Types</Text>
                  
                  <View style={styles.responseCardsContainer}>
                    <TouchableOpacity 
                      style={styles.responseCard}
                      onPress={() => setShowChat(true)}
                    >
                      <Ionicons name="sparkles" size={20} color={AppColors.accent} />
                      <Text style={styles.responseCardTitle}>Task Suggestions</Text>
                      <Text style={styles.responseCardDesc}>
                        I suggest completing Design Review first.
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.responseCard}
                      onPress={() => setShowChat(true)}
                    >
                      <Ionicons name="bulb" size={20} color={AppColors.accent} />
                      <Text style={styles.responseCardTitle}>Smart</Text>
                      <Text style={styles.responseCardDesc}>
                        You completed 1 task this morning.
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Input Area for Landing */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              >
                <View style={styles.landingInputWrapper}>
                  <TextInput
                    style={styles.landingInput}
                    placeholder="Type a message..."
                    placeholderTextColor={AppColors.textMuted}
                    value={inputText}
                    onChangeText={setInputText}
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      if (inputText.trim()) {
                        setShowChat(true);
                      }
                    }}
                    style={styles.landingSendBtn}
                  >
                    <LinearGradient
                      colors={[AppColors.accent, AppColors.floatingButtonEnd]}
                      style={styles.landingSendGradient}
                    >
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </>
          ) : (
            // Chat Screen
            <>
              {/* Header */}
              <LinearGradient
                colors={[AppColors.cardBackground, AppColors.background]}
                style={styles.header}
              >
                <View style={styles.headerBar} />
                <View style={styles.headerContent}>
                  <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Taskly AI</Text>
                    <View style={styles.onlineBadge}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.closeBtn}
                  >
                    <Ionicons name="chevron-down" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Chat List */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => String(item.id)}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                       <Ionicons name="chatbubble-ellipses-outline" size={40} color={AppColors.accent} />
                    </View>
                    <Text style={styles.welcomeTitle}>Brainstorm with AI</Text>
                    <Text style={styles.welcomeSub}>I can help you create tasks, manage your schedule, and explore new ideas.</Text>
                  </View>
                }
              />

              {/* Typing Indicator */}
              {isLoading && (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color={AppColors.accent} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              )}

              {/* Input Area for Chat */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              >
                <View style={styles.inputWrapper}>
                   <TextInput
                     style={styles.input}
                     placeholder="Message Taskly AI..."
                     placeholderTextColor={AppColors.textMuted}
                     value={inputText}
                     onChangeText={setInputText}
                     multiline
                   />
                   <TouchableOpacity 
                     onPress={handleSend} 
                     style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
                     disabled={!inputText.trim() || isLoading}
                   >
                     <LinearGradient
                       colors={[AppColors.floatingButtonStart, AppColors.floatingButtonEnd]}
                       style={styles.sendGradient}
                     >
                       <Ionicons name="arrow-up" size={22} color="#fff" />
                     </LinearGradient>
                   </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  
  // Landing Screen Styles
  landingHeader: { 
    padding: 20, 
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  landingHeaderContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userAvatarSection: {
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleRow: {
    flex: 1,
    alignItems: 'center',
  },
  aiTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  landingContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  greetingSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  greetingText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  aiResponseSection: {
    marginBottom: 24,
  },
  responseTypesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  responseCardsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  responseCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  responseCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  responseCardDesc: {
    color: AppColors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  landingInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  landingInput: {
    flex: 1,
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  landingSendBtn: {
    width: 40,
    height: 40,
  },
  landingSendGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chat Screen Styles
  header: { padding: 15, paddingBottom: 20 },
  headerBar: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerInfo: { gap: 4 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.success },
  onlineText: { color: AppColors.textMuted, fontSize: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  aiBubble: { backgroundColor: AppColors.cardBackground, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: AppColors.accent, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiText: { color: '#eee' },
  userText: { color: '#000', fontWeight: '500' },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: AppColors.surface, 
    borderTopWidth: 1, 
    borderTopColor: '#333',
    gap: 12
  },
  input: { 
    flex: 1, 
    backgroundColor: '#000', 
    color: '#fff', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#333'
  },
  sendBtn: { width: 44, height: 44 },
  sendGradient: { width: '100%', height: '100%', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  welcomeTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  welcomeSub: { color: AppColors.textMuted, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  suggestions: { marginTop: 30, gap: 10, width: '100%' },
  suggestion: { backgroundColor: '#333', padding: 15, borderRadius: 15, width: '100%' },
  suggestionText: { color: '#eee', fontSize: 14, fontWeight: '600' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  typingText: { color: AppColors.textMuted, fontSize: 12 },
});
