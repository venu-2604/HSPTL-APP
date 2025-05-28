package com.arogith.api.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.UUID;

/**
 * Utility class to add a patient directly to the database
 * Bypasses the API to troubleshoot database issues
 */
@Configuration
public class PatientCreator {
    
    private static final Logger logger = LoggerFactory.getLogger(PatientCreator.class);
    
    @Value("${spring.datasource.url}")
    private String jdbcUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUsername;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    @Bean
    @Profile("dev")
    public CommandLineRunner createSamplePatient() {
        return args -> {
            // Only run this if a specific system property is set
            if (!"true".equals(System.getProperty("create.sample.patient"))) {
                logger.info("Skipping sample patient creation. Set -Dcreate.sample.patient=true to enable.");
                return;
            }
            
            logger.info("Creating sample patient directly in the database...");
            
            try (Connection conn = DriverManager.getConnection(jdbcUrl, dbUsername, dbPassword)) {
                // Check if the Aadhar number already exists
                String aadharNumber = "987601234500";
                String checkSql = "SELECT COUNT(*) FROM patients WHERE aadhar_number = ?";
                
                try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                    checkStmt.setString(1, aadharNumber);
                    ResultSet rs = checkStmt.executeQuery();
                    
                    if (rs.next() && rs.getInt(1) > 0) {
                        logger.info("Aadhar number {} already exists, skipping patient creation", aadharNumber);
                        return;
                    }
                }
                
                // Generate a unique patient ID
                String patientId = String.format("%03d", calculateNextPatientId(conn));
                
                // Insert the patient
                String sql = "INSERT INTO patients (patient_id, name, surname, father_name, gender, age, address, blood_group, phone_number, aadhar_number, total_visits) " +
                             "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, patientId);
                    stmt.setString(2, "Rahul");
                    stmt.setString(3, "Sharma");
                    stmt.setString(4, "Rajesh");
                    stmt.setString(5, "Male");
                    stmt.setInt(6, 28);
                    stmt.setString(7, "45 Park Avenue, Mumbai");
                    stmt.setString(8, "O+");
                    stmt.setString(9, "9876123450");
                    stmt.setString(10, aadharNumber);
                    stmt.setInt(11, 0);
                    
                    int rowsAffected = stmt.executeUpdate();
                    logger.info("Sample patient created successfully. Rows affected: {}", rowsAffected);
                    logger.info("Patient ID: {}", patientId);
                }
                
                // List all patients to verify
                String listSql = "SELECT patient_id, name, surname, aadhar_number FROM patients";
                try (PreparedStatement listStmt = conn.prepareStatement(listSql)) {
                    ResultSet rs = listStmt.executeQuery();
                    
                    logger.info("Current patients in the database:");
                    while (rs.next()) {
                        logger.info("ID: {}, Name: {} {}, Aadhar: {}", 
                                rs.getString("patient_id"), 
                                rs.getString("name"),
                                rs.getString("surname"),
                                rs.getString("aadhar_number"));
                    }
                }
            } catch (Exception e) {
                logger.error("Error creating sample patient: {}", e.getMessage(), e);
            }
        };
    }

    /**
     * Calculate the next sequential patient ID
     */
    private int calculateNextPatientId(Connection conn) throws Exception {
        String sql = "SELECT COUNT(*) FROM patients";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) + 1;
            }
        }
        return 1; // Default to 1 if no patients exist
    }
} 