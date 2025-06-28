package com.example.studentmanagement.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.studentmanagement.model.Enquiry;
import com.example.studentmanagement.service.EnquiryService;
import com.example.studentmanagement.model.FeedbackEntry;
import com.example.studentmanagement.repository.FeedbackRepository;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "*")
public class EnquiryController {
    
    private static final Logger logger = LoggerFactory.getLogger(EnquiryController.class);

    @Autowired
    private EnquiryService enquiryService;
    
    @Autowired
    private FeedbackRepository feedbackRepository;

    @GetMapping
    public List<Enquiry> getAllEnquiries() {
        return enquiryService.getAllEnquiries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enquiry> getEnquiryById(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Enquiry createEnquiry(@RequestBody Enquiry enquiry) {
        return enquiryService.saveEnquiry(enquiry);
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<Enquiry> convertToStudent(@PathVariable Long id) {
        try {
            Enquiry convertedEnquiry = enquiryService.convertToStudent(id);
            return ResponseEntity.ok(convertedEnquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<?> reverseConversion(@PathVariable Long id) {
        try {
            Enquiry reversedEnquiry = enquiryService.reverseConversion(id);
            return ResponseEntity.ok(reversedEnquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable Long id, @RequestBody FeedbackEntry feedbackEntry) {
        return enquiryService.getEnquiryById(id)
                .map(enquiry -> {
                    feedbackEntry.setEnquiry(enquiry);
                    FeedbackEntry savedFeedback = feedbackRepository.save(feedbackEntry);
                    return ResponseEntity.ok(savedFeedback);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<List<FeedbackEntry>> getFeedback(@PathVariable Long id) {
        List<FeedbackEntry> feedbackEntries = feedbackRepository.findByEnquiryIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(feedbackEntries);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnquiry(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id)
                .map(enquiry -> {
                    enquiryService.deleteEnquiry(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 