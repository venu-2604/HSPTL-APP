package com.arogith.api.controller;

import com.arogith.api.model.Patient;
import com.arogith.api.model.Visit;
import com.arogith.api.service.PatientService;
import com.arogith.api.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);
    
    private final PatientService patientService;
    private final VisitService visitService;
    
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        logger.debug("Getting all patients");
        return ResponseEntity.ok(patientService.getAllPatients());
    }
    
    @GetMapping("/{patientId}")
    public ResponseEntity<Patient> getPatientById(@PathVariable String patientId) {
        logger.debug("Getting patient with ID: {}", patientId);
        return patientService.getPatientById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/aadhar/{aadharNumber}")
    public ResponseEntity<Patient> getPatientByAadhar(@PathVariable String aadharNumber) {
        logger.debug("Getting patient with Aadhar: {}", aadharNumber);
        return patientService.getPatientByAadhar(aadharNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Transactional(rollbackFor = Exception.class, noRollbackFor = {IllegalArgumentException.class})
    public ResponseEntity<?> createPatient(@RequestBody Map<String, Object> requestBody) {
        try {
            // Log the incoming request
            logger.info("Received POST request to create patient: {}", requestBody);
            
            // Extract patient data
            Patient patient = new Patient();
            
            // If this is a nested structure (from frontend), extract the patient object
            Map<String, Object> patientData = requestBody;
            if (requestBody.containsKey("patient")) {
                patientData = (Map<String, Object>) requestBody.get("patient");
                logger.debug("Found nested patient data structure");
            }
            
            // Check for missing required fields
            if (patientData.get("name") == null || patientData.get("surname") == null) {
                logger.warn("Required fields missing in patient creation request");
                return ResponseEntity.badRequest().body(Map.of("error", "Name and surname are required"));
            }
            
            // Extract all patient fields
            patient.setName((String) patientData.get("name"));
            patient.setSurname((String) patientData.get("surname"));
            
            // Handle different field naming conventions
            String fatherName = (String) patientData.get("fatherName");
            if (fatherName == null) {
                fatherName = (String) patientData.get("father_name");
            }
            patient.setFatherName(fatherName);
            
            patient.setGender((String) patientData.get("gender"));
            
            // Handle age with various possible types
            Object ageObj = patientData.get("age");
            if (ageObj != null) {
                if (ageObj instanceof Number) {
                    patient.setAge(((Number) ageObj).intValue());
                } else {
                    try {
                        patient.setAge(Integer.parseInt(ageObj.toString()));
                    } catch (NumberFormatException e) {
                        logger.warn("Invalid age format: {}", ageObj);
                        patient.setAge(0);
                    }
                }
            } else {
                patient.setAge(0);
            }
            
            patient.setAddress((String) patientData.get("address"));
            
            // Handle different field naming conventions for blood group
            String bloodGroup = (String) patientData.get("bloodGroup");
            if (bloodGroup == null) {
                bloodGroup = (String) patientData.get("blood_group");
            }
            patient.setBloodGroup(bloodGroup);
            
            // Handle different field naming conventions for phone
            String phoneNumber = (String) patientData.get("phoneNumber");
            if (phoneNumber == null) {
                phoneNumber = (String) patientData.get("phone_number");
            }
            if (phoneNumber == null) {
                phoneNumber = (String) patientData.get("phone");
            }
            patient.setPhoneNumber(phoneNumber);
            
            // Handle different field naming conventions for aadhar
            String aadharNumber = (String) patientData.get("aadharNumber");
            if (aadharNumber == null) {
                aadharNumber = (String) patientData.get("aadhar_number");
            }
            patient.setAadharNumber(aadharNumber);
            
            // Validate Aadhar number
            if (aadharNumber == null || aadharNumber.isEmpty()) {
                logger.warn("Aadhar number is missing");
                return ResponseEntity.badRequest().body(Map.of("error", "Aadhar number is required"));
            }
            
            // Check if Aadhar already exists
            if (patientService.existsByAadhar(patient.getAadharNumber())) {
                logger.warn("Aadhar number already exists: {}", patient.getAadharNumber());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("error", "Patient with this Aadhar number already exists")
                );
            }
            
            // Generate a patient ID if not provided
            if (patient.getPatientId() == null || patient.getPatientId().isEmpty()) {
                // Let the service generate the ID using the sequential format
                long count = patientService.count() + 1;
                String patientId = String.format("%03d", count);
                patient.setPatientId(patientId);
                logger.debug("Generated patient ID: {}", patientId);
            }
            
            // Initialize totalVisits to 0
            patient.setTotalVisits(0);
            
            // Important: Set photo to empty string to avoid type mismatch issues
            if (patient.getPhoto() == null) {
                patient.setPhoto("");
            }
            
            logger.debug("Constructed patient object: {}", patient);
            
            // Create patient in a separate transaction
            try {
                // Handle photo field explicitly to avoid type mismatch
                // This is a critical fix for the bytea/bigint type issue
                try {
                    logger.info("Creating patient with explicit SQL to avoid photo type issues");
                    // First create the patient without the photo field
                    Patient newPatient = new Patient();
                    newPatient.setPatientId(patient.getPatientId());
                    newPatient.setName(patient.getName());
                    newPatient.setSurname(patient.getSurname());
                    newPatient.setFatherName(patient.getFatherName());
                    newPatient.setGender(patient.getGender());
                    newPatient.setAge(patient.getAge());
                    newPatient.setAddress(patient.getAddress());
                    newPatient.setBloodGroup(patient.getBloodGroup());
                    newPatient.setPhoneNumber(patient.getPhoneNumber());
                    newPatient.setAadharNumber(patient.getAadharNumber());
                    newPatient.setTotalVisits(0);
                    // Do not set photo field
                    
                    Patient createdPatient = patientService.createPatientWithoutPhoto(newPatient);
                    logger.info("Patient created successfully without photo field: {}", createdPatient.getPatientId());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("patientId", createdPatient.getPatientId());
                    response.put("message", "Patient registered successfully");
                    
                    // Extract and process visit data if present - do this in a separate non-transactional call
                    createVisitIfNeeded(requestBody, createdPatient.getPatientId(), response);
                    
                    return ResponseEntity.status(HttpStatus.CREATED).body(response);
                    
                } catch (Exception ex) {
                    logger.error("Failed with custom approach. Error: {}", ex.getMessage());
                    throw ex;
                }
            } catch (Exception e) {
                // Fall back to original method if the custom approach fails
                logger.warn("Falling back to original patient creation method. Error was: {}", e.getMessage());
                Patient createdPatient = patientService.createPatient(patient);
                logger.info("Successfully created patient with ID: {}", createdPatient.getPatientId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("patientId", createdPatient.getPatientId());
                response.put("message", "Patient registered successfully");
                
                // Extract and process visit data if present - do this in a separate non-transactional call
                createVisitIfNeeded(requestBody, createdPatient.getPatientId(), response);
                
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error creating patient: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
    
    /**
     * Helper method to create a visit for a patient in a separate non-transactional context
     */
    private void createVisitIfNeeded(Map<String, Object> requestBody, String patientId, Map<String, Object> response) {
        try {
            Map<String, Object> visitData = null;
            if (requestBody.containsKey("visit")) {
                visitData = (Map<String, Object>) requestBody.get("visit");
            }
            
            if (visitData != null) {
                Visit visit = new Visit();
                String bp = (String) visitData.get("bp");
                String complaint = (String) visitData.get("complaint");
                String symptoms = (String) visitData.get("symptoms");
                if (symptoms == null) {
                    symptoms = (String) visitData.get("current_condition");
                }
                if (symptoms == null) {
                    symptoms = (String) visitData.get("currentCondition");
                }
                visit.setBp(bp);
                visit.setComplaint(complaint);
                visit.setSymptoms(symptoms);
                visit.setStatus((String) visitData.get("status"));
                visit.setTemperature((String) visitData.get("temperature"));
                visit.setWeight((String) visitData.get("weight"));
                visit.setPatientId(patientId);
                
                try {
                    Visit createdVisit = visitService.createVisit(patientId, visit);
                    response.put("visitId", createdVisit.getVisitId());
                    response.put("visitMessage", "Visit created successfully");
                    logger.info("Successfully created visit for patient: {}", patientId);
                } catch (Exception e) {
                    logger.error("Failed to create visit: {}", e.getMessage());
                    response.put("visitError", "Failed to create visit: " + e.getMessage());
                    // Continue even if visit creation fails
                }
            }
        } catch (Exception e) {
            logger.error("Error processing visit data: {}", e.getMessage(), e);
            response.put("visitError", "Failed to process visit data: " + e.getMessage());
        }
    }
    
    @PutMapping("/{patientId}")
    public ResponseEntity<?> updatePatient(@PathVariable String patientId, @RequestBody Patient patient) {
        logger.debug("Updating patient with ID: {}", patientId);
        try {
            if (!patientService.getPatientById(patientId).isPresent()) {
                logger.warn("Patient not found for update: {}", patientId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Patient not found with ID: " + patientId));
            }
            
            // Log the update request data
            logger.debug("Update request data: {}", patient);
            
            Patient updatedPatient = patientService.updatePatient(patientId, patient);
            logger.info("Successfully updated patient: {}", patientId);
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            logger.error("Error updating patient {}: {}", patientId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Failed to update patient",
                    "message", e.getMessage(),
                    "patientId", patientId
                ));
        }
    }
    
    @DeleteMapping("/{patientId}")
    public ResponseEntity<Void> deletePatient(@PathVariable String patientId) {
        logger.debug("Deleting patient with ID: {}", patientId);
        if (!patientService.getPatientById(patientId).isPresent()) {
            logger.warn("Patient not found for deletion: {}", patientId);
            return ResponseEntity.notFound().build();
        }
        patientService.deletePatient(patientId);
        logger.info("Successfully deleted patient: {}", patientId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/check-aadhar/{aadharNumber}")
    public ResponseEntity<Object> checkAadharExists(@PathVariable String aadharNumber) {
        logger.debug("Checking if Aadhar exists: {}", aadharNumber);
        Optional<Patient> patient = patientService.getPatientByAadhar(aadharNumber);
        if (patient.isPresent()) {
            logger.debug("Aadhar {} exists for patient: {}", aadharNumber, patient.get().getPatientId());
            return ResponseEntity.ok(patient.get());
        } else {
            logger.debug("Aadhar {} does not exist", aadharNumber);
            return ResponseEntity.ok(false);
        }
    }
    
    // Add a general exception handler for this controller
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        logger.error("Unhandled exception in PatientController: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Server error: " + e.getMessage()));
    }
} 