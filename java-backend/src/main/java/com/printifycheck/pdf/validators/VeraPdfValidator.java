
package com.printifycheck.pdf.validators;

import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.verapdf.core.EncryptedPdfException;
import org.verapdf.core.ModelParsingException;
import org.verapdf.core.ValidationException;
import org.verapdf.features.FeatureExtractorConfig;
import org.verapdf.features.FeatureFactory;
import org.verapdf.metadata.fixer.FixerFactory;
import org.verapdf.metadata.fixer.MetadataFixerConfig;
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
import org.verapdf.processor.BatchProcessor;
import org.verapdf.processor.ProcessorConfig;
import org.verapdf.processor.ProcessorFactory;
import org.verapdf.processor.TaskType;
import org.verapdf.processor.plugins.PluginsCollectionConfig;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Component
@Slf4j
public class VeraPdfValidator {

    public VeraPdfValidator() {
        // Initialize VeraPDF
        VeraGreenfieldFoundryProvider.initialise();
    }

    /**
     * Validates a PDF file for PDF/A compliance using VeraPDF
     * 
     * @param pdfPath Path to the PDF file
     * @param flavour PDF/A flavour to validate against (e.g., PDFA_1_B, PDFA_2_B)
     * @return List of issues found in the PDF
     */
    public List<PdfIssue> validatePdfA(String pdfPath, PDFAFlavour flavour) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Create a parser for the PDF document
            try (PDFAParser parser = Foundries.defaultInstance().createParser(new File(pdfPath), flavour)) {
                // Create a validator for the PDF/A flavour
                PDFAValidator validator = Foundries.defaultInstance().createValidator(flavour, false);
                
                // Validate the document
                ValidationResult result = validator.validate(parser);
                
                // Process the validation results
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
                                .type("PDF/A Compliance")
                                .severity(severity)
                                .message(formatAssertionMessage(assertion))
                                .description(assertion.getMessage())
                                .location(assertion.getLocation() != null ? assertion.getLocation().getContext() : null)
                                .autoFixable(isFixable(assertion))
                                .build();
                            
                            issues.add(issue);
                        }
                    }
                }
            }
        } catch (IOException | ValidationException | ModelParsingException | EncryptedPdfException e) {
            log.error("Error validating PDF/A compliance: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type("PDF/A Validation Error")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error validating PDF/A compliance: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    /**
     * Validates a PDF file for PDF/UA (Universal Accessibility) compliance
     * 
     * @param pdfPath Path to the PDF file
     * @return List of issues found in the PDF
     */
    public List<PdfIssue> validatePdfUA(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Load the PDF/UA validation profile
            ProfileDirectory directory = Profiles.getVeraProfileDirectory();
            ValidationProfile profile = directory.getValidationProfileByFlavour(PDFAFlavour.PDFUA_1);
            
            if (profile == null) {
                log.warn("PDF/UA validation profile not found");
                issues.add(PdfIssue.builder()
                    .id(UUID.randomUUID().toString())
                    .type("PDF/UA Validation")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF/UA validation profile not available")
                    .autoFixable(false)
                    .build());
                return issues;
            }
            
            // Create a parser with PDF/UA flavour
            try (PDFAParser parser = Foundries.defaultInstance().createParser(new File(pdfPath), PDFAFlavour.PDFUA_1)) {
                // Create a validator with the PDF/UA profile
                PDFAValidator validator = Foundries.defaultInstance().createValidator(profile, false);
                
                // Validate the document
                ValidationResult result = validator.validate(parser);
                
                // Process the validation results
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
                                .type("PDF/UA Compliance")
                                .severity(severity)
                                .message(formatAssertionMessage(assertion))
                                .description(assertion.getMessage())
                                .location(assertion.getLocation() != null ? assertion.getLocation().getContext() : null)
                                .autoFixable(isFixable(assertion))
                                .build();
                            
                            issues.add(issue);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error validating PDF/UA compliance: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type("PDF/UA Validation Error")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error validating PDF/UA compliance: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    /**
     * Validates a PDF file for PDF/X (print production) compliance
     * 
     * @param pdfPath Path to the PDF file
     * @return List of issues found in the PDF
     */
    public List<PdfIssue> validatePdfX(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Set up processor configuration for PDF/X validation
            Set<TaskType> tasks = EnumSet.of(TaskType.VALIDATE);
            
            // Create processor config
            ProcessorConfig config = ProcessorFactory.fromValues(tasks, getFeatureConfig(), 
                PDFAFlavour.NO_FLAVOUR, null, getFixerConfig(), getPluginsConfig());
            
            // Create processor
            BatchProcessor processor = ProcessorFactory.createBatchProcessor(config);
            
            // Process the file and extract validation results
            // Note: In a real implementation, you would process the results from the processor
            // This is a simplified version that focuses on the integration pattern
            
            // For now, we'll add a placeholder issue
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type("PDF/X Validation")
                .severity(PdfIssue.IssueSeverity.MEDIUM)
                .message("PDF/X validation is being developed with VeraPDF integration")
                .autoFixable(false)
                .build());
        } catch (Exception e) {
            log.error("Error validating PDF/X compliance: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type("PDF/X Validation Error")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error validating PDF/X compliance: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    /**
     * Validates a PDF file for WCAG 2.1 (Web Content Accessibility Guidelines) compliance
     * 
     * @param pdfPath Path to the PDF file
     * @return List of issues found in the PDF
     */
    public List<PdfIssue> validateWcag(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        // WCAG validation requires additional checks beyond PDF/UA
        // For now, we'll leverage PDF/UA checks and add WCAG-specific checks
        List<PdfIssue> pdfuaIssues = validatePdfUA(pdfPath);
        issues.addAll(pdfuaIssues);
        
        try {
            // Extract additional WCAG-specific features using VeraPDF's feature extraction
            FeatureExtractorConfig featureConfig = getFeatureConfig();
            
            // In a real implementation, you would extract features and analyze them for WCAG compliance
            // For now, we'll add a placeholder issue
            if (pdfuaIssues.isEmpty()) {
                issues.add(PdfIssue.builder()
                    .id(UUID.randomUUID().toString())
                    .type("WCAG 2.1")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("PDF meets basic accessibility requirements, but full WCAG 2.1 validation requires additional tests")
                    .autoFixable(false)
                    .build());
            }
        } catch (Exception e) {
            log.error("Error validating WCAG compliance: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .id(UUID.randomUUID().toString())
                .type("WCAG Validation Error")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error validating WCAG compliance: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    /**
     * Creates a feature extractor configuration
     * 
     * @return FeatureExtractorConfig
     */
    private FeatureExtractorConfig getFeatureConfig() {
        return FeatureFactory.defaultConfig();
    }
    
    /**
     * Creates a metadata fixer configuration
     * 
     * @return MetadataFixerConfig
     */
    private MetadataFixerConfig getFixerConfig() {
        return FixerFactory.defaultConfig();
    }
    
    /**
     * Creates a plugins configuration
     * 
     * @return PluginsCollectionConfig
     */
    private PluginsCollectionConfig getPluginsConfig() {
        return PluginsCollectionConfig.defaultConfig();
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
        // This is a simplified implementation
        // In a real scenario, you would have a more sophisticated logic to determine fixability
        return assertion.getRuleId() != null && 
            (assertion.getRuleId().contains("metadata") || 
             assertion.getRuleId().contains("font") || 
             assertion.getRuleId().contains("color") ||
             assertion.getMessage().contains("embedding"));
    }
}
