import { Platform } from 'react-native';

// Standardized API configuration
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8084/api' 
  : 'http://localhost:8084/api';

// Standard error handling for API responses
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Standard field naming for patients
export interface Patient {
  patientId: string;
  name: string;
  surname: string;
  father_name?: string; // Using snake_case for API interaction
  gender?: string;
  age?: number;
  address?: string;
  blood_group?: string; // Using snake_case for API interaction
  phone_number?: string; // Using snake_case for API interaction
  aadhar_number: string; // Using snake_case for API interaction
  photo?: string;
  totalVisits: number;
}

// Standard field naming for visits
export interface Visit {
  visitId: number;
  visitDate: string;
  bp?: string;
  complaint?: string;
  symptoms?: string; // Using snake_case for API interaction
  opNo: string;
  regNo: string;
  status?: string;
  temperature?: string;
  weight?: string;
  prescription?: string;
  patient_id: string; // Using snake_case for API interaction
}

// Function to standardize field names for backend communication
export function toSnakeCase<T>(obj: T): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Recursively process nested objects and arrays
    if (Array.isArray(value)) {
      result[snakeKey] = value.map(item => 
        typeof item === 'object' && item !== null ? toSnakeCase(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      result[snakeKey] = toSnakeCase(value);
    } else {
      result[snakeKey] = value;
    }
  }
  
  return result;
}

// Function to standardize field names for frontend use
export function toCamelCase<T>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj as T;
  
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
    
    // Recursively process nested objects and arrays
    if (Array.isArray(value)) {
      result[camelKey] = value.map(item => 
        typeof item === 'object' && item !== null ? toCamelCase(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      result[camelKey] = toCamelCase(value);
    } else {
      result[camelKey] = value;
    }
  }
  
  return result as T;
}

// Standardized API request function
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  try {
    // Add default headers for JSON communication
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
      } catch (e) {
        errorMessage = await response.text() || `HTTP Error ${response.status}`;
      }
      
      throw new ApiError(errorMessage, response.status);
    }
    
    // Parse and return the response
    const data = await response.json();
    return toCamelCase<T>(data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert other errors to ApiError
    console.error('API Request Error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error',
      0
    );
  }
}

// Specific API functions for common operations
export const patientsApi = {
  // Get all patients
  getAll: () => apiRequest<Patient[]>('patients'),
  
  // Get patient by ID
  getById: (patientId: string) => apiRequest<Patient>(`patients/${patientId}`),
  
  // Check if patient exists by Aadhar
  checkAadhar: (aadharNumber: string) => 
    apiRequest<Patient | boolean>(`patients/check-aadhar/${aadharNumber}`),
  
  // Create a new patient
  create: (patientData: Partial<Patient>, visitData?: any) => {
    const payload = visitData ? { patient: patientData, visit: visitData } : patientData;
    return apiRequest<Patient>('patients', {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(payload)),
    });
  },
  
  // Update an existing patient
  update: (patientId: string, patientData: Partial<Patient>) => 
    apiRequest<Patient>(`patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(toSnakeCase(patientData)),
    }),
};

export const visitsApi = {
  // Get all visits
  getAll: () => apiRequest<Visit[]>('visits'),
  
  // Get visits for a patient
  getByPatient: (patientId: string) => apiRequest<Visit[]>(`visits/patient/${patientId}`),
  
  // Create a new visit
  create: (patientId: string, visitData: Partial<Visit>) => 
    apiRequest<Visit>(`visits/patient/${patientId}`, {
      method: 'POST',
      body: JSON.stringify(toSnakeCase(visitData)),
    }),
};

// Function to get complete patient details with visits
export const getPatientWithVisits = async (patientId: string): Promise<any> => {
  try {
    // Fetch patient data
    const patientResponse = await fetch(`${API_BASE_URL}/patients/${patientId}`);
    if (!patientResponse.ok) {
      throw new ApiError(`Failed to fetch patient: ${patientResponse.status}`, patientResponse.status);
    }
    
    const patientData = await patientResponse.json();
    const patient = toCamelCase(patientData);
    
    // Fetch visits for this patient
    const visitsResponse = await fetch(`${API_BASE_URL}/visits/patient/${patientId}`);
    if (!visitsResponse.ok) {
      throw new ApiError(`Failed to fetch visits: ${visitsResponse.status}`, visitsResponse.status);
    }
    
    const visitsData = await visitsResponse.json();
    const visits = visitsData.map((visit: any) => toCamelCase(visit));
    
    // Sort visits by date (newest first)
    visits.sort((a: any, b: any) => 
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );
    
    // Get the latest visit
    const latestVisit = visits.length > 0 ? visits[0] : null;
    
    // Combine patient and visit data
    return {
      patient,
      latestVisit,
      visits,
      // Also provide flattened fields for convenience
      combined: {
        ...patient,
        ...(latestVisit || {}),
        visitCount: visits.length
      }
    };
  } catch (error) {
    console.error('Error fetching patient with visits:', error);
    throw error;
  }
}; 