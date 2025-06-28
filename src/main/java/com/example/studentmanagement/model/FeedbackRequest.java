package com.example.studentmanagement.model;

import java.time.LocalDate;

public class FeedbackRequest {
    private LocalDate callDate;
    private String feedback;

    // Default constructor
    public FeedbackRequest() {}

    // Constructor with parameters
    public FeedbackRequest(LocalDate callDate, String feedback) {
        this.callDate = callDate;
        this.feedback = feedback;
    }

    // Getters and Setters
    public LocalDate getCallDate() {
        return callDate;
    }

    public void setCallDate(LocalDate callDate) {
        this.callDate = callDate;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
} 