
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfIssue {
    private String id;
    private String type;
    private IssueSeverity severity;
    private String message;
    private String description;
    private Integer page;
    private String location;
    private boolean autoFixable;
    private String fixDescription;
    private String fixType;
    private String ruleId;
    private String clause;
    private String specification;
    private String testNumber;
    
    public enum IssueSeverity {
        HIGH, MEDIUM, LOW, INFO
    }
}
