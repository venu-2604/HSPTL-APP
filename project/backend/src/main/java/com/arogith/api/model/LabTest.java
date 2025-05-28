package com.arogith.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "labtests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabTest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long testId;
    
    @Column(name = "test_name")
    private String testName;
    
    private String result;
    
    @Column(name = "reference_range")
    private String referenceRange;
    
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'Pending'")
    private String status = "Pending";
    
    @ManyToOne
    @JoinColumn(name = "visit_id")
    private Visit visit;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "patient_id")
    private Patient patient;
    
    @Column(name = "test_given_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime testGivenAt;
    
    @Column(name = "result_updated_at")
    private LocalDateTime resultUpdatedAt;
} 