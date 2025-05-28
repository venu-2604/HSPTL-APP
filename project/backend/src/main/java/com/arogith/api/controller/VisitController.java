package com.arogith.api.controller;

import com.arogith.api.model.Visit;
import com.arogith.api.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VisitController {

    private final VisitService visitService;
    
    @GetMapping
    public ResponseEntity<List<Visit>> getAllVisits() {
        return ResponseEntity.ok(visitService.getAllVisits());
    }
    
    @GetMapping("/{visitId}")
    public ResponseEntity<Visit> getVisitById(@PathVariable Long visitId) {
        return visitService.getVisitById(visitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Visit>> getVisitsByPatientId(@PathVariable String patientId) {
        return ResponseEntity.ok(visitService.getVisitsByPatientId(patientId));
    }
    
    @GetMapping("/patient/{patientId}/recent")
    public ResponseEntity<List<Visit>> getVisitsByPatientIdOrderedByDate(@PathVariable String patientId) {
        return ResponseEntity.ok(visitService.getVisitsByPatientIdOrderedByDate(patientId));
    }
    
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<Visit> createVisit(@PathVariable String patientId, @RequestBody Visit visit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(visitService.createVisit(patientId, visit));
    }
    
    @PutMapping("/{visitId}")
    public ResponseEntity<Visit> updateVisit(@PathVariable Long visitId, @RequestBody Visit visit) {
        if (!visitService.getVisitById(visitId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(visitService.updateVisit(visitId, visit));
    }
    
    @DeleteMapping("/{visitId}")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long visitId) {
        if (!visitService.getVisitById(visitId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        visitService.deleteVisit(visitId);
        return ResponseEntity.noContent().build();
    }
} 