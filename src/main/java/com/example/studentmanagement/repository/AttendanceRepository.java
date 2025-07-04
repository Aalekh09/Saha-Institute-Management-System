package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.Attendance;
import com.example.studentmanagement.model.Batch;
import com.example.studentmanagement.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndBatchAndDate(Student student, Batch batch, LocalDate date);
    List<Attendance> findAllByBatchAndDate(Batch batch, LocalDate date);
    List<Attendance> findAllByStudent(Student student);
} 