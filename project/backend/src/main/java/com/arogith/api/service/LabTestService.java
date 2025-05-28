package com.arogith.api.service;

import com.arogith.api.model.LabTest;
import com.arogith.api.model.Patient;
import com.arogith.api.model.Visit;
import com.arogith.api.repository.LabTestRepository;
import com.arogith.api.repository.PatientRepository;
import com.arogith.api.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LabTestService {

    private final LabTestRepository labTestRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    
    public List<LabTest> getAllLabTests() {
        return labTestRepository.findAll();
    }
    
    public Optional<LabTest> getLabTestById(Long testId) {
        return labTestRepository.findById(testId);
    }
    
    public List<LabTest> getLabTestsByPatientId(String patientId) {
        return labTestRepository.findByPatientPatientId(patientId);
    }
    
    public List<LabTest> getLabTestsByVisitId(Long visitId) {
        return labTestRepository.findByVisitVisitId(visitId);
    }
    
    public List<LabTest> getLabTestsByStatus(String status) {
        return labTestRepository.findByStatus(status);
    }
    
    public LabTest createLabTest(String patientId, Long visitId, LabTest labTest) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
                
        Visit visit = null;
        if (visitId != null) {
            visit = visitRepository.findById(visitId)
                    .orElseThrow(() -> new RuntimeException("Visit not found with id: " + visitId));
        }
        
        // Set default values if not provided
        if (labTest.getStatus() == null) {
            labTest.setStatus("Pending");
        }
        
        if (labTest.getTestGivenAt() == null) {
            labTest.setTestGivenAt(LocalDateTime.now());
        }
        
        // Associate with patient and visit
        labTest.setPatient(patient);
        labTest.setVisit(visit);
        
        return labTestRepository.save(labTest);
    }
    
    public LabTest updateLabTest(Long testId, LabTest labTestDetails) {
        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + testId));
        
        // Update fields
        labTest.setTestName(labTestDetails.getTestName());
        labTest.setResult(labTestDetails.getResult());
        labTest.setReferenceRange(labTestDetails.getReferenceRange());
        labTest.setStatus(labTestDetails.getStatus());
        
        // Don't update these associations
        // labTest.setPatient(labTestDetails.getPatient());
        // labTest.setVisit(labTestDetails.getVisit());
        
        // resultUpdatedAt is handled by the database trigger
        
        return labTestRepository.save(labTest);
    }
    
    public LabTest updateLabTestResult(Long testId, String result, String status) {
        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + testId));
        
        labTest.setResult(result);
        
        if (status != null) {
            labTest.setStatus(status);
        } else {
            labTest.setStatus("Completed");
        }
        
        // resultUpdatedAt is handled by the database trigger
        
        return labTestRepository.save(labTest);
    }
    
    public void deleteLabTest(Long testId) {
        labTestRepository.deleteById(testId);
    }
} 