-- Create database if not exists
CREATE DATABASE IF NOT EXISTS doctor_appointment;
USE doctor_appointment;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Doctor', 'Patient') NOT NULL,
  age INT DEFAULT NULL,
  gender ENUM('Male', 'Female', 'Other', '') DEFAULT '',
  mobile VARCHAR(20) DEFAULT '',
  address TEXT,
  status VARCHAR(50) DEFAULT '',
  pic VARCHAR(255) DEFAULT 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);


-- Google Auth Users table
CREATE TABLE IF NOT EXISTS GUsers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  googleId VARCHAR(100) NOT NULL UNIQUE,
  displayName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_googleId (googleId),
  INDEX idx_email (email)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS Doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL UNIQUE,
  specialization VARCHAR(100) NOT NULL,
  experience INT NOT NULL CHECK (experience >= 0),
  fees DECIMAL(10,2) NOT NULL CHECK (fees >= 0),
  isDoctor BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_specialization (specialization)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS Appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  doctorId INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  age INT NOT NULL,
  bloodGroup VARCHAR(5),
  gender ENUM('male', 'female', 'other') NOT NULL,
  number VARCHAR(15) NOT NULL,
  familyDiseases TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_doctor (doctorId),
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_isRead (isRead)
);

-- Create Specifications table
CREATE TABLE IF NOT EXISTS Specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  isDeleted BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_isDeleted (isDeleted)
);

-- Junction table for Doctor-Specification many-to-many relationship
CREATE TABLE IF NOT EXISTS DoctorSpecifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctorId INT NOT NULL,
  specificationId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (doctorId) REFERENCES Doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (specificationId) REFERENCES Specifications(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doctor_spec (doctorId, specificationId),
  INDEX idx_doctor (doctorId),
  INDEX idx_specification (specificationId)
);