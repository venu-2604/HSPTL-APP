import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import { QrCode, ChevronDown, Calendar, Phone, User, Home, FileText, Clipboard, Thermometer, Activity, Heart, Droplet, AlertCircle, UserCircle, Stethoscope, ArrowRight, Camera, Upload, ArrowLeft, X, ClipboardCheck, Check } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const STATUS_OPTIONS = ['Normal', 'Critical'] as const;
type StatusType = typeof STATUS_OPTIONS[number];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const WEIGHT_OPTIONS = Array.from({ length: 150 }, (_, i) => `${i + 30} kg`);

const STATUS_COLORS: Record<StatusType, string> = {
  Normal: '#4ade80',
  Critical: '#ef4444',
};

// API URL for backend connection
// Use the appropriate URL based on environment
// - For Android Emulator: 10.0.2.2:8084
// - For iOS Simulator: localhost:8084 
// - For physical device: Use the actual IP address of your development machine
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8084/api' 
  : 'http://localhost:8084/api';

// Check if the API server is available
const checkApiServer = async () => {
  try {
    console.log(`Checking API server at: ${API_URL}`);
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`API server status: ${response.status} - ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.error(`Error connecting to API server: ${error}`);
    return false;
  }
};

// Legacy function - kept for backward compatibility but not used
const checkApiServerLegacy = async () => {
  try {
    const response = await fetch(`${API_URL}/patients`);
    if (response.ok) {
      console.log("Backend connection successful");
      const data = await response.json();
      console.log(`Retrieved ${data.length} patients from the database`);
      return true;
    } else {
      console.error(`Backend connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error connecting to backend: ${error}`);
    return false;
  }
};

const phoneRegex = /^[0-9]{10}$/;
const aadharRegex = /^[0-9]{12}$/;

const genderOptions = ['Male', 'Female', 'Other'];

function parseAadharXML(xmlString: string) {
  try {
    const matches = xmlString.match(/PrintLetterBarcodeData\s+([^>]+)/);
    if (!matches) return null;

    const attributes = matches[1];
    const getData = (key: string) => {
      const match = attributes.match(new RegExp(`${key}="([^"]+)"`));
      return match ? match[1] : '';
    };

    return {
      name: getData('name'),
      gender: getData('gender') === 'M' ? 'Male' : 'Female',
      yob: getData('yob'),
      address: [
        getData('house'),
        getData('street'),
        getData('loc'),
        getData('vtc'),
        getData('dist'),
        getData('state'),
        getData('pc')
      ].filter(Boolean).join(', '),
      uid: getData('uid'),
      co: getData('co'), // Father's name
    };
  } catch (error) {
    console.error('Error parsing Aadhar data:', error);
    return null;
  }
}

// Helper function to capitalize first letter of each word
const capitalizeFirstLetter = (string: string): string => {
  if (!string) return '';
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Add back the mandatory field indicator component
const MandatoryFieldIndicator = () => (
  <Text style={{ color: '#e53e3e', marginLeft: 4 }}>*</Text>
);

// Add a custom circular tick mark component
const VerifiedTickMark = () => (
  <View style={styles.tickMarkContainer}>
    <Check size={10} color="#ffffff" />
  </View>
);

// Create a function to verify patient exists in database
const verifyPatientExists = async (patientId: string) => {
  try {
    console.log(`Verifying patient exists with ID: ${patientId}`);
    const response = await fetch(`${API_URL}/patients/${patientId}`);
    
    if (!response.ok) {
      console.error(`Patient verification failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const patientData = await response.json();
    console.log(`Patient verification successful:`, patientData);
    return true;
  } catch (error) {
    console.error(`Error verifying patient: ${error}`);
    return false;
  }
};

// Add a function to test backend connectivity
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/patients`);
    if (response.ok) {
      console.log("Backend connection successful");
      const data = await response.json();
      console.log(`Retrieved ${data.length} patients from the database`);
      return true;
    } else {
      console.error(`Backend connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error connecting to backend: ${error}`);
    return false;
  }
};

// Add function to test API connection
const testApiConnection = async () => {
  try {
    console.log(`Testing API connection to: ${API_URL}/patients`);
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`API connection test result: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`API connection test failed: ${error}`);
    return false;
  }
};

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const isEditMode = params.editMode === 'true';
  
  // Initialize form data with params if provided (for editing)
  const [surname, setSurname] = useState(typeof params.surname === 'string' ? params.surname : '');
  const [name, setName] = useState(typeof params.name === 'string' ? params.name : '');
  const [fatherName, setFatherName] = useState(typeof params.fatherName === 'string' ? params.fatherName : '');
  const [gender, setGender] = useState(typeof params.gender === 'string' ? params.gender : 'Male');
  const [age, setAge] = useState(typeof params.age === 'string' ? params.age : '');
  const [phone, setPhone] = useState(typeof params.phone === 'string' ? params.phone : '');
  const [aadharNumber, setAadharNumber] = useState(typeof params.aadharNumber === 'string' ? params.aadharNumber : '');
  const [address, setAddress] = useState(typeof params.address === 'string' ? params.address : '');
  const [weight, setWeight] = useState(typeof params.weight === 'string' ? params.weight : '');
  const [bloodPressure, setBloodPressure] = useState(typeof params.bloodPressure === 'string' ? params.bloodPressure : '');
  const [temperature, setTemperature] = useState(typeof params.temperature === 'string' ? params.temperature : '');
  const [bloodGroup, setBloodGroup] = useState(typeof params.bloodGroup === 'string' ? params.bloodGroup : '');
  const [symptoms, setSymptoms] = useState(typeof params.symptoms === 'string' ? params.symptoms : '');
  const [status, setStatus] = useState(typeof params.status === 'string' ? params.status : 'Active');
  const [complaint, setComplaint] = useState(typeof params.complaint === 'string' ? params.complaint : '');
  
  // Store original values for comparison in edit mode
  const [originalValues, setOriginalValues] = useState({
    surname: typeof params.surname === 'string' ? params.surname : '',
    name: typeof params.name === 'string' ? params.name : '',
    fatherName: typeof params.fatherName === 'string' ? params.fatherName : '',
    gender: typeof params.gender === 'string' ? params.gender : 'Male',
    age: typeof params.age === 'string' ? params.age : '',
    phone: typeof params.phone === 'string' ? params.phone : '',
    aadharNumber: typeof params.aadharNumber === 'string' ? params.aadharNumber : '',
    address: typeof params.address === 'string' ? params.address : '',
    weight: typeof params.weight === 'string' ? params.weight : '',
    bloodPressure: typeof params.bloodPressure === 'string' ? params.bloodPressure : '',
    temperature: typeof params.temperature === 'string' ? params.temperature : '',
    bloodGroup: typeof params.bloodGroup === 'string' ? params.bloodGroup : '',
    symptoms: typeof params.symptoms === 'string' ? params.symptoms : '',
    status: typeof params.status === 'string' ? params.status : 'Active',
    complaint: typeof params.complaint === 'string' ? params.complaint : ''
  });
  
  // For validation and API state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Format Aadhar number - removing spaces
  const formatAadharNumber = (text: string) => {
    // Remove all spaces and non-digit characters
    return text.replace(/\D/g, '').substring(0, 12);
  };

  // Add state variables for existing patient information and checking status
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [existingPatientId, setExistingPatientId] = useState('');
  const [isCheckingAadhar, setIsCheckingAadhar] = useState(false);
  const [aadharChecked, setAadharChecked] = useState(false);
  const [nameMatchError, setNameMatchError] = useState('');

  // Add state for new patient notification
  const [isNewPatient, setIsNewPatient] = useState(false);

  // Handle Aadhar input with validation and auto-verification
  const handleAadharChange = (text: string) => {
    const digitsOnly = formatAadharNumber(text);
    setAadharNumber(digitsOnly);
    
    // Reset patient states when Aadhar is changed
    if (aadharChecked && digitsOnly.length < 12) {
      setAadharChecked(false);
      setIsExistingPatient(false);
      setIsNewPatient(false);
      setExistingPatientId('');
      setNameMatchError('');
    }
    
    // Auto-verify when 12 digits are entered
    if (digitsOnly.length === 12) {
      checkAadharExists(digitsOnly);
    }
  };

  // Function to check if Aadhar exists with standardized field names
  const checkAadharExists = async (aadharToCheck: string = aadharNumber) => {
    if (aadharToCheck.length !== 12) {
      return; // Silently return if not the right length
    }

    setIsCheckingAadhar(true);
    // Reset both patient states
    setIsExistingPatient(false);
    setIsNewPatient(false);
    
    try {
      console.log("Checking Aadhar:", aadharToCheck);
      const response = await fetch(`${API_URL}/patients/check-aadhar/${aadharToCheck}`);
      
      if (!response.ok) {
        console.error(`Aadhar check failed: ${response.status} ${response.statusText}`);
        setIsCheckingAadhar(false);
        return;
      }
      
      const data = await response.json();
      
      setAadharChecked(true);
      
      if (data && data !== false) {
        // Log full response to check exact field names
        console.log("Retrieved patient data:", data);
        console.log("Response data keys:", Object.keys(data));
        
        // Extract the patient ID using the exact format returned from the backend
        const patientId = data.patientId || data.patient_id || data.id || '';
        console.log("Extracted patient ID:", patientId);
        
        // Create a standardized data object that maps API response to our form fields
        // This ensures consistency between retrieval and submission
        const standardizedData = {
          // Personal information with both snake_case and camelCase fallbacks
          patientId: patientId,
          name: data.name || data.first_name || '',
          surname: data.surname || data.last_name || '',
          fatherName: data.father_name || data.fatherName || data.father || '',
          gender: data.gender || 'Male',
          age: data.age ? String(data.age) : '',
          phone: data.phone_number || data.phoneNumber || data.phone || '',
          address: data.address || '',
          bloodGroup: data.blood_group || data.bloodGroup || data.bloodgroup || '',
          
          // Medical fields with both snake_case and camelCase fallbacks
          bloodPressure: data.bp || data.blood_pressure || data.bloodPressure || '',
          weight: data.weight || '',
          temperature: data.temperature || data.temp || '',
          symptoms: data.symptoms || data.current_condition || data.currentCondition || data.condition || '',
          status: data.status || 'Active',
          complaint: data.complaint || '',
        };
        
        console.log("Standardized data for form:", standardizedData);
        
        // Aadhar exists, patient found
        setIsExistingPatient(true);
        setIsNewPatient(false);
        setExistingPatientId(standardizedData.patientId);
        
        // Always set these critical fields
        setPhone(standardizedData.phone);
        setFatherName(standardizedData.fatherName);
        setBloodGroup(standardizedData.bloodGroup);
        
        // Auto-fill patient data if name and surname are empty
        if (!name && !surname) {
          // Auto-fill all patient information
          setSurname(standardizedData.surname);
          setName(standardizedData.name);
          setGender(standardizedData.gender);
          setAge(standardizedData.age);
          setAddress(standardizedData.address);
          
          Alert.alert('Existing Patient', 'Patient found with this Aadhar number. Personal information has been filled automatically. Please verify and add medical information for a new visit.');
        } 
        // If name or surname are already filled, check if they match
        else if (name || surname) {
          const nameMatches = !name || (standardizedData.name && name.toLowerCase() === standardizedData.name.toLowerCase());
          const surnameMatches = !surname || (standardizedData.surname && surname.toLowerCase() === standardizedData.surname.toLowerCase());
          
          if (!nameMatches || !surnameMatches) {
            setNameMatchError('Name/Surname does not match with the existing Aadhar record');
          } else {
            // Name matches, auto-fill remaining fields
            setGender(standardizedData.gender);
            setAge(standardizedData.age);
            setAddress(standardizedData.address);
            
            Alert.alert('Existing Patient', 'Patient verified. Personal information has been filled automatically. Please add medical information for a new visit.');
          }
        }
    } else {
        // Aadhar doesn't exist - this is a new patient
        setIsExistingPatient(false);
        setIsNewPatient(true);
        setExistingPatientId('');
        Alert.alert('New Patient', 'No existing patient found with this Aadhar number. Please fill all details to register a new patient.');
      }
    } catch (error) {
      console.error('Error checking Aadhar:', error);
      // Don't show an alert for auto-verification failures to avoid interrupting the user flow
    } finally {
      setIsCheckingAadhar(false);
    }
  };

  // Handle age input - ensure it's an integer
  const handleAgeChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/\D/g, '');
    setAge(digitsOnly);
  };

  // Update the form validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate patient personal information
    if (!name) newErrors.name = 'Name is required';
    if (!surname) newErrors.surname = 'Surname is required';
    if (!aadharNumber) newErrors.aadharNumber = 'Aadhar number is required';
    if (aadharNumber && aadharNumber.length !== 12) newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    if (!fatherName) newErrors.fatherName = 'Father\'s name is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!age) newErrors.age = 'Age is required';
    if (age && isNaN(parseInt(age, 10))) newErrors.age = 'Age must be a valid number';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (phone && !phoneRegex.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!address) newErrors.address = 'Address is required';
    if (!bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    
    // Validate medical information only if not in edit mode
    if (!isEditMode) {
      if (!weight) newErrors.weight = 'Weight is required';
      if (!bloodPressure) newErrors.bloodPressure = 'Blood pressure is required';
      if (!temperature) newErrors.temperature = 'Temperature is required';
      if (!symptoms) newErrors.symptoms = 'Symptoms are required';
      if (!complaint) newErrors.complaint = 'Complaint is required';
    }
    
    // Add name match error if it exists
    if (nameMatchError) {
      newErrors.name = nameMatchError;
      newErrors.surname = nameMatchError;
    }
    
    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if a field has an error and should show error styling
  const hasError = (field: string) => {
    return errors[field];
  };

  const [showScanner, setShowScanner] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [showWeightDropdown, setShowWeightDropdown] = useState(false);
  
  const [patientData, setPatientData] = useState({
    name: '',
    fatherName: '',
    gender: '',
    age: '',
    phone: '',
    aadhar: '',
    address: '',
    weight: '',
    temperature: '',
    bloodPressure: '',
    bloodGroup: '',
    status: 'Normal' as StatusType,
    complaint: '',
    symptoms: '',
  });

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    try {
      const aadharData = parseAadharXML(data);
      
      if (aadharData) {
        // Update the form fields with scanned data
        setSurname(aadharData.name.split(' ')[0]);
        setName(aadharData.name.split(' ')[1]);
        setGender(aadharData.gender);
        
        // Calculate age from year of birth if available
        if (aadharData.yob) {
          const currentYear = new Date().getFullYear();
          const birthYear = parseInt(aadharData.yob);
          if (!isNaN(birthYear)) {
            setAge((currentYear - birthYear).toString());
          }
        }
        
        setAddress(aadharData.address);
        // Remove spaces from Aadhar number
        setAadharNumber(aadharData.uid.replace(/\s/g, ''));
        setFatherName(aadharData.co.replace('S/O ', '').replace('D/O ', ''));
      } else {
        Alert.alert('Invalid QR Code', 'The scanned QR code is not a valid Aadhar QR code.');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'An error occurred while processing the QR code.');
    }
    
    setShowScanner(false);
  };

  // Add state variables for the modal pickers
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  if (showScanner) {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowScanner(false)}>
          <Text style={styles.closeButtonText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    data: string[],
    onSelect: (value: string) => void,
    selectedValue?: string
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContent}>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedValue === item && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}>
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Formatting functions for input values
  const formatPhone = (text: string): string => {
    // Allow only digits and restrict to 10 digits
    const digits = text.replace(/\D/g, '');
    return digits.substring(0, 10);
  };

  const formatTemperatureInput = (text: string): string => {
    // Allow decimal numbers with one decimal place
    // Remove non-digit and non-decimal characters
    let cleanText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      cleanText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to one decimal place
    if (cleanText.includes('.') && cleanText.split('.')[1].length > 1) {
      const [whole, decimal] = cleanText.split('.');
      cleanText = whole + '.' + decimal.substring(0, 1);
    }
    
    return cleanText;
  };

  // Function to reset the form after submission
  const resetForm = () => {
    setSurname('');
    setName('');
    setFatherName('');
    setGender('Male');
    setAge('');
    setPhone('');
    setAadharNumber('');
    setAddress('');
    setWeight('');
    setBloodPressure('');
    setTemperature('');
    setBloodGroup('');
    setSymptoms('');
    setStatus('Active');
    setComplaint('');
    
    // Reset validation states
    setErrors({});
    setLoading(false);
    
    // Scroll back to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Call the test on component mount
  useEffect(() => {
    const runTests = async () => {
      // Test backend connection
      const isConnected = await checkApiServer();
      if (!isConnected) {
        Alert.alert(
          'Backend Connection Issue',
          'Could not connect to the backend server. Please check that the server is running.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // We no longer need to test for specific endpoints
      console.log('Backend server connection confirmed');
    };
    
    runTests();
  }, []);

  // Update the main registration form submission
  const handleFormSubmission = async () => {
    try {
      setLoading(true);
      
      // Test API connection first
      const isApiConnected = await testApiConnection();
      if (!isApiConnected) {
        Alert.alert(
          'Server Unavailable',
          'Cannot connect to the server. Please check your network connection and try again.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Validate all required fields
      if (!validateForm()) {
        Alert.alert('Missing Information', 'Please fill all required fields for the patient.');
        setLoading(false);
        return;
      }

      // Check if we're in edit mode
      if (isEditMode && params.patientId) {
        // We're updating an existing patient
        const patientId = params.patientId;
        console.log(`Updating patient with ID: ${patientId}`);
        
        // First, get the latest visit for this patient
        const visitsResponse = await fetch(`${API_URL}/visits/patient/${patientId}/recent`);
        if (!visitsResponse.ok) {
          throw new Error(`Failed to fetch visits: ${visitsResponse.status}`);
        }
        
        const visits = await visitsResponse.json();
        if (!visits || visits.length === 0) {
          throw new Error('No visits found for this patient');
        }
        
        const latestVisit = visits[0];
        console.log('Latest visit:', latestVisit);
        
        // Prepare patient update data
        const patientUpdateData = {
          name: name || undefined,
          surname: surname || undefined,
          fatherName: fatherName || undefined,
          gender: gender || undefined,
          age: age ? parseInt(age, 10) : undefined,
          phoneNumber: phone || undefined,
          address: address || undefined,
          bloodGroup: bloodGroup || undefined
        };

        // Only remove null values, keep empty strings and preserve existing opNo/regNo
        Object.keys(patientUpdateData).forEach(key => {
          if (patientUpdateData[key] === null) {
            delete patientUpdateData[key];
          }
        });
        
        // Prepare visit update data
        const visitUpdateData = {
          bp: bloodPressure || undefined,
          weight: weight || undefined,
          temperature: temperature || undefined,
          symptoms: symptoms || undefined,
          status: status || undefined,
          complaint: complaint || undefined,
          opNo: latestVisit.opNo, // Preserve existing OP NO
          regNo: latestVisit.regNo // Preserve existing REG NO
        };

        // Log the values being preserved
        console.log('Preserving OP NO:', latestVisit.opNo);
        console.log('Preserving REG NO:', latestVisit.regNo);
        console.log('Full visit update data:', JSON.stringify(visitUpdateData, null, 2));

        // Remove undefined values to preserve existing data
        Object.keys(visitUpdateData).forEach(key => {
          if (visitUpdateData[key] === undefined) {
            delete visitUpdateData[key];
          }
        });
        
        // Log the final data being sent
        console.log('Final visit update data:', JSON.stringify(visitUpdateData, null, 2));
        
        // Update patient data
        const patientResponse = await fetch(`${API_URL}/patients/${patientId}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientUpdateData)
        });
        
        if (!patientResponse.ok) {
          throw new Error(`Failed to update patient: ${patientResponse.status}`);
        }
        
        // Update visit data
        const visitResponse = await fetch(`${API_URL}/visits/${latestVisit.visitId}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(visitUpdateData)
        });
        
        if (!visitResponse.ok) {
          throw new Error(`Failed to update visit: ${visitResponse.status}`);
        }
        
        // Successfully updated both patient and visit
        console.log('Successfully updated patient and visit');
        
        // Fetch the latest patient data after successful update
        const latestPatientResponse = await fetch(`${API_URL}/patients/${patientId}`);
        if (!latestPatientResponse.ok) {
          throw new Error(`Failed to fetch latest patient data: ${latestPatientResponse.status}`);
        }
        
        const latestPatientData = await latestPatientResponse.json();
        console.log('Latest patient data:', latestPatientData);
        
        // Navigate to success page with the latest data
        router.push({
          pathname: '/(tabs)/success',
          params: { 
            patientId,
            editMode: 'true',
            // Pass the latest data from the API response
            surname: latestPatientData.surname,
            name: latestPatientData.name,
            fatherName: latestPatientData.fatherName,
            gender: latestPatientData.gender,
            age: latestPatientData.age,
            phone: latestPatientData.phoneNumber,
            aadharNumber: latestPatientData.aadharNumber,
            address: latestPatientData.address,
            bloodGroup: latestPatientData.bloodGroup,
            bloodPressure: latestPatientData.bp,
            weight: latestPatientData.weight,
            temperature: latestPatientData.temperature,
            symptoms: latestPatientData.symptoms,
            status: latestPatientData.status,
            complaint: latestPatientData.complaint,
            opNo: latestPatientData.opNo,
            regNo: latestPatientData.regNo
          }
        });
        
        setLoading(false);
        return;
      }

      // Check if Aadhar number exists (if not already checked)
      if (!aadharChecked) {
        try {
          const response = await fetch(`${API_URL}/patients/check-aadhar/${aadharNumber}`);
          
          if (!response.ok) {
            Alert.alert('Server Error', 'Failed to verify Aadhar number. Please try again.');
            setLoading(false);
            return;
          }

          const data = await response.json();
          
          if (data && data !== false) {
            // Patient exists with this Aadhar
            const existingName = data.name || data.first_name || '';
            const existingSurname = data.surname || data.last_name || '';
            
            // Verify name and surname
            const nameMatches = existingName.toLowerCase() === name.toLowerCase();
            const surnameMatches = existingSurname.toLowerCase() === surname.toLowerCase();
            
            if (!nameMatches || !surnameMatches) {
              Alert.alert(
                'Name Mismatch',
                'The name and surname do not match with the existing Aadhar record. Please verify your information.',
                [{ text: 'OK' }]
              );
              setLoading(false);
              return;
            }
        
            // If match, set the patient ID for the visit - use the exact format returned by the API
            setIsExistingPatient(true);
            const patientId = data.patientId || data.patient_id || data.id || '';
            console.log("Existing patient ID:", patientId);
            setExistingPatientId(patientId);
          }
        } catch (error) {
          console.error('Error checking Aadhar:', error);
          Alert.alert('Connection Error', 'Failed to verify Aadhar number. Please try again.');
          setLoading(false);
          return;
        }
      }

      let patientId = existingPatientId;
      let endpoint;
      let requestData;
      
      if (isExistingPatient && existingPatientId) {
        // For existing patients, create a visit with consistent snake_case field names
        requestData = {
          bp: bloodPressure,
          weight,
          temperature,
          symptoms,
          status,
          complaint
        };
        
        endpoint = `${API_URL}/visits/patient/${existingPatientId}`;
        console.log(`Creating visit for existing patient with ID: ${existingPatientId}`);
      } else {
        // For new patients, create the patient first, then create a visit separately
        requestData = {
          name,
          surname,
          father_name: fatherName, // Use snake_case consistently
          gender,
          age: parseInt(age, 10),
          address,
          blood_group: bloodGroup, // Use snake_case consistently
          phone_number: phone, // Use snake_case consistently
          aadhar_number: aadharNumber // Use snake_case consistently
        };
        
        endpoint = `${API_URL}/patients`;
        console.log(`Creating new patient with Aadhar: ${aadharNumber}`);
      }
      
      console.log(`Making API request to: ${endpoint}`);
      console.log("Request data:", JSON.stringify(requestData, null, 2));
      
      try {
        // First, attempt to check for duplicate Aadhar to avoid errors
        if (!isExistingPatient && !existingPatientId) {
          console.log("Checking for existing patient with Aadhar before submission...");
          try {
            const checkResponse = await fetch(`${API_URL}/patients/check-aadhar/${aadharNumber}`);
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (checkData && checkData !== false) {
                console.log("Patient already exists with this Aadhar number");
                Alert.alert(
                  'Duplicate Aadhar Number',
                  'A patient with this Aadhar number already exists. Please use the existing patient option.',
                  [{ text: 'OK' }]
                );
                setLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Error checking for duplicate Aadhar:", error);
          }
        }

        // Make the API request for patient creation or visit creation
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
        
        console.log(`API response status: ${response.status}`);
        
        // Get the full response body for debugging
        let responseText = '';
        let responseData;
        
        try {
          responseText = await response.text();
          console.log("Full response:", responseText);
          
          // Try to parse as JSON if possible
          try {
            responseData = JSON.parse(responseText);
            console.log("Parsed response data:", responseData);
          } catch (parseError) {
            console.log("Response is not valid JSON");
          }
        } catch (e) {
          console.error("Could not read response text:", e);
        }
        
        if (response.ok) {
          if (!isExistingPatient) {
            // For new patients, get the ID from the response
            if (responseData) {
              // Extract the exact patient ID as returned by the backend
              // Backend now generates sequential numeric IDs (e.g., "001", "002", etc.)
              patientId = responseData.patientId || 
                          responseData.patient_id || 
                          responseData.id || '';
              
              console.log("New patient created with ID:", patientId);
              
              if (patientId) {
                // Now create a visit for the new patient using the exact ID format returned by the backend
                const visitData = {
                  bp: bloodPressure,
                  weight,
                  temperature,
                  symptoms,
                  status,
                  complaint
                };
                
                console.log(`Creating visit for new patient with ID: ${patientId}`);
                console.log("Visit data:", JSON.stringify(visitData, null, 2));
                
                // Use the exact patient ID format in the URL
                const visitResponse = await fetch(`${API_URL}/visits/patient/${patientId}`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(visitData)
                });
                
                console.log(`Visit creation response status: ${visitResponse.status}`);
                
                if (!visitResponse.ok) {
                  console.error("Failed to create visit, but patient was created");
                  // Continue anyway since the patient was created
                }
              }
            }
          }
          
          // If we have a patient ID, navigate to success
          if (patientId) {
            console.log("Navigating to success page with patient ID:", patientId);
            router.push({
              pathname: '/(tabs)/success',
              params: { patientId }
            });
          } else {
            // If for some reason we couldn't get a patient ID
            console.warn("Patient operation completed but ID couldn't be retrieved");
            router.push({
              pathname: '/dashboard'
            });
          }
        } else {
          // Handle specific error cases
          if (response.status === 409) {
            Alert.alert(
              'Duplicate Aadhar Number',
              'A patient with this Aadhar number already exists. Please use the existing patient option.',
              [{ text: 'OK' }]
            );
          } else if (response.status === 500) {
            Alert.alert(
              'Server Error',
              'The server encountered an error. This might be temporary. Would you like to retry?',
              [
                { 
                  text: 'Retry', 
                  onPress: () => handleFormSubmission() 
                },
                {
                  text: 'Cancel',
                  style: 'cancel'
                }
              ]
            );
          } else {
            Alert.alert(
              'Registration Failed',
              `Request failed with status ${response.status}. Please try again later or contact support.`,
              [{ text: 'OK' }]
            );
          }
        }
      } catch (error) {
        console.error("Network or fetch error:", error);
        Alert.alert(
          'Connection Error',
          'Failed to connect to the server. Please check your network connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4299e1" />
          <Text style={styles.loadingText}>Processing registration...</Text>
        </View>
      )}
    <ScrollView 
      ref={scrollViewRef} 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/dashboard')}
        >
          <ArrowLeft size={24} color="#4299e1" />
        </TouchableOpacity>
        <Text style={styles.hospitalName}>AROGITH</Text>
        <Text style={styles.hospitalSubtitle}>Health in Harmony Strength is Arogith</Text>
      </View>
    
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode 
            ? `Edit Patient: ${surname} ${name}` 
            : 'Patient Registration'
          }
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}>
          <QrCode size={14} color="#fff" />
          <Text style={styles.scanButtonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.formHeader}>
          <Text style={styles.formHeaderTitle}>Patient Information</Text>
          <Text style={styles.mandatoryFieldNote}>Fields marked with <Text style={styles.mandatoryAsterisk}>*</Text> are mandatory</Text>
        </View>
        
        <View style={styles.profileIconContainer}>
          <UserCircle size={80} color="#4299e1" />
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Aadhar Number</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Clipboard size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('aadharNumber') && styles.inputError]}
              value={aadharNumber}
              onChangeText={handleAadharChange}
              placeholder="Enter 12-digit Aadhar number"
              keyboardType="number-pad"
              maxLength={12}
              placeholderTextColor="#718096"
            />
            {isCheckingAadhar && (
              <ActivityIndicator size="small" color="#4299e1" style={{marginRight: 12}} />
            )}
          </View>
          {hasError('aadharNumber') && <Text style={styles.errorText}>{errors.aadharNumber}</Text>}
          {isExistingPatient && (
            <View style={styles.verifiedContainer}>
              <VerifiedTickMark />
              <Text style={styles.existingPatientText}>
                Existing patient found. Adding a new visit.
              </Text>
            </View>
          )}
          {isNewPatient && (
            <View style={styles.verifiedContainer}>
              <VerifiedTickMark />
              <Text style={styles.existingPatientText}>
                New patient verified.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Surname</Text>
            <MandatoryFieldIndicator />
          </View>
            <TextInput
            style={[styles.input, hasError('surname') && styles.inputError]}
            placeholder="Enter Surname"
              value={surname}
            onChangeText={(text) => {
              setSurname(text);
            }}
              placeholderTextColor="#718096"
            />
          {hasError('surname') && <Text style={styles.errorText}>{errors.surname}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Name</Text>
            <MandatoryFieldIndicator />
          </View>
            <TextInput
            style={[styles.input, hasError('name') && styles.inputError]}
            placeholder="Enter Name"
              value={name}
            onChangeText={(text) => {
              setName(text);
            }}
              placeholderTextColor="#718096"
            />
          {hasError('name') && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Father's Name</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <User size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('fatherName') && styles.inputError]}
              value={fatherName}
              onChangeText={(text) => {
                setFatherName(text);
              }}
              placeholder="Enter father's name"
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('fatherName') && <Text style={styles.errorText}>{errors.fatherName}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Gender</Text>
            <MandatoryFieldIndicator />
          </View>
          <TouchableOpacity
            style={[styles.inputContainer, styles.dropdownContainer, hasError('gender') && styles.inputError]}
            onPress={() => setShowGenderPicker(true)}
          >
            <UserCircle size={20} color="#4299e1" style={styles.inputIcon} />
            <Text style={[styles.dropdownText, !gender && styles.placeholderText]}>
              {gender || "Select gender"}
            </Text>
            <ChevronDown size={20} color="#718096" />
          </TouchableOpacity>
          {hasError('gender') && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Age</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('age') && styles.inputError]}
              value={age}
              onChangeText={handleAgeChange}
              placeholder="Enter age in years"
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('age') && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Phone</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('phone') && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
              }}
              placeholder="Enter 10-digit phone number"
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('phone') && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Address</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Home size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, styles.textArea, hasError('address') && styles.inputError]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
              }}
              placeholder="Enter complete address"
              multiline
              numberOfLines={3}
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('address') && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.sectionTitleContainer}>
          <Stethoscope size={22} color="#4299e1" />
          <Text style={styles.sectionTitle}>Medical Information</Text>
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Weight</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Activity size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('weight') && styles.inputError]}
              value={weight}
              onChangeText={(text) => {
                setWeight(text);
              }}
              placeholder="e.g. 70 kg"
              keyboardType="numeric"
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('weight') && <Text style={styles.errorText}>{errors.weight}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Blood Pressure</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Heart size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('bloodPressure') && styles.inputError]}
              value={bloodPressure}
              onChangeText={(text) => {
                setBloodPressure(text);
              }}
              placeholder="e.g. 120/80"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('bloodPressure') && <Text style={styles.errorText}>{errors.bloodPressure}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Temperature</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <Thermometer size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, hasError('temperature') && styles.inputError]}
              value={temperature}
              onChangeText={(text) => {
                setTemperature(text);
              }}
              placeholder="e.g. 98.6 °F"
              keyboardType="numeric"
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('temperature') && <Text style={styles.errorText}>{errors.temperature}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Blood Group</Text>
            <MandatoryFieldIndicator />
          </View>
          <TouchableOpacity
            style={[styles.inputContainer, styles.dropdownContainer, hasError('bloodGroup') && styles.inputError]}
            onPress={() => {
              console.log("Blood group selected:", bloodGroup);
              setShowBloodGroupDropdown(true);
            }}
          >
            <Droplet size={20} color="#4299e1" style={styles.inputIcon} />
            <Text style={[styles.dropdownText, !bloodGroup && styles.placeholderText]}>
              {bloodGroup || "Select blood group"}
            </Text>
            <ChevronDown size={20} color="#718096" />
          </TouchableOpacity>
          {hasError('bloodGroup') && <Text style={styles.errorText}>{errors.bloodGroup}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Symptoms</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <AlertCircle size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, styles.textArea, hasError('symptoms') && styles.inputError]}
              value={symptoms}
              onChangeText={(text) => {
                setSymptoms(text);
              }}
              placeholder="Enter current symptoms"
              multiline
              numberOfLines={3}
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('symptoms') && <Text style={styles.errorText}>{errors.symptoms}</Text>}
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Status</Text>
          </View>
          <View style={styles.statusRadioGroup}>
            <TouchableOpacity
              style={[styles.statusOption, status === 'Active' && styles.statusOptionSelected]}
              onPress={() => setStatus('Active')}
            >
              <View style={styles.statusIconContainer}>
                <AlertCircle size={18} color={status === 'Active' ? '#4299e1' : '#718096'} />
              </View>
              <Text style={[styles.statusText, status === 'Active' && styles.statusTextSelected]}>Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, status === 'Critical' && styles.statusOptionSelected]}
              onPress={() => setStatus('Critical')}
            >
              <View style={styles.statusIconContainer}>
                <AlertCircle size={18} color={status === 'Critical' ? '#e53e3e' : '#718096'} />
              </View>
              <Text style={[styles.statusText, status === 'Critical' && styles.statusTextSelected]}>Critical</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formItem}>
          <View style={styles.inputLabel}>
            <Text style={styles.inputLabelText}>Complaint</Text>
            <MandatoryFieldIndicator />
          </View>
          <View style={styles.inputContainer}>
            <FileText size={20} color="#4299e1" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputWithIcon, styles.textArea, hasError('complaint') && styles.inputError]}
              value={complaint}
              onChangeText={(text) => {
                setComplaint(text);
              }}
              placeholder="Enter patient's primary complaint"
              multiline
              numberOfLines={4}
              placeholderTextColor="#718096"
            />
          </View>
          {hasError('complaint') && <Text style={styles.errorText}>{errors.complaint}</Text>}
        </View>
      </View>
      
      <View style={styles.formActions}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleFormSubmission}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.submitButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.buttonContentContainer}>
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Patient' : 'Register Patient'}
              </Text>
              <ArrowRight size={20} color="#fff" style={styles.submitIcon} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdowns */}
      {renderDropdownModal(
        showStatusDropdown,
        () => setShowStatusDropdown(false),
        [...STATUS_OPTIONS],
        (value) => setPatientData({ ...patientData, status: value as StatusType }),
        patientData.status
      )}

      {renderDropdownModal(
        showBloodGroupDropdown,
        () => setShowBloodGroupDropdown(false),
        BLOOD_GROUPS,
        (selected) => {
          console.log("Blood group selected:", selected);
          setBloodGroup(selected);
        },
        bloodGroup
      )}

      {renderDropdownModal(
        showWeightDropdown,
        () => setShowWeightDropdown(false),
        WEIGHT_OPTIONS,
        (value) => setPatientData({ ...patientData, weight: value }),
        patientData.weight
      )}

      {/* Gender Picker Modal */}
      <Modal
        transparent={true}
        visible={showGenderPicker}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowGenderPicker(false)}
              >
                <X size={20} color="#4a5568" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerOptions}>
              <TouchableOpacity 
                style={styles.pickerOption}
                onPress={() => {
                  setGender('Male');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, gender === 'Male' && styles.pickerOptionSelected]}>Male</Text>
                {gender === 'Male' && (
                  <View style={styles.pickerCheckmark}>
                    <ClipboardCheck size={18} color="#4299e1" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.pickerOption}
                onPress={() => {
                  setGender('Female');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, gender === 'Female' && styles.pickerOptionSelected]}>Female</Text>
                {gender === 'Female' && (
                  <View style={styles.pickerCheckmark}>
                    <ClipboardCheck size={18} color="#4299e1" />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.pickerOption}
                onPress={() => {
                  setGender('Other');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerOptionText, gender === 'Other' && styles.pickerOptionSelected]}>Other</Text>
                {gender === 'Other' && (
                  <View style={styles.pickerCheckmark}>
                    <ClipboardCheck size={18} color="#4299e1" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeader: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 8,
    backgroundColor: '#ebf8ff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#bee3f8',
    zIndex: 10,
  },
  hospitalName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#1a365d',
  },
  hospitalSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#4a5568',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2d3748',
    marginBottom: 10,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4299e1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.84,
    elevation: 2,
    width: '40%',
  },
  scanButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#2d3748',
    marginLeft: 10,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  formItem: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabelText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#4a5568',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#2d3748',
  },
  inputError: {
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  placeholderText: {
    color: '#718096',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#ebf8ff',
    borderColor: '#4299e1',
  },
  radioText: {
    color: '#4a5568',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  radioTextSelected: {
    color: '#2b6cb0',
    fontFamily: 'Poppins_500Medium',
  },
  formActions: {
    marginTop: 16,
  },
  disabledRegistration: {
    backgroundColor: '#f7fafc',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  disabledRegistrationText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  validationSummary: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
    borderRadius: 8,
    marginBottom: 24,
    padding: 16,
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#c53030',
    marginLeft: 8,
  },
  validationErrorList: {
    marginLeft: 8,
  },
  validationErrorItem: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  validationErrorItemDot: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#c53030',
    marginRight: 8,
  },
  validationErrorItemText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#c53030',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  closeButtonText: {
    fontFamily: 'Poppins_500Medium',
    color: '#1a365d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxHeight: '50%',
  },
  dropdownItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f7fafc',
  },
  dropdownItemSelected: {
    backgroundColor: '#4299e1',
  },
  dropdownItemText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  inputWithIcon: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#2d3748',
    paddingVertical: 12,
    paddingRight: 12,
  },
  dropdownContainer: {
    paddingVertical: 12,
  },
  dropdownText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#2d3748',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
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
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pickerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#2d3748',
  },
  pickerOptions: {
    paddingVertical: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerOptionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#4a5568',
  },
  pickerOptionSelected: {
    color: '#4299e1',
    fontFamily: 'Poppins_500Medium',
  },
  pickerCheckmark: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRadioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '48%',
  },
  statusOptionSelected: {
    borderColor: '#4299e1',
    backgroundColor: '#ebf8ff',
  },
  statusIconContainer: {
    marginRight: 10,
  },
  statusText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4a5568',
  },
  statusTextSelected: {
    fontFamily: 'Poppins_500Medium',
    color: '#2d3748',
  },
  formHeader: {
    marginBottom: 16,
  },
  formHeaderTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#2d3748',
    marginBottom: 4,
  },
  mandatoryFieldNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#718096',
  },
  mandatoryAsterisk: {
    color: '#e53e3e',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 6,
  },
  required: {
    color: '#e53e3e',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  loadingText: {
    color: '#4299e1',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  warningText: {
    color: '#ed8936',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginTop: 4,
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEECEC',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  disabledBannerText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#9B2C2C',
    marginLeft: 8,
  },
  disabledInput: {
    backgroundColor: '#f7fafc',
    color: '#a0aec0',
  },
  submitButton: {
    backgroundColor: '#4299e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 8,
  },
  existingPatientText: {
    color: '#38a169',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tickMarkContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#38a169',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalLoadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
});