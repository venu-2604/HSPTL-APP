import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

// Define patient interface
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  registeredDate: string;
}

// API URL
const API_URL = 'http://localhost:8084/api';

export default function PatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patients data from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/patients`);
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched patients data:', data);
      
      // Transform the data to match our Patient interface if needed
      const formattedPatients = data.map((patient: any) => ({
        id: patient.patientId || patient.id || String(patient._id),
        name: `${patient.name || ''} ${patient.surname || ''}`.trim(),
        age: patient.age || calculateAge(patient.dateOfBirth),
        gender: patient.gender || 'Not specified',
        registeredDate: formatDate(patient.registeredDate || new Date().toISOString())
      }));
      
      setPatients(formattedPatients);
      setFilteredPatients(formattedPatients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from date of birth if needed
  const calculateAge = (dateOfBirth: string | undefined): number => {
    if (!dateOfBirth) return 0;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date to a readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Filter patients based on search query
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  // Load patients when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.patientName}>{item.name}</Text>
      <View style={styles.patientInfo}>
        <Text style={styles.infoText}>Age: {item.age}</Text>
        <Text style={styles.infoText}>Gender: {item.gender}</Text>
      </View>
      <Text style={styles.dateText}>Registered: {item.registeredDate}</Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#4299e1" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.emptyText}>No patients found</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registered Patients</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#4a5568" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#4a5568"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyList}
        refreshing={loading}
        onRefresh={fetchPatients}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    backgroundColor: '#f7fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1a365d',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  patientName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1a365d',
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4a5568',
    marginRight: 16,
  },
  dateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
  },
});