package com.example.studentmanagement.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "enquiries")
public class Enquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "date_of_enquiry", nullable = false)
    private LocalDate dateOfEnquiry;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String course;

    @Column(name = "course_duration", nullable = false)
    private String courseDuration;

    @Column
    private String remarks;

    @Column(name = "converted_to_student")
    private boolean convertedToStudent = false;

    @Column(name = "taken_by")
    private String takenBy;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFatherName() {
        return fatherName;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public LocalDate getDateOfEnquiry() {
        return dateOfEnquiry;
    }

    public void setDateOfEnquiry(LocalDate dateOfEnquiry) {
        this.dateOfEnquiry = dateOfEnquiry;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getCourseDuration() {
        return courseDuration;
    }

    public void setCourseDuration(String courseDuration) {
        this.courseDuration = courseDuration;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public boolean isConvertedToStudent() {
        return convertedToStudent;
    }

    public void setConvertedToStudent(boolean convertedToStudent) {
        this.convertedToStudent = convertedToStudent;
    }

    public String getTakenBy() {
        return takenBy;
    }

    public void setTakenBy(String takenBy) {
        this.takenBy = takenBy;
    }
} 