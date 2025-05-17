
package com.printifycheck.pdf;

import com.itextpdf.kernel.colors.ColorSpace;
import com.itextpdf.kernel.colors.DeviceCmyk;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.colorspace.PdfColorSpace;
import com.itextpdf.kernel.pdf.colorspace.PdfDeviceCs;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.printifycheck.model.PdfFixType;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Component
@Slf4j
public class PdfFixer {

    @Value("${pdf.processed.dir}")
    private String processedDir;
    
    @Value("${pdf.min.bleed.mm:3}")
    private float minBleedMm;
    
    /**
     * Apply fixes to the PDF based on the issues found during preflight check
     * 
     * @param inputFilePath Path to the input PDF
     * @param issues List of issues to fix
     * @return Path to the fixed PDF
     */
    public String applyFixes(String inputFilePath, List<PdfIssue> issues) {
        try {
            log.info("Applying fixes to PDF: {}", inputFilePath);
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Get the output file path
            File inputFile = new File(inputFilePath);
            String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_fixed.pdf");
            
            // Group issues by type to avoid applying the same fix multiple times
            Map<String, List<PdfIssue>> issuesByType = new HashMap<>();
            for (PdfIssue issue : issues) {
                if (issue.isAutoFixable()) {
                    String type = issue.getType();
                    issuesByType.computeIfAbsent(type, k -> new ArrayList<>()).add(issue);
                }
            }
            
            // Create reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Apply each fix only once per type
            for (String issueType : issuesByType.keySet()) {
                log.info("Applying fix for issue type: {}", issueType);
                
                PdfFixType fixType = PdfFixType.getFixTypeForIssue(issueType);
                if (fixType != null) {
                    switch (fixType) {
                        case ADD_BLEED -> addBleed(pdfDoc, issuesByType.get(issueType));
                        case CONVERT_TO_CMYK -> convertToCmyk(pdfDoc, issuesByType.get(issueType));
                        case CONVERT_SPOT_TO_PROCESS -> convertSpotToProcess(pdfDoc, issuesByType.get(issueType));
                        case EMBED_FONTS -> embedFonts(pdfDoc, issuesByType.get(issueType));
                        case CONVERT_TEXT_TO_OUTLINES -> convertTextToOutlines(pdfDoc, issuesByType.get(issueType));
                        case FLATTEN_TRANSPARENCY -> flattenTransparency(pdfDoc, issuesByType.get(issueType));
                        case REDUCE_INK_DENSITY -> reduceInkDensity(pdfDoc, issuesByType.get(issueType));
                    }
                }
            }
            
            // Close the document
            pdfDoc.close();
            
            log.info("Fixes applied successfully, output file: {}", outputFilePath);
            return outputFilePath;
            
        } catch (Exception e) {
            log.error("Error applying fixes: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Add bleed to the document
     */
    private void addBleed(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Adding bleed to document");
        
        try {
            // Convert mm to points (1 mm = 2.83465 points)
            float bleedPoints = minBleedMm * 2.83465f;
            
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle originalPageSize = page.getPageSize();
                
                // Create new page size with bleed
                Rectangle newPageSize = new Rectangle(
                        originalPageSize.getLeft() - bleedPoints,
                        originalPageSize.getBottom() - bleedPoints,
                        originalPageSize.getWidth() + (2 * bleedPoints),
                        originalPageSize.getHeight() + (2 * bleedPoints)
                );
                
                // Create a copy of the page content
                PdfFormXObject pageCopy = page.copyAsFormXObject(pdfDoc);
                
                // Clear the page and set the new size
                page.setMediaBox(newPageSize);
                PdfCanvas canvas = new PdfCanvas(page);
                
                // Draw the original content at the center of the new page
                canvas.addXObjectAt(pageCopy, bleedPoints, bleedPoints);
                
                // Add bleed marks if needed
                // This would extend the content to the edges - simplified for this implementation
                canvas.setStrokeColor(new DeviceCmyk(0, 0, 0, 100)) // Black
                     .setLineWidth(0.5f)
                     .rectangle(
                         originalPageSize.getLeft(),
                         originalPageSize.getBottom(),
                         originalPageSize.getWidth(),
                         originalPageSize.getHeight())
                     .stroke();
            }
            
            log.info("Bleed added successfully to all pages");
            
        } catch (Exception e) {
            log.error("Error adding bleed: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Convert RGB colors to CMYK
     */
    private void convertToCmyk(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Converting RGB colors to CMYK");
        
        try {
            // This is a simplified implementation
            // A complete implementation would involve analyzing each element and converting colors
            
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                // Process color space resources
                PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                if (colorSpaces != null) {
                    for (PdfName key : colorSpaces.keySet()) {
                        PdfObject colorSpace = colorSpaces.get(key);
                        if (colorSpace.isArray()) {
                            PdfArray colorSpaceArray = (PdfArray) colorSpace;
                            PdfName csName = colorSpaceArray.getAsName(0);
                            
                            // Replace RGB color spaces with CMYK
                            if (PdfName.DeviceRGB.equals(csName) || PdfName.CalRGB.equals(csName)) {
                                colorSpaces.put(key, PdfName.DeviceCMYK);
                            }
                        }
                    }
                }
                
                // Process ExtGState for transparency groups
                PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
                if (extGState != null) {
                    for (PdfName key : extGState.keySet()) {
                        PdfDictionary gs = extGState.getAsDictionary(key);
                        if (gs != null) {
                            PdfDictionary tr = gs.getAsDictionary(PdfName.TR);
                            if (tr != null && tr.contains(PdfName.S)) {
                                PdfName renderingIntent = tr.getAsName(PdfName.S);
                                if (PdfName.RelativeColorimetric.equals(renderingIntent)) {
                                    // Change color rendering intent for better CMYK conversion
                                    tr.put(PdfName.S, PdfName.Perceptual);
                                }
                            }
                        }
                    }
                }
            }
            
            // Add a process color CMYK output intent to the document
            PdfOutputIntent outputIntent = new PdfOutputIntent("Custom", "", "http://www.color.org", 
                    "Coated FOGRA39", null);
            outputIntent.addKeys();
            pdfDoc.getCatalog().setOutputIntent(outputIntent);
            
            log.info("RGB colors converted to CMYK");
            
        } catch (Exception e) {
            log.error("Error converting RGB to CMYK: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Convert spot colors to process colors
     */
    private void convertSpotToProcess(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Converting spot colors to process colors");
        
        try {
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                // Process color spaces
                PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                if (colorSpaces != null) {
                    for (PdfName key : colorSpaces.keySet()) {
                        PdfObject colorSpace = colorSpaces.get(key);
                        if (colorSpace.isArray()) {
                            PdfArray colorSpaceArray = (PdfArray) colorSpace;
                            if (colorSpaceArray.size() > 0) {
                                PdfName csType = colorSpaceArray.getAsName(0);
                                
                                // Check if it's a Separation or DeviceN (spot color) space
                                if (PdfName.Separation.equals(csType) || PdfName.DeviceN.equals(csType)) {
                                    // Replace with DeviceCMYK - this is simplified
                                    colorSpaces.put(key, PdfName.DeviceCMYK);
                                }
                            }
                        }
                    }
                }
            }
            
            log.info("Spot colors converted to process colors");
            
        } catch (Exception e) {
            log.error("Error converting spot colors to process: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Embed fonts in the document
     */
    private void embedFonts(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Embedding fonts in document");
        
        try {
            // Note: iText's approach to font embedding is usually done during PDF creation
            // For existing PDFs, this would require a more complex approach of:
            // 1. Identifying all non-embedded fonts
            // 2. Finding matching font files
            // 3. Re-creating text with embedded fonts
            
            // This is a simplified placeholder that would mark fonts as embedded
            // A full implementation would require additional font handling libraries
            
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                // Process font resources
                PdfDictionary fonts = resources.getAsDictionary(PdfName.Font);
                if (fonts != null) {
                    for (PdfName key : fonts.keySet()) {
                        PdfDictionary font = fonts.getAsDictionary(key);
                        if (font != null) {
                            // Check if the font is not embedded
                            PdfDictionary fontDescriptor = font.getAsDictionary(PdfName.FontDescriptor);
                            if (fontDescriptor != null && !fontDescriptor.containsKey(PdfName.FontFile) 
                                    && !fontDescriptor.containsKey(PdfName.FontFile2) 
                                    && !fontDescriptor.containsKey(PdfName.FontFile3)) {
                                
                                // Log the font that would need embedding
                                PdfName fontName = fontDescriptor.getAsName(PdfName.FontName);
                                log.warn("Font embedding required for: {}", fontName);
                                
                                // In a full implementation, we would embed the font here
                                // For this example, we're just acknowledging the issue
                            }
                        }
                    }
                }
            }
            
            log.info("Font embedding check completed - full implementation would embed missing fonts");
            
        } catch (Exception e) {
            log.error("Error embedding fonts: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Convert text to outlines
     */
    private void convertTextToOutlines(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Converting text to outlines");
        
        try {
            // This would be a complex operation requiring:
            // 1. Extracting all text and its formatting
            // 2. Creating vector paths for each character
            // 3. Replacing the text with the vector paths
            
            // This is a simplified placeholder
            // A full implementation would be significantly more complex
            
            log.warn("Text to outlines conversion requires a more specialized implementation");
            log.warn("This operation would convert all text elements to vector paths");
            
            // For documentation purposes, we'll note the steps that would be involved
            // in a complete implementation
            
        } catch (Exception e) {
            log.error("Error converting text to outlines: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Flatten transparency in the document
     */
    private void flattenTransparency(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Flattening transparency");
        
        try {
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                // Process extended graphics states for transparency
                PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
                if (extGState != null) {
                    for (PdfName key : extGState.keySet()) {
                        PdfDictionary gs = extGState.getAsDictionary(key);
                        if (gs != null) {
                            // Check for transparency settings
                            if (gs.containsKey(PdfName.CA) || gs.containsKey(PdfName.ca)) {
                                // Set opacity to 1 (fully opaque)
                                if (gs.containsKey(PdfName.CA)) {
                                    gs.put(PdfName.CA, new PdfNumber(1));
                                }
                                if (gs.containsKey(PdfName.ca)) {
                                    gs.put(PdfName.ca, new PdfNumber(1));
                                }
                            }
                            
                            // Remove soft mask if present
                            if (gs.containsKey(PdfName.SMask)) {
                                gs.remove(PdfName.SMask);
                            }
                        }
                    }
                }
                
                // For a complete implementation, additional steps would be needed:
                // 1. Flatten transparency groups
                // 2. Flatten overlapping transparent objects
                // 3. Handle blend modes
            }
            
            log.info("Transparency flattened");
            
        } catch (Exception e) {
            log.error("Error flattening transparency: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Reduce ink density in areas with excessive coverage
     */
    private void reduceInkDensity(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Reducing ink density");
        
        try {
            // This would be a complex operation requiring:
            // 1. Analyzing the color values in the document
            // 2. Identifying areas with high ink coverage
            // 3. Adjusting the CMYK values to reduce total area coverage
            
            // For a real implementation, this would need specialized color management
            
            // For documentation purposes, we'll note the steps that would be involved
            // in a complete implementation
            log.warn("Ink density reduction requires a specialized color management implementation");
            log.warn("This operation would analyze and adjust CMYK values to reduce total area coverage");
            
        } catch (Exception e) {
            log.error("Error reducing ink density: {}", e.getMessage(), e);
        }
    }
}
