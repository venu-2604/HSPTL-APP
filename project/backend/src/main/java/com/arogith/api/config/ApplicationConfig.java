package com.arogith.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class ApplicationConfig {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationConfig.class);

    @Autowired
    private Environment env;

    /**
     * Fix photo column type if needed and add a sample patient if running in dev mode
     */
    @Bean
    public CommandLineRunner databaseInitializer(DataSource dataSource) {
        return args -> {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            
            // Check if we need to fix the photo column type
            logger.info("Checking database schema...");
            try {
                // Check column type
                String columnType = jdbcTemplate.queryForObject(
                    "SELECT data_type FROM information_schema.columns " +
                    "WHERE table_name = 'patients' AND column_name = 'photo'", 
                    String.class);
                
                logger.info("Current photo column type: {}", columnType);
                
                // If column is OID type, alter it to BYTEA
                if ("oid".equalsIgnoreCase(columnType)) {
                    logger.info("Changing photo column type from OID to BYTEA...");
                    jdbcTemplate.execute("ALTER TABLE patients ALTER COLUMN photo TYPE BYTEA USING NULL");
                    logger.info("Column type changed successfully");
                }
            } catch (Exception e) {
                logger.error("Error checking/fixing schema: {}", e.getMessage(), e);
            }
            
            // Add a sample patient in development mode
            if (Arrays.asList(env.getActiveProfiles()).contains("dev")) {
                addSamplePatient(jdbcTemplate);
            }
        };
    }
    
    @Transactional
    private void addSamplePatient(JdbcTemplate jdbcTemplate) {
        try {
            String aadharNumber = "987601234500";
            
            // Check if patient with this Aadhar already exists
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM patients WHERE aadhar_number = ?",
                Integer.class,
                aadharNumber);
                
            if (count != null && count > 0) {
                logger.info("Patient with Aadhar {} already exists, skipping creation", aadharNumber);
                return;
            }
            
            // Generate a unique patient ID
            String patientId = String.format("%03d", getNextPatientId(jdbcTemplate));
            
            // Insert new patient
            logger.info("Adding sample patient with ID {}", patientId);
            jdbcTemplate.update(
                "INSERT INTO patients (patient_id, name, surname, father_name, gender, age, " +
                "address, blood_group, phone_number, aadhar_number, photo, total_visits) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)",
                patientId, "Rahul", "Sharma", "Rajesh", "Male", 28,
                "45 Park Avenue, Mumbai", "O+", "9876123450", aadharNumber, 0);
                
            logger.info("Sample patient added successfully");
            
            // List all patients
            logger.info("Current patients in the database:");
            jdbcTemplate.query(
                "SELECT patient_id, name, surname, aadhar_number FROM patients",
                (rs, rowNum) -> String.format(
                    "ID: %s, Name: %s %s, Aadhar: %s",
                    rs.getString("patient_id"),
                    rs.getString("name"),
                    rs.getString("surname"),
                    rs.getString("aadhar_number")
                )
            ).forEach(logger::info);
            
        } catch (Exception e) {
            logger.error("Error adding sample patient: {}", e.getMessage(), e);
        }
    }

    /**
     * Get the next sequential patient ID
     */
    private int getNextPatientId(JdbcTemplate jdbcTemplate) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM patients",
            Integer.class);
        return (count != null ? count : 0) + 1;
    }
} 