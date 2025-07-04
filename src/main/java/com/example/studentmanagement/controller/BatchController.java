package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Batch;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.repository.BatchRepository;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/batches")
public class BatchController {
    @Autowired
    private BatchRepository batchRepository;
    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    @PostMapping
    public Batch createBatch(@RequestBody Batch batch) {
        return batchRepository.save(batch);
    }

    @PutMapping("/{id}")
    public Batch updateBatch(@PathVariable Long id, @RequestBody Batch batch) {
        batch.setId(id);
        return batchRepository.save(batch);
    }

    @DeleteMapping("/{id}")
    public void deleteBatch(@PathVariable Long id) {
        batchRepository.deleteById(id);
    }

    // Assign students to a batch
    @PostMapping("/{batchId}/students")
    public Batch assignStudentsToBatch(@PathVariable Long batchId, @RequestBody List<Long> studentIds) {
        Optional<Batch> batchOpt = batchRepository.findById(batchId);
        if (batchOpt.isEmpty()) throw new RuntimeException("Batch not found");
        Batch batch = batchOpt.get();
        Set<Student> students = new HashSet<>(studentRepository.findAllById(studentIds));
        batch.setStudents(students);
        return batchRepository.save(batch);
    }

    // Get students in a batch
    @GetMapping("/{batchId}/students")
    public Set<Student> getStudentsInBatch(@PathVariable Long batchId) {
        return batchRepository.findById(batchId).map(Batch::getStudents).orElse(Set.of());
    }
} 