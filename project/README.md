# Arogith Healthcare Management System

## Overview
Arogith Healthcare Management System is a comprehensive application for managing patient records, appointments, and healthcare services. The system consists of a Spring Boot backend and a React frontend.

## Quick Start
To quickly start the application with all required fixes:

1. Ensure PostgreSQL is installed and running
2. Run the `start-app.bat` file by double-clicking on it
3. Wait for both backend and frontend servers to start
4. Access the application at http://localhost:3000

## Manual Setup

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher
- Maven

### Backend Setup
1. Navigate to the `backend` directory
2. Configure the database connection in `application.properties`
3. Run `mvn clean install` to build the project
4. Start the backend with `java -jar target/arogith-healthcare-0.0.1-SNAPSHOT.jar`
5. The backend API will be available at http://localhost:8083

### Frontend Setup
1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Start the frontend with `npm start`
4. The application UI will be available at http://localhost:3000

## Database Configuration
The application requires a PostgreSQL database. The default configuration:
- Database Name: arogith_healthcare
- Username: postgres
- Password: Venu@2604
- Port: 5432

## Features
- Patient registration and management
- Appointment scheduling
- Medical records management
- Staff and doctor management
- Reporting and analytics

## API Endpoints
The main API endpoints include:

- `/api/patients` - Patient management
- `/api/appointments` - Appointment scheduling
- `/api/staff` - Staff management
- `/api/doctors` - Doctor management

## Troubleshooting
- If the application fails to start, check PostgreSQL service is running
- If database connection fails, verify credentials in application.properties
- For frontend issues, check browser console for errors
- For backend issues, check logs in the terminal window

## Shutdown
To properly shut down the application:
1. Press Ctrl+C in both terminal windows or
2. Close the batch file window which will terminate both servers 