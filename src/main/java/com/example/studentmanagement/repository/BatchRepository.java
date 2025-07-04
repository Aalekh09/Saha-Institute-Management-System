package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {
} 