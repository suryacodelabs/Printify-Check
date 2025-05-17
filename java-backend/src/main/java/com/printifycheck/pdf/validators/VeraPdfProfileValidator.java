
package com.printifycheck.pdf.validators;

import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.verapdf.core.ModelParsingException;
import org.verapdf.core.ValidationException;
import org.verapdf.features.FeatureExtractorConfig;
import org.verapdf.features.FeatureFactory;
import org.verapdf.metadata.fixer.utils.FixerConfig;
import org.verapdf.pdfa.Foundries;
import org.verapdf.pdfa.PDFAParser;
import org.verapdf.pdfa.PDFAValidator;
import org.verapdf.pdfa.VeraGreenfieldFoundryProvider;
import org.verapdf.pdfa.flavours.PDFAFlavour;
import org.verapdf.pdfa.results.TestAssertion;
import org.verapdf.pdfa.results.ValidationResult;
import org.verapdf.pdfa.validation.profiles.ProfileDirectory;
import org.verapdf.pdfa.validation.profiles.Profiles;
import org.verapdf.pdfa.validation.profiles.ValidationProfile;
import org.verapdf.processor.TaskType;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Extended VeraPDF validator for specific profiles like PDF/UA, WCAG, PDF/VT
 */
@Component
@Slf4j
public class VeraPdfProfileValidator {

    public VeraPdfProfileValidator() {
        // Initialize VeraPDF
        VeraGreenfieldFoundryProvider.initialise();
    }

    /**
     * Validates PDF against a specific profile
     *
     * @param pdfPath Path to the PDF file
     * @param profileName Name of the validation profile (e.g., "pdfua-1", "pdfvt-1")
     * @return List of issues found during validation
     */
    public List<PdfIssue> validateWithProfile(String pdfPath, String profileName) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Load the validation profile
            ProfileDirectory directory = Profiles.getVeraProfileDirectory();
            Optional<ValidationProfile> profileOpt = directory.getValidationProfiles().stream()
                .filter(p -> p.getPDFAFlavour().getId().toLowerCase().contains(profileName.toLowerCase()))
                .findFirst();
            
            if (profileOpt.isEmpty()) {
                log.warn("Validation profile '{}' not found", profileName);
                issues.add(PdfIssue.builder()
                    .id(UUID.randomUUID().toString())
                    .type("Profile Validation")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Validation profile '" + profileName + "' not available")
                    .autoFixable(false)
                    .build());
                return issues;
            }
            
            ValidationProfile profile = profileOpt.get();
            PDFAFlavour flavour = profile.getPDFAFlavour();
            
            // Create a parser with the appropriate flavour
            try (PDFAParser parser = Foundries.defaultInstance().createParser(new File(pdfPath), flavour)) {
                // Create a validator with the profile
                PDFAValidator validator = Foundries.defaultInstance().createValidator(profile, false);
                
                // Validate the document
                ValidationResult result = validator.validate(parser);
                
                // Process validation results
                processValidationResult(result, issues, profileName);
            }
        } catch (Exception e) {
            log.error("Error validating PDF with profile '{}': {}", profileName, e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type(profileName.toUpperCase() + " Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error validating PDF: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }

    /**
     * Process validation results and convert to PdfIssue objects
     *
     * @param result ValidationResult from VeraPDF
     * @param issues List to add PdfIssue objects to
     * @param profileName Name of the validation profile
     */
    private void processValidationResult(ValidationResult result, List<PdfIssue> issues, String profileName) {
        if (!result.isCompliant()) {
            for (TestAssertion assertion : result.getTestAssertions()) {
                if (assertion.getStatus() != TestAssertion.Status.PASSED) {
                    PdfIssue.IssueSeverity severity;
                    
                    switch (assertion.getStatus()) {
                        case FAILED:
                            severity = PdfIssue.IssueSeverity.HIGH;
                            break;
                        case WARNING:
                            severity = PdfIssue.IssueSeverity.MEDIUM;
                            break;
                        default:
                            severity = PdfIssue.IssueSeverity.LOW;
                    }
                    
                    PdfIssue issue = PdfIssue.builder()
                        .id(UUID.randomUUID().toString())
                        .type(profileName.toUpperCase() + " Compliance")
                        .severity(severity)
                        .message(formatAssertionMessage(assertion))
                        .description(assertion.getMessage())
                        .location(assertion.getLocation() != null ? assertion.getLocation().getContext() : null)
                        .autoFixable(isFixable(assertion))
                        .ruleId(assertion.getRuleId())
                        .clause(assertion.getClause())
                        .testNumber(assertion.getTestNumber())
                        .build();
                    
                    issues.add(issue);
                }
            }
        }
    }
    
    /**
     * Formats an assertion message for user-friendly display
     * 
     * @param assertion TestAssertion from VeraPDF
     * @return Formatted message
     */
    private String formatAssertionMessage(TestAssertion assertion) {
        return assertion.getRuleId() + ": " + assertion.getMessage();
    }
    
    /**
     * Determines if an issue is potentially fixable
     * 
     * @param assertion TestAssertion from VeraPDF
     * @return True if the issue is potentially fixable
     */
    private boolean isFixable(TestAssertion assertion) {
        return assertion.getRuleId() != null && 
            (assertion.getRuleId().contains("metadata") || 
             assertion.getRuleId().contains("font") || 
             assertion.getRuleId().contains("color") ||
             assertion.getMessage().contains("embedding"));
    }
}
