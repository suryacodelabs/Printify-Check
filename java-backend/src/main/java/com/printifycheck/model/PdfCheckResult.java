
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfCheckResult {
    private UUID id;
    private UUID userId;
    private String fileName;
    private long fileSize;
    private int qualityScore;
    private CheckStatus status;
    private int issuesCount;
    private List<PdfIssue> issues;
    private Instant createdAt;
    private Instant updatedAt;
    
    public enum CheckStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
