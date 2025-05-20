package com.example.studentmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.studentmanagement.model.Enquiry;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    // Custom query methods can be added here if needed
} 