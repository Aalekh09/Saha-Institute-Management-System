package com.example.studentmanagement.service;

import com.example.studentmanagement.model.Certificate;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.CertificateRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public Optional<Certificate> getCertificateById(Long id) {
        return certificateRepository.findById(id);
    }

    public Certificate createCertificate(Certificate certificate) {
        // Set default status if not provided
        if (certificate.getStatus() == null) {
            certificate.setStatus("Active");
        }
        return certificateRepository.save(certificate);
    }

    public Certificate updateCertificate(Long id, Certificate certificateDetails) {
        Optional<Certificate> certificate = certificateRepository.findById(id);
        if (certificate.isPresent()) {
            Certificate existingCertificate = certificate.get();
            existingCertificate.setType(certificateDetails.getType());
            existingCertificate.setIssueDate(certificateDetails.getIssueDate());
            existingCertificate.setValidUntil(certificateDetails.getValidUntil());
            existingCertificate.setRemarks(certificateDetails.getRemarks());
            existingCertificate.setStatus(certificateDetails.getStatus());
            return certificateRepository.save(existingCertificate);
        }
        return null;
    }

    public void deleteCertificate(Long id) {
        certificateRepository.deleteById(id);
    }

    public List<Certificate> getCertificatesByStudentId(Long studentId) {
        Optional<Student> student = studentRepository.findById(studentId);
        return student.map(certificateRepository::findByStudent).orElse(List.of());
    }
} 