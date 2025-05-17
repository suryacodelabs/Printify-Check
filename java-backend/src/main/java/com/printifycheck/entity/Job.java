
package com.printifycheck.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = false)
    private String type;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String status;
    
    @Column(columnDefinition = "TEXT")
    private String results;
    
    private String outputFilePath;
    
    private String annotatedFilePath;
    
    private String extractedText;
    
    @Column(nullable = false)
    private OffsetDateTime createdAt;
    
    private OffsetDateTime updatedAt;
}
