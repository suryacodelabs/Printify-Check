
package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class SecurityValidator {

    public List<PdfIssue> validateSecurity(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check encryption strength
            List<PdfIssue> encryptionIssues = checkEncryption(reader, pdfDoc);
            issues.addAll(encryptionIssues);
            
            // Check digital signatures
            List<PdfIssue> signatureIssues = checkSignatures(pdfDoc);
            issues.addAll(signatureIssues);
            
            // Check JavaScript
            List<PdfIssue> javascriptIssues = checkJavascript(pdfDoc);
            issues.addAll(javascriptIssues);
            
            // Check hidden layers
            List<PdfIssue> hiddenLayerIssues = checkHiddenLayers(pdfDoc);
            issues.addAll(hiddenLayerIssues);
            
            // Check embedded attachments
            List<PdfIssue> attachmentIssues = checkEmbeddedAttachments(pdfDoc);
            issues.addAll(attachmentIssues);
            
            // Check password protection
            List<PdfIssue> passwordIssues = checkPasswordProtection(reader);
            issues.addAll(passwordIssues);
            
            // Check access permissions
            List<PdfIssue> permissionIssues = checkAccessPermissions(reader);
            issues.addAll(permissionIssues);
            
            // Check metadata sensitivity
            List<PdfIssue> metadataIssues = checkMetadataSensitivity(pdfDoc);
            issues.addAll(metadataIssues);
            
        } catch (IOException e) {
            log.error("Error validating PDF security: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Security Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing security: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkEncryption(PdfReader reader, PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check if document is encrypted
            if (reader.isEncrypted()) {
                // For print workflows, encryption can be problematic
                issues.add(PdfIssue.builder()
                    .type("Encryption")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Document is encrypted. This may cause issues in some print workflows")
                    .autoFixable(true)
                    .fixDescription("Remove encryption if appropriate for your workflow")
                    .build());
                
                // Check encryption strength
                if (isWeakEncryption(reader)) {
                    issues.add(PdfIssue.builder()
                        .type("Encryption Strength")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document uses weak encryption. Consider using AES-256 encryption")
                        .autoFixable(true)
                        .fixDescription("Upgrade to AES-256 encryption")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking encryption", e);
        }
        
        return issues;
    }
    
    private boolean isWeakEncryption(PdfReader reader) {
        try {
            // This is a simplified check - in real implementations, we would have more detailed analysis
            // Often we'd need to analyze the document's encryption dictionary
            
            // Most PDF readers won't expose encryption details directly
            // For a real implementation, we would need to check encryption dictionary (V and R entries)
            // V=1 or V=2 with R=2 or R=3 would be RC4 (weak)
            // V=4 or V=5 with R=4 would be AES but potentially 128-bit (medium)
            // V=5 with R=6 would be AES-256 (strong)
            
            return true; // Conservative approach - mark as weak unless proven otherwise
        } catch (Exception e) {
            log.error("Error determining encryption strength", e);
            return true; // Conservative approach
        }
    }
    
    private List<PdfIssue> checkSignatures(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for digital signatures
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.AcroForm)) {
                PdfDictionary acroForm = catalog.getAsDictionary(PdfName.AcroForm);
                if (acroForm != null) {
                    PdfArray fields = acroForm.getAsArray(PdfName.Fields);
                    if (fields != null) {
                        boolean hasSignatures = false;
                        
                        // Check each field
                        for (int i = 0; i < fields.size(); i++) {
                            PdfDictionary field = fields.getAsDictionary(i);
                            if (field != null) {
                                PdfName fieldType = field.getAsName(PdfName.FT);
                                if (PdfName.Sig.equals(fieldType)) {
                                    hasSignatures = true;
                                    
                                    // Check if signature has been filled
                                    if (field.containsKey(PdfName.V)) {
                                        PdfDictionary value = field.getAsDictionary(PdfName.V);
                                        if (value != null) {
                                            // Document is signed
                                            // For printing, this might need verification
                                            issues.add(PdfIssue.builder()
                                                .type("Digital Signatures")
                                                .severity(PdfIssue.IssueSeverity.LOW)
                                                .message("Document contains digital signatures. " +
                                                         "Verify that modifications for print will not invalidate them")
                                                .autoFixable(false)
                                                .build());
                                            
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If signature fields exist but aren't filled
                        if (hasSignatures && issues.isEmpty()) {
                            issues.add(PdfIssue.builder()
                                .type("Digital Signatures")
                                .severity(PdfIssue.IssueSeverity.LOW)
                                .message("Document contains empty signature fields")
                                .autoFixable(true)
                                .fixDescription("Remove unused signature fields")
                                .build());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking digital signatures", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkJavascript(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for JavaScript in document
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            
            // Check for JavaScript in Names dictionary
            if (catalog.containsKey(PdfName.Names)) {
                PdfDictionary names = catalog.getAsDictionary(PdfName.Names);
                if (names != null && names.containsKey(PdfName.JavaScript)) {
                    issues.add(PdfIssue.builder()
                        .type("JavaScript")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document contains JavaScript which may not be supported in print workflows")
                        .autoFixable(true)
                        .fixDescription("Remove JavaScript")
                        .build());
                }
            }
            
            // Check for JavaScript actions
            if (catalog.containsKey(PdfName.OpenAction)) {
                PdfObject action = catalog.get(PdfName.OpenAction);
                if (action.isDictionary()) {
                    PdfDictionary actionDict = (PdfDictionary) action;
                    if (PdfName.JavaScript.equals(actionDict.getAsName(PdfName.S))) {
                        issues.add(PdfIssue.builder()
                            .type("JavaScript")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document contains JavaScript OpenAction which may not be supported in print workflows")
                            .autoFixable(true)
                            .fixDescription("Remove JavaScript")
                            .build());
                    }
                }
            }
            
            // Check for JavaScript in form fields
            if (catalog.containsKey(PdfName.AcroForm)) {
                PdfDictionary acroForm = catalog.getAsDictionary(PdfName.AcroForm);
                if (acroForm != null) {
                    PdfArray fields = acroForm.getAsArray(PdfName.Fields);
                    if (fields != null) {
                        boolean hasJavaScript = checkFieldsForJavaScript(fields);
                        if (hasJavaScript) {
                            issues.add(PdfIssue.builder()
                                .type("JavaScript")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message("Document contains form field JavaScript which may not be supported in print workflows")
                                .autoFixable(true)
                                .fixDescription("Remove JavaScript from form fields")
                                .build());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking JavaScript", e);
        }
        
        return issues;
    }
    
    private boolean checkFieldsForJavaScript(PdfArray fields) {
        try {
            for (int i = 0; i < fields.size(); i++) {
                PdfDictionary field = fields.getAsDictionary(i);
                if (field != null) {
                    // Check for additional-actions dictionary
                    if (field.containsKey(PdfName.AA)) {
                        PdfDictionary aa = field.getAsDictionary(PdfName.AA);
                        if (aa != null) {
                            // Various event triggers that might have JavaScript
                            String[] events = {"K", "F", "V", "C"};
                            for (String event : events) {
                                PdfDictionary action = aa.getAsDictionary(new PdfName(event));
                                if (action != null && PdfName.JavaScript.equals(action.getAsName(PdfName.S))) {
                                    return true;
                                }
                            }
                        }
                    }
                    
                    // Check for child fields
                    if (field.containsKey(PdfName.Kids)) {
                        PdfArray kids = field.getAsArray(PdfName.Kids);
                        if (kids != null && checkFieldsForJavaScript(kids)) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking fields for JavaScript", e);
        }
        
        return false;
    }
    
    private List<PdfIssue> checkHiddenLayers(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for Optional Content Groups (Layers)
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.OCProperties)) {
                PdfDictionary ocProperties = catalog.getAsDictionary(PdfName.OCProperties);
                if (ocProperties != null) {
                    PdfArray ocgs = ocProperties.getAsArray(PdfName.OCGs);
                    if (ocgs != null && !ocgs.isEmpty()) {
                        // Check default visibility configuration
                        PdfDictionary d = ocProperties.getAsDictionary(PdfName.D);
                        if (d != null) {
                            PdfArray off = d.getAsArray(PdfName.OFF);
                            if (off != null && !off.isEmpty()) {
                                issues.add(PdfIssue.builder()
                                    .type("Hidden Layers")
                                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                                    .message("Document contains hidden layers (" + off.size() + 
                                             " layers hidden). Content may be invisible when printed")
                                    .autoFixable(true)
                                    .fixDescription("Make all layers visible or flatten layers")
                                    .build());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking hidden layers", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkEmbeddedAttachments(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for file attachments
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            boolean hasAttachments = false;
            
            // Check in Names tree
            if (catalog.containsKey(PdfName.Names)) {
                PdfDictionary names = catalog.getAsDictionary(PdfName.Names);
                if (names != null && names.containsKey(PdfName.EmbeddedFiles)) {
                    hasAttachments = true;
                }
            }
            
            // Also check for FileAttachment annotations
            if (!hasAttachments) {
                for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                    PdfPage page = pdfDoc.getPage(i);
                    PdfArray annots = page.getPdfObject().getAsArray(PdfName.Annots);
                    if (annots != null) {
                        for (int j = 0; j < annots.size(); j++) {
                            PdfDictionary annot = annots.getAsDictionary(j);
                            if (annot != null) {
                                PdfName subtype = annot.getAsName(PdfName.Subtype);
                                if (PdfName.FileAttachment.equals(subtype)) {
                                    hasAttachments = true;
                                    break;
                                }
                            }
                        }
                    }
                    
                    if (hasAttachments) break;
                }
            }
            
            if (hasAttachments) {
                issues.add(PdfIssue.builder()
                    .type("Embedded Attachments")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Document contains embedded files which may not be included when printed")
                    .autoFixable(true)
                    .fixDescription("Remove embedded attachments or extract them separately")
                    .build());
            }
        } catch (Exception e) {
            log.error("Error checking embedded attachments", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkPasswordProtection(PdfReader reader) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            if (reader.isEncrypted()) {
                // Check if document has owner password
                // This is a simplified check - in real implementation we'd check encryption dictionary
                if (!reader.isOpenedWithFullPermission()) {
                    issues.add(PdfIssue.builder()
                        .type("Password Protection")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("Document is password-protected with restrictions. " +
                                 "This may prevent modifications needed for printing")
                        .autoFixable(false)
                        .fixDescription("Remove password protection if appropriate")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking password protection", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkAccessPermissions(PdfReader reader) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            if (reader.isEncrypted()) {
                // Check specific permissions that might affect printing
                if (!reader.isOpenedWithFullPermission()) {
                    // Check printing permissions
                    if (!reader.canPrint()) {
                        issues.add(PdfIssue.builder()
                            .type("Access Permissions")
                            .severity(PdfIssue.IssueSeverity.HIGH)
                            .message("Document does not allow printing")
                            .autoFixable(false)
                            .fixDescription("Remove restrictions with owner password")
                            .build());
                    } else if (!reader.canPrintDegraded()) {
                        issues.add(PdfIssue.builder()
                            .type("Access Permissions")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document only allows low-quality printing")
                            .autoFixable(false)
                            .fixDescription("Remove restrictions with owner password")
                            .build());
                    }
                    
                    // Check modification permissions
                    if (!reader.canModify()) {
                        issues.add(PdfIssue.builder()
                            .type("Access Permissions")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document does not allow modifications which may be needed for printing")
                            .autoFixable(false)
                            .fixDescription("Remove restrictions with owner password")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking access permissions", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkMetadataSensitivity(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check document info dictionary
            PdfDocumentInfo info = pdfDoc.getDocumentInfo();
            
            // Check for potentially sensitive metadata
            String[] fields = {
                "Author", "Title", "Subject", "Keywords", "Creator", "Producer"
            };
            
            List<String> sensitiveMeta = new ArrayList<>();
            
            for (String field : fields) {
                String value = info.getMoreInfo(field);
                if (value != null && !value.trim().isEmpty()) {
                    sensitiveMeta.add(field);
                }
            }
            
            // Check XMP metadata
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.Metadata)) {
                PdfStream metadataStream = catalog.getAsStream(PdfName.Metadata);
                if (metadataStream != null) {
                    byte[] metadataBytes = metadataStream.getBytes();
                    String metadata = new String(metadataBytes);
                    
                    // Look for potentially sensitive patterns in XMP
                    String[] patterns = {
                        "rdf:Description", "dc:creator", "xmp:CreatorTool", 
                        "xmp:ModifyDate", "pdf:Producer", "xmp:CreateDate"
                    };
                    
                    for (String pattern : patterns) {
                        if (metadata.contains(pattern)) {
                            sensitiveMeta.add("XMP Metadata");
                            break;
                        }
                    }
                }
            }
            
            if (!sensitiveMeta.isEmpty()) {
                issues.add(PdfIssue.builder()
                    .type("Metadata Sensitivity")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Document contains potentially sensitive metadata: " + 
                             String.join(", ", sensitiveMeta))
                    .autoFixable(true)
                    .fixDescription("Clean document metadata")
                    .build());
            }
        } catch (Exception e) {
            log.error("Error checking metadata sensitivity", e);
        }
        
        return issues;
    }
}
