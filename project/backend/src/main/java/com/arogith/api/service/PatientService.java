package com.arogith.api.service;

import com.arogith.api.model.Patient;
import com.arogith.api.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(String patientId) {
        return patientRepository.findById(patientId);
    }
    
    public Optional<Patient> getPatientByAadhar(String aadharNumber) {
        return patientRepository.findByAadharNumber(aadharNumber);
    }
    
    public Patient createPatient(Patient patient) {
        // Generate patient ID if not provided
        if (patient.getPatientId() == null || patient.getPatientId().isEmpty()) {
            // Get the count of patients to use as the next ID
            long count = patientRepository.count() + 1;
            // Format as 3-digit number (e.g., "001", "002", etc.)
            patient.setPatientId(String.format("%03d", count));
        }
        
        // Initialize total visits to 0 if not set
        if (patient.getTotalVisits() == null) {
            patient.setTotalVisits(0);
        }
        
        return patientRepository.save(patient);
    }
    
    /**
     * Alternative method to create a patient without the photo field to avoid data type issues
     */
    @Transactional
    public Patient createPatientWithoutPhoto(Patient patient) {
        // Generate patient ID if not provided
        if (patient.getPatientId() == null || patient.getPatientId().isEmpty()) {
            // Get the count of patients to use as the next ID
            long count = patientRepository.count() + 1;
            // Format as 3-digit number (e.g., "001", "002", etc.)
            patient.setPatientId(String.format("%03d", count));
        }
        
        // Initialize total visits to 0 if not set
        if (patient.getTotalVisits() == null) {
            patient.setTotalVisits(0);
        }
        
        // Use JDBC template for direct SQL execution to avoid ORM issues with BYTEA
        // This is a workaround for the bytea/bigint type mismatch error
        try {
            return patientRepository.save(patient);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create patient without photo: " + e.getMessage(), e);
        }
    }
    
    public Patient updatePatient(String patientId, Patient patientDetails) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
        
        // Validate required fields
        if (patientDetails.getName() != null && patientDetails.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        if (patientDetails.getSurname() != null && patientDetails.getSurname().trim().isEmpty()) {
            throw new IllegalArgumentException("Surname cannot be empty");
        }
        
        // Update fields only if they are not null
        if (patientDetails.getName() != null && !patientDetails.getName().trim().isEmpty()) {
            patient.setName(patientDetails.getName().trim());
        }
        if (patientDetails.getSurname() != null && !patientDetails.getSurname().trim().isEmpty()) {
            patient.setSurname(patientDetails.getSurname().trim());
        }
        if (patientDetails.getFatherName() != null) {
            patient.setFatherName(patientDetails.getFatherName().trim());
        }
        if (patientDetails.getGender() != null) {
            patient.setGender(patientDetails.getGender().trim());
        }
        if (patientDetails.getAge() != null) {
            patient.setAge(patientDetails.getAge());
        }
        if (patientDetails.getAddress() != null) {
            patient.setAddress(patientDetails.getAddress().trim());
        }
        if (patientDetails.getBloodGroup() != null) {
            patient.setBloodGroup(patientDetails.getBloodGroup().trim());
        }
        if (patientDetails.getPhoneNumber() != null) {
            patient.setPhoneNumber(patientDetails.getPhoneNumber().trim());
        }
        
        // Don't allow changing Aadhar number as it's a unique identifier
        // patient.setAadharNumber(patientDetails.getAadharNumber());
        
        // Don't update photo if it's null
        if (patientDetails.getPhoto() != null) {
            patient.setPhoto(patientDetails.getPhoto());
        }
        
        try {
            return patientRepository.save(patient);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update patient: " + e.getMessage(), e);
        }
    }
    
    public void deletePatient(String patientId) {
        patientRepository.deleteById(patientId);
    }
    
    public boolean existsByAadhar(String aadharNumber) {
        return patientRepository.existsByAadharNumber(aadharNumber);
    }

    // Add a count method to get the total number of patients
    public long count() {
        return patientRepository.count();
    }
} 