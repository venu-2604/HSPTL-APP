package com.arogith.api.service;

import com.arogith.api.model.Nurse;
import com.arogith.api.repository.NurseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {

    private final NurseRepository nurseRepository;

    @Override
    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    @Override
    public Optional<Nurse> getNurseById(String id) {
        return nurseRepository.findById(id);
    }

    @Override
    public Optional<Nurse> getNurseByNurseId(String nurseId) {
        return nurseRepository.findByNurseId(nurseId);
    }

    @Override
    public Nurse saveNurse(Nurse nurse) {
        return nurseRepository.save(nurse);
    }

    @Override
    public void deleteNurse(String id) {
        nurseRepository.deleteById(id);
    }

    @Override
    public boolean existsByNurseId(String nurseId) {
        return nurseRepository.existsByNurseId(nurseId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return nurseRepository.existsByEmail(email);
    }

    @Override
    public boolean validateCredentials(String nurseId, String password) {
        Optional<Nurse> nurse = getNurseByNurseId(nurseId);
        if (nurse.isPresent()) {
            // Compare the password from request directly with the stored password
            // Note: In a production environment, passwords should be hashed with BCrypt 
            // and compared using a password encoder
            return nurse.get().getPassword().equals(password);
        }
        return false;
    }

    @Override
    public boolean updateNurseStatus(String nurseId, String status) {
        Optional<Nurse> nurseOptional = nurseRepository.findByNurseId(nurseId);
        if (nurseOptional.isPresent()) {
            Nurse nurse = nurseOptional.get();
            nurse.setStatus(status);
            nurseRepository.save(nurse);
            return true;
        }
        return false;
    }

    @Override
    public List<Nurse> getNursesByStatus(String status) {
        return nurseRepository.findByStatusIgnoreCase(status);
    }
} 