package com.example.studentmanagement.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.studentmanagement.model.FeedbackEntry;
import com.example.studentmanagement.model.Enquiry;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntry, Long> {
    List<FeedbackEntry> findByEnquiryOrderByCreatedAtDesc(Enquiry enquiry);
    List<FeedbackEntry> findByEnquiryIdOrderByCreatedAtDesc(Long enquiryId);
} 