package com.arogith.api.controller;

import com.arogith.api.model.Patient;
import com.arogith.api.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    private final PatientService patientService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        logger.info("Health check endpoint called");
        Map<String, String> response = new HashMap<>();
        response.put("status", "up");
        response.put("time", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/create-test-patient")
    public ResponseEntity<Patient> createTestPatient() {
        logger.info("Creating test patient");
        
        try {
            // Generate a random unique ID for the test patient's Aadhar
            String uniqueTestId = UUID.randomUUID().toString().substring(0, 12);
            
            // Create a test patient
            Patient testPatient = new Patient();
            testPatient.setName("Test");
            testPatient.setSurname("Patient");
            testPatient.setGender("Male");
            testPatient.setAge(30);
            testPatient.setAddress("Test Address");
            testPatient.setBloodGroup("O+");
            testPatient.setPhoneNumber("1234567890");
            testPatient.setAadharNumber(uniqueTestId);
            
            // Save the patient
            Patient createdPatient = patientService.createPatient(testPatient);
            logger.info("Successfully created test patient with ID: {}", createdPatient.getPatientId());
            
            return ResponseEntity.ok(createdPatient);
        } catch (Exception e) {
            logger.error("Error creating test patient: {}", e.getMessage(), e);
            throw e; // Let the global exception handler deal with it
        }
    }

    // Add new test endpoint to check database connection
    @GetMapping("/db-connection")
    public ResponseEntity<Map<String, Object>> testDatabaseConnection() {
        logger.info("Testing database connection");
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test database connectivity by counting patients
            long patientCount = patientService.count();
            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("patientCount", patientCount);
            logger.info("Database connection test successful. Patient count: {}", patientCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Database connection error: " + e.getMessage());
            logger.error("Database connection test failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/create-simple-patient")
    public ResponseEntity<Patient> createSimplePatient() {
        logger.info("Creating simple test patient");
        
        try {
            // Generate a random unique ID for the test patient's Aadhar
            String uniqueTestId = UUID.randomUUID().toString().substring(0, 12);
            
            // Create a test patient with minimal data
            Patient testPatient = new Patient();
            testPatient.setName("SimpleTest");
            testPatient.setSurname("Patient");
            testPatient.setAadharNumber(uniqueTestId);
            testPatient.setTotalVisits(0);
            
            // Save the patient without any additional fields
            Patient createdPatient = patientService.createPatient(testPatient);
            logger.info("Successfully created simple test patient with ID: {}", createdPatient.getPatientId());
            
            return ResponseEntity.ok(createdPatient);
        } catch (Exception e) {
            logger.error("Error creating simple test patient: {}", e.getMessage(), e);
            throw e;
        }
    }
} 