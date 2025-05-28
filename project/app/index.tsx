import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Hospital Header */}
      <View style={styles.header}>
        <Text style={styles.hospitalName}>AROGITH</Text>
        <Text style={styles.hospitalSubtitle}>Health in Harmony Strength is Arogith</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={require('../assets/images/nameste.png')}
          style={styles.heroImage}
          accessibilityLabel="Namaste greeting gesture"
        />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title}>Patient Registration System</Text>
        
        <Text style={styles.subtitle}>
          Streamline patient registration with our advanced QR scanning system
        </Text>
        
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Link>
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
    zIndex: 10,
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
  heroContainer: {
    height: '40%',
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  heroImage: {
    width: '80%',
    height: '90%',
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    textAlign: 'center',
    color: '#1a365d',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    textAlign: 'center',
    color: '#4a5568',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
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