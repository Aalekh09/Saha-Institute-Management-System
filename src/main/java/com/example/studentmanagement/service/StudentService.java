package com.example.studentmanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.CertificateRepository;
import com.example.studentmanagement.repository.EnquiryRepository;
import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.repository.FeedbackRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    public Student saveStudent(Student student) {
        // Ensure payment fields are properly initialized
        if (student.getPaidAmount() == null) {
            student.setPaidAmount(new java.math.BigDecimal("0.00"));
        }
        // Set admissionDate if not set
        if (student.getAdmissionDate() == null) {
            student.setAdmissionDate(java.time.LocalDate.now());
        }
        // Calculate remaining amount if total fee is set
        if (student.getTotalCourseFee() != null) {
            student.setRemainingAmount(
                student.getTotalCourseFee().subtract(student.getPaidAmount())
            );
        }
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        try {
            // First get the student to ensure it exists
            Student student = getStudentById(id);
            
            // Delete all related payments and receipts
            List<Payment> payments = paymentRepository.findByStudentId(id);
            for (Payment payment : payments) {
                paymentRepository.deleteById(payment.getId());
            }
            
            // Delete all related certificates
            certificateRepository.findByStudent(student).forEach(certificate -> {
                certificateRepository.deleteById(certificate.getId());
            });
            
            // Delete related enquiries and their feedback
            enquiryRepository.findAll().stream()
                .filter(enquiry -> student.getPhoneNumber().equals(enquiry.getPhoneNumber()))
                .forEach(enquiry -> {
                    // Delete feedback entries for this enquiry
                    feedbackRepository.findByEnquiryIdOrderByCreatedAtDesc(enquiry.getId())
                        .forEach(feedback -> feedbackRepository.deleteById(feedback.getId()));
                    // Delete the enquiry itself
                    enquiryRepository.deleteById(enquiry.getId());
                });
            
            // Finally delete the student
            studentRepository.deleteById(id);
        } catch (Exception e) {
            e.printStackTrace(); // Add this for debugging
            throw new RuntimeException("Error deleting student and related records: " + e.getMessage());
        }
    }

    // Method to update payment information
    public Student updatePayment(Long studentId, java.math.BigDecimal newPayment) {
        return studentRepository.findById(studentId)
            .map(student -> {
                java.math.BigDecimal currentPaid = student.getPaidAmount() != null ? 
                    student.getPaidAmount() : new java.math.BigDecimal("0.00");
                
                student.setPaidAmount(currentPaid.add(newPayment));
                
                if (student.getTotalCourseFee() != null) {
                    student.setRemainingAmount(
                        student.getTotalCourseFee().subtract(student.getPaidAmount())
                    );
                }
                
                return studentRepository.save(student);
            })
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
    }

    public Student createStudent(Student student) {
        return saveStudent(student);
    }

    public Student updateStudent(Long id, Student studentDetails) {
        Student student = getStudentById(id);
        student.setName(studentDetails.getName());
        student.setFatherName(studentDetails.getFatherName());
        student.setMotherName(studentDetails.getMotherName());
        student.setDob(studentDetails.getDob());
        student.setEmail(studentDetails.getEmail());
        student.setPhoneNumber(studentDetails.getPhoneNumber());
        student.setAddress(studentDetails.getAddress());
        student.setCourses(studentDetails.getCourses());
        student.setCourseDuration(studentDetails.getCourseDuration());
        student.setTotalCourseFee(studentDetails.getTotalCourseFee());
        student.setPaidAmount(studentDetails.getPaidAmount());
        student.setRemainingAmount(studentDetails.getRemainingAmount());
        student.setAdmissionDate(studentDetails.getAdmissionDate());
        return saveStudent(student);
    }

    public List<Student> searchStudents(String name, String email, String phone) {
        return studentRepository.findAll().stream()
                .filter(s -> (name == null || s.getName().toLowerCase().contains(name.toLowerCase()))
                        && (email == null || s.getEmail().toLowerCase().contains(email.toLowerCase()))
                        && (phone == null || s.getPhoneNumber().contains(phone)))
                .toList();
    }
} 