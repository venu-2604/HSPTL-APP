package com.arogith.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NurseDTO {
    private String nurse_id;
    private String name;
    private String email;
    private String role;
    private String status;
} 