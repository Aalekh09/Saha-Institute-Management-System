package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Attendance;
import com.example.studentmanagement.model.Batch;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.AttendanceRepository;
import com.example.studentmanagement.repository.BatchRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private BatchRepository batchRepository;

    // Mark or update attendance for a batch on a date
    @PostMapping("/mark")
    public String markAttendance(@RequestParam Long batchId, @RequestParam String date, @RequestBody List<AttendanceRequest> attendanceList) {
        LocalDate attendanceDate = LocalDate.parse(date);
        Optional<Batch> batchOpt = batchRepository.findById(batchId);
        if (batchOpt.isEmpty()) return "Batch not found";
        Batch batch = batchOpt.get();
        for (AttendanceRequest req : attendanceList) {
            Optional<Student> studentOpt = studentRepository.findById(req.studentId);
            if (studentOpt.isEmpty()) continue;
            Student student = studentOpt.get();
            Attendance attendance = attendanceRepository.findByStudentAndBatchAndDate(student, batch, attendanceDate)
                    .orElse(new Attendance());
            // If updating, check if lastUpdated is within 24 hours
            if (attendance.getId() != null && attendance.getLastUpdated() != null) {
                long hours = ChronoUnit.HOURS.between(attendance.getLastUpdated(), LocalDateTime.now());
                if (hours > 24) continue; // skip update if more than 24 hours old
            }
            attendance.setStudent(student);
            attendance.setBatch(batch);
            attendance.setDate(attendanceDate);
            attendance.setStatus(req.status);
            attendance.setLastUpdated(LocalDateTime.now());
            attendanceRepository.save(attendance);
        }
        return "Attendance marked/updated";
    }

    // Get attendance for a batch on a date
    @GetMapping
    public List<Attendance> getAttendance(@RequestParam Long batchId, @RequestParam String date) {
        LocalDate attendanceDate = LocalDate.parse(date);
        Optional<Batch> batchOpt = batchRepository.findById(batchId);
        if (batchOpt.isEmpty()) return List.of();
        Batch batch = batchOpt.get();
        return attendanceRepository.findAllByBatchAndDate(batch, attendanceDate);
    }

    // Get attendance for a student (history)
    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceForStudent(@PathVariable Long studentId) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) return List.of();
        Student student = studentOpt.get();
        return attendanceRepository.findAllByStudent(student);
    }

    // DTO for attendance marking
    public static class AttendanceRequest {
        public Long studentId;
        public String status; // "present" or "absent"
    }
} 