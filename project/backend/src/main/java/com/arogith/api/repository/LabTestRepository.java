package com.arogith.api.repository;

import com.arogith.api.model.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByPatientPatientId(String patientId);
    List<LabTest> findByVisitVisitId(Long visitId);
    List<LabTest> findByStatus(String status);
} 