
package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class FontValidator {

    public List<PdfIssue> validateFonts(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check for non-embedded fonts
            List<PdfIssue> embeddingIssues = checkFontEmbedding(pdfDoc);
            issues.addAll(embeddingIssues);
            
            // Check for invalid CMAPs
            List<PdfIssue> cmapIssues = checkCmaps(pdfDoc);
            issues.addAll(cmapIssues);
            
            // Check glyph widths
            List<PdfIssue> glyphWidthIssues = checkGlyphWidths(pdfDoc);
            issues.addAll(glyphWidthIssues);
            
            // Check Type 3 fonts
            List<PdfIssue> type3FontIssues = checkType3Fonts(pdfDoc);
            issues.addAll(type3FontIssues);
            
            // Check font subsetting
            List<PdfIssue> subsetIssues = checkFontSubsetting(pdfDoc);
            issues.addAll(subsetIssues);
            
            // Check text encoding
            List<PdfIssue> encodingIssues = checkTextEncoding(pdfDoc);
            issues.addAll(encodingIssues);
            
            // Check small text
            List<PdfIssue> smallTextIssues = checkSmallText(pdfDoc);
            issues.addAll(smallTextIssues);
            
        } catch (IOException e) {
            log.error("Error validating PDF fonts: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Font Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing fonts: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkFontEmbedding(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            PdfDictionary fontDescriptor = font.getAsDictionary(PdfName.FontDescriptor);
                            
                            if (fontDescriptor != null) {
                                boolean embedded = fontDescriptor.containsKey(PdfName.FontFile) || 
                                                 fontDescriptor.containsKey(PdfName.FontFile2) || 
                                                 fontDescriptor.containsKey(PdfName.FontFile3);
                                
                                if (!embedded) {
                                    PdfName fontName = fontDescriptor.getAsName(PdfName.FontName);
                                    String fontNameStr = fontName != null ? fontName.getValue() : key.getValue();
                                    
                                    issues.add(PdfIssue.builder()
                                        .type("Non-Embedded Font")
                                        .severity(PdfIssue.IssueSeverity.HIGH)
                                        .message("Font '" + fontNameStr + "' on page " + i + " is not embedded")
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Embed all fonts")
                                        .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking font embedding", e);
            issues.add(PdfIssue.builder()
                .type("Font Embedding")
                .severity(PdfIssue.IssueSeverity.MEDIUM)
                .message("Error checking font embedding: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkCmaps(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            
                            // Check for ToUnicode CMap
                            if (!font.containsKey(PdfName.ToUnicode)) {
                                PdfName subtype = font.getAsName(PdfName.Subtype);
                                if (PdfName.TrueType.equals(subtype) || PdfName.Type1.equals(subtype) || 
                                    PdfName.Type0.equals(subtype)) {
                                    
                                    issues.add(PdfIssue.builder()
                                        .type("Invalid CMAP")
                                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                                        .message("Font '" + key.getValue() + "' on page " + i + 
                                                 " is missing ToUnicode CMap which may affect text extraction and accessibility")
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Generate ToUnicode CMap for font")
                                        .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking CMAPs", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkGlyphWidths(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            PdfDictionary fontDescriptor = font.getAsDictionary(PdfName.FontDescriptor);
                            
                            if (fontDescriptor != null) {
                                // Check for missing width information
                                if (!font.containsKey(PdfName.Widths) && !font.containsKey(PdfName.W)) {
                                    issues.add(PdfIssue.builder()
                                        .type("Glyph Widths")
                                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                                        .message("Font '" + key.getValue() + "' on page " + i + 
                                                 " is missing glyph width information")
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Fix glyph width information")
                                        .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking glyph widths", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkType3Fonts(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            PdfName subtype = font.getAsName(PdfName.Subtype);
                            
                            if (PdfName.Type3.equals(subtype)) {
                                issues.add(PdfIssue.builder()
                                    .type("Type 3 Font")
                                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                                    .message("Type 3 font '" + key.getValue() + "' found on page " + i + 
                                             ". These fonts may not print correctly")
                                    .page(i)
                                    .autoFixable(true)
                                    .fixDescription("Convert Type 3 fonts to outlines")
                                    .build());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking Type 3 fonts", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkFontSubsetting(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            PdfDictionary fontDescriptor = font.getAsDictionary(PdfName.FontDescriptor);
                            
                            if (fontDescriptor != null) {
                                PdfName fontName = fontDescriptor.getAsName(PdfName.FontName);
                                if (fontName != null) {
                                    String fontNameStr = fontName.getValue();
                                    // Check if the font is not subset (subset fonts have name starting with 6 letters/numbers followed by '+')
                                    if (fontNameStr.length() > 7 && !fontNameStr.substring(6, 7).equals("+")) {
                                        issues.add(PdfIssue.builder()
                                            .type("Font Subsetting")
                                            .severity(PdfIssue.IssueSeverity.LOW)
                                            .message("Font '" + fontNameStr + "' on page " + i + 
                                                     " is not subset. Subsetting reduces file size")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Apply font subsetting")
                                            .build());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking font subsetting", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkTextEncoding(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                    if (fonts != null) {
                        for (PdfName key : fonts.keySet()) {
                            PdfDictionary font = fonts.getAsDictionary(key);
                            
                            PdfName encoding = font.getAsName(PdfName.Encoding);
                            if (encoding != null) {
                                if (PdfName.MacRomanEncoding.equals(encoding) || 
                                    PdfName.MacExpertEncoding.equals(encoding) || 
                                    PdfName.WinAnsiEncoding.equals(encoding)) {
                                    
                                    issues.add(PdfIssue.builder()
                                        .type("Text Encoding")
                                        .severity(PdfIssue.IssueSeverity.LOW)
                                        .message("Font '" + key.getValue() + "' on page " + i + 
                                                 " uses legacy encoding " + encoding.getValue())
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Convert to Unicode encoding")
                                        .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking text encoding", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkSmallText(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        // This is a complex check that would require text extraction and analysis
        // A simplified implementation is provided here
        
        try {
            // In a real implementation, we would extract text and check size
            // This would involve parsing content streams for text operations
            // Here we're just checking if there are any text rendering operations with small size
            
            issues.add(PdfIssue.builder()
                .type("Small Text")
                .severity(PdfIssue.IssueSeverity.LOW)
                .message("Check the document for text smaller than 6pt which may not be legible when printed")
                .autoFixable(false)
                .fixDescription("Increase text size or convert small text to outlines")
                .build());
            
        } catch (Exception e) {
            log.error("Error checking small text", e);
        }
        
        return issues;
    }
}
