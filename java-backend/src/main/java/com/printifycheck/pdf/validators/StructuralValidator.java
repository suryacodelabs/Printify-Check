
package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class StructuralValidator {

    public List<PdfIssue> validateStructure(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check linearization
            if (!isLinearized(reader)) {
                issues.add(PdfIssue.builder()
                    .type("Linearization")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF is not linearized for web optimization")
                    .autoFixable(true)
                    .fixDescription("Apply linearization to optimize file for web viewing")
                    .build());
            }
            
            // Check object streams
            if (!hasObjectStreams(pdfDoc)) {
                issues.add(PdfIssue.builder()
                    .type("Object Streams")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("PDF does not use object streams for efficient storage")
                    .autoFixable(true)
                    .fixDescription("Apply object stream compression to reduce file size")
                    .build());
            }
            
            // Validate XREF table
            List<PdfIssue> xrefIssues = validateXrefTable(pdfPath);
            issues.addAll(xrefIssues);
            
            // Validate syntax
            List<PdfIssue> syntaxIssues = validateSyntax(pdfDoc);
            issues.addAll(syntaxIssues);
            
            // Validate page count
            if (pdfDoc.getNumberOfPages() <= 0) {
                issues.add(PdfIssue.builder()
                    .type("Page Count")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("PDF has an invalid page count")
                    .autoFixable(false)
                    .build());
            }
            
            // Validate file size (>100MB is a warning)
            long fileSizeInMB = reader.getFileLength() / (1024 * 1024);
            if (fileSizeInMB > 100) {
                issues.add(PdfIssue.builder()
                    .type("File Size")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF file size is large: " + fileSizeInMB + "MB")
                    .autoFixable(true)
                    .fixDescription("Optimize file to reduce size")
                    .build());
            }
            
            // Check for embedded files
            List<PdfIssue> embeddedFileIssues = checkEmbeddedFiles(pdfDoc);
            issues.addAll(embeddedFileIssues);
            
            // Validate annotations
            List<PdfIssue> annotationIssues = validateAnnotations(pdfDoc);
            issues.addAll(annotationIssues);
            
            // Validate forms
            List<PdfIssue> formIssues = validateForms(pdfDoc);
            issues.addAll(formIssues);
            
            // Validate actions
            List<PdfIssue> actionIssues = validateActions(pdfDoc);
            issues.addAll(actionIssues);
            
        } catch (IOException e) {
            log.error("Error validating PDF structure: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("File Structure")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("PDF file is corrupt or cannot be read: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private boolean isLinearized(PdfReader reader) {
        try {
            // More accurate linearization check
            RandomAccessFile raf = new RandomAccessFile(reader.getFileFromSource(), "r");
            byte[] buffer = new byte[1024];
            raf.read(buffer);
            String header = new String(buffer);
            raf.close();
            
            // Check for /Linearized entry in the header
            return header.contains("/Linearized") || reader.isOpenedWithFullPermission();
        } catch (Exception e) {
            log.error("Error checking linearization: {}", e.getMessage(), e);
            return false;
        }
    }
    
    private boolean hasObjectStreams(PdfDocument pdfDoc) {
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPdfObjects(); i++) {
                PdfObject obj = pdfDoc.getPdfObject(i);
                if (obj != null && obj.isStream()) {
                    PdfStream stream = (PdfStream) obj;
                    if (stream.containsKey(PdfName.Type) && 
                        PdfName.ObjStm.equals(stream.getAsName(PdfName.Type))) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking for object streams", e);
        }
        return false;
    }
    
    private List<PdfIssue> validateXrefTable(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        try {
            RandomAccessFile raf = new RandomAccessFile(pdfPath, "r");
            long fileSize = raf.length();
            
            // Check for startxref at the end of the file
            raf.seek(Math.max(0, fileSize - 1024));
            byte[] buffer = new byte[(int)Math.min(1024, fileSize)];
            raf.readFully(buffer);
            String trailer = new String(buffer);
            raf.close();
            
            if (!trailer.contains("startxref")) {
                issues.add(PdfIssue.builder()
                    .type("XREF Table")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("PDF has invalid or missing XREF table")
                    .autoFixable(true)
                    .fixDescription("Repair XREF table for better reliability")
                    .build());
            }
            
            // Check if PDF uses cross-reference streams (PDF 1.5+)
            if (!trailer.contains("/XRef")) {
                issues.add(PdfIssue.builder()
                    .type("XREF Stream")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("PDF uses traditional XREF table instead of more efficient XREF stream")
                    .autoFixable(true)
                    .fixDescription("Convert to XREF stream for better efficiency")
                    .build());
            }
        } catch (Exception e) {
            log.error("Error validating XREF table: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("XREF Analysis")
                .severity(PdfIssue.IssueSeverity.MEDIUM)
                .message("Unable to analyze XREF structure: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        return issues;
    }
    
    private List<PdfIssue> validateSyntax(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check PDF version
            if (pdfDoc.getReader().getVersionInfo().getPdfVersion() < PdfVersion.PDF_1_7.getVersion()) {
                issues.add(PdfIssue.builder()
                    .type("PDF Version")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF version is outdated, using version " + 
                             pdfDoc.getReader().getVersionInfo().getPdfVersion())
                    .autoFixable(true)
                    .fixDescription("Update to PDF version 1.7 or higher")
                    .build());
            }
            
            // Check PDF dictionary structure
            try {
                PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
                if (catalog == null) {
                    issues.add(PdfIssue.builder()
                        .type("Syntax Error")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("PDF is missing catalog dictionary")
                        .autoFixable(false)
                        .build());
                }
                
                // Check for damaged objects
                int damaged = 0;
                for (int i = 1; i <= pdfDoc.getNumberOfPdfObjects(); i++) {
                    try {
                        PdfObject obj = pdfDoc.getPdfObject(i);
                        if (obj == null) damaged++;
                    } catch (Exception e) {
                        damaged++;
                    }
                }
                
                if (damaged > 0) {
                    issues.add(PdfIssue.builder()
                        .type("Damaged Objects")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("PDF contains " + damaged + " damaged or invalid objects")
                        .autoFixable(true)
                        .fixDescription("Repair damaged objects")
                        .build());
                }
                
            } catch (Exception e) {
                issues.add(PdfIssue.builder()
                    .type("Syntax Error")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Error in PDF structure: " + e.getMessage())
                    .autoFixable(false)
                    .build());
            }
        } catch (Exception e) {
            log.error("Error validating PDF syntax", e);
            issues.add(PdfIssue.builder()
                .type("Syntax Error")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("General syntax error in PDF: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkEmbeddedFiles(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.Names)) {
                PdfDictionary names = catalog.getAsDictionary(PdfName.Names);
                if (names != null && names.containsKey(PdfName.EmbeddedFiles)) {
                    issues.add(PdfIssue.builder()
                        .type("Embedded Files")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("PDF contains embedded files which may not be wanted for print")
                        .autoFixable(true)
                        .fixDescription("Remove embedded files")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking for embedded files", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> validateAnnotations(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfArray annots = page.getPdfObject().getAsArray(PdfName.Annots);
                if (annots != null && !annots.isEmpty()) {
                    for (int j = 0; j < annots.size(); j++) {
                        PdfDictionary annot = annots.getAsDictionary(j);
                        if (annot == null) continue;
                        
                        // Check annotation type
                        PdfName subtype = annot.getAsName(PdfName.Subtype);
                        if (PdfName.Link.equals(subtype) || 
                            PdfName.Widget.equals(subtype) ||
                            PdfName.Highlight.equals(subtype)) {
                            
                            issues.add(PdfIssue.builder()
                                .type("Annotations")
                                .severity(PdfIssue.IssueSeverity.LOW)
                                .message("PDF contains " + subtype.getValue() + 
                                         " annotations on page " + i +
                                         " which may not display in print")
                                .page(i)
                                .autoFixable(true)
                                .fixDescription("Flatten or remove annotations")
                                .build());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error validating annotations", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> validateForms(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.AcroForm)) {
                PdfDictionary acroForm = catalog.getAsDictionary(PdfName.AcroForm);
                if (acroForm != null) {
                    PdfArray fields = acroForm.getAsArray(PdfName.Fields);
                    if (fields != null && !fields.isEmpty()) {
                        issues.add(PdfIssue.builder()
                            .type("Form Fields")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("PDF contains " + fields.size() + 
                                     " form fields which may not display correctly in print")
                            .autoFixable(true)
                            .fixDescription("Flatten form fields")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error validating forms", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> validateActions(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check catalog for open actions
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.OpenAction)) {
                issues.add(PdfIssue.builder()
                    .type("Actions")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("PDF contains OpenAction which may affect viewing")
                    .autoFixable(true)
                    .fixDescription("Remove OpenAction")
                    .build());
            }
            
            // Check for JavaScript actions
            if (catalog.containsKey(PdfName.Names)) {
                PdfDictionary names = catalog.getAsDictionary(PdfName.Names);
                if (names != null && names.containsKey(PdfName.JavaScript)) {
                    issues.add(PdfIssue.builder()
                        .type("JavaScript")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("PDF contains JavaScript which is not suitable for print")
                        .autoFixable(true)
                        .fixDescription("Remove JavaScript")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error validating actions", e);
        }
        
        return issues;
    }
}
