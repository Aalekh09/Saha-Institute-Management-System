package com.example.studentmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.CommandLineRunner;
import com.example.studentmanagement.model.Batch;
import com.example.studentmanagement.repository.BatchRepository;
import java.time.LocalTime;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    @Bean
    public CommandLineRunner seedDefaultBatches(BatchRepository batchRepository) {
        return args -> {
            if (batchRepository.count() == 0) {
                for (int hour = 7; hour < 21; hour++) {
                    Batch batch = new Batch();
                    batch.setName("Batch " + (hour - 6));
                    batch.setStartTime(LocalTime.of(hour, 0));
                    batch.setEndTime(LocalTime.of(hour + 1, 0));
                    batchRepository.save(batch);
                }
            }
        };
    }
} 