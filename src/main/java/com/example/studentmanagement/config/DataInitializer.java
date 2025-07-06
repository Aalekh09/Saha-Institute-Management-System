package com.example.studentmanagement.config;

import com.example.studentmanagement.model.Batch;
import com.example.studentmanagement.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BatchRepository batchRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if batches exist, if not create default batches
        if (batchRepository.count() == 0) {
            createHourlyBatches();
        }
    }

    private void createHourlyBatches() {
        List<Batch> batches = new ArrayList<>();
        LocalTime start = LocalTime.of(7, 0);
        LocalTime end = LocalTime.of(21, 0); // 9 PM
        while (start.isBefore(end)) {
            LocalTime batchEnd = start.plusHours(1);
            String name = String.format("%02d:00-%02d:00 Batch", start.getHour(), batchEnd.getHour());
            Batch batch = new Batch();
            batch.setName(name);
            batch.setStartTime(start);
            batch.setEndTime(batchEnd);
            batches.add(batch);
            start = batchEnd;
        }
        batchRepository.saveAll(batches);
        System.out.println("Hourly batches from 7 AM to 9 PM created successfully!");
    }
} 