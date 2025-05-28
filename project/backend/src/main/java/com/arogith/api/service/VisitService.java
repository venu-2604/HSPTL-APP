package com.arogith.api.service;

import com.arogith.api.model.Patient;
import com.arogith.api.model.Visit;
import com.arogith.api.repository.PatientRepository;
import com.arogith.api.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VisitService {

    private static final Logger logger = LoggerFactory.getLogger(VisitService.class);

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    
    public List<Visit> getAllVisits() {
        logger.debug("Getting all visits");
        return visitRepository.findAll();
    }
    
    public Optional<Visit> getVisitById(Long visitId) {
        logger.debug("Getting visit by ID: {}", visitId);
        return visitRepository.findById(visitId);
    }
    
    public List<Visit> getVisitsByPatientId(String patientId) {
        logger.debug("Getting visits for patient ID: {}", patientId);
        return visitRepository.findByPatientPatientId(patientId);
    }
    
    public List<Visit> getVisitsByPatientIdOrderedByDate(String patientId) {
        logger.debug("Getting visits ordered by date for patient ID: {}", patientId);
        return visitRepository.findByPatientPatientIdOrderByVisitDateDesc(patientId);
    }
    
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public Visit createVisit(String patientId, Visit visit) {
        logger.debug("Creating visit for patient ID: {}", patientId);
        
        // First check if the patient ID is already set in the visit
        if (visit.getPatientId() == null) {
            logger.debug("Setting patient ID in the visit object to: {}", patientId);
            visit.setPatientId(patientId);
        } else if (!visit.getPatientId().equals(patientId)) {
            logger.warn("Visit has patient ID {} but method was called with patient ID {}", 
                        visit.getPatientId(), patientId);
            // Prioritize the method parameter over the visit object
            visit.setPatientId(patientId);
        }
        
        // Find the patient - catch and handle exception to prevent transaction rollback
        Patient patient;
        try {
            patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> {
                        logger.error("Patient not found with ID: {}", patientId);
                        return new RuntimeException("Patient not found with id: " + patientId);
                    });
            
            logger.debug("Found patient: {}", patient.getPatientId());
        } catch (Exception e) {
            logger.error("Error finding patient {}: {}", patientId, e.getMessage());
            throw new RuntimeException("Patient lookup failed: " + e.getMessage());
        }
        
        // Set defaults if not provided
        if (visit.getVisitDate() == null) {
            logger.debug("Setting visit date to current time");
            visit.setVisitDate(LocalDateTime.now());
        }
        
        // Set default status if not provided
        if (visit.getStatus() == null || visit.getStatus().isEmpty()) {
            logger.debug("Setting default status to 'Active'");
            visit.setStatus("Active");
        }
        
        // IMPORTANT: We no longer set the patient object
        // Only set the patient ID since we're using insertable=false, updatable=false in the JPA mapping
        // This avoids JPA trying to manage the relationship from both sides
        
        logger.debug("About to save visit with patientId: {}", visit.getPatientId());
        
        try {
            // Save visit (triggers will handle formatting of OP_NO and REG_NO and updating patient's total_visits)
            Visit savedVisit = visitRepository.save(visit);
            logger.info("Successfully created visit with ID: {} for patient: {}", 
                       savedVisit.getVisitId(), patientId);
            return savedVisit;
        } catch (Exception e) {
            logger.error("Error saving visit for patient {}: {}", patientId, e.getMessage(), e);
            throw new RuntimeException("Failed to create visit: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public Visit updateVisit(Long visitId, Visit visitDetails) {
        logger.debug("Updating visit with ID: {}", visitId);
        
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> {
                    logger.error("Visit not found with ID: {}", visitId);
                    return new RuntimeException("Visit not found with id: " + visitId);
                });
        
        // Update fields
        visit.setBp(visitDetails.getBp());
        visit.setComplaint(visitDetails.getComplaint());
        visit.setSymptoms(visitDetails.getSymptoms());
        visit.setOpNo(visitDetails.getOpNo());
        visit.setStatus(visitDetails.getStatus());
        visit.setTemperature(visitDetails.getTemperature());
        visit.setWeight(visitDetails.getWeight());
        visit.setPrescription(visitDetails.getPrescription());
        
        logger.debug("About to save updated visit: {}", visit);
        
        try {
            Visit updatedVisit = visitRepository.save(visit);
            logger.info("Successfully updated visit with ID: {}", visitId);
            return updatedVisit;
        } catch (Exception e) {
            logger.error("Error updating visit {}: {}", visitId, e.getMessage(), e);
            throw new RuntimeException("Failed to update visit: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public void deleteVisit(Long visitId) {
        logger.debug("Deleting visit with ID: {}", visitId);
        
        try {
            visitRepository.deleteById(visitId);
            logger.info("Successfully deleted visit with ID: {}", visitId);
        } catch (Exception e) {
            logger.error("Error deleting visit {}: {}", visitId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete visit: " + e.getMessage(), e);
        }
    }
} 