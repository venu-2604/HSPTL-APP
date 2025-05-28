import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { Lock, Badge, User, LogIn, AlertCircle } from 'lucide-react-native';
import { storeNurseData } from './utils/nurseStorage';
import { NurseType, NurseAuthResponse } from './types/nurse';

// API base URL configuration - standardized for all environments
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8084/api' 
  : Platform.OS === 'ios'
    ? 'http://localhost:8084/api'
    : 'http://localhost:8084/api'; // For web

export default function LoginScreen() {
  const [nurseId, setNurseId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ nurseId: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { nurseId: '', password: '' };

    if (!nurseId.trim()) {
      newErrors.nurseId = 'Nurse ID is required';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    setLoginError(''); // Clear any previous login errors
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        console.log(`Attempting to log in with nurse ID: ${nurseId}`);
        console.log(`API URL: ${API_BASE_URL}/auth/login`);
        
        // Make API request to authenticate nurse
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nurse_id: nurseId,
            password: password
          }),
        });
        
        console.log(`API response status: ${response.status}`);
        const data: NurseAuthResponse = await response.json();
        console.log('API response data:', data);
        
        if (response.ok && data.success) {
          // Authentication successful
          console.log('Login successful, redirecting to dashboard');
          
          // Store nurse data for use across the app
          if (data.nurse) {
            const nurseData: NurseType = data.nurse;
            // Update status to Active
            try {
              await fetch(`${API_BASE_URL}/nurses/status/${nurseData.nurse_id}?status=Active`, { method: 'PUT' });
            } catch (err) { console.error('Failed to update nurse status to Active:', err); }
            await storeNurseData(nurseData);
          } else {
            console.warn('Login successful but no nurse data received');
          }
          
          // Navigate to dashboard
          router.replace('/dashboard');
        } else {
          // Authentication failed
          console.log(`Login failed: ${data.error || 'unknown error'}`);
          if (data.error === 'invalid_nurse_id') {
            setLoginError('Nurse ID not found');
          } else if (data.error === 'invalid_password') {
            setLoginError('Incorrect password');
          } else {
            setLoginError(data.message || 'Authentication failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('Could not connect to the server. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hospital Header */}
      <View style={styles.header}>
        <Text style={styles.hospitalName}>AROGITH</Text>
        <Text style={styles.hospitalSubtitle}>Health in Harmony Strength is Arogith</Text>
      </View>

      <View style={styles.content}>
        {/* Profile Icon */}
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <User size={80} color="#4299e1" />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.title}>Nurse Login</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {loginError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#e53e3e" />
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          ) : null}
          
          <View style={styles.inputContainer}>
            <Badge size={20} color="#4a5568" />
            <TextInput
              style={styles.input}
              placeholder="Nurse ID *"
              value={nurseId}
              onChangeText={(text) => {
                setNurseId(text);
                if (errors.nurseId) setErrors({...errors, nurseId: ''});
                if (loginError) setLoginError('');
              }}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.nurseId ? <Text style={styles.errorText}>{errors.nurseId}</Text> : null}

          <View style={[styles.inputContainer, { marginTop: errors.nurseId ? 4 : 16 }]}>
            <Lock size={20} color="#4a5568" />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: ''});
                if (loginError) setLoginError('');
              }}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <TouchableOpacity 
            style={[
              styles.button, 
              { marginTop: errors.password ? 16 : 24 },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <LogIn size={20} color="#fff" />
                <Text style={styles.buttonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2023 Arogith Healthcare</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  hospitalName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#1a365d',
  },
  hospitalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4a5568',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  profileIcon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ebf8ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#4a5568',
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  loginErrorText: {
    color: '#e53e3e',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    paddingVertical: 14,
    paddingLeft: 12,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#4299e1',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#718096',
  },
});