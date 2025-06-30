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
        
        // Note: We're not linking to existing students since registration number
        // is not a field in the Student entity. The certificate will be created
        // with the registration number stored in the certificate itself.
        
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
            
            // Update new fields
            existingCertificate.setRegistrationNumber(certificateDetails.getRegistrationNumber());
            existingCertificate.setRollNumber(certificateDetails.getRollNumber());
            existingCertificate.setExamRollNumber(certificateDetails.getExamRollNumber());
            existingCertificate.setCourseDuration(certificateDetails.getCourseDuration());
            existingCertificate.setPerformance(certificateDetails.getPerformance());
            existingCertificate.setGrade(certificateDetails.getGrade());
            existingCertificate.setIssueSession(certificateDetails.getIssueSession());
            existingCertificate.setIssueDay(certificateDetails.getIssueDay());
            existingCertificate.setIssueMonth(certificateDetails.getIssueMonth());
            existingCertificate.setIssueYear(certificateDetails.getIssueYear());
            existingCertificate.setFathersName(certificateDetails.getFathersName());
            existingCertificate.setMothersName(certificateDetails.getMothersName());
            existingCertificate.setDateOfBirth(certificateDetails.getDateOfBirth());
            
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
    
    public List<Certificate> getCertificatesByRegistrationNumber(String registrationNumber) {
        return certificateRepository.findByRegistrationNumber(registrationNumber);
    }
} 