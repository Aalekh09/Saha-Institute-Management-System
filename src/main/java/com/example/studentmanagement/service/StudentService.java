package com.example.studentmanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.StudentRepository;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

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
        
        // Calculate remaining amount if total fee is set
        if (student.getTotalCourseFee() != null) {
            student.setRemainingAmount(
                student.getTotalCourseFee().subtract(student.getPaidAmount())
            );
        }
        
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
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