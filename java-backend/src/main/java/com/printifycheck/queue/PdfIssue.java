
package com.printifycheck.queue;

import com.printifycheck.model.PdfIssueLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an issue found during PDF preflight check
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfIssue {
    private String type;
    private IssueSeverity severity;
    private String message;
    private Integer page;
    private PdfIssueLocation location;
    private boolean autoFixable;
    private String fixDescription;
    
    /**
     * Severity levels for preflight issues
     */
    public enum IssueSeverity {
        CRITICAL,
        HIGH,
        MEDIUM,
        LOW
    }
}
