import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Alert, Image, Modal, ActivityIndicator, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getNurseData, clearNurseData } from './utils/nurseStorage';
import { NurseType } from './types/nurse';

// API base URL configuration - standardized for all environments
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8084/api' 
  : 'http://localhost:8084/api';

// Define interfaces for data models with consistent field naming
interface Patient {
  patientId: string;
  name: string;
  surname: string;
  fatherName?: string;
  gender?: string;
  age?: number;
  address?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  aadharNumber: string;
  photo?: string; // Base64 encoded image
  totalVisits: number;
}

interface Visit {
  visitId: number;
  visitDate: string;
  bp?: string;
  complaint?: string;
  symptoms?: string;
  opNo: string;
  regNo: string;
  status?: string;
  temperature?: string;
  weight?: string;
  prescription?: string;
  patientId: string; // Foreign key to Patient
}

interface PatientWithVisits extends Patient {
  visits?: Visit[];
  latestVisitDate?: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientWithVisits[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithVisits[]>([]);
  const [showNurseProfile, setShowNurseProfile] = useState(false);
  const [nurseData, setNurseData] = useState<NurseType>({ 
    name: '', 
    nurse_id: '', 
    email: '' 
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const tabs = ['Today', 'Yesterday', 'All', 'Consulted'];

  // Load patients data and nurse data from API/storage on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchPatientsAndVisits();
      await loadNurseData();
    };
    
    loadInitialData();
  }, []);

  // Load nurse data from storage
  const loadNurseData = async () => {
    try {
      const nurse = await getNurseData();
      if (nurse) {
        setNurseData(nurse);
        console.log('Loaded nurse data:', nurse);
      } else {
        console.warn('No nurse data found, redirecting to login');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error loading nurse data:', error);
      router.replace('/login');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Update status to INActive
      if (nurseData.nurse_id) {
        try {
          await fetch(`${API_BASE_URL}/nurses/status/${nurseData.nurse_id}?status=INActive`, { method: 'PUT' });
        } catch (err) { console.error('Failed to update nurse status to INActive:', err); }
      }
      await clearNurseData();
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  // Filter patients when search query or active tab changes
  useEffect(() => {
    filterPatients();
  }, [searchQuery, activeTab, patients, visits]);

  // Function to handle the pull-to-refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientsAndVisits();
    setRefreshing(false);
  };

  const fetchPatientsAndVisits = async () => {
    if (refreshing) return; // Prevent multiple simultaneous fetches
    
    // Only show the full loading screen on initial load, not on refresh
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Standardize API URLs
      const patientsUrl = `${API_BASE_URL}/patients`;
      const visitsUrl = `${API_BASE_URL}/visits`;
      
      // Fetch patients with consistent error handling
      const patientsResponse = await fetch(patientsUrl);
      if (!patientsResponse.ok) {
        throw new Error(`Failed to fetch patients: ${patientsResponse.status}`);
      }
      
      const patientsData = await patientsResponse.json();
      console.log('Patients data fetched:', patientsData.length);
      
      // Create standardized patient objects with consistent field naming
      const standardizedPatients = patientsData.map((patient) => ({
        patientId: patient.patientId || patient.patient_id || '',
        name: patient.name || '',
        surname: patient.surname || '',
        fatherName: patient.father_name || patient.fatherName || '',
        gender: patient.gender || '',
        age: patient.age || 0,
        address: patient.address || '',
        bloodGroup: patient.blood_group || patient.bloodGroup || '',
        phoneNumber: patient.phone_number || patient.phoneNumber || '',
        aadharNumber: patient.aadhar_number || patient.aadharNumber || '',
        totalVisits: patient.totalVisits || patient.total_visits || 0,
        photo: patient.photo || null
      }));
      
      // Fetch visits with consistent error handling
      const visitsResponse = await fetch(visitsUrl);
      if (!visitsResponse.ok) {
        throw new Error(`Failed to fetch visits: ${visitsResponse.status}`);
      }
      
      const visitsData = await visitsResponse.json();
      console.log('Visits data fetched:', visitsData.length);
      
      // Create standardized visit objects with consistent field naming
      const standardizedVisits = visitsData.map((visit) => ({
        visitId: visit.visitId || visit.visit_id || 0,
        visitDate: visit.visitDate || visit.visit_date || '',
        bp: visit.bp || '',
        complaint: visit.complaint || '',
        symptoms: visit.symptoms || '',
        opNo: visit.opNo || visit.op_no || '',
        regNo: visit.regNo || visit.reg_no || '',
        status: visit.status || 'Active',
        temperature: visit.temperature || '',
        weight: visit.weight || '',
        prescription: visit.prescription || '',
        patientId: visit.patientId || visit.patient_id || ''
      }));
      
      // Process patient and visit data consistently
      const patientsWithVisits = standardizedPatients.map(patient => {
        const patientVisits = standardizedVisits.filter(
          visit => visit.patientId === patient.patientId
        );
        
        // Sort visits by date descending
        patientVisits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        
        // Add visits and latest visit date to patient object
        return {
          ...patient,
          visits: patientVisits,
          latestVisitDate: patientVisits.length > 0 ? patientVisits[0].visitDate : ''
        };
      });
      
      setPatients(patientsWithVisits);
      setVisits(standardizedVisits);
      setFilteredPatients(patientsWithVisits);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError((err as Error).message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Function to filter patients based on search query and active tab
  const filterPatients = () => {
    if (!patients.length) return;
    
    let filtered = [...patients];
    
    // Filter by tab selection
    if (activeTab === 'Today') {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      filtered = filtered.filter(patient => 
        patient.latestVisitDate && patient.latestVisitDate.startsWith(today)
      );
    } else if (activeTab === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      filtered = filtered.filter(patient => 
        patient.latestVisitDate && patient.latestVisitDate.startsWith(yesterdayStr)
      );
    } else if (activeTab === 'Consulted') {
      // Filter for patients with completed consultations (status in their visits)
      filtered = filtered.filter(patient => {
        if (!patient.visits || patient.visits.length === 0) return false;
        
        // Check if at least one visit has a completed status
        return patient.visits.some(visit => 
          visit.status === 'Completed' || 
          visit.status === 'Consulted' ||
          (visit.prescription && visit.prescription.length > 0)
        );
      });
    }
    // 'All' tab shows all patients, so no additional filtering needed
    
    // Filter by search query - Enhanced to support multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(patient => {
        // Search by name or surname (case insensitive)
        const fullName = `${patient.name} ${patient.surname}`.toLowerCase();
        const reverseName = `${patient.surname} ${patient.name}`.toLowerCase();
        const nameMatch = fullName.includes(query) || reverseName.includes(query);
        
        // Search by phone number
        const phoneMatch = patient.phoneNumber ? patient.phoneNumber.includes(query) : false;
        
        // Search by Aadhar number
        const aadharMatch = patient.aadharNumber ? patient.aadharNumber.includes(query) : false;
        
        // Search by visit date (supports partial date formats like "Apr", "2025", "12")
        let dateMatch = false;
        if (patient.visits && patient.visits.length > 0) {
          dateMatch = patient.visits.some(visit => {
            if (!visit.visitDate) return false;
            const visitDate = new Date(visit.visitDate);
            
            // Format date components for searching
            const monthName = visitDate.toLocaleString('en-US', { month: 'short' }).toLowerCase();
            const monthLongName = visitDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
            const fullDate = visitDate.toISOString().split('T')[0].toLowerCase(); // YYYY-MM-DD
            const dayNumber = visitDate.getDate().toString();
            const yearNumber = visitDate.getFullYear().toString();
            
            return (
              monthName.includes(query) || 
              monthLongName.includes(query) || 
              fullDate.includes(query) || 
              dayNumber === query || 
              yearNumber.includes(query)
            );
          });
        }
        
        // Search by complaint
        let complaintMatch = false;
        if (patient.visits && patient.visits.length > 0) {
          complaintMatch = patient.visits.some(visit => 
            visit.complaint ? visit.complaint.toLowerCase().includes(query) : false
          );
        }
        
        // Return true if any search criteria matches
        return nameMatch || phoneMatch || aadharMatch || dateMatch || complaintMatch;
      });
    }
    
    setFilteredPatients(filtered);
  };

  // Function to get the appropriate count display text based on active tab
  const getCountDisplayText = () => {
    const count = filteredPatients.length;
    
    switch(activeTab) {
      case 'Today':
        return `${count} today`;
      case 'Yesterday':
        return `${count} yesterday`;
      case 'Consulted':
        return `${count} consulted`;
      case 'All':
      default:
        return `${count} total`;
    }
  };

  // Function to view patient details
  const viewPatientDetails = (patient: PatientWithVisits) => {
    router.push({
      pathname: '/(tabs)/success',
      params: {
        patientId: patient.patientId,
        surname: patient.surname,
        name: patient.name,
        gender: patient.gender || 'Not specified',
        age: patient.age?.toString() || 'Not specified',
        phone: patient.phoneNumber || 'Not specified',
        aadharNumber: patient.aadharNumber
      }
    });
  };

  // Render a patient card with visit information
  const renderPatientCard = ({ item }: { item: PatientWithVisits }) => {
    // Format the visit date for display
    let formattedVisitDate = '';
    let formattedTime = '';
    
    if (item.latestVisitDate) {
      const visitDate = new Date(item.latestVisitDate);
      
      // Format as "Apr 12, 2025"
      formattedVisitDate = visitDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      
      // Format as "16:34 PM"
      formattedTime = visitDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // Get the latest complaint from visits
    const latestComplaint = item.visits && item.visits.length > 0 ? item.visits[0].complaint : '';
    
    // Determine status based on the most recent visit
    const patientStatus = item.visits && item.visits.length > 0 ? item.visits[0].status : 'Active';

    return (
      <TouchableOpacity 
        style={styles.patientCard}
        onPress={() => viewPatientDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.patientInfo}>
          <View style={styles.avatarContainer}>
            {/* Circle avatar placeholder */}
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0).toUpperCase() : ''}
              {item.surname ? item.surname.charAt(0).toUpperCase() : ''}
            </Text>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName}>{item.surname} {item.name}</Text>
              <View style={[
                styles.statusBadge, 
                patientStatus === 'Critical' ? styles.criticalBadge : styles.activeBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  patientStatus === 'Critical' ? styles.criticalText : styles.activeText
                ]}>{patientStatus}</Text>
              </View>
            </View>
            <Text style={styles.complaintText} numberOfLines={1} ellipsizeMode="tail">
              {latestComplaint || 'No complaint recorded'}
            </Text>
            <View style={styles.visitDateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#718096" style={styles.dateIcon} />
              <Text style={styles.dateText}>{formattedVisitDate || 'No visit date'}</Text>
              <Ionicons name="time-outline" size={14} color="#718096" style={styles.timeIcon} />
              <Text style={styles.timeText}>{formattedTime || 'N/A'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActionIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
        </View>
      </TouchableOpacity>
    );
  };

  // Function to add a new patient through the API
  const addPatient = async (patientData: Omit<Patient, 'patientId' | 'totalVisits'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          totalVisits: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const newPatient = await response.json();
      setPatients([...patients, newPatient]);
      Alert.alert('Success', 'Patient added successfully');
    } catch (error) {
      console.error('Failed to add patient:', error);
      Alert.alert('Error', 'Failed to add patient. Please try again.');
    }
  };

  // Function to refresh the data
  const refreshPatients = () => {
    fetchPatientsAndVisits();
  };

  // Search bar container style
  const searchContainerStyles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f4f6f8',
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      flex: 1,
      ...Platform.select({
        android: {
          elevation: 0,
          borderWidth: 0,
        },
        ios: {
          shadowColor: 'transparent',
        }
      }),
    },
    searchIcon: {
      marginRight: 10,
      color: '#a0aec0',
    },
    inputWrapper: {
      flex: 1,
      backgroundColor: 'transparent',
      position: 'relative',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: '#2d3748',
      padding: 0,
      backgroundColor: 'transparent',
      ...Platform.select({
        android: {
          height: 40,
        },
      }),
    },
    androidInputWrapper: {
      flex: 1,
      backgroundColor: '#f4f6f8',
    },
  });

  // Custom search input for Android to avoid highlight issues
  const renderSearchInput = () => {
    if (Platform.OS === 'android') {
      return (
        <View style={searchContainerStyles.androidInputWrapper}>
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              color: '#2d3748',
              padding: 0,
              backgroundColor: '#f4f6f8',
              height: 40
            }}
            placeholder="Search by name, complaint, or date..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#a0aec0"
            underlineColorAndroid="transparent"
            textAlignVertical="center"
            includeFontPadding={false}
          />
        </View>
      );
    }
    
    // Default for iOS and other platforms
    return (
      <TextInput
        style={searchContainerStyles.searchInput}
        placeholder="Search by name, complaint, or date..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#a0aec0"
      />
    );
  };

  // Fetch nurse profile from backend
  const fetchNurseProfile = async (nurseId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/nurses/find-by-nurse-id/${nurseId}`);
      if (response.ok) {
        const nurseProfile = await response.json();
        setNurseData(nurseProfile);
      } else {
        console.warn('Failed to fetch nurse profile from backend');
      }
    } catch (error) {
      console.error('Error fetching nurse profile:', error);
    }
  };

  // When opening profile modal, fetch latest nurse data from backend
  const handleShowProfile = async () => {
    if (nurseData.nurse_id) {
      await fetchNurseProfile(nurseData.nurse_id);
    }
    setShowNurseProfile(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Nav Section with light blue background */}
      <View style={styles.topNavSection}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="people" size={24} color="#4299e1" />
            <Text style={styles.title}>Patients</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.countContainer}>
              <Text style={styles.patientCount}>{getCountDisplayText()}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab, 
                activeTab === tab ? styles.activeTab : null
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === tab ? styles.activeTabText : null
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search bar */}
        <View style={searchContainerStyles.container}>
          <View style={searchContainerStyles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#a0aec0" style={searchContainerStyles.searchIcon} />
            {renderSearchInput()}
          </View>
        </View>
      </View>

      {/* Patient List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4299e1" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchPatientsAndVisits}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPatients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'No patients match your search' 
              : `No patients found for ${activeTab.toLowerCase()}`
            }
          </Text>
          <TouchableOpacity 
            style={styles.addPatientButton}
            onPress={() => router.push('/(tabs)/register')}
          >
            <Text style={styles.addPatientButtonText}>Add New Patient</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientCard}
          keyExtractor={item => item.patientId}
          contentContainerStyle={[styles.patientList, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={true}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Nurse Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNurseProfile}
        onRequestClose={() => setShowNurseProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nurse Profile</Text>
              <TouchableOpacity onPress={() => setShowNurseProfile(false)}>
                <Ionicons name="close" size={24} color="#4a5568" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileContent}>
              <View style={styles.profileImageContainer}>
                <Ionicons name="person-circle" size={80} color="#4299e1" />
              </View>
              <Text style={styles.nurseName}>{nurseData.name}</Text>
              <Text style={styles.nurseDetails}>ID: {nurseData.nurse_id}</Text>
              <Text style={styles.nurseDetails}>Email: {nurseData.email}</Text>
              <Text style={styles.nurseDetails}>Role: {nurseData.role || 'NURSE'}</Text>
              <Text style={styles.nurseDetails}>Status: {nurseData.status || 'Not set'}</Text>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/dashboard')}>
          <Ionicons name="home" size={28} color={activeTab === 'All' ? '#4299e1' : '#718096'} />
          <Text style={[styles.navLabel, activeTab === 'All' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/chat')}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#718096" />
          <Text style={styles.navLabel}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemCenter} onPress={() => router.push('/(tabs)/register')}>
          <View style={styles.addButtonNav}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleShowProfile}>
          <Ionicons name="person-circle" size={28} color="#718096" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={28} color="#718096" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  topNavSection: {
    backgroundColor: '#e6f0ff',
    paddingBottom: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2d3748',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countContainer: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  patientCount: {
    fontSize: 14,
    color: '#4299E1',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 5,
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f5fa',
  },
  activeTab: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: 14,
    color: '#718096',
  },
  activeTabText: {
    color: '#3182ce',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    shadowColor: 'transparent',
    elevation: 0,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
    color: '#a0aec0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
    padding: 0,
    outlineStyle: 'none',
    highlightColor: 'transparent',
    selectionColor: '#4299e1',
  },
  patientList: {
    paddingHorizontal: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EBF8FF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4299E1',
  },
  patientDetails: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#e6f0ff',
  },
  criticalBadge: {
    backgroundColor: '#ffe6e6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#3182ce',
  },
  criticalText: {
    color: '#e53e3e',
  },
  complaintText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
  },
  visitDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    marginRight: 10,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#718096',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4299e1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#718096',
    marginBottom: 20,
  },
  addPatientButton: {
    backgroundColor: '#4299e1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addPatientButtonText: {
    color: 'white',
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4299e1',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  cardActionIndicator: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  profileContent: {
    alignItems: 'center',
    padding: 10,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  nurseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  nurseDetails: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#f56565',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 100,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  addButtonNav: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4299e1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#4299e1',
    fontWeight: 'bold',
  },
});

export default Dashboard; 