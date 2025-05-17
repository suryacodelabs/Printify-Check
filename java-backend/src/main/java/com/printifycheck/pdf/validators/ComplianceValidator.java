package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.verapdf.pdfa.flavours.PDFAFlavour;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class ComplianceValidator {
    private final VeraPdfValidator veraPdfValidator;

    public List<PdfIssue> validateCompliance(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Using VeraPDF for comprehensive compliance validation
            
            // Check PDF/A compliance (1b, 2b, 3b)
            log.info("Checking PDF/A-1b compliance");
            List<PdfIssue> pdfA1bIssues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_1_B);
            if (!pdfA1bIssues.isEmpty()) {
                issues.addAll(pdfA1bIssues);
            }
            
            // Check PDF/A-2b compliance if needed
            if (issues.isEmpty()) {
                log.info("Checking PDF/A-2b compliance");
                List<PdfIssue> pdfA2bIssues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_2_B);
                if (!pdfA2bIssues.isEmpty()) {
                    issues.addAll(pdfA2bIssues);
                }
            }
            
            // Check PDF/UA compliance
            log.info("Checking PDF/UA compliance");
            List<PdfIssue> pdfUAIssues = veraPdfValidator.validatePdfUA(pdfPath);
            issues.addAll(pdfUAIssues);
            
            // Check PDF/X compliance
            log.info("Checking PDF/X compliance");
            List<PdfIssue> pdfXIssues = veraPdfValidator.validatePdfX(pdfPath);
            issues.addAll(pdfXIssues);
            
            // Check WCAG 2.1 compliance
            log.info("Checking WCAG 2.1 compliance");
            List<PdfIssue> wcagIssues = veraPdfValidator.validateWcag(pdfPath);
            issues.addAll(wcagIssues);
            
            // If no issues found with VeraPDF, perform additional checks using iText
            if (issues.isEmpty()) {
                issues.addAll(performAdditionalComplianceChecks(pdfPath));
            }
            
        } catch (Exception e) {
            log.error("Error validating PDF compliance: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Compliance Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing compliance: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    // Perform additional compliance checks using iText or other libraries
    private List<PdfIssue> performAdditionalComplianceChecks(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check for PDF/A metadata marker
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.Metadata)) {
                PdfStream metadataStream = catalog.getAsStream(PdfName.Metadata);
                if (metadataStream != null) {
                    byte[] metadataBytes = metadataStream.getBytes();
                    String metadata = new String(metadataBytes);
                    
                    if (metadata.contains("pdfaid:conformance") || 
                        metadata.contains("http://www.aiim.org/pdfa/ns/id/") ||
                        metadata.contains("PDF/A")) {
                        // PDF/A metadata found
                    } else {
                        issues.add(PdfIssue.builder()
                            .type("PDF/A Compliance")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document is not PDF/A compliant. PDF/A is recommended for archival purposes")
                            .autoFixable(true)
                            .fixDescription("Convert to PDF/A")
                            .build());
                    }
                }
            }
            
            // Check for PDF/X output intent
            PdfArray outputIntents = pdfDoc.getCatalog().getPdfObject().getAsArray(PdfName.OutputIntents);
            if (outputIntents != null) {
                boolean isPdfX = false;
                for (int i = 0; i < outputIntents.size(); i++) {
                    PdfDictionary intent = outputIntents.getAsDictionary(i);
                    if (intent != null) {
                        PdfName outputConditionIdentifier = intent.getAsName(new PdfName("OutputCondition"));
                        PdfName outputIntentSubtype = intent.getAsName(PdfName.S);
                        
                        if (outputIntentSubtype != null && 
                            (outputIntentSubtype.toString().contains("GTS_PDFX") || 
                             outputIntentSubtype.toString().contains("PDF/X"))) {
                            isPdfX = true;
                            break;
                        }
                    }
                }
                if (!isPdfX) {
                    issues.add(PdfIssue.builder()
                        .type("PDF/X Compliance")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("Document is not PDF/X compliant. PDF/X is recommended for print production")
                        .autoFixable(true)
                        .fixDescription("Convert to PDF/X-1a or PDF/X-4")
                        .build());
                }
            }
            
            // Also check metadata for PDF/X markers
            if (catalog.containsKey(PdfName.Metadata)) {
                PdfStream metadataStream = catalog.getAsStream(PdfName.Metadata);
                if (metadataStream != null) {
                    byte[] metadataBytes = metadataStream.getBytes();
                    String metadata = new String(metadataBytes);
                    
                    if (metadata.contains("pdfxid:GTS_PDFXVersion") || 
                        metadata.contains("http://www.npes.org/pdfx/ns/id/") ||
                        metadata.contains("PDF/X")) {
                        // PDF/X metadata found
                    } else {
                        issues.add(PdfIssue.builder()
                            .type("PDF/X Compliance")
                            .severity(PdfIssue.IssueSeverity.HIGH)
                            .message("Document is not PDF/X compliant. PDF/X is recommended for print production")
                            .autoFixable(true)
                            .fixDescription("Convert to PDF/X-1a or PDF/X-4")
                            .build());
                    }
                }
            }
            
            // Check for PDF/UA metadata marker
            if (catalog.containsKey(PdfName.Metadata)) {
                PdfStream metadataStream = catalog.getAsStream(PdfName.Metadata);
                if (metadataStream != null) {
                    byte[] metadataBytes = metadataStream.getBytes();
                    String metadata = new String(metadataBytes);
                    
                    if (metadata.contains("pdfuaid:part") || 
                        metadata.contains("http://www.aiim.org/pdfua/ns/id/") ||
                        metadata.contains("PDF/UA")) {
                        // PDF/UA metadata found
                    } else {
                        issues.add(PdfIssue.builder()
                            .type("PDF/UA Compliance")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document is not PDF/UA compliant. PDF/UA is recommended for accessibility")
                            .autoFixable(true)
                            .fixDescription("Add document tags and structure to meet PDF/UA requirements")
                            .build());
                    }
                }
            }
            
            // Also check for structure tree
            if (catalog.containsKey(PdfName.MarkInfo)) {
                PdfDictionary markInfo = catalog.getAsDictionary(PdfName.MarkInfo);
                if (markInfo != null && markInfo.getAsBoolean(PdfName.Marked) != null && 
                    markInfo.getAsBoolean(PdfName.Marked).getValue()) {
                    
                    // Document is tagged, but we still need Structure Tree Root
                    if (!catalog.containsKey(PdfName.StructTreeRoot)) {
                        issues.add(PdfIssue.builder()
                            .type("PDF/UA Compliance")
                            .severity(PdfIssue.IssueSeverity.LOW)
                            .message("Document has tags but is not fully PDF/UA compliant. PDF/UA improves accessibility")
                            .autoFixable(true)
                            .fixDescription("Enhance accessibility to meet PDF/UA requirements")
                            .build());
                    }
                } else {
                    issues.add(PdfIssue.builder()
                        .type("PDF/UA Compliance")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document is not PDF/UA compliant. PDF/UA is recommended for accessibility")
                        .autoFixable(true)
                        .fixDescription("Add document tags and structure to meet PDF/UA requirements")
                        .build());
                }
            }
            
            // Check GWG 2022 (Ghent Workgroup) profiles for print production
            boolean hasOutputIntent = false;
            PdfArray outputIntentsGWG = pdfDoc.getCatalog().getPdfObject().getAsArray(PdfName.OutputIntents);
            if (outputIntentsGWG != null && !outputIntentsGWG.isEmpty()) {
                hasOutputIntent = true;
            }
            
            if (!hasOutputIntent) {
                issues.add(PdfIssue.builder()
                    .type("GWG 2022")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Document does not have an output intent as required by GWG 2022")
                    .autoFixable(true)
                    .fixDescription("Add appropriate output intent")
                    .build());
            }
            
            if (pdfDoc.getPdfVersion() < PdfVersion.PDF_1_4.getVersion()) {
                issues.add(PdfIssue.builder()
                    .type("GWG 2022")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF version " + pdfDoc.getPdfVersion() + 
                             " is below the minimum 1.4 required by GWG 2022")
                    .autoFixable(true)
                    .fixDescription("Upgrade to at least PDF 1.4")
                    .build());
            }
            
            issues.add(PdfIssue.builder()
                .type("GWG 2022")
                .severity(PdfIssue.IssueSeverity.LOW)
                .message("Full GWG 2022 compliance requires detailed validation")
                .autoFixable(false)
                .fixDescription("Consider using a specialized GWG preflight tool")
                .build());
            
            // Check ISO 32000-2 compliance
            if (pdfDoc.getPdfVersion() < PdfVersion.PDF_2_0.getVersion()) {
                issues.add(PdfIssue.builder()
                    .type("ISO 32000-2")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Document is not PDF 2.0 (ISO 32000-2)")
                    .autoFixable(true)
                    .fixDescription("Upgrade to PDF 2.0")
                    .build());
            }
            
        } catch (IOException e) {
            log.error("Error performing additional compliance checks: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Additional Compliance Checks")
                .severity(PdfIssue.IssueSeverity.MEDIUM)
                .message("Error performing additional compliance checks: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
}
