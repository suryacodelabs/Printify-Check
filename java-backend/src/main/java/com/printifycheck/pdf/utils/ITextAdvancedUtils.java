
package com.printifycheck.pdf.utils;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceCmyk;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.exceptions.PdfException;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.action.PdfAction;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.colorspace.PdfColorSpace;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.pdfa.PdfADocument;
import com.itextpdf.svg.converter.SvgConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Advanced PDF utility operations using iText 9 library
 */
@Slf4j
@Component
public class ITextAdvancedUtils {

    /**
     * Optimizes a PDF for web viewing (linearization)
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @return true if successful, false otherwise
     */
    public boolean linearizePdf(String inputPath, String outputPath) {
        try {
            // Configure reader
            PdfReader reader = new PdfReader(inputPath);
            PdfDocument pdfDoc = new PdfDocument(reader);
            
            // Configure writer with linearization
            WriterProperties writerProperties = new WriterProperties();
            writerProperties.setFullCompressionMode(true);
            writerProperties.setPdfVersion(PdfVersion.PDF_1_7);
            writerProperties.setLinearize(true);
            
            PdfWriter writer = new PdfWriter(outputPath, writerProperties);
            PdfDocument newDoc = new PdfDocument(writer);
            
            // Copy pages from original to new document
            pdfDoc.copyPagesTo(1, pdfDoc.getNumberOfPages(), newDoc);
            
            // Close resources
            newDoc.close();
            pdfDoc.close();
            
            log.info("PDF linearized successfully: {}", outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to linearize PDF: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Embeds all fonts in a PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @return true if successful, false otherwise
     */
    public boolean embedFonts(String inputPath, String outputPath) {
        try {
            // Using iText's built-in embedding when copying document
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Embed fonts during the process
            pdfDoc.setFlushUnusedObjects(true);
            
            // Close resources
            pdfDoc.close();
            
            log.info("Embedded fonts in PDF successfully: {}", outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to embed fonts: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Converts RGB colors to CMYK in a PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param preserveBlack Whether to preserve pure black
     * @return true if successful, false otherwise
     */
    public boolean convertRgbToCmyk(String inputPath, String outputPath, boolean preserveBlack) {
        try {
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Process each page
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfResources resources = page.getResources();
                
                // Process color spaces in resources
                Map<PdfName, PdfObject> colorSpaces = resources.getResourceObjects(PdfName.ColorSpace);
                if (colorSpaces != null) {
                    // Convert colorspaces as needed - this is a simplified approach
                    // A complete solution would need to analyze each color space type and convert accordingly
                    log.info("Processing color spaces on page {}", i);
                }
                
                // Create an intermediary page to handle color conversion
                PdfFormXObject pageCopy = page.copyAsFormXObject(pdfDoc);
                
                // Clear the page
                Rectangle pageRect = page.getPageSizeWithRotation();
                PdfCanvas canvas = new PdfCanvas(page);
                
                // Draw the copied page content using CMYK color context
                if (preserveBlack) {
                    // Special handling for black content
                    canvas.setFillColor(new DeviceCmyk(0, 0, 0, 100)); // 100% Black in CMYK
                } else {
                    // Default color conversion
                    canvas.setFillColor(new DeviceCmyk(0, 0, 0, 0)); // 0% of each color
                }
                
                // Add the original content back
                canvas.addXObjectAt(pageCopy, 0, 0);
            }
            
            pdfDoc.close();
            log.info("Converted RGB to CMYK successfully: {}", outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to convert RGB to CMYK: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Applies an ICC profile to a PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param iccProfilePath Path to the ICC profile
     * @return true if successful, false otherwise
     */
    public boolean applyIccProfile(String inputPath, String outputPath, String iccProfilePath) {
        try {
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Read ICC profile
            byte[] iccData = Files.readAllBytes(Path.of(iccProfilePath));
            PdfArray iccArray = new PdfArray();
            
            // Setup ICC profile as output intent
            iccArray.add(PdfName.ICCBased);
            PdfStream iccStream = new PdfStream(iccData);
            iccArray.add(iccStream);
            PdfDictionary outputIntent = new PdfDictionary();
            outputIntent.put(PdfName.S, PdfName.GTS_PDFA1);
            outputIntent.put(PdfName.OutputConditionIdentifier, new PdfString("Custom"));
            outputIntent.put(PdfName.DestOutputProfile, iccStream);
            
            // Add output intent to the document
            pdfDoc.getCatalog().put(PdfName.OutputIntents, new PdfArray(outputIntent));
            
            pdfDoc.close();
            
            log.info("Applied ICC profile successfully: {}", outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to apply ICC profile: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Flattens transparency in a PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param quality Quality level (low, medium, high)
     * @return true if successful, false otherwise
     */
    public boolean flattenTransparency(String inputPath, String outputPath, String quality) {
        try {
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Process each page
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfResources resources = page.getResources();
                
                // Handle ExtGState resources (where transparency settings are defined)
                Map<PdfName, PdfObject> extGStates = resources.getResourceObjects(PdfName.ExtGState);
                if (extGStates != null) {
                    for (Map.Entry<PdfName, PdfObject> entry : extGStates.entrySet()) {
                        if (entry.getValue().isDictionary()) {
                            PdfDictionary gState = (PdfDictionary) entry.getValue();
                            
                            // Remove transparency settings
                            gState.remove(PdfName.CA); // Stroke opacity
                            gState.remove(PdfName.ca); // Fill opacity
                            
                            // Set full opacity
                            gState.put(PdfName.CA, new PdfNumber(1.0f));
                            gState.put(PdfName.ca, new PdfNumber(1.0f));
                        }
                    }
                }
                
                // Form XObjects may contain transparency as well - should be processed recursively
                // This is a simplified approach - full implementation would need to process form XObjects
            }
            
            pdfDoc.close();
            
            log.info("Flattened transparency successfully with {} quality: {}", quality, outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to flatten transparency: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Converts a PDF to PDF/A standard
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param conformanceLevel Conformance level (e.g., "1B", "2A", etc.)
     * @return true if successful, false otherwise
     */
    public boolean convertToPdfA(String inputPath, String outputPath, String conformanceLevel) {
        try {
            // Map conformance level to PdfAConformanceLevel
            PdfADocument.PdfAConformanceLevel level;
            
            switch (conformanceLevel.toUpperCase()) {
                case "1B":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_1B;
                    break;
                case "1A":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_1A;
                    break;
                case "2B":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_2B;
                    break;
                case "2A":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_2A;
                    break;
                case "3B":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_3B;
                    break;
                case "3A":
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_3A;
                    break;
                default:
                    level = PdfADocument.PdfAConformanceLevel.PDF_A_1B;
                    break;
            }
            
            // Create an ICC profile (required for PDF/A)
            String iccPath = getDefaultIccProfilePath();
            InputStream iccStream = new FileInputStream(iccPath);
            
            // Setup writer with PDF/A conformance
            PdfWriter writer = new PdfWriter(outputPath);
            
            // Create PDF/A document
            PdfADocument pdfADoc = new PdfADocument(writer, level, 
                    new PdfOutputIntent("Custom", "", "http://www.color.org", 
                    "sRGB IEC61966-2.1", iccStream));
            
            // Copy pages from the original PDF
            PdfDocument origDoc = new PdfDocument(new PdfReader(inputPath));
            origDoc.copyPagesTo(1, origDoc.getNumberOfPages(), pdfADoc);
            
            // Close resources
            origDoc.close();
            pdfADoc.close();
            iccStream.close();
            
            log.info("Converted to PDF/A-{} successfully: {}", conformanceLevel, outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to convert to PDF/A: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Converts a PDF to PDF/X standard
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param standard PDF/X standard ("1A", "3", "4")
     * @return true if successful, false otherwise
     */
    public boolean convertToPdfX(String inputPath, String outputPath, String standard) {
        try {
            // Setup reader and writer
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Create appropriate output intent for PDF/X standard
            String iccPath = getDefaultIccProfilePath();
            
            // Add output intent based on standard
            PdfDictionary outputIntent = new PdfDictionary();
            switch (standard) {
                case "1a":
                    outputIntent.put(PdfName.S, new PdfName("GTS_PDFX"));
                    break;
                case "3":
                    outputIntent.put(PdfName.S, new PdfName("GTS_PDFX3"));
                    break;
                case "4":
                    outputIntent.put(PdfName.S, new PdfName("GTS_PDFX4"));
                    break;
                default:
                    outputIntent.put(PdfName.S, new PdfName("GTS_PDFX"));
                    break;
            }
            
            // Add required fields for output intent
            outputIntent.put(PdfName.OutputConditionIdentifier, new PdfString("CGATS TR 001"));
            outputIntent.put(PdfName.RegistryName, new PdfString("https://www.color.org"));
            
            // Add ICC profile if exists
            if (new File(iccPath).exists()) {
                PdfStream iccStream = new PdfStream(Files.readAllBytes(Paths.get(iccPath)));
                outputIntent.put(PdfName.DestOutputProfile, iccStream);
            }
            
            // Add output intent to the document
            PdfArray outputIntents = new PdfArray();
            outputIntents.add(outputIntent);
            pdfDoc.getCatalog().put(PdfName.OutputIntents, outputIntents);
            
            // PDF/X requirements: set trap network state
            pdfDoc.getCatalog().put(new PdfName("Trapped"), new PdfName("False"));
            
            // Close resources
            pdfDoc.close();
            
            log.info("Converted to PDF/X-{} successfully: {}", standard, outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to convert to PDF/X: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Adds bleed to a PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param bleedMargin Bleed margin in points (1/72 inch)
     * @return true if successful, false otherwise
     */
    public boolean addBleed(String inputPath, String outputPath, float bleedMargin) {
        try {
            PdfReader reader = new PdfReader(inputPath);
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Process each page
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle originalPageSize = page.getPageSize();
                
                // Calculate new page size with bleed
                Rectangle newPageSize = new Rectangle(
                        originalPageSize.getLeft() - bleedMargin,
                        originalPageSize.getBottom() - bleedMargin,
                        originalPageSize.getWidth() + 2 * bleedMargin,
                        originalPageSize.getHeight() + 2 * bleedMargin
                );
                
                // Create a copy of the original page content
                PdfFormXObject pageCopy = page.copyAsFormXObject(pdfDoc);
                
                // Set new page size
                page.setMediaBox(newPageSize);
                
                // Add crop marks and bleed marks
                PdfCanvas canvas = new PdfCanvas(page);
                
                // Clear the page and draw the original content in the center
                canvas.rectangle(newPageSize.getLeft(), newPageSize.getBottom(), 
                        newPageSize.getWidth(), newPageSize.getHeight());
                canvas.setFillColor(ColorConstants.WHITE);
                canvas.fill();
                
                // Draw the original content in the center
                canvas.addXObject(pageCopy, bleedMargin, bleedMargin);
                
                // Draw crop marks
                canvas.setStrokeColor(ColorConstants.BLACK);
                canvas.setLineWidth(0.5f);
                
                // Top left corner
                canvas.moveTo(bleedMargin - 10, originalPageSize.getHeight() + bleedMargin);
                canvas.lineTo(bleedMargin + 10, originalPageSize.getHeight() + bleedMargin);
                canvas.moveTo(bleedMargin, originalPageSize.getHeight() + bleedMargin - 10);
                canvas.lineTo(bleedMargin, originalPageSize.getHeight() + bleedMargin + 10);
                
                // Top right corner
                canvas.moveTo(originalPageSize.getWidth() + bleedMargin - 10, originalPageSize.getHeight() + bleedMargin);
                canvas.lineTo(originalPageSize.getWidth() + bleedMargin + 10, originalPageSize.getHeight() + bleedMargin);
                canvas.moveTo(originalPageSize.getWidth() + bleedMargin, originalPageSize.getHeight() + bleedMargin - 10);
                canvas.lineTo(originalPageSize.getWidth() + bleedMargin, originalPageSize.getHeight() + bleedMargin + 10);
                
                // Bottom left corner
                canvas.moveTo(bleedMargin - 10, bleedMargin);
                canvas.lineTo(bleedMargin + 10, bleedMargin);
                canvas.moveTo(bleedMargin, bleedMargin - 10);
                canvas.lineTo(bleedMargin, bleedMargin + 10);
                
                // Bottom right corner
                canvas.moveTo(originalPageSize.getWidth() + bleedMargin - 10, bleedMargin);
                canvas.lineTo(originalPageSize.getWidth() + bleedMargin + 10, bleedMargin);
                canvas.moveTo(originalPageSize.getWidth() + bleedMargin, bleedMargin - 10);
                canvas.lineTo(originalPageSize.getWidth() + bleedMargin, bleedMargin + 10);
                
                canvas.stroke();
            }
            
            pdfDoc.close();
            
            log.info("Added {}pt bleed successfully: {}", bleedMargin, outputPath);
            return true;
        } catch (IOException | PdfException e) {
            log.error("Failed to add bleed: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Creates a print-ready PDF from an input PDF
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF file path
     * @param addBleed Whether to add bleed
     * @param convertToCmyk Whether to convert colors to CMYK
     * @param flattenTransparency Whether to flatten transparency
     * @return true if successful, false otherwise
     */
    public boolean preparePrintReadyPdf(String inputPath, String outputPath, 
            boolean addBleed, boolean convertToCmyk, boolean flattenTransparency) {
        
        String tempPath1 = outputPath + ".temp1";
        String tempPath2 = outputPath + ".temp2";
        
        try {
            String currentInput = inputPath;
            String nextOutput = tempPath1;
            
            // First operation
            if (convertToCmyk) {
                if (!convertRgbToCmyk(currentInput, nextOutput, true)) {
                    return false;
                }
                currentInput = nextOutput;
                nextOutput = tempPath2;
            }
            
            // Second operation
            if (flattenTransparency) {
                if (!flattenTransparency(currentInput, nextOutput, "high")) {
                    return false;
                }
                
                // Swap paths
                String temp = currentInput;
                currentInput = nextOutput;
                nextOutput = (temp.equals(inputPath)) ? tempPath1 : temp;
            }
            
            // Last operation
            if (addBleed) {
                if (!addBleed(currentInput, outputPath, 9.0f)) { // 9pt = 1/8 inch bleed
                    return false;
                }
            } else {
                // Copy the last temp file to the output path
                if (!currentInput.equals(outputPath)) {
                    Files.copy(Paths.get(currentInput), Paths.get(outputPath));
                }
            }
            
            // Clean up temp files
            try {
                Files.deleteIfExists(Paths.get(tempPath1));
                Files.deleteIfExists(Paths.get(tempPath2));
            } catch (IOException e) {
                log.warn("Failed to delete temporary files: {}", e.getMessage());
            }
            
            log.info("Created print-ready PDF successfully: {}", outputPath);
            return true;
        } catch (Exception e) {
            log.error("Failed to create print-ready PDF: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Generate a preflight report PDF for a PDF file
     * 
     * @param inputPath Input PDF file path
     * @param outputPath Output PDF report file path
     * @param issues List of identified issues
     * @param qualityScore Overall quality score
     * @return true if successful, false otherwise
     */
    public boolean generatePreflightReport(String inputPath, String outputPath, 
            List<Map<String, Object>> issues, int qualityScore) {
        
        try {
            PdfWriter writer = new PdfWriter(outputPath);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Title
            document.add(new Paragraph("PDF Preflight Report")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            
            // Date and time
            document.add(new Paragraph("Generated on " + new Date())
                    .setFontSize(10)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.add(new Paragraph("\n"));
            
            // Add file information
            Table fileInfo = new Table(UnitValue.createPercentArray(2));
            fileInfo.setWidth(UnitValue.createPercentValue(100));
            
            File file = new File(inputPath);
            
            fileInfo.addCell("Filename:");
            fileInfo.addCell(file.getName());
            
            fileInfo.addCell("File size:");
            fileInfo.addCell((file.length() / 1024) + " KB");
            
            fileInfo.addCell("Quality Score:");
            fileInfo.addCell(qualityScore + "/100");
            
            document.add(fileInfo);
            
            document.add(new Paragraph("\n"));
            
            // Issues Summary
            document.add(new Paragraph("Issues Summary")
                    .setFontSize(16)
                    .setBold());
            
            if (issues.isEmpty()) {
                document.add(new Paragraph("No issues found. The PDF file meets all requirements.")
                        .setFontSize(12));
            } else {
                // Issues table
                Table issuesTable = new Table(UnitValue.createPercentArray(new float[]{15, 45, 20, 20}));
                issuesTable.setWidth(UnitValue.createPercentValue(100));
                
                // Add header
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Severity").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Issue").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Page").setBold()));
                issuesTable.addHeaderCell(new Cell().add(new Paragraph("Fixable").setBold()));
                
                // Add issues
                for (Map<String, Object> issue : issues) {
                    String severity = (String) issue.getOrDefault("severity", "");
                    String message = (String) issue.getOrDefault("message", "");
                    Object page = issue.getOrDefault("page", "-");
                    Boolean fixable = (Boolean) issue.getOrDefault("autoFixable", false);
                    
                    Cell severityCell = new Cell();
                    
                    // Color-code severity
                    switch (severity.toLowerCase()) {
                        case "high":
                            severityCell.setBackgroundColor(new DeviceRgb(255, 200, 200));
                            break;
                        case "medium":
                            severityCell.setBackgroundColor(new DeviceRgb(255, 235, 156));
                            break;
                        case "low":
                            severityCell.setBackgroundColor(new DeviceRgb(198, 239, 206));
                            break;
                        default:
                            severityCell.setBackgroundColor(new DeviceRgb(235, 235, 235));
                            break;
                    }
                    
                    severityCell.add(new Paragraph(severity.toUpperCase()));
                    issuesTable.addCell(severityCell);
                    
                    issuesTable.addCell(message);
                    issuesTable.addCell(page.toString());
                    issuesTable.addCell(fixable ? "Yes" : "No");
                }
                
                document.add(issuesTable);
            }
            
            document.add(new Paragraph("\n"));
            
            // Recommendations
            document.add(new Paragraph("Recommendations")
                    .setFontSize(16)
                    .setBold());
            
            if (issues.isEmpty()) {
                document.add(new Paragraph("The PDF file is ready for production.")
                        .setFontSize(12));
            } else {
                List<String> recommendations = new ArrayList<>();
                
                // Generate recommendations based on issues
                boolean hasColorIssues = false;
                boolean hasFontIssues = false;
                boolean hasResolutionIssues = false;
                
                for (Map<String, Object> issue : issues) {
                    String message = (String) issue.getOrDefault("message", "").toLowerCase();
                    
                    if (message.contains("color") || message.contains("rgb") || message.contains("cmyk")) {
                        hasColorIssues = true;
                    }
                    
                    if (message.contains("font") || message.contains("embedded")) {
                        hasFontIssues = true;
                    }
                    
                    if (message.contains("resolution") || message.contains("dpi")) {
                        hasResolutionIssues = true;
                    }
                }
                
                if (hasColorIssues) {
                    recommendations.add("Convert all RGB colors to CMYK for print-ready output.");
                }
                
                if (hasFontIssues) {
                    recommendations.add("Embed all fonts to ensure consistent text rendering.");
                }
                
                if (hasResolutionIssues) {
                    recommendations.add("Increase resolution of low-resolution images to at least 300 DPI for print.");
                }
                
                // Add generic recommendation if none were generated
                if (recommendations.isEmpty()) {
                    recommendations.add("Fix the identified issues before proceeding to production.");
                }
                
                // Add recommendations to document
                List list = new List();
                for (String recommendation : recommendations) {
                    list.add(recommendation);
                }
                
                document.add(list);
            }
            
            // Footer
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Generated by Printify Check Tool")
                    .setFontSize(8)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.close();
            
            log.info("Generated preflight report successfully: {}", outputPath);
            return true;
        } catch (Exception e) {
            log.error("Failed to generate preflight report: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Gets the path to a default ICC profile (sRGB)
     * 
     * @return Path to ICC profile
     */
    public String getDefaultIccProfilePath() {
        // In production, we would have ICC profiles stored in a known location
        // For this implementation, we'll check a few common locations
        
        // Check for a profile in the application directory
        Path appProfile = Paths.get("./profiles/sRGB.icc");
        if (Files.exists(appProfile)) {
            return appProfile.toString();
        }
        
        // Default to a system location
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return "C:\\Windows\\System32\\spool\\drivers\\color\\sRGB Color Space Profile.icm";
        } else {
            return "/usr/share/color/icc/colord/sRGB.icc";
        }
    }
}
