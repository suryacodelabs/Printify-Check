
package com.printifycheck.entity;

import com.printifycheck.model.PdfCheckResult;
import com.printifycheck.model.PdfIssue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pdf_checks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfCheckEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = true)
    private UUID projectId;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private long fileSize;
    
    private int qualityScore;
    
    @Column(nullable = false)
    private String status;
    
    @Column(nullable = true)
    private int issuesCount;
    
    @Column(columnDefinition = "TEXT")
    private String issuesJson;
    
    @Column(nullable = false)
    private Instant createdAt;
    
    @Column(nullable = false)
    private Instant updatedAt;
    
    public PdfCheckResult toModel() {
        return PdfCheckResult.builder()
                .id(id)
                .userId(userId)
                .fileName(fileName)
                .fileSize(fileSize)
                .qualityScore(qualityScore)
                .status(PdfCheckResult.CheckStatus.valueOf(status.toUpperCase()))
                .issuesCount(issuesCount)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
