package com.example.studentmanagement.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class FeedbackEntry {
    private String date; // yyyy-MM-dd
    private String time; // HH:mm
    private String feedback;

    public FeedbackEntry() {}
    public FeedbackEntry(String date, String time, String feedback) {
        this.date = date;
        this.time = time;
        this.feedback = feedback;
    }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
} 