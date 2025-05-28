package com.arogith.api.controller;

import com.arogith.api.dto.LoginRequest;
import com.arogith.api.dto.LoginResponse;
import com.arogith.api.dto.NurseDTO;
import com.arogith.api.model.Nurse;
import com.arogith.api.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final NurseService nurseService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Auth service is up and running!");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        String nurseId = loginRequest.getNurse_id();
        String password = loginRequest.getPassword();
        
        // Check if nurse exists
        Optional<Nurse> nurseOptional = nurseService.getNurseByNurseId(nurseId);
        
        if (nurseOptional.isEmpty()) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(false)
                    .error("invalid_nurse_id")
                    .message("Nurse ID not found")
                    .build());
        }
        
        // Validate password
        Nurse nurse = nurseOptional.get();
        if (!nurse.getPassword().equals(password)) {
            return ResponseEntity.ok(LoginResponse.builder()
                    .success(false)
                    .error("invalid_password")
                    .message("Incorrect password")
                    .build());
        }
        
        // Create nurse DTO with only necessary data
        NurseDTO nurseDTO = NurseDTO.builder()
                .nurse_id(nurse.getNurseId())
                .name(nurse.getName())
                .email(nurse.getEmail())
                .build();
        
        // Return success response
        return ResponseEntity.ok(LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .nurse(nurseDTO)
                .build());
    }
} 