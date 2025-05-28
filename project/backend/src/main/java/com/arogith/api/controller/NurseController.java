package com.arogith.api.controller;

import com.arogith.api.dto.NurseDTO;
import com.arogith.api.model.Nurse;
import com.arogith.api.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nurses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NurseController {

    private final NurseService nurseService;

    @GetMapping
    public ResponseEntity<List<NurseDTO>> getAllNurses() {
        List<NurseDTO> nurses = nurseService.getAllNurses().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nurses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NurseDTO> getNurseById(@PathVariable String id) {
        return nurseService.getNurseById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/find-by-nurse-id/{nurseId}")
    public ResponseEntity<NurseDTO> getNurseByNurseId(@PathVariable String nurseId) {
        return nurseService.getNurseByNurseId(nurseId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NurseDTO> createNurse(@RequestBody Nurse nurse) {
        if (nurseService.existsByNurseId(nurse.getNurseId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        nurse.setCreatedAt(LocalDateTime.now());
        Nurse savedNurse = nurseService.saveNurse(nurse);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedNurse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NurseDTO> updateNurse(@PathVariable String id, @RequestBody Nurse nurse) {
        if (!nurseService.getNurseById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        nurse.setNurseId(id);
        Nurse updatedNurse = nurseService.saveNurse(nurse);
        return ResponseEntity.ok(convertToDTO(updatedNurse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNurse(@PathVariable String id) {
        if (!nurseService.getNurseById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        nurseService.deleteNurse(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/status/{nurseId}")
    public ResponseEntity<String> updateNurseStatus(@PathVariable String nurseId, @RequestParam String status) {
        boolean updated = nurseService.updateNurseStatus(nurseId, status);
        if (updated) {
            return ResponseEntity.ok("Status updated successfully");
        } else {
            return ResponseEntity.status(404).body("Nurse not found");
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<NurseDTO>> getActiveNurses() {
        List<NurseDTO> nurses = nurseService.getNursesByStatus("Active").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nurses);
    }
    
    private NurseDTO convertToDTO(Nurse nurse) {
        return NurseDTO.builder()
                .nurse_id(nurse.getNurseId())
                .name(nurse.getName())
                .email(nurse.getEmail())
                .role(nurse.getRole())
                .status(nurse.getStatus())
                .build();
    }
} 