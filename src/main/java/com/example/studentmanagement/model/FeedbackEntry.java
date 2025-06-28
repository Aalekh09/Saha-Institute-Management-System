package com.example.studentmanagement.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_entries")
public class FeedbackEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "enquiry_id", nullable = false)
    private Enquiry enquiry;
    
    private String date; // yyyy-MM-dd
    private String time; // HH:mm
    private String feedback;
    private LocalDateTime createdAt;

    public FeedbackEntry() {
        this.createdAt = LocalDateTime.now();
    }
    
    public FeedbackEntry(String date, String time, String feedback) {
        this.date = date;
        this.time = time;
        this.feedback = feedback;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Enquiry getEnquiry() {
        return enquiry;
    }

    public void setEnquiry(Enquiry enquiry) {
        this.enquiry = enquiry;
    }

    public String getDate() { 
        return date; 
    }
    
    public void setDate(String date) { 
        this.date = date; 
    }
    
    public String getTime() { 
        return time; 
    }
    
    public void setTime(String time) { 
        this.time = time; 
    }
    
    public String getFeedback() { 
        return feedback; 
    }
    
    public void setFeedback(String feedback) { 
        this.feedback = feedback; 
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 