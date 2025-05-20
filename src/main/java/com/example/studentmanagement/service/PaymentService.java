package com.example.studentmanagement.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.studentmanagement.model.Payment;
import com.example.studentmanagement.repository.PaymentRepository;
import com.example.studentmanagement.repository.StudentRepository;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    public Payment createPayment(Payment payment) {
        // Generate receipt number
        payment.setReceiptNumber(generateReceiptNumber(payment));
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus("PAID");
        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByStudentId(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
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