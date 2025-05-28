package com.arogith.api.service;

import com.arogith.api.model.Nurse;

import java.util.List;
import java.util.Optional;

public interface NurseService {
    List<Nurse> getAllNurses();
    Optional<Nurse> getNurseById(String id);
    Optional<Nurse> getNurseByNurseId(String nurseId);
    Nurse saveNurse(Nurse nurse);
    void deleteNurse(String id);
    boolean existsByNurseId(String nurseId);
    boolean existsByEmail(String email);
    boolean validateCredentials(String nurseId, String password);
    boolean updateNurseStatus(String nurseId, String status);
    List<Nurse> getNursesByStatus(String status);
} 