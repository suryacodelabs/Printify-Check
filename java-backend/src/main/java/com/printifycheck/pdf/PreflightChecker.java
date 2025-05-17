
package com.printifycheck.pdf;

import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.parser.PdfCanvasProcessor;
import com.itextpdf.kernel.pdf.canvas.parser.listener.FilteredTextEventListener;
import com.itextpdf.kernel.pdf.canvas.parser.listener.LocationTextExtractionStrategy;
import com.itextpdf.kernel.pdf.colorspace.PdfColorSpace;
import com.itextpdf.kernel.pdf.colorspace.PdfDeviceCs;
import com.itextpdf.kernel.pdf.colorspace.PdfSpecialCs;
import com.itextpdf.kernel.pdf.xobject.PdfImageXObject;
import com.printifycheck.model.PdfCheckResult;
import com.printifycheck.model.PdfIssue;
import com.printifycheck.model.PdfIssueLocation;
import com.printifycheck.model.PreflightCheckParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class PreflightChecker {

    @Value("${preflight.min-image-dpi:300}")
    private int minImageDpi;
    
    @Value("${preflight.min-bleed-mm:3}")
    private float minBleedMm;
    
    @Value("${preflight.require-cmyk:true}")
    private boolean requireCmyk;
    
    @Value("${preflight.max-ink-density:300}")
    private int maxInkDensity;
    
    /**
     * Perform comprehensive preflight checks on a PDF
     * 
     * @param filePath Path to the PDF file
     * @param params Check parameters
     * @return List of issues found
     */
    public List<PdfIssue> checkPdf(String filePath, PreflightCheckParams params) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(filePath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            log.info("Starting preflight check on: {}", filePath);
            
            // Get PDF version
            if (params.isCheckLayers()) {
                checkPdfVersion(pdfDoc, issues, params.getMinPdfVersion());
            }
            
            // Check each page
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                
                // Check image resolution
                if (params.isCheckImageResolution()) {
                    checkImageResolution(page, issues, i, params.getMinImageDpi());
                }
                
                // Check color spaces
                if (params.isCheckRgbColors() || params.isCheckSpotColors()) {
                    checkColorSpaces(page, issues, i, params.isRequireCmyk(), params.isCheckSpotColors());
                }
                
                // Check bleed
                if (params.isCheckBleed()) {
                    checkBleed(page, issues, i, params.getMinBleedMm());
                }
                
                // Check fonts
                if (params.isCheckEmbeddedFonts()) {
                    checkFonts(page, issues, i);
                }
                
                // Check transparency
                if (params.isCheckTransparency()) {
                    checkTransparency(page, issues, i);
                }
                
                // Check ink density
                if (params.isCheckInkDensity()) {
                    checkInkDensity(page, issues, i, params.getMaxInkDensity());
                }
                
                // Check overprint settings
                if (params.isCheckOverprint()) {
                    checkOverprint(page, issues, i);
                }
                
                // Check annotations
                if (params.isCheckAnnotations()) {
                    checkAnnotations(page, issues, i);
                }
            }
            
            // Check document metadata
            if (params.isCheckMetadata()) {
                checkMetadata(pdfDoc, issues);
            }
            
            // Check interactive elements
            if (params.isCheckInteractive()) {
                checkInteractiveElements(pdfDoc, issues);
            }
            
            // Check compression
            if (params.isCheckCompression()) {
                checkCompression(pdfDoc, issues);
            }
            
            log.info("Preflight check completed. Found {} issues.", issues.size());
            
        } catch (Exception e) {
            log.error("Error performing preflight check: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                    .type("Error")
                    .severity(PdfIssue.IssueSeverity.CRITICAL)
                    .message("Error checking PDF: " + e.getMessage())
                    .autoFixable(false)
                    .build());
        }
        
        return issues;
    }
    
    /**
     * Check PDF version
     */
    private void checkPdfVersion(PdfDocument pdfDoc, List<PdfIssue> issues, String minVersion) {
        log.debug("Checking PDF version");
        
        try {
            PdfVersion pdfVersion = pdfDoc.getPdfVersion();
            float versionNum = pdfVersion.toPdfVersion();
            float requiredVersion = Float.parseFloat(minVersion);
            
            if (versionNum < requiredVersion) {
                issues.add(PdfIssue.builder()
                        .type("PDF Version")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message(String.format("PDF version %.1f is below required %.1f", versionNum, requiredVersion))
                        .autoFixable(false)
                        .build());
                
                log.info("PDF version {}, required {}", versionNum, requiredVersion);
            }
        } catch (Exception e) {
            log.error("Error checking PDF version: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check image resolution
     */
    private void checkImageResolution(PdfPage page, List<PdfIssue> issues, int pageNumber, int minDpi) {
        log.debug("Checking image resolution on page {}", pageNumber);
        
        try {
            PdfDictionary resources = page.getResources();
            PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
            
            if (xObjects == null) {
                return;
            }
            
            for (PdfName name : xObjects.keySet()) {
                PdfObject obj = xObjects.get(name);
                if (obj.isStream()) {
                    PdfStream stream = (PdfStream)obj;
                    PdfName subtype = stream.getAsName(PdfName.Subtype);
                    
                    if (PdfName.Image.equals(subtype)) {
                        PdfImageXObject image = new PdfImageXObject(stream);
                        
                        // Calculate DPI based on image dimensions and target size
                        int width = image.getWidth();
                        int height = image.getHeight();
                        
                        // Get image DPI if available, otherwise estimate from dimensions
                        int dpi = estimateImageDpi(image, width, height);
                        
                        if (dpi < minDpi) {
                            PdfIssue issue = PdfIssue.builder()
                                    .type("Low Image Resolution")
                                    .severity(PdfIssue.IssueSeverity.HIGH)
                                    .message(String.format("Image on page %d has resolution below %d DPI (%d DPI)",
                                            pageNumber, minDpi, dpi))
                                    .page(pageNumber)
                                    .autoFixable(false)
                                    .fixDescription("Replace with a higher resolution image (at least " + minDpi + " DPI)")
                                    .build();
                            
                            // Try to determine image location on the page
                            try {
                                float[] matrix = stream.getAsArray(PdfName.Matrix).toFloatArray();
                                if (matrix != null && matrix.length >= 4) {
                                    PdfIssueLocation location = PdfIssueLocation.builder()
                                            .page(pageNumber)
                                            .x(matrix[4])
                                            .y(matrix[5])
                                            .width(width / dpi * 72) // Convert to points
                                            .height(height / dpi * 72) // Convert to points
                                            .build();
                                    issue.setLocation(location);
                                }
                            } catch (Exception e) {
                                // If we can't determine location, continue without it
                                log.debug("Couldn't determine image location: {}", e.getMessage());
                            }
                            
                            issues.add(issue);
                            log.info("Found low resolution image ({}x{} @ {} DPI) on page {}", 
                                    width, height, dpi, pageNumber);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image resolution: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Estimate image DPI based on dimensions and metadata
     */
    private int estimateImageDpi(PdfImageXObject image, int width, int height) {
        // Try to get DPI from image metadata
        try {
            PdfArray decode = image.getPdfObject().getAsArray(PdfName.Decode);
            if (decode != null) {
                // Some images store resolution info in the Decode array
                return 300; // Simplified - real implementation would extract actual DPI
            }
            
            // Check if the image has a JBIG2Decode or CCITTFaxDecode filter
            PdfArray filters = image.getPdfObject().getAsArray(PdfName.Filter);
            if (filters != null) {
                for (int i = 0; i < filters.size(); i++) {
                    PdfName filter = filters.getAsName(i);
                    if (PdfName.JBIG2Decode.equals(filter) || PdfName.CCITTFaxDecode.equals(filter)) {
                        // These are typically used for scanned documents at specific resolutions
                        return 200; // Typical scanned document resolution
                    }
                }
            }
            
            // If no specific metadata, estimate based on size
            // This is a very rough estimate - in a real implementation, you would
            // compare the image dimensions to its rendered size on the page
            if (width > 2000 || height > 2000) {
                return 300;
            } else if (width > 1000 || height > 1000) {
                return 150;
            } else {
                return 72;
            }
            
        } catch (Exception e) {
            log.debug("Error estimating image DPI: {}", e.getMessage());
            // Default to a conservative estimate
            return 150;
        }
    }
    
    /**
     * Check color spaces used in the document
     */
    private void checkColorSpaces(PdfPage page, List<PdfIssue> issues, int pageNumber, boolean requireCmyk, boolean checkSpot) {
        log.debug("Checking color spaces on page {}", pageNumber);
        
        try {
            PdfDictionary resources = page.getResources();
            boolean hasRgb = false;
            boolean hasSpot = false;
            
            // Check color spaces in resources
            PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
            if (colorSpaces != null) {
                for (PdfName name : colorSpaces.keySet()) {
                    PdfObject cs = colorSpaces.get(name);
                    if (cs.isArray()) {
                        PdfArray csArray = (PdfArray) cs;
                        if (csArray.size() > 0) {
                            PdfName csType = csArray.getAsName(0);
                            
                            if (PdfName.DeviceRGB.equals(csType) || PdfName.CalRGB.equals(csType)) {
                                hasRgb = true;
                            } else if (PdfName.Separation.equals(csType) || PdfName.DeviceN.equals(csType)) {
                                hasSpot = true;
                            }
                        }
                    } else if (cs.isName()) {
                        PdfName csName = (PdfName) cs;
                        if (PdfName.DeviceRGB.equals(csName)) {
                            hasRgb = true;
                        }
                    }
                }
            }
            
            // Check content streams for direct color space usage
            // This is a simplified check - a real implementation would parse the content stream
            
            if (requireCmyk && hasRgb) {
                issues.add(PdfIssue.builder()
                        .type("RGB Color Space")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message(String.format("RGB color space detected on page %d but CMYK is required for print",
                                pageNumber))
                        .page(pageNumber)
                        .autoFixable(true)
                        .fixDescription("Convert RGB colors to CMYK color space")
                        .build());
                
                log.info("Found RGB color space on page {}", pageNumber);
            }
            
            if (checkSpot && hasSpot) {
                issues.add(PdfIssue.builder()
                        .type("Spot Colors")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message(String.format("Spot colors detected on page %d", pageNumber))
                        .page(pageNumber)
                        .autoFixable(true)
                        .fixDescription("Convert spot colors to process (CMYK) colors")
                        .build());
                
                log.info("Found spot colors on page {}", pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking color spaces: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check if the document has proper bleed
     */
    private void checkBleed(PdfPage page, List<PdfIssue> issues, int pageNumber, float minBleedMm) {
        log.debug("Checking bleed on page {}", pageNumber);
        
        try {
            // Get page boxes
            Rectangle mediaBox = page.getMediaBox();
            Rectangle trimBox = page.getTrimBox();
            Rectangle bleedBox = page.getBleedBox();
            
            // If trim box is not defined, use media box
            if (trimBox == null) {
                trimBox = mediaBox;
            }
            
            // If bleed box is not defined, use media box
            if (bleedBox == null) {
                bleedBox = mediaBox;
            }
            
            // Calculate bleed in points (1mm = 2.83465 points)
            float minBleedPoints = minBleedMm * 2.83465f;
            
            // Check if bleed is sufficient on all sides
            boolean sufficientBleed = true;
            
            if (bleedBox.getLeft() > trimBox.getLeft() - minBleedPoints ||
                    bleedBox.getBottom() > trimBox.getBottom() - minBleedPoints ||
                    bleedBox.getRight() < trimBox.getRight() + minBleedPoints ||
                    bleedBox.getTop() < trimBox.getTop() + minBleedPoints) {
                
                sufficientBleed = false;
            }
            
            if (!sufficientBleed) {
                issues.add(PdfIssue.builder()
                        .type("Missing Bleed")
                        .severity(PdfIssue.IssueSeverity.HIGH)
                        .message(String.format("Document on page %d is missing the required %.1fmm bleed", 
                                pageNumber, minBleedMm))
                        .page(pageNumber)
                        .autoFixable(true)
                        .fixDescription(String.format("Add %.1fmm bleed to all sides of the document", minBleedMm))
                        .build());
                
                log.info("Missing bleed on page {}", pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking bleed: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check fonts for embedding and other issues
     */
    private void checkFonts(PdfPage page, List<PdfIssue> issues, int pageNumber) {
        log.debug("Checking fonts on page {}", pageNumber);
        
        try {
            PdfDictionary resources = page.getResources();
            PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
            
            if (fonts == null) {
                return;
            }
            
            for (PdfName fontName : fonts.keySet()) {
                PdfDictionary font = fonts.getAsDictionary(fontName);
                PdfDictionary fontDescriptor = font.getAsDictionary(PdfName.FontDescriptor);
                
                if (fontDescriptor != null) {
                    // Check if font is embedded
                    boolean isEmbedded = fontDescriptor.containsKey(PdfName.FontFile) ||
                            fontDescriptor.containsKey(PdfName.FontFile2) ||
                            fontDescriptor.containsKey(PdfName.FontFile3);
                    
                    if (!isEmbedded) {
                        // Get the name of the font for the message
                        String fontNameStr = fontName.getValue();
                        if (fontDescriptor.containsKey(PdfName.FontName)) {
                            fontNameStr = fontDescriptor.getAsName(PdfName.FontName).getValue();
                        }
                        
                        issues.add(PdfIssue.builder()
                                .type("Non-embedded Fonts")
                                .severity(PdfIssue.IssueSeverity.HIGH)
                                .message(String.format("Font '%s' on page %d is not embedded", 
                                        fontNameStr, pageNumber))
                                .page(pageNumber)
                                .autoFixable(true)
                                .fixDescription(String.format("Embed font '%s' or convert text to outlines", fontNameStr))
                                .build());
                        
                        log.info("Non-embedded font '{}' on page {}", fontNameStr, pageNumber);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Error checking fonts: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check for transparency
     */
    private void checkTransparency(PdfPage page, List<PdfIssue> issues, int pageNumber) {
        log.debug("Checking transparency on page {}", pageNumber);
        
        try {
            PdfDictionary resources = page.getResources();
            PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
            
            if (extGState == null) {
                return;
            }
            
            boolean hasTransparency = false;
            
            for (PdfName gsName : extGState.keySet()) {
                PdfDictionary gs = extGState.getAsDictionary(gsName);
                
                if (gs != null) {
                    // Check for opacity < 1
                    if (gs.containsKey(PdfName.CA)) {
                        PdfNumber opacity = gs.getAsNumber(PdfName.CA);
                        if (opacity != null && opacity.floatValue() < 1.0f) {
                            hasTransparency = true;
                        }
                    }
                    
                    if (gs.containsKey(PdfName.ca)) {
                        PdfNumber opacity = gs.getAsNumber(PdfName.ca);
                        if (opacity != null && opacity.floatValue() < 1.0f) {
                            hasTransparency = true;
                        }
                    }
                    
                    // Check for soft mask (another form of transparency)
                    if (gs.containsKey(PdfName.SMask) && !PdfName.None.equals(gs.get(PdfName.SMask))) {
                        hasTransparency = true;
                    }
                    
                    // Check for blend mode other than Normal
                    if (gs.containsKey(PdfName.BM)) {
                        PdfObject blendMode = gs.get(PdfName.BM);
                        if (blendMode != null && !PdfName.Normal.equals(blendMode)) {
                            hasTransparency = true;
                        }
                    }
                }
            }
            
            if (hasTransparency) {
                issues.add(PdfIssue.builder()
                        .type("Transparency")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message(String.format("Transparency detected on page %d", pageNumber))
                        .page(pageNumber)
                        .autoFixable(true)
                        .fixDescription("Flatten transparency for better print compatibility")
                        .build());
                
                log.info("Transparency found on page {}", pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking transparency: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check ink density (simplified implementation)
     */
    private void checkInkDensity(PdfPage page, List<PdfIssue> issues, int pageNumber, int maxInkDensity) {
        log.debug("Checking ink density on page {}", pageNumber);
        
        // Note: A full ink density check would require color sampling across the page
        // This is a simplified placeholder implementation
        
        try {
            // In a real implementation, you would:
            // 1. Sample colors across the page
            // 2. Calculate CMYK values for each sample
            // 3. Sum the CMYK percentages to get total ink coverage
            // 4. Report areas exceeding the maximum
            
            // For this implementation, we'll just check if there are solid CMYK blacks
            PdfDictionary resources = page.getResources();
            boolean potentialHighInkDensity = false;
            
            // Check for patterns or shadings that might have high ink density
            if (resources.containsKey(PdfName.Pattern) || resources.containsKey(PdfName.Shading)) {
                potentialHighInkDensity = true;
            }
            
            // This is a placeholder - in a real implementation you would check actual ink coverage
            if (potentialHighInkDensity) {
                issues.add(PdfIssue.builder()
                        .type("High Ink Density")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message(String.format("Potential high ink density detected on page %d (exceeding %d%%)", 
                                pageNumber, maxInkDensity))
                        .page(pageNumber)
                        .autoFixable(true)
                        .fixDescription(String.format("Reduce ink density to below %d%% total area coverage", maxInkDensity))
                        .build());
                
                log.info("Potential high ink density on page {}", pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking ink density: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check overprint settings
     */
    private void checkOverprint(PdfPage page, List<PdfIssue> issues, int pageNumber) {
        log.debug("Checking overprint on page {}", pageNumber);
        
        try {
            PdfDictionary resources = page.getResources();
            PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
            
            if (extGState == null) {
                return;
            }
            
            boolean hasOverprint = false;
            
            for (PdfName gsName : extGState.keySet()) {
                PdfDictionary gs = extGState.getAsDictionary(gsName);
                
                if (gs != null) {
                    // Check for overprint mode
                    if (gs.containsKey(PdfName.OPM)) {
                        hasOverprint = true;
                    }
                    
                    // Check for stroke overprint
                    if (gs.containsKey(PdfName.OP)) {
                        PdfBoolean op = gs.getAsBoolean(PdfName.OP);
                        if (op != null && op.getValue()) {
                            hasOverprint = true;
                        }
                    }
                    
                    // Check for fill overprint
                    if (gs.containsKey(PdfName.op)) {
                        PdfBoolean op = gs.getAsBoolean(PdfName.op);
                        if (op != null && op.getValue()) {
                            hasOverprint = true;
                        }
                    }
                }
            }
            
            if (hasOverprint) {
                issues.add(PdfIssue.builder()
                        .type("Overprint Settings")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message(String.format("Overprint settings detected on page %d", pageNumber))
                        .page(pageNumber)
                        .autoFixable(false)
                        .fixDescription("Verify overprint settings are appropriate for your printing process")
                        .build());
                
                log.info("Overprint settings found on page {}", pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking overprint: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check annotations
     */
    private void checkAnnotations(PdfPage page, List<PdfIssue> issues, int pageNumber) {
        log.debug("Checking annotations on page {}", pageNumber);
        
        try {
            List<PdfAnnotation> annotations = page.getAnnotations();
            
            if (annotations != null && !annotations.isEmpty()) {
                issues.add(PdfIssue.builder()
                        .type("Annotations")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message(String.format("%d annotation(s) found on page %d", 
                                annotations.size(), pageNumber))
                        .page(pageNumber)
                        .autoFixable(false)
                        .fixDescription("Remove annotations or flatten them to content")
                        .build());
                
                log.info("{} annotations found on page {}", annotations.size(), pageNumber);
            }
            
        } catch (Exception e) {
            log.error("Error checking annotations: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check metadata
     */
    private void checkMetadata(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.debug("Checking document metadata");
        
        try {
            PdfDocumentInfo info = pdfDoc.getDocumentInfo();
            Map<String, String> metadata = new HashMap<>();
            
            // Collect metadata fields
            if (info.getTitle() != null) metadata.put("Title", info.getTitle());
            if (info.getAuthor() != null) metadata.put("Author", info.getAuthor());
            if (info.getSubject() != null) metadata.put("Subject", info.getSubject());
            if (info.getKeywords() != null) metadata.put("Keywords", info.getKeywords());
            if (info.getCreator() != null) metadata.put("Creator", info.getCreator());
            if (info.getProducer() != null) metadata.put("Producer", info.getProducer());
            
            if (!metadata.isEmpty()) {
                StringBuilder metadataInfo = new StringBuilder("Document contains metadata: ");
                for (Map.Entry<String, String> entry : metadata.entrySet()) {
                    metadataInfo.append(entry.getKey()).append(", ");
                }
                
                // Remove trailing comma and space
                if (metadataInfo.length() > 2) {
                    metadataInfo.setLength(metadataInfo.length() - 2);
                }
                
                issues.add(PdfIssue.builder()
                        .type("Metadata Present")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message(metadataInfo.toString())
                        .autoFixable(true)
                        .fixDescription("Strip metadata for privacy or security")
                        .build());
                
                log.info("Document contains metadata");
            }
            
        } catch (Exception e) {
            log.error("Error checking metadata: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check interactive elements
     */
    private void checkInteractiveElements(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.debug("Checking interactive elements");
        
        try {
            // Check for actions in the document catalog
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            boolean hasInteractiveElements = false;
            
            // Check for JavaScript
            if (catalog.containsKey(PdfName.JavaScript)) {
                hasInteractiveElements = true;
            }
            
            // Check for AcroForm
            if (catalog.containsKey(PdfName.AcroForm)) {
                hasInteractiveElements = true;
            }
            
            // Check for actions
            if (catalog.containsKey(PdfName.AA) || catalog.containsKey(PdfName.OpenAction)) {
                hasInteractiveElements = true;
            }
            
            if (hasInteractiveElements) {
                issues.add(PdfIssue.builder()
                        .type("Interactive Elements")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document contains interactive elements (forms, JavaScript, actions)")
                        .autoFixable(false)
                        .fixDescription("Remove interactive elements for print production")
                        .build());
                
                log.info("Interactive elements found in document");
            }
            
        } catch (Exception e) {
            log.error("Error checking interactive elements: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check compression
     */
    private void checkCompression(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.debug("Checking compression");
        
        try {
            // This is a simplified check - a complete implementation would analyze all streams
            boolean hasLzwCompression = false;
            boolean hasJpeg2000 = false;
            
            // Check a few pages for compression types
            for (int i = 1; i <= Math.min(pdfDoc.getNumberOfPages(), 5); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                
                if (xObjects != null) {
                    for (PdfName name : xObjects.keySet()) {
                        PdfObject obj = xObjects.get(name);
                        if (obj.isStream()) {
                            PdfStream stream = (PdfStream)obj;
                            PdfObject filter = stream.get(PdfName.Filter);
                            
                            if (filter != null) {
                                if (filter.isName()) {
                                    PdfName filterName = (PdfName)filter;
                                    if (PdfName.LZWDecode.equals(filterName)) {
                                        hasLzwCompression = true;
                                    } else if (PdfName.JPXDecode.equals(filterName)) {
                                        hasJpeg2000 = true;
                                    }
                                } else if (filter.isArray()) {
                                    PdfArray filters = (PdfArray)filter;
                                    for (int j = 0; j < filters.size(); j++) {
                                        PdfName filterName = filters.getAsName(j);
                                        if (PdfName.LZWDecode.equals(filterName)) {
                                            hasLzwCompression = true;
                                        } else if (PdfName.JPXDecode.equals(filterName)) {
                                            hasJpeg2000 = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (hasLzwCompression) {
                issues.add(PdfIssue.builder()
                        .type("LZW Compression")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message("Document uses LZW compression which may cause issues with some older RIPs")
                        .autoFixable(false)
                        .fixDescription("Consider recompressing with Flate (ZIP) compression")
                        .build());
                
                log.info("LZW compression detected");
            }
            
            if (hasJpeg2000) {
                issues.add(PdfIssue.builder()
                        .type("JPEG2000 Compression")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message("Document uses JPEG2000 compression which may cause issues with some older RIPs")
                        .autoFixable(false)
                        .fixDescription("Consider recompressing with standard JPEG compression")
                        .build());
                
                log.info("JPEG2000 compression detected");
            }
            
        } catch (Exception e) {
            log.error("Error checking compression: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Calculate a quality score based on the issues found
     * 
     * @param issues List of issues found during preflight check
     * @return Quality score from 0-100
     */
    public int calculateQualityScore(List<PdfIssue> issues) {
        if (issues.isEmpty()) {
            return 100;
        }
        
        int baseScore = 100;
        int deductions = 0;
        
        for (PdfIssue issue : issues) {
            switch (issue.getSeverity()) {
                case CRITICAL -> deductions += 25;
                case HIGH -> deductions += 10;
                case MEDIUM -> deductions += 5;
                case LOW -> deductions += 2;
            }
        }
        
        // Cap deductions at 100 to ensure score doesn't go negative
        deductions = Math.min(deductions, 100);
        
        return baseScore - deductions;
    }
}
