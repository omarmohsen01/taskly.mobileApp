import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, BorderRadius, Spacing } from '@/constants/theme';
import { currentUser } from '@/constants/dummyData';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string;
};

export default function AIAssistantScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'What I can help with you today?',
      isUser: false,
      timestamp: '10:00 AM',
    },
  ]);

  const suggestions = [
    '📊 Reschedule my Topics',
    '✅ Task Suggestions',
  ];

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // TODO: Replace with API call to AI backend
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I'll help you with that! Let me analyze your tasks and suggest the best approach.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: currentUser.avatar }}
            style={styles.headerAvatar}
          />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search hint */}
        <View style={styles.searchHint}>
          <Ionicons name="search-outline" size={16} color={AppColors.textMuted} />
          <Text style={styles.searchHintText}>You can record a Sound</Text>
        </View>

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            {!msg.isUser && (
              <LinearGradient
                colors={['#1a237e', '#283593', '#3949ab']}
                style={styles.aiMessageGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.aiMessageText}>{msg.text}</Text>
              </LinearGradient>
            )}
            {msg.isUser && (
              <View style={styles.userMessageInner}>
                <Text style={styles.userMessageText}>{msg.text}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Suggestions */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => {
                  setMessage(suggestion);
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={AppColors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={22} color={AppColors.accent} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.sendButton, message.trim() ? styles.sendButtonActive : {}]}
          onPress={handleSend}
        >
          <Ionicons
            name="send"
            size={20}
            color={message.trim() ? AppColors.background : AppColors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom padding for tab bar */}
      <View style={{ height: 80 }} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.cardBackground,
  },
  headerTitle: {
    color: AppColors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  searchHintText: {
    color: AppColors.textMuted,
    fontSize: 13,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  messageBubble: {
    marginBottom: Spacing.lg,
    maxWidth: '85%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessageGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  aiMessageText: {
    color: AppColors.white,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  userMessageInner: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  userMessageText: {
    color: AppColors.background,
    fontSize: 15,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  suggestionChip: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  suggestionText: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: AppColors.cardBackground,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: AppColors.border,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: AppColors.white,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  micButton: {
    padding: Spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  sendButtonActive: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.accent,
  },
});
