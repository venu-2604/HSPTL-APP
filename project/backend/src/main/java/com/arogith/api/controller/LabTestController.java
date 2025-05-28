package com.arogith.api.controller;

import com.arogith.api.model.LabTest;
import com.arogith.api.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labtests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LabTestController {

    private final LabTestService labTestService;
    
    @GetMapping
    public ResponseEntity<List<LabTest>> getAllLabTests() {
        return ResponseEntity.ok(labTestService.getAllLabTests());
    }
    
    @GetMapping("/{testId}")
    public ResponseEntity<LabTest> getLabTestById(@PathVariable Long testId) {
        return labTestService.getLabTestById(testId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabTest>> getLabTestsByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(labTestService.getLabTestsByPatientId(patientId));
    }
    
    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<LabTest>> getLabTestsByVisitId(@PathVariable Long visitId) {
        return ResponseEntity.ok(labTestService.getLabTestsByVisitId(visitId));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LabTest>> getLabTestsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(labTestService.getLabTestsByStatus(status));
    }
    
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<LabTest> createLabTestForPatient(
            @PathVariable String patientId,
            @RequestBody LabTest labTest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labTestService.createLabTest(patientId, null, labTest));
    }
    
    @PostMapping("/patient/{patientId}/visit/{visitId}")
    public ResponseEntity<LabTest> createLabTestForVisit(
            @PathVariable String patientId,
            @PathVariable Long visitId,
            @RequestBody LabTest labTest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labTestService.createLabTest(patientId, visitId, labTest));
    }
    
    @PutMapping("/{testId}")
    public ResponseEntity<LabTest> updateLabTest(@PathVariable Long testId, @RequestBody LabTest labTest) {
        if (!labTestService.getLabTestById(testId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(labTestService.updateLabTest(testId, labTest));
    }
    
    @PatchMapping("/{testId}/result")
    public ResponseEntity<LabTest> updateLabTestResult(
            @PathVariable Long testId,
            @RequestBody Map<String, String> resultData) {
        
        if (!labTestService.getLabTestById(testId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        String result = resultData.get("result");
        String status = resultData.get("status");
        
        return ResponseEntity.ok(labTestService.updateLabTestResult(testId, result, status));
    }
    
    @DeleteMapping("/{testId}")
    public ResponseEntity<Void> deleteLabTest(@PathVariable Long testId) {
        if (!labTestService.getLabTestById(testId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        labTestService.deleteLabTest(testId);
        return ResponseEntity.noContent().build();
    }
} 