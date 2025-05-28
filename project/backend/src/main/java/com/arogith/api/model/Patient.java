package com.arogith.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    
    @Id
    @Column(name = "patient_id")
    private String patientId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String surname;
    
    @Column(name = "father_name")
    private String fatherName;
    
    private String gender;
    
    private Integer age;
    
    private String address;
    
    @Column(name = "blood_group")
    private String bloodGroup;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "aadhar_number", unique = true, nullable = false)
    private String aadharNumber;
    
    @Column(name = "photo")
    private String photo;
    
    @Column(name = "total_visits", columnDefinition = "INT DEFAULT 0")
    private Integer totalVisits = 0;
    
    @Column(name = "op_no", unique = true)
    private String opNo;
    
    @Column(name = "reg_no", unique = true)
    private String regNo;
} 