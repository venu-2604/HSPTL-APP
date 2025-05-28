package com.arogith.api.repository;

import com.arogith.api.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByAadharNumber(String aadharNumber);
    boolean existsByAadharNumber(String aadharNumber);
} 