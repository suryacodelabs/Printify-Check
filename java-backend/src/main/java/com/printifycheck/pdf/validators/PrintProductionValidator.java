
package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class PrintProductionValidator {

    // Minimum bleed in points (3mm = ~8.5 points)
    private static final float MIN_BLEED_POINTS = 8.5f;

    public List<PdfIssue> validatePrintProduction(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check bleed
            List<PdfIssue> bleedIssues = checkBleed(pdfDoc);
            issues.addAll(bleedIssues);
            
            // Check trim/safe zones
            List<PdfIssue> trimSafeIssues = checkTrimSafeZones(pdfDoc);
            issues.addAll(trimSafeIssues);
            
            // Check page geometry
            List<PdfIssue> geometryIssues = checkPageGeometry(pdfDoc);
            issues.addAll(geometryIssues);
            
            // Check registration marks
            List<PdfIssue> registrationIssues = checkRegistrationMarks(pdfDoc);
            issues.addAll(registrationIssues);
            
            // Check die line
            List<PdfIssue> dieLineIssues = checkDieLine(pdfDoc);
            issues.addAll(dieLineIssues);
            
            // Check varnish layer
            List<PdfIssue> varnishIssues = checkVarnishLayer(pdfDoc);
            issues.addAll(varnishIssues);
            
            // Check barcode readability
            List<PdfIssue> barcodeIssues = checkBarcodeReadability(pdfDoc);
            issues.addAll(barcodeIssues);
            
            // Check fold marks
            List<PdfIssue> foldMarkIssues = checkFoldMarks(pdfDoc);
            issues.addAll(foldMarkIssues);
            
        } catch (IOException e) {
            log.error("Error validating print production: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Print Production Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing print production aspects: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkBleed(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                
                // Check for bleed box
                Rectangle bleedBox = page.getBleedBox();
                Rectangle trimBox = page.getTrimBox();
                Rectangle cropBox = page.getCropBox();
                Rectangle mediaBox = page.getMediaBox();
                
                // If no TrimBox defined, use CropBox
                if (trimBox == null) {
                    trimBox = cropBox;
                }
                
                // If no BleedBox defined, use MediaBox
                if (bleedBox == null) {
                    bleedBox = mediaBox;
                }
                
                // If TrimBox is defined, check if BleedBox extends beyond it
                if (trimBox != null && bleedBox != null) {
                    float leftBleed = trimBox.getLeft() - bleedBox.getLeft();
                    float rightBleed = bleedBox.getRight() - trimBox.getRight();
                    float topBleed = bleedBox.getTop() - trimBox.getTop();
                    float bottomBleed = trimBox.getBottom() - bleedBox.getBottom();
                    
                    // Check if bleed is insufficient in any direction
                    if (leftBleed < MIN_BLEED_POINTS || rightBleed < MIN_BLEED_POINTS || 
                        topBleed < MIN_BLEED_POINTS || bottomBleed < MIN_BLEED_POINTS) {
                        
                        issues.add(PdfIssue.builder()
                            .type("Bleed")
                            .severity(PdfIssue.IssueSeverity.HIGH)
                            .message("Insufficient bleed on page " + i + ". " +
                                     "Minimum 3mm bleed required, found: " +
                                     "left=" + String.format("%.2f", leftBleed / 2.83465) + "mm, " +
                                     "right=" + String.format("%.2f", rightBleed / 2.83465) + "mm, " +
                                     "top=" + String.format("%.2f", topBleed / 2.83465) + "mm, " +
                                     "bottom=" + String.format("%.2f", bottomBleed / 2.83465) + "mm")
                            .page(i)
                            .autoFixable(true)
                            .fixDescription("Add 3mm bleed to all sides")
                            .build());
                    }
                } else {
                    // No TrimBox defined
                    issues.add(PdfIssue.builder()
                        .type("Bleed")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message("No TrimBox defined on page " + i + 
                                 ". Cannot determine bleed area")
                        .page(i)
                        .autoFixable(true)
                        .fixDescription("Add TrimBox and extend MediaBox or BleedBox")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking bleed", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkTrimSafeZones(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                
                Rectangle trimBox = page.getTrimBox();
                Rectangle artBox = page.getArtBox();
                
                // If no TrimBox defined, use CropBox
                if (trimBox == null) {
                    trimBox = page.getCropBox();
                }
                
                // If no ArtBox defined (safe zone), issue a warning
                if (artBox == null) {
                    issues.add(PdfIssue.builder()
                        .type("Safe Zone")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("No ArtBox (safe zone) defined on page " + i + 
                                 ". Important content may be too close to trim edge")
                        .page(i)
                        .autoFixable(true)
                        .fixDescription("Add ArtBox with safe margin (typically 3-5mm from trim)")
                        .build());
                } else if (trimBox != null) {
                    // Check if ArtBox has sufficient margin from TrimBox (at least 3mm ~ 8.5pt)
                    float leftMargin = artBox.getLeft() - trimBox.getLeft();
                    float rightMargin = trimBox.getRight() - artBox.getRight();
                    float topMargin = trimBox.getTop() - artBox.getTop();
                    float bottomMargin = artBox.getBottom() - trimBox.getBottom();
                    
                    if (leftMargin < MIN_BLEED_POINTS || rightMargin < MIN_BLEED_POINTS || 
                        topMargin < MIN_BLEED_POINTS || bottomMargin < MIN_BLEED_POINTS) {
                        
                        issues.add(PdfIssue.builder()
                            .type("Safe Zone")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Safe zone (ArtBox) too close to trim edge on page " + i + 
                                     ". Recommend at least 3mm margin from trim edge")
                            .page(i)
                            .autoFixable(true)
                            .fixDescription("Adjust ArtBox to provide safe margin")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking trim/safe zones", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkPageGeometry(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for mixed page sizes
            List<String> pageSizes = new ArrayList<>();
            List<Integer> pagesWithDifferentSizes = new ArrayList<>();
            
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle mediaBox = page.getMediaBox();
                
                String size = String.format("%.2fx%.2f", mediaBox.getWidth(), mediaBox.getHeight());
                
                if (pageSizes.isEmpty()) {
                    pageSizes.add(size);
                } else if (!pageSizes.contains(size)) {
                    pageSizes.add(size);
                    pagesWithDifferentSizes.add(i);
                }
            }
            
            if (pageSizes.size() > 1) {
                issues.add(PdfIssue.builder()
                    .type("Page Geometry")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Document contains " + pageSizes.size() + 
                             " different page sizes. Inconsistent pages: " + 
                             pagesWithDifferentSizes.toString().substring(1, pagesWithDifferentSizes.toString().length() - 1))
                    .autoFixable(true)
                    .fixDescription("Standardize page sizes")
                    .build());
            }
            
            // Check for non-standard page dimensions
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle trimBox = page.getTrimBox();
                
                // If no TrimBox, use CropBox
                if (trimBox == null) {
                    trimBox = page.getCropBox();
                }
                
                if (trimBox != null) {
                    // Check if page dimensions are of standard sizes
                    // This is a simplified check - real implementation would have more standard sizes
                    float width = trimBox.getWidth();
                    float height = trimBox.getHeight();
                    
                    boolean isStandardSize = false;
                    
                    // A-series sizes (in points)
                    float[][] aSizes = {
                        {841.89f, 1190.55f},  // A0
                        {595.28f, 841.89f},   // A1
                        {419.53f, 595.28f},   // A2
                        {297.64f, 419.53f},   // A3
                        {210.0f, 297.0f},     // A4
                        {148.0f, 210.0f},     // A5
                        {105.0f, 148.0f}      // A6
                    };
                    
                    for (float[] size : aSizes) {
                        if ((Math.abs(width - size[0]) < 1 && Math.abs(height - size[1]) < 1) || 
                            (Math.abs(width - size[1]) < 1 && Math.abs(height - size[0]) < 1)) {
                            isStandardSize = true;
                            break;
                        }
                    }
                    
                    // US/ANSI sizes
                    if (!isStandardSize) {
                        float[][] usSizes = {
                            {612.0f, 792.0f},     // Letter
                            {612.0f, 1008.0f},    // Legal
                            {792.0f, 1224.0f},    // Tabloid/Ledger
                            {1224.0f, 1584.0f},   // ANSI C
                            {1584.0f, 2448.0f},   // ANSI D
                            {2448.0f, 3168.0f}    // ANSI E
                        };
                        
                        for (float[] size : usSizes) {
                            if ((Math.abs(width - size[0]) < 1 && Math.abs(height - size[1]) < 1) || 
                                (Math.abs(width - size[1]) < 1 && Math.abs(height - size[0]) < 1)) {
                                isStandardSize = true;
                                break;
                            }
                        }
                    }
                    
                    if (!isStandardSize) {
                        issues.add(PdfIssue.builder()
                            .type("Page Geometry")
                            .severity(PdfIssue.IssueSeverity.LOW)
                            .message("Non-standard page size on page " + i + 
                                     ": " + String.format("%.2f x %.2f pts", width, height) +
                                     " (approx. " + String.format("%.2f x %.2f mm", width / 2.83465, height / 2.83465) + ")")
                            .page(i)
                            .autoFixable(false)
                            .fixDescription("Check if custom size is intended")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking page geometry", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkRegistrationMarks(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // This is a complex check that would involve analyzing content streams
            // A simplified implementation is provided
            
            // Check if document has multiple color plates but no registration marks
            boolean hasCmyk = false;
            
            // Check color spaces
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                    if (colorSpaces != null) {
                        for (PdfName key : colorSpaces.keySet()) {
                            PdfObject cs = colorSpaces.get(key);
                            if (cs.isName() && PdfName.DeviceCMYK.equals(cs)) {
                                hasCmyk = true;
                                break;
                            } else if (cs.isArray()) {
                                PdfArray csArray = (PdfArray) cs;
                                if (csArray.size() > 0) {
                                    PdfName csName = csArray.getAsName(0);
                                    if (PdfName.DeviceCMYK.equals(csName)) {
                                        hasCmyk = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    if (hasCmyk) break;
                }
            }
            
            // If CMYK but media box equals crop box, likely no registration marks
            if (hasCmyk) {
                PdfPage firstPage = pdfDoc.getPage(1);
                Rectangle mediaBox = firstPage.getMediaBox();
                Rectangle cropBox = firstPage.getCropBox();
                
                if (mediaBox.equals(cropBox)) {
                    issues.add(PdfIssue.builder()
                        .type("Registration Marks")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document uses CMYK color but appears to be missing registration marks. " + 
                                 "These are recommended for commercial printing")
                        .autoFixable(true)
                        .fixDescription("Add registration marks, color bars, and trim marks")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking registration marks", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkDieLine(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for layers that might be die lines
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            boolean hasDieLine = false;
            
            if (catalog.containsKey(PdfName.OCProperties)) {
                PdfDictionary ocProperties = catalog.getAsDictionary(PdfName.OCProperties);
                if (ocProperties != null) {
                    PdfArray ocgs = ocProperties.getAsArray(PdfName.OCGs);
                    if (ocgs != null) {
                        for (int i = 0; i < ocgs.size(); i++) {
                            PdfDictionary ocg = ocgs.getAsDictionary(i);
                            if (ocg != null) {
                                PdfString name = ocg.getAsString(PdfName.Name);
                                if (name != null) {
                                    String layerName = name.toString().toLowerCase();
                                    if (layerName.contains("die") || 
                                        layerName.contains("cut") || 
                                        layerName.contains("crease") || 
                                        layerName.contains("fold") ||
                                        layerName.contains("perforation")) {
                                        hasDieLine = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // If no die line layer detected, and document has non-standard size,
            // it might need a die line
            if (!hasDieLine) {
                PdfPage firstPage = pdfDoc.getPage(1);
                Rectangle trimBox = firstPage.getTrimBox();
                if (trimBox == null) {
                    trimBox = firstPage.getCropBox();
                }
                
                if (trimBox != null) {
                    float width = trimBox.getWidth();
                    float height = trimBox.getHeight();
                    
                    boolean isStandardSize = false;
                    
                    // A-series sizes (in points)
                    float[][] aSizes = {
                        {841.89f, 1190.55f},  // A0
                        {595.28f, 841.89f},   // A1
                        {419.53f, 595.28f},   // A2
                        {297.64f, 419.53f},   // A3
                        {210.0f, 297.0f},     // A4
                        {148.0f, 210.0f},     // A5
                        {105.0f, 148.0f}      // A6
                    };
                    
                    for (float[] size : aSizes) {
                        if ((Math.abs(width - size[0]) < 5 && Math.abs(height - size[1]) < 5) || 
                            (Math.abs(width - size[1]) < 5 && Math.abs(height - size[0]) < 5)) {
                            isStandardSize = true;
                            break;
                        }
                    }
                    
                    // US/ANSI sizes
                    if (!isStandardSize) {
                        float[][] usSizes = {
                            {612.0f, 792.0f},     // Letter
                            {612.0f, 1008.0f},    // Legal
                            {792.0f, 1224.0f},    // Tabloid/Ledger
                            {1224.0f, 1584.0f},   // ANSI C
                            {1584.0f, 2448.0f},   // ANSI D
                            {2448.0f, 3168.0f}    // ANSI E
                        };
                        
                        for (float[] size : usSizes) {
                            if ((Math.abs(width - size[0]) < 5 && Math.abs(height - size[1]) < 5) || 
                                (Math.abs(width - size[1]) < 5 && Math.abs(height - size[0]) < 5)) {
                                isStandardSize = true;
                                break;
                            }
                        }
                    }
                    
                    if (!isStandardSize) {
                        issues.add(PdfIssue.builder()
                            .type("Die Line")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document has non-standard size but no visible die line. " +
                                     "Die lines are recommended for custom-shaped printed materials")
                            .autoFixable(false)
                            .fixDescription("Add die line if custom cutting is needed")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking die line", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkVarnishLayer(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for layers that might be varnish
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            
            if (catalog.containsKey(PdfName.OCProperties)) {
                PdfDictionary ocProperties = catalog.getAsDictionary(PdfName.OCProperties);
                if (ocProperties != null) {
                    PdfArray ocgs = ocProperties.getAsArray(PdfName.OCGs);
                    if (ocgs != null) {
                        for (int i = 0; i < ocgs.size(); i++) {
                            PdfDictionary ocg = ocgs.getAsDictionary(i);
                            if (ocg != null) {
                                PdfString name = ocg.getAsString(PdfName.Name);
                                if (name != null) {
                                    String layerName = name.toString().toLowerCase();
                                    if (layerName.contains("varnish") || 
                                        layerName.contains("uv") || 
                                        layerName.contains("gloss") || 
                                        layerName.contains("spot") ||
                                        layerName.contains("coating")) {
                                        
                                        // Check if varnish layer is set up correctly
                                        PdfDictionary usage = ocg.getAsDictionary(PdfName.Usage);
                                        if (usage == null || !usage.containsKey(new PdfName("Print"))) {
                                            issues.add(PdfIssue.builder()
                                                .type("Varnish Layer")
                                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                                .message("Varnish layer '" + name + "' may not be set up correctly. " +
                                                         "Ensure it's configured for printing")
                                                .autoFixable(true)
                                                .fixDescription("Configure varnish layer with proper print settings")
                                                .build());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking varnish layer", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkBarcodeReadability(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Checking barcode readability would typically require image processing
            // Here's a simplified implementation that adds a general warning
            
            issues.add(PdfIssue.builder()
                .type("Barcode Readability")
                .severity(PdfIssue.IssueSeverity.LOW)
                .message("If document contains barcodes, ensure they have sufficient size and " +
                         "contrast for scanning (typically minimum 300 DPI and 80% black)")
                .autoFixable(false)
                .fixDescription("Check barcode quality with a verification tool")
                .build());
            
        } catch (Exception e) {
            log.error("Error checking barcode readability", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkFoldMarks(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check if document might be intended for folding (e.g., brochures)
            // This is a simplified implementation
            
            PdfPage firstPage = pdfDoc.getPage(1);
            Rectangle trimBox = firstPage.getTrimBox();
            if (trimBox == null) {
                trimBox = firstPage.getCropBox();
            }
            
            if (trimBox != null) {
                float width = trimBox.getWidth();
                float height = trimBox.getHeight();
                
                // Check if dimensions suggest a foldable document (e.g., long rectangle)
                float ratio = Math.max(width, height) / Math.min(width, height);
                
                // If the ratio is more than 2:1, it might be intended to be folded
                if (ratio >= 2.0f) {
                    // Check for layers that might be fold marks
                    PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
                    boolean hasFoldMarks = false;
                    
                    if (catalog.containsKey(PdfName.OCProperties)) {
                        PdfDictionary ocProperties = catalog.getAsDictionary(PdfName.OCProperties);
                        if (ocProperties != null) {
                            PdfArray ocgs = ocProperties.getAsArray(PdfName.OCGs);
                            if (ocgs != null) {
                                for (int i = 0; i < ocgs.size(); i++) {
                                    PdfDictionary ocg = ocgs.getAsDictionary(i);
                                    if (ocg != null) {
                                        PdfString name = ocg.getAsString(PdfName.Name);
                                        if (name != null) {
                                            String layerName = name.toString().toLowerCase();
                                            if (layerName.contains("fold") || 
                                                layerName.contains("crease") || 
                                                layerName.contains("score")) {
                                                hasFoldMarks = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if (!hasFoldMarks) {
                        issues.add(PdfIssue.builder()
                            .type("Fold Marks")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document has dimensions that suggest folding, but no fold marks were detected")
                            .autoFixable(true)
                            .fixDescription("Add fold marks if document is intended to be folded")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking fold marks", e);
        }
        
        return issues;
    }
}
