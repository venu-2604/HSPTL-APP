package com.arogith.api.repository;

import com.arogith.api.model.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, String> {
    Optional<Nurse> findByNurseId(String nurseId);
    boolean existsByNurseId(String nurseId);
    boolean existsByEmail(String email);
    List<Nurse> findByStatusIgnoreCase(String status);
} 