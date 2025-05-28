import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThumbsUp, ClipboardCheck, User, Phone, Activity, Heart, Thermometer, Clock, Calendar, Hash, FileText, Edit2, X, AlertCircle, UserCircle, Home, Droplet } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getPatientWithVisits, API_BASE_URL } from '../utils/api';

// Replace the API_URL definition at the beginning of the file
const API_URL = 'http://localhost:8084/api';

export default function SuccessScreen() {
  const params = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingReturn, setIsEditingReturn] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(
    typeof params.patientId === 'string' ? params.patientId : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState({
    surname: '',
    name: '',
    fatherName: '',
    fullName: '',
    gender: '',
    age: '',
    phone: '',
    aadharNumber: '',
    address: '',
    weight: '',
    bloodPressure: '',
    temperature: '',
    bloodGroup: '',
    symptoms: '',
    complaint: '',
    status: 'Active',
    description: '',
    visitCount: 1,
    opNo: '',
    regNo: '',
    visitDate: '',
    visitTime: '',
  });

  // Get current date and time for default values
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString();
  const formattedTime = currentDate.toLocaleTimeString();
  
  // Format for OP and REG numbers
  const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
  const defaultOpNumber = `${dateString}-01`;
  
  // Load patient data if patientId is available
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) {
        // For new registrations without a patientId, just use params
        populateFromParams();
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Always fetch complete patient data using the utility function
        const data = await getPatientWithVisits(patientId);
        
        // Extract patient and visit info
        const { patient, latestVisit, visits } = data;
        
        // Format visit date and time
        let visitDate = '';
        let visitTime = '';
        
        if (latestVisit?.visitDate) {
          const date = new Date(latestVisit.visitDate);
          visitDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          
          visitTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        }
        
        // Set patient data with full information
        setPatientData({
          surname: patient.surname || '',
          name: patient.name || '',
          fatherName: patient.fatherName || '',
          fullName: `${patient.surname || ''} ${patient.name || ''}`.trim(),
          gender: patient.gender || 'Not specified',
          age: patient.age?.toString() || 'N/A',
          phone: patient.phoneNumber || 'N/A',
          aadharNumber: patient.aadharNumber || 'N/A',
          address: patient.address || 'N/A',
          weight: latestVisit?.weight || 'N/A',
          bloodPressure: latestVisit?.bp || 'N/A',
          temperature: latestVisit?.temperature || 'N/A',
          bloodGroup: patient.bloodGroup || 'N/A',
          symptoms: latestVisit?.symptoms || 'N/A',
          complaint: latestVisit?.complaint || 'N/A',
          status: latestVisit?.status || 'Active',
          description: latestVisit?.description || 'N/A',
          visitCount: visits.length || 1,
          opNo: latestVisit?.opNo || patient.opNo || 'N/A',
          regNo: latestVisit?.regNo || patient.regNo || 'N/A',
          visitDate: visitDate || formattedDate,
          visitTime: visitTime || formattedTime,
        });
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Please try again.');
        // Fall back to param data if API fails
        populateFromParams();
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId, params.editMode]);
  
  // Populate data from URL params (used for new registrations or as fallback)
  const populateFromParams = () => {
    setPatientData({
      surname: typeof params.surname === 'string' ? params.surname : '',
      name: typeof params.name === 'string' ? params.name : '',
      fatherName: typeof params.fatherName === 'string' ? params.fatherName : '',
      fullName: typeof params.fullName === 'string' ? params.fullName : '',
      gender: typeof params.gender === 'string' ? params.gender : '',
      age: typeof params.age === 'string' ? params.age : 'N/A',
      phone: typeof params.phone === 'string' ? params.phone : 'N/A',
      aadharNumber: typeof params.aadharNumber === 'string' ? params.aadharNumber : 'N/A',
      address: typeof params.address === 'string' ? params.address : 'N/A',
      weight: typeof params.weight === 'string' ? params.weight : 'N/A',
      bloodPressure: typeof params.bloodPressure === 'string' ? params.bloodPressure : 'N/A',
      temperature: typeof params.temperature === 'string' ? params.temperature : 'N/A',
      bloodGroup: typeof params.bloodGroup === 'string' ? params.bloodGroup : 'N/A',
      symptoms: typeof params.symptoms === 'string' ? params.symptoms : 'N/A',
      complaint: typeof params.complaint === 'string' ? params.complaint : 'N/A',
      status: typeof params.status === 'string' ? params.status : 'Active',
      description: typeof params.description === 'string' ? params.description : 'N/A',
      visitCount: 1,
      opNo: defaultOpNumber,
      regNo: defaultOpNumber,
      visitDate: formattedDate,
      visitTime: formattedTime,
    });
  };

  // Check if we're returning from an edit
  useEffect(() => {
    if (params.editMode === 'true') {
      setIsEditingReturn(true);
      // Always fetch fresh data from the database when returning from edit
      const fetchUpdatedData = async () => {
        try {
          setLoading(true);
          const patId = patientId || (typeof params.patientId === 'string' ? params.patientId : '');
          if (!patId) {
            setError('Patient ID is missing');
            return;
          }
          
          // Fetch complete patient data using the utility function
          const data = await getPatientWithVisits(patId);
          
          // Extract patient and visit info
          const { patient, latestVisit, visits } = data;
          
          // Format visit date and time
          let visitDate = '';
          let visitTime = '';
          
          if (latestVisit?.visitDate) {
            const date = new Date(latestVisit.visitDate);
            visitDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
            
            visitTime = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
          }
          
          // Set patient data with full information from database
          setPatientData({
            surname: patient.surname || '',
            name: patient.name || '',
            fatherName: patient.fatherName || '',
            fullName: `${patient.surname || ''} ${patient.name || ''}`.trim(),
            gender: patient.gender || 'Not specified',
            age: patient.age?.toString() || 'N/A',
            phone: patient.phoneNumber || 'N/A',
            aadharNumber: patient.aadharNumber || 'N/A',
            address: patient.address || 'N/A',
            weight: latestVisit?.weight || 'N/A',
            bloodPressure: latestVisit?.bp || 'N/A',
            temperature: latestVisit?.temperature || 'N/A',
            bloodGroup: patient.bloodGroup || 'N/A',
            symptoms: latestVisit?.symptoms || 'N/A',
            complaint: latestVisit?.complaint || 'N/A',
            status: latestVisit?.status || 'Active',
            description: latestVisit?.description || 'N/A',
            visitCount: visits.length || 1,
            opNo: latestVisit?.opNo || patient.opNo || 'N/A',
            regNo: latestVisit?.regNo || patient.regNo || 'N/A',
            visitDate: visitDate || formattedDate,
            visitTime: visitTime || formattedTime,
          });
          
          // Clear any existing errors
          setError(null);
        } catch (err) {
          console.error('Error fetching updated patient data:', err);
          setError('Failed to load updated patient data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      // Fetch data immediately when returning from edit
      fetchUpdatedData();
    }
  }, [params.editMode, patientId]);

  const handleHomePress = () => {
    router.replace('/dashboard');
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditRegistration = async () => {
    try {
      setLoading(true);
      setIsEditing(false);
      
      // Fetch the complete patient data from the API
      const patId = patientId || (typeof params.patientId === 'string' ? params.patientId : '');
      
      if (!patId) {
        setError('Patient ID is missing');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching patient details for edit, ID: ${patId}`);
      
      // Get patient details
      const patientResponse = await fetch(`${API_URL}/patients/${patId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Patient details response status: ${patientResponse.status}`);
      
      if (!patientResponse.ok) {
        const errorText = await patientResponse.text();
        console.error(`Failed to retrieve patient details: ${patientResponse.status}`, errorText);
        throw new Error(`Failed to retrieve patient details: ${patientResponse.status}`);
      }
      
      const patientText = await patientResponse.text();
      console.log(`Patient response body: ${patientText}`);
      
      let patient;
      try {
        patient = JSON.parse(patientText);
      } catch (e) {
        console.error('Error parsing patient JSON:', e);
        throw new Error('Invalid patient data received from server');
      }
      
      // Get latest visit data for this patient
      const visitsResponse = await fetch(`${API_URL}/visits/patient/${patId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Visits response status: ${visitsResponse.status}`);
      
      if (!visitsResponse.ok) {
        const errorText = await visitsResponse.text();
        console.error(`Failed to retrieve visit details: ${visitsResponse.status}`, errorText);
        throw new Error(`Failed to retrieve visit details: ${visitsResponse.status}`);
      }
      
      const visitsText = await visitsResponse.text();
      console.log(`Visits response body: ${visitsText}`);
      
      let visits;
      try {
        visits = JSON.parse(visitsText);
      } catch (e) {
        console.error('Error parsing visits JSON:', e);
        throw new Error('Invalid visit data received from server');
      }
      
      // Find the most recent visit
      const latestVisit = visits && visits.length > 0 ? 
        visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0] 
        : null;
      
      console.log('Latest visit:', latestVisit);
      
      // Navigate to registration form with all patient data
      router.push({
      pathname: '/(tabs)/register',
      params: {
          patientId: patId,
          editMode: 'true',
          surname: patient.surname || '',
          name: patient.name || '',
          fatherName: patient.fatherName || '',
          gender: patient.gender || '',
          age: patient.age?.toString() || '',
          phone: patient.phoneNumber || '',
          aadharNumber: patient.aadharNumber || '',
          address: patient.address || '',
          bloodGroup: patient.bloodGroup || '',
          // Add visit-related data if available
          weight: latestVisit?.weight || '',
          bloodPressure: latestVisit?.bp || '',
          temperature: latestVisit?.temperature || '',
          status: latestVisit?.status || 'Active',
          symptoms: latestVisit?.symptoms || '',
          complaint: latestVisit?.complaint || ''
          // Note: OP NO and REG NO are intentionally excluded as they are generated by backend triggers
        }
      });
    } catch (error) {
      console.error('Error fetching patient data for edit:', error);
      setError(error instanceof Error ? error.message : 'Failed to retrieve patient data for editing');
    } finally {
      setLoading(false);
    }
  };

  // Add function to format value with fallback
  const formatValue = (value: string | undefined | null): string => {
    if (!value || value === 'undefined' || value === 'null') return 'N/A';
    return value;
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2960&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      
      <View style={styles.topHeader}>
        <Text style={styles.hospitalName}>AROGITH</Text>
        <Text style={styles.hospitalSubtitle}>Health in Harmony Strength is Arogith</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ClipboardCheck size={28} color="#4ade80" />
          <Text style={styles.title}>
            {isEditingReturn ? 'REGISTRATION UPDATED' : 'REGISTRATION SUCCESSFUL'}
          </Text>
        </View>

        {isEditingReturn && (
          <View style={styles.updateNotification}>
            <Text style={styles.updateNotificationText}>
              Patient information has been successfully updated.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4299e1" />
            <Text style={styles.loadingText}>Loading patient details...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.successIcon}>
              <ThumbsUp size={48} color="#4ade80" />
            </View>

            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patientData.fullName}</Text>
              <View style={styles.patientNumbers}>
                <Text style={styles.patientId}>OP Number: {patientData.opNo}</Text>
                <Text style={styles.patientId}>Reg Number: {patientData.regNo}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <User size={20} color="#666" />
                  <Text style={styles.infoLabel}>Father's Name</Text>
                  <Text style={styles.infoValue}>{patientData.fatherName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <UserCircle size={20} color="#666" />
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{patientData.gender}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Calendar size={20} color="#666" />
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{patientData.age}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Phone size={20} color="#666" />
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{patientData.phone}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Hash size={20} color="#666" />
                  <Text style={styles.infoLabel}>Aadhar Number</Text>
                  <Text style={styles.infoValue}>{patientData.aadharNumber}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Home size={20} color="#666" />
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{patientData.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Activity size={20} color="#666" />
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{patientData.weight}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Heart size={20} color="#666" />
                  <Text style={styles.infoLabel}>Blood Pressure</Text>
                  <Text style={styles.infoValue}>{patientData.bloodPressure}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Thermometer size={20} color="#666" />
                  <Text style={styles.infoLabel}>Temperature</Text>
                  <Text style={styles.infoValue}>{patientData.temperature}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Droplet size={20} color="#666" />
                  <Text style={styles.infoLabel}>Blood Group</Text>
                  <Text style={styles.infoValue}>{patientData.bloodGroup}</Text>
                </View>
                <View style={styles.infoItem}>
                  <FileText size={20} color="#666" />
                  <Text style={styles.infoLabel}>Symptoms</Text>
                  <Text style={styles.infoValue}>{patientData.symptoms}</Text>
                </View>
                <View style={styles.infoItem}>
                  <FileText size={20} color="#666" />
                  <Text style={styles.infoLabel}>Complaint</Text>
                  <Text style={styles.infoValue}>{patientData.complaint}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Activity size={20} color="#666" />
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={[styles.infoValue, { color: patientData.status === 'Active' ? '#4ade80' : '#ef4444' }]}>
                    {patientData.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Visit Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Calendar size={20} color="#666" />
                  <Text style={styles.infoLabel}>Visit Date</Text>
                  <Text style={styles.infoValue}>{patientData.visitDate}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={20} color="#666" />
                  <Text style={styles.infoLabel}>Visit Time</Text>
                  <Text style={styles.infoValue}>{patientData.visitTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <FileText size={20} color="#666" />
                  <Text style={styles.infoLabel}>Visit Count</Text>
                  <Text style={styles.infoValue}>{patientData.visitCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEditPress}
              >
                <Edit2 size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit Registration</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.homeButton]}
                onPress={handleHomePress}
              >
                <Home size={20} color="#fff" />
                <Text style={styles.buttonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditing}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Patient Details</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <X size={20} color="#4a5568" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                You're about to edit this patient's registration information.
              </Text>
              <Text style={styles.modalText}>
                This will take you back to the registration form with the current information pre-filled.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleEditRegistration}
              >
                <Text style={styles.confirmButtonText}>Edit Registration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    opacity: 0.1,
  },
  topHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    zIndex: 1,
  },
  hospitalName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#1a365d',
  },
  hospitalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4a5568',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1a365d',
    marginLeft: 8,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  patientInfo: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  patientName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1a365d',
    marginBottom: 8,
    textAlign: 'center',
  },
  patientNumbers: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  patientId: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1a365d',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  infoGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748b',
    width: '40%',
  },
  infoValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1a365d',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4299e1',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4299e1',
  },
  homeButton: {
    backgroundColor: '#4ade80',
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#4299e1',
    fontFamily: 'Poppins_500Medium',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1a365d',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 12,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmButton: {
    backgroundColor: '#4299e1',
  },
  cancelButtonText: {
    fontFamily: 'Poppins_500Medium',
    color: '#4a5568',
    fontSize: 14,
  },
  confirmButtonText: {
    fontFamily: 'Poppins_500Medium',
    color: 'white',
    fontSize: 14,
  },
  updateNotification: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  updateNotificationText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 22,
  },
});