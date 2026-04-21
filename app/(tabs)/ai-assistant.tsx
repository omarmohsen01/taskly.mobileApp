import React from 'react';
import { View, StyleSheet } from 'react-native';
import AIChatAssistant from '@/components/AIChatAssistant';
import { useRouter } from 'expo-router';

export default function AIAssistantScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AIChatAssistant 
        visible={true} 
        mode="fullscreen" 
        isTabScreen={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
