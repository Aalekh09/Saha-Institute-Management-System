package com.example.studentmanagement.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.StudentRepository;

import jakarta.transaction.Transactional;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public Payment createPayment(Payment payment) {
        // Set the student object from the studentId
        if (payment.getStudent() == null && payment.getStudentId() != null) {
            Student student = studentRepository.findById(payment.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + payment.getStudentId()));
            payment.setStudent(student);
        }
        
        // Generate receipt number
        payment.setReceiptNumber(generateReceiptNumber(payment));
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus("PAID");
        
        // Save the payment first
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update student's paid amount and remaining amount
        Student student = savedPayment.getStudent();
        if (student != null) {
            BigDecimal currentPaidAmount = student.getPaidAmount() != null ? student.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal paymentAmount = savedPayment.getAmount() != null ? BigDecimal.valueOf(savedPayment.getAmount()) : BigDecimal.ZERO;
            BigDecimal newPaidAmount = currentPaidAmount.add(paymentAmount);
            student.setPaidAmount(newPaidAmount);
            
            BigDecimal totalCourseFee = student.getTotalCourseFee() != null ? student.getTotalCourseFee() : BigDecimal.ZERO;
            BigDecimal newRemainingAmount = totalCourseFee.subtract(newPaidAmount);
            student.setRemainingAmount(newRemainingAmount);
            
            studentRepository.save(student); // Save the updated student
        }
        
        return savedPayment;
    }

    public List<Payment> getPaymentsByStudentId(Long studentId) {
        return paymentRepository.findByStudent_Id(studentId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment != null) {
            payment.setAmount(paymentDetails.getAmount());
            payment.setPaymentMethod(paymentDetails.getPaymentMethod());
            payment.setDescription(paymentDetails.getDescription());
            payment.setStatus(paymentDetails.getStatus());
            return paymentRepository.save(payment);
        }
        return null;
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    private String generateReceiptNumber(Payment payment) {
        // Format: REC-YYYYMMDD-XXXX where XXXX is a sequential number
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%04d", paymentRepository.count() + 1);
        return "REC-" + date + "-" + sequence;
    }
} 