
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidationResult {
    private String checkId;
    private String userId;
    private String fileName;
    private long fileSize;
    private Map<ValidationCategory, List<PdfIssue>> issuesByCategory;
    private int totalIssues;
    private double qualityScore;
    private Map<String, Boolean> supportedFixes;
}
