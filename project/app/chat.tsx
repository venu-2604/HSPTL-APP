import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userType, setUserType] = useState(null); // 'doctor' or 'nurse'
  const [userId, setUserId] = useState('');
  const [otherId, setOtherId] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const flatListRef = useRef(null);
  const router = useRouter();
  const stompClientRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'disconnected', 'error'
  const [connectionError, setConnectionError] = useState(null);

  // Connect to WebSocket on mount (after setup)
  useEffect(() => {
    if (!setupDone) return;
    setConnectionStatus('connecting');
    setConnectionError(null);
    const socket = new SockJS('http://192.168.1.100:8082/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnectionStatus('connected');
        client.subscribe('/user/queue/messages', (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prev) => [...prev, msg]);
        });
      },
      onStompError: (frame) => {
        setConnectionStatus('error');
        setConnectionError(frame.headers['message'] || 'STOMP error');
        console.error('STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        setConnectionStatus('error');
        setConnectionError('WebSocket error');
        console.error('WebSocket error:', event);
      },
      onWebSocketClose: () => {
        setConnectionStatus('disconnected');
      },
    });
    client.activate();
    stompClientRef.current = client;
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [setupDone]);

  // Scroll to bottom when a new message is added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '' || !stompClientRef.current || connectionStatus !== 'connected') return;
    const newMessage = {
      from: userId,
      to: otherId,
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    stompClientRef.current.publish({
      destination: '/app/chat',
      body: JSON.stringify(newMessage),
    });
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.from === userId ? styles.nurseMessage : styles.doctorMessage]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  if (!setupDone) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Set Up Chat</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setUserType('doctor')} style={{ backgroundColor: userType === 'doctor' ? '#4299e1' : '#e2e8f0', padding: 10, borderRadius: 8, marginRight: 10 }}>
            <Text style={{ color: userType === 'doctor' ? '#fff' : '#2d3748' }}>Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUserType('nurse')} style={{ backgroundColor: userType === 'nurse' ? '#4299e1' : '#e2e8f0', padding: 10, borderRadius: 8 }}>
            <Text style={{ color: userType === 'nurse' ? '#fff' : '#2d3748' }}>Nurse</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, width: 200, marginBottom: 10, color: '#2d3748' }}
          placeholder="Your ID (e.g. doctor1 or nurse1)"
          value={userId}
          onChangeText={setUserId}
          placeholderTextColor="#a0aec0"
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, width: 200, marginBottom: 20, color: '#2d3748' }}
          placeholder="Other User's ID (e.g. nurse1 or doctor1)"
          value={otherId}
          onChangeText={setOtherId}
          placeholderTextColor="#a0aec0"
        />
        <TouchableOpacity
          style={{ backgroundColor: '#4299e1', padding: 12, borderRadius: 8 }}
          onPress={() => {
            if (userType && userId && otherId) setSetupDone(true);
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Chat</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4299e1" />
        </TouchableOpacity>
        <Ionicons name="chatbubble-ellipses" size={24} color="#4299e1" />
        <Text style={styles.headerTitle}>Chat with Doctor</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#a0aec0"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {connectionStatus !== 'connected' && (
          <View style={{ padding: 10, backgroundColor: '#fed7d7', borderRadius: 8, margin: 10 }}>
            <Text style={{ color: '#c53030', textAlign: 'center' }}>
              {connectionStatus === 'connecting' && 'Connecting to chat...'}
              {connectionStatus === 'disconnected' && 'Not connected to chat server.'}
              {connectionStatus === 'error' && `Connection error: ${connectionError || ''}`}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginLeft: 10,
  },
  messageList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#e6f0ff',
  },
  nurseMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4299e1',
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f0ff',
  },
  messageText: {
    color: '#2d3748',
    fontSize: 16,
  },
  timestamp: {
    color: '#718096',
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f4f6f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#2d3748',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4299e1',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Chat; 