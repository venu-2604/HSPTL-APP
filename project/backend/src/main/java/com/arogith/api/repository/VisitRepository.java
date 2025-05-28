package com.arogith.api.repository;

import com.arogith.api.model.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByPatientPatientId(String patientId);
    List<Visit> findByPatientPatientIdOrderByVisitDateDesc(String patientId);
} 