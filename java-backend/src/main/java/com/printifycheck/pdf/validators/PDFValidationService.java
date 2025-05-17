package com.printifycheck.pdf.validators;

import com.printifycheck.model.PdfIssue;
import com.printifycheck.model.ValidationCategory;
import com.printifycheck.model.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PDFValidationService {

    private final StructuralValidator structuralValidator;
    private final FontValidator fontValidator;
    private final ColorValidator colorValidator;
    private final ImageValidator imageValidator;
    private final ComplianceValidator complianceValidator;
    private final SecurityValidator securityValidator;
    private final PrintProductionValidator printProductionValidator;
    
    public ValidationResult validatePDF(String filePath, String userId, String fileName) {
        log.info("Starting comprehensive PDF validation for file: {}", filePath);
        Map<ValidationCategory, List<PdfIssue>> issuesByCategory = new HashMap<>();
        long startTime = System.currentTimeMillis();
        
        try {
            // Check if file exists
            File pdfFile = new File(filePath);
            if (!pdfFile.exists() || !pdfFile.isFile()) {
                log.error("PDF file not found: {}", filePath);
                issuesByCategory.put(ValidationCategory.STRUCTURAL, List.of(
                    PdfIssue.builder()
                        .type("File Access")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("PDF file not found or cannot be accessed")
                        .autoFixable(false)
                        .build()
                ));
                
                return buildErrorResult(userId, fileName, pdfFile.length(), issuesByCategory);
            }
            
            // Run all validators in parallel for performance
            Map<ValidationCategory, List<PdfIssue>> results = runValidators(filePath);
            issuesByCategory.putAll(results);
            
            // Calculate quality score based on issues
            double qualityScore = calculateQualityScore(issuesByCategory);
            
            // Determine what fixes are supported
            Map<String, Boolean> supportedFixes = determineSupportedFixes(issuesByCategory);
            
            long endTime = System.currentTimeMillis();
            log.info("PDF validation completed in {} ms with quality score: {}", 
                    (endTime - startTime), qualityScore);
            
            return ValidationResult.builder()
                    .checkId(UUID.randomUUID().toString())
                    .userId(userId)
                    .fileName(fileName)
                    .fileSize(pdfFile.length())
                    .issuesByCategory(issuesByCategory)
                    .totalIssues(countTotalIssues(issuesByCategory))
                    .qualityScore(qualityScore)
                    .supportedFixes(supportedFixes)
                    .build();
            
        } catch (Exception e) {
            log.error("Error during PDF validation: {}", e.getMessage(), e);
            issuesByCategory.put(ValidationCategory.STRUCTURAL, List.of(
                PdfIssue.builder()
                    .type("Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
            
            return buildErrorResult(userId, fileName, 0, issuesByCategory);
        }
    }
    
    private Map<ValidationCategory, List<PdfIssue>> runValidators(String filePath) {
        Map<ValidationCategory, List<PdfIssue>> results = new HashMap<>();
        
        // Run all validators
        try {
            List<PdfIssue> structuralIssues = structuralValidator.validateStructure(filePath);
            results.put(ValidationCategory.STRUCTURAL, structuralIssues);
        } catch (Exception e) {
            log.error("Error in structural validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.STRUCTURAL, List.of(
                PdfIssue.builder()
                    .type("Structural Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during structural validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> fontIssues = fontValidator.validateFonts(filePath);
            results.put(ValidationCategory.FONTS, fontIssues);
        } catch (Exception e) {
            log.error("Error in font validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.FONTS, List.of(
                PdfIssue.builder()
                    .type("Font Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during font validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> colorIssues = colorValidator.validateColors(filePath);
            results.put(ValidationCategory.COLOR, colorIssues);
        } catch (Exception e) {
            log.error("Error in color validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.COLOR, List.of(
                PdfIssue.builder()
                    .type("Color Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during color validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> imageIssues = imageValidator.validateImages(filePath);
            results.put(ValidationCategory.IMAGE, imageIssues);
        } catch (Exception e) {
            log.error("Error in image validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.IMAGE, List.of(
                PdfIssue.builder()
                    .type("Image Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during image validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> complianceIssues = complianceValidator.validateCompliance(filePath);
            results.put(ValidationCategory.COMPLIANCE, complianceIssues);
        } catch (Exception e) {
            log.error("Error in compliance validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.COMPLIANCE, List.of(
                PdfIssue.builder()
                    .type("Compliance Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during compliance validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> securityIssues = securityValidator.validateSecurity(filePath);
            results.put(ValidationCategory.SECURITY, securityIssues);
        } catch (Exception e) {
            log.error("Error in security validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.SECURITY, List.of(
                PdfIssue.builder()
                    .type("Security Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during security validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        try {
            List<PdfIssue> printProductionIssues = printProductionValidator.validatePrintProduction(filePath);
            results.put(ValidationCategory.PRINT_PRODUCTION, printProductionIssues);
        } catch (Exception e) {
            log.error("Error in print production validation: {}", e.getMessage(), e);
            results.put(ValidationCategory.PRINT_PRODUCTION, List.of(
                PdfIssue.builder()
                    .type("Print Production Validation Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error during print production validation: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            ));
        }
        
        return results;
    }
    
    private ValidationResult buildErrorResult(String userId, String fileName, long fileSize, 
                                              Map<ValidationCategory, List<PdfIssue>> issues) {
        return ValidationResult.builder()
                .checkId(UUID.randomUUID().toString())
                .userId(userId)
                .fileName(fileName)
                .fileSize(fileSize)
                .issuesByCategory(issues)
                .totalIssues(countTotalIssues(issues))
                .qualityScore(0)
                .supportedFixes(new HashMap<>())
                .build();
    }
    
    private int countTotalIssues(Map<ValidationCategory, List<PdfIssue>> issuesByCategory) {
        return issuesByCategory.values().stream()
                .mapToInt(List::size)
                .sum();
    }
    
    private double calculateQualityScore(Map<ValidationCategory, List<PdfIssue>> issuesByCategory) {
        // Base score starts at 100
        double score = 100.0;
        
        // Count issues by severity
        int criticalCount = 0;
        int warningCount = 0;
        int infoCount = 0;
        
        for (List<PdfIssue> issues : issuesByCategory.values()) {
            for (PdfIssue issue : issues) {
                switch (issue.getSeverity()) {
                    case HIGH:
                        criticalCount++;
                        break;
                    case MEDIUM:
                        warningCount++;
                        break;
                    case LOW:
                        infoCount++;
                        break;
                }
            }
        }
        
        // Deduct points for issues
        // Critical issues have a larger impact
        score -= criticalCount * 10;
        score -= warningCount * 3;
        score -= infoCount * 1;
        
        // Ensure score doesn't go below 0
        return Math.max(0, score);
    }
    
    private Map<String, Boolean> determineSupportedFixes(Map<ValidationCategory, List<PdfIssue>> issuesByCategory) {
        Map<String, Boolean> fixes = new HashMap<>();
        
        // Initialize all fix types as false
        fixes.put("linearization", false);
        fixes.put("fontEmbedding", false);
        fixes.put("rgbToCmyk", false);
        fixes.put("addBleed", false);
        fixes.put("fixOverprint", false);
        fixes.put("flattenTransparency", false);
        fixes.put("optimizeImages", false);
        fixes.put("pdfA", false);
        fixes.put("pdfX", false);
        fixes.put("removeJavaScript", false);
        fixes.put("sanitizeMetadata", false);
        // New Phase 2 structural fix types
        fixes.put("repairXref", false);
        fixes.put("convertToXrefStream", false);
        fixes.put("repairDamagedObjects", false);
        fixes.put("updatePdfVersion", false);
        fixes.put("objectStreams", false);
        
        // Determine supported fixes based on detected issues
        for (Map.Entry<ValidationCategory, List<PdfIssue>> entry : issuesByCategory.entrySet()) {
            for (PdfIssue issue : entry.getValue()) {
                if (!issue.isAutoFixable()) continue;
                
                switch (issue.getType()) {
                    case "Linearization":
                        fixes.put("linearization", true);
                        break;
                    case "Object Streams":
                        fixes.put("objectStreams", true);
                        break;
                    case "XREF Table":
                        fixes.put("repairXref", true);
                        break;
                    case "XREF Stream":
                        fixes.put("convertToXrefStream", true);
                        break;
                    case "Damaged Objects":
                        fixes.put("repairDamagedObjects", true);
                        break;
                    case "PDF Version":
                        fixes.put("updatePdfVersion", true);
                        break;
                    case "Non-Embedded Font":
                        fixes.put("fontEmbedding", true);
                        break;
                    case "RGB in CMYK":
                    case "RGB Images in CMYK":
                        fixes.put("rgbToCmyk", true);
                        break;
                    case "Bleed":
                        fixes.put("addBleed", true);
                        break;
                    case "Overprint":
                        fixes.put("fixOverprint", true);
                        break;
                    case "Transparency":
                    case "Image Transparency":
                        fixes.put("flattenTransparency", true);
                        break;
                    case "Low Resolution":
                    case "Image Size":
                    case "Image Compression":
                        fixes.put("optimizeImages", true);
                        break;
                    case "PDF/A Compliance":
                        fixes.put("pdfA", true);
                        break;
                    case "PDF/X Compliance":
                        fixes.put("pdfX", true);
                        break;
                    case "JavaScript":
                        fixes.put("removeJavaScript", true);
                        break;
                    case "Metadata Sensitivity":
                        fixes.put("sanitizeMetadata", true);
                        break;
                }
            }
        }
        
        return fixes;
    }
}
