package com.example.studentmanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.studentmanagement.model.Enquiry;
import com.example.studentmanagement.repository.EnquiryRepository;
import com.example.studentmanagement.repository.StudentRepository;

@Service
public class EnquiryService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Autowired
    private StudentRepository studentRepository;

    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    @Transactional
    public Enquiry saveEnquiry(Enquiry enquiry) {
        // Validate required fields
        if (enquiry.getName() == null || enquiry.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (enquiry.getPhoneNumber() == null || enquiry.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (enquiry.getCourse() == null || enquiry.getCourse().trim().isEmpty()) {
            throw new IllegalArgumentException("Course is required");
        }
        if (enquiry.getCourseDuration() == null || enquiry.getCourseDuration().trim().isEmpty()) {
            throw new IllegalArgumentException("Course duration is required");
        }

        // Set default value for convertedToStudent if not set
        if (!enquiry.isConvertedToStudent()) {
            enquiry.setConvertedToStudent(false);
        }

        return enquiryRepository.save(enquiry);
    }

    public Optional<Enquiry> getEnquiryById(Long id) {
        return enquiryRepository.findById(id);
    }

    @Transactional
    public Enquiry convertToStudent(Long id) {
        Optional<Enquiry> enquiryOpt = enquiryRepository.findById(id);
        if (enquiryOpt.isPresent()) {
            Enquiry enquiry = enquiryOpt.get();
            if (enquiry.isConvertedToStudent()) {
                throw new IllegalStateException("Enquiry is already converted to student");
            }
            enquiry.setConvertedToStudent(true);
            enquiryRepository.save(enquiry);

            // Create and save new Student
            com.example.studentmanagement.model.Student student = new com.example.studentmanagement.model.Student();
            student.setName(enquiry.getName());
            student.setPhoneNumber(enquiry.getPhoneNumber());
            student.setCourses(enquiry.getCourse());
            student.setCourseDuration(enquiry.getCourseDuration());
            // Other fields can be set to null or default
            studentRepository.save(student);

            return enquiry;
        }
        throw new RuntimeException("Enquiry not found with id: " + id);
    }

    @Transactional
    public void deleteEnquiry(Long id) {
        if (!enquiryRepository.existsById(id)) {
            throw new RuntimeException("Enquiry not found with id: " + id);
        }
        enquiryRepository.deleteById(id);
    }

    @Transactional
    public Enquiry reverseConversion(Long id) {
        Optional<Enquiry> enquiryOpt = enquiryRepository.findById(id);
        if (enquiryOpt.isPresent()) {
            Enquiry enquiry = enquiryOpt.get();
            if (!enquiry.isConvertedToStudent()) {
                throw new IllegalStateException("Enquiry is not converted to student");
            }
            
            // Find the most recently created student for this phone number
            List<com.example.studentmanagement.model.Student> students = studentRepository.findByPhoneNumberOrderByIdDesc(enquiry.getPhoneNumber());
            if (!students.isEmpty()) {
                // Delete only the most recently created student
                studentRepository.deleteById(students.get(0).getId());
            }
            
            enquiry.setConvertedToStudent(false);
            return enquiryRepository.save(enquiry);
        }
        throw new RuntimeException("Enquiry not found with id: " + id);
    }
} 