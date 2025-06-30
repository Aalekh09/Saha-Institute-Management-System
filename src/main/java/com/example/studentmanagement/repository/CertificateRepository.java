package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.Certificate;
import com.example.studentmanagement.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudent(Student student);
    List<Certificate> findByRegistrationNumber(String registrationNumber);
} 