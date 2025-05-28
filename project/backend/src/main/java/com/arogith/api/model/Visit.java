package com.arogith.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "visit_id")
    private Long visitId;
    
    @Column(name = "visit_date", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime visitDate;
    
    private String bp;
    
    private String complaint;
    
    @Column(name = "symptoms")
    private String symptoms;
    
    @Column(name = "op_no")
    private String opNo;
    
    @Column(name = "reg_no")
    private String regNo;
    
    private String status;
    
    private String temperature;
    
    private String weight;
    
    private String prescription;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "patient_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Patient patient;
    
    // This field maps directly to the patient_id column in the database
    @Column(name = "patient_id")
    private String patientId;
    
    /**
     * Helper method to set patient ID from Patient entity.
     * This should be called when the patient entity is set.
     */
    public void setPatient(Patient patient) {
        this.patient = patient;
        if (patient != null) {
            this.patientId = patient.getPatientId();
        }
    }
    
    /**
     * Helper method to get patient ID from associated Patient entity.
     * @return the patient ID or null if no patient is associated
     */
    public String getPatientId() {
        if (this.patientId != null) {
            return this.patientId;
        }
        return this.patient != null ? this.patient.getPatientId() : null;
    }
} 