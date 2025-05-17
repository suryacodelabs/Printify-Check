
package com.printifycheck.pdf;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.colorspace.PdfColorSpace;
import com.itextpdf.kernel.pdf.colorspace.PdfDeviceCs;
import com.itextpdf.kernel.pdf.colorspace.PdfSpecialCs;
import com.printifycheck.model.PdfCheckResult;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class PreflightService {

    @Value("${pdf.processed.dir}")
    private String processedDir;
    
    private static final float MIN_IMAGE_DPI = 300;
    private static final float MIN_BLEED_MM = 3.0f;
    private static final float MIN_TEXT_SIZE_PT = 6.0f;
    private static final float MIN_LINE_WIDTH_PT = 0.25f;
    private static final int MAX_INK_DENSITY_PERCENT = 300;
    private static final long MAX_RECOMMENDED_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * Performs a comprehensive preflight check on the PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param userId User ID of the requesting user
     * @return PdfCheckResult containing all issues found
     */
    public PdfCheckResult performPreflightCheck(String inputFilePath, UUID userId) {
        File inputFile = new File(inputFilePath);
        String fileName = inputFile.getName();
        long fileSize = inputFile.length();
        
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(inputFilePath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // 1. Check image resolution
            checkImageResolution(pdfDoc, issues);
            
            // 2. Check bleed
            checkBleed(pdfDoc, issues);
            
            // 3. Check color spaces
            checkColorSpaces(pdfDoc, issues);
            
            // 4. Check fonts
            checkFonts(pdfDoc, issues);
            
            // 5. Check transparency
            checkTransparency(pdfDoc, issues);
            
            // 6. Check ink density
            checkInkDensity(pdfDoc, issues);
            
            // 7. Check PDF/X compliance
            checkPdfXCompliance(pdfDoc, issues);
            
            // 8. Check text size
            checkTextSize(pdfDoc, issues);
            
            // 9. Check hairlines
            checkHairlines(pdfDoc, issues);
            
            // 10. Check overprint
            checkOverprint(pdfDoc, issues);
            
            // 11. Check spot colors
            checkSpotColors(pdfDoc, issues);
            
            // 12. Check image compression
            checkImageCompression(pdfDoc, issues);
            
            // 13. Check trim/safe zones
            checkTrimSafeZones(pdfDoc, issues);
            
            // 14. Check ICC profiles
            checkIccProfiles(pdfDoc, issues);
            
            // 15. Check page geometry
            checkPageGeometry(pdfDoc, issues);
            
            // 16. Check annotations/forms
            checkAnnotationsAndForms(pdfDoc, issues);
            
            // 17. Check metadata
            checkMetadata(pdfDoc, issues);
            
            // 18. Check file size
            checkFileSize(fileSize, issues);
            
            // Calculate quality score based on issues
            int qualityScore = calculateQualityScore(issues);
            
            return PdfCheckResult.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .fileName(fileName)
                    .fileSize(fileSize)
                    .qualityScore(qualityScore)
                    .status(PdfCheckResult.CheckStatus.COMPLETED)
                    .issuesCount(issues.size())
                    .issues(issues)
                    .build();
            
        } catch (IOException e) {
            log.error("Error performing preflight check: {}", e.getMessage(), e);
            
            return PdfCheckResult.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .fileName(fileName)
                    .fileSize(fileSize)
                    .qualityScore(0)
                    .status(PdfCheckResult.CheckStatus.FAILED)
                    .issuesCount(0)
                    .issues(List.of(
                        PdfIssue.builder()
                            .type("Error")
                            .severity(PdfIssue.IssueSeverity.HIGH)
                            .message("Failed to process PDF: " + e.getMessage())
                            .autoFixable(false)
                            .build()
                    ))
                    .build();
        }
    }
    
    /**
     * Creates an annotated PDF with preflight issues highlighted
     * 
     * @param inputFilePath Path to the original PDF
     * @param issues List of issues found during preflight
     * @return Path to the annotated PDF file
     */
    public String createAnnotatedPdf(String inputFilePath, List<PdfIssue> issues) {
        File inputFile = new File(inputFilePath);
        String annotatedFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_annotated.pdf");
        
        try (PdfReader reader = new PdfReader(inputFilePath);
             PdfWriter writer = new PdfWriter(annotatedFilePath);
             PdfDocument pdfDoc = new PdfDocument(reader, writer)) {
            
            Document document = new Document(pdfDoc);
            PdfFont font = PdfFontFactory.createFont();
            
            // Add annotation for each issue
            for (PdfIssue issue : issues) {
                if (issue.getPage() == null || issue.getPage() <= 0 || issue.getPage() > pdfDoc.getNumberOfPages()) {
                    continue;
                }
                
                PdfPage page = pdfDoc.getPage(issue.getPage());
                PdfCanvas canvas = new PdfCanvas(page);
                
                // Draw a red box around the issue if location is provided
                if (issue.getLocation() != null) {
                    PdfIssue.IssueLocation location = issue.getLocation();
                    canvas.saveState()
                          .setStrokeColor(ColorConstants.RED)
                          .setLineWidth(1.5f)
                          .rectangle(location.getX(), location.getY(), location.getWidth(), location.getHeight())
                          .stroke()
                          .restoreState();
                    
                    // Add a comment annotation
                    Rectangle rect = new Rectangle(
                            location.getX(), 
                            location.getY(), 
                            location.getWidth(), 
                            location.getHeight());
                    
                    PdfAnnotation annotation = new PdfTextAnnotation(rect)
                            .setTitle(issue.getType())
                            .setContents(issue.getMessage())
                            .setColor(ColorConstants.RED.getColorValue());
                    
                    page.addAnnotation(annotation);
                }
            }
            
            // Add summary page at the end
            pdfDoc.addNewPage();
            document.add(new Paragraph("PDF Preflight Summary")
                    .setFont(font)
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.add(new Paragraph("Total Issues: " + issues.size())
                    .setFont(font)
                    .setFontSize(14));
            
            // Group issues by severity
            long highSeverity = issues.stream().filter(i -> i.getSeverity() == PdfIssue.IssueSeverity.HIGH).count();
            long mediumSeverity = issues.stream().filter(i -> i.getSeverity() == PdfIssue.IssueSeverity.MEDIUM).count();
            long lowSeverity = issues.stream().filter(i -> i.getSeverity() == PdfIssue.IssueSeverity.LOW).count();
            
            document.add(new Paragraph("High Severity: " + highSeverity)
                    .setFont(font)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.RED));
            
            document.add(new Paragraph("Medium Severity: " + mediumSeverity)
                    .setFont(font)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.ORANGE));
            
            document.add(new Paragraph("Low Severity: " + lowSeverity)
                    .setFont(font)
                    .setFontSize(12)
                    .setFontColor(ColorConstants.BLUE));
            
            // List all issues
            for (PdfIssue issue : issues) {
                document.add(new Paragraph(issue.getType() + " (" + issue.getSeverity() + "): " + issue.getMessage())
                        .setFont(font)
                        .setFontSize(10));
            }
            
            document.close();
            return annotatedFilePath;
            
        } catch (IOException e) {
            log.error("Error creating annotated PDF: {}", e.getMessage(), e);
            return null;
        }
    }

    // Implementation of check methods with detailed logic
    
    private void checkImageResolution(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking image resolution");
        
        try {
            Map<Integer, List<PdfImageInfo>> imagesByPage = extractImageInfo(pdfDoc);
            
            for (Map.Entry<Integer, List<PdfImageInfo>> entry : imagesByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<PdfImageInfo> pageImages = entry.getValue();
                
                for (PdfImageInfo imageInfo : pageImages) {
                    if (imageInfo.getDpi() < MIN_IMAGE_DPI) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Low Image Resolution")
                                .severity(PdfIssue.IssueSeverity.HIGH)
                                .message(String.format("Image on page %d has resolution below 300 DPI (%.1f DPI)", 
                                        pageNumber, imageInfo.getDpi()))
                                .page(pageNumber)
                                .autoFixable(false)
                                .fixDescription("Replace the image with a higher resolution version")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(imageInfo.getX())
                                    .y(imageInfo.getY())
                                    .width(imageInfo.getWidth())
                                    .height(imageInfo.getHeight())
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image resolution: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Image Resolution Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze image resolution: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkBleed(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking bleed");
        
        try {
            // For each page in the document
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle trimBox = page.getTrimBox();
                Rectangle bleedBox = page.getBleedBox();
                
                // If trimBox and bleedBox are the same, there's no bleed
                if (trimBox.equals(bleedBox)) {
                    issues.add(
                        PdfIssue.builder()
                            .type("Missing Bleed")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message(String.format("Page %d is missing the required %.1fmm bleed", i, MIN_BLEED_MM))
                            .page(i)
                            .autoFixable(true)
                            .fixDescription("Add bleed by extending content beyond trim area")
                            .build()
                    );
                    continue;
                }
                
                // Convert points to mm (1 pt = 0.352778 mm)
                float bleedLeft = (trimBox.getLeft() - bleedBox.getLeft()) * 0.352778f;
                float bleedRight = (bleedBox.getRight() - trimBox.getRight()) * 0.352778f;
                float bleedTop = (bleedBox.getTop() - trimBox.getTop()) * 0.352778f;
                float bleedBottom = (trimBox.getBottom() - bleedBox.getBottom()) * 0.352778f;
                
                // Check if bleed is less than the minimum on any side
                if (bleedLeft < MIN_BLEED_MM || bleedRight < MIN_BLEED_MM || 
                    bleedTop < MIN_BLEED_MM || bleedBottom < MIN_BLEED_MM) {
                    
                    issues.add(
                        PdfIssue.builder()
                            .type("Insufficient Bleed")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message(String.format("Page %d has insufficient bleed (minimum %.1fmm required on all sides)", 
                                    i, MIN_BLEED_MM))
                            .page(i)
                            .autoFixable(true)
                            .fixDescription("Extend bleed to at least 3mm on all sides")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking bleed: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Bleed Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze bleed: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkColorSpaces(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking color spaces");
        
        try {
            Map<Integer, List<ColorSpaceInfo>> colorSpacesByPage = extractColorSpaces(pdfDoc);
            
            for (Map.Entry<Integer, List<ColorSpaceInfo>> entry : colorSpacesByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<ColorSpaceInfo> colorSpaces = entry.getValue();
                
                boolean hasRgb = false;
                boolean hasSpot = false;
                
                for (ColorSpaceInfo cs : colorSpaces) {
                    if (cs.getType() == ColorSpaceType.RGB) {
                        hasRgb = true;
                    } else if (cs.getType() == ColorSpaceType.SPOT) {
                        hasSpot = true;
                    }
                }
                
                if (hasRgb) {
                    issues.add(
                        PdfIssue.builder()
                            .type("RGB Color Space")
                            .severity(PdfIssue.IssueSeverity.HIGH)
                            .message(String.format("Page %d contains RGB color space which is not recommended for print", 
                                    pageNumber))
                            .page(pageNumber)
                            .autoFixable(true)
                            .fixDescription("Convert RGB colors to CMYK")
                            .build()
                    );
                }
                
                if (hasSpot) {
                    issues.add(
                        PdfIssue.builder()
                            .type("Spot Colors")
                            .severity(PdfIssue.IssueSeverity.LOW)
                            .message(String.format("Page %d contains spot colors", pageNumber))
                            .page(pageNumber)
                            .autoFixable(false)
                            .fixDescription("Verify spot colors are intended for print")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking color spaces: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Color Space Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze color spaces: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkFonts(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking fonts");
        
        try {
            // Get all fonts in the document
            Map<Integer, List<FontInfo>> fontsByPage = extractFontInfo(pdfDoc);
            
            for (Map.Entry<Integer, List<FontInfo>> entry : fontsByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<FontInfo> fonts = entry.getValue();
                
                for (FontInfo font : fonts) {
                    if (!font.isEmbedded()) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Non-embedded Font")
                                .severity(PdfIssue.IssueSeverity.HIGH)
                                .message(String.format("Page %d uses non-embedded font '%s'", pageNumber, font.getName()))
                                .page(pageNumber)
                                .autoFixable(true)
                                .fixDescription("Embed font in PDF")
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking fonts: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Font Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze fonts: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkTransparency(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking transparency");
        
        try {
            Map<Integer, Boolean> transparencyByPage = detectTransparency(pdfDoc);
            
            for (Map.Entry<Integer, Boolean> entry : transparencyByPage.entrySet()) {
                int pageNumber = entry.getKey();
                boolean hasTransparency = entry.getValue();
                
                if (hasTransparency) {
                    issues.add(
                        PdfIssue.builder()
                            .type("Transparency Detected")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message(String.format("Page %d contains transparency which may cause flattening issues in print", 
                                    pageNumber))
                            .page(pageNumber)
                            .autoFixable(true)
                            .fixDescription("Flatten transparency")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking transparency: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Transparency Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze transparency: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkInkDensity(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking ink density");
        
        try {
            Map<Integer, List<InkDensityInfo>> inkDensityByPage = calculateInkDensity(pdfDoc);
            
            for (Map.Entry<Integer, List<InkDensityInfo>> entry : inkDensityByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<InkDensityInfo> inkDensityInfos = entry.getValue();
                
                for (InkDensityInfo info : inkDensityInfos) {
                    if (info.getDensity() > MAX_INK_DENSITY_PERCENT) {
                        issues.add(
                            PdfIssue.builder()
                                .type("High Ink Density")
                                .severity(PdfIssue.IssueSeverity.HIGH)
                                .message(String.format("Page %d has areas with ink density exceeding %d%% (found %.1f%%)", 
                                        pageNumber, MAX_INK_DENSITY_PERCENT, info.getDensity()))
                                .page(pageNumber)
                                .autoFixable(false)
                                .fixDescription("Reduce ink density to below 300%")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(info.getX())
                                    .y(info.getY())
                                    .width(info.getWidth())
                                    .height(info.getHeight())
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking ink density: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Ink Density Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze ink density: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkPdfXCompliance(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking PDF/X compliance");
        
        try {
            boolean isPdfX = isPdfXCompliant(pdfDoc);
            
            if (!isPdfX) {
                issues.add(
                    PdfIssue.builder()
                        .type("Not PDF/X Compliant")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document is not PDF/X compliant which is recommended for print")
                        .autoFixable(false)
                        .fixDescription("Convert to PDF/X-1a or PDF/X-4 format")
                        .build()
                );
            }
        } catch (Exception e) {
            log.error("Error checking PDF/X compliance: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("PDF/X Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze PDF/X compliance: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkTextSize(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking text size");
        
        try {
            Map<Integer, List<TextInfo>> textInfoByPage = extractTextInfo(pdfDoc);
            
            for (Map.Entry<Integer, List<TextInfo>> entry : textInfoByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<TextInfo> textInfos = entry.getValue();
                
                for (TextInfo textInfo : textInfos) {
                    if (textInfo.getFontSize() < MIN_TEXT_SIZE_PT) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Small Text")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message(String.format("Page %d contains text smaller than %s pt (%.1f pt)",
                                        pageNumber, MIN_TEXT_SIZE_PT, textInfo.getFontSize()))
                                .page(pageNumber)
                                .autoFixable(false)
                                .fixDescription("Increase text size to at least 6pt")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(textInfo.getX())
                                    .y(textInfo.getY())
                                    .width(textInfo.getWidth())
                                    .height(textInfo.getHeight())
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking text size: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Text Size Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze text size: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkHairlines(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking hairlines");
        
        try {
            Map<Integer, List<LineInfo>> lineInfoByPage = extractLineInfo(pdfDoc);
            
            for (Map.Entry<Integer, List<LineInfo>> entry : lineInfoByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<LineInfo> lineInfos = entry.getValue();
                
                for (LineInfo lineInfo : lineInfos) {
                    if (lineInfo.getLineWidth() < MIN_LINE_WIDTH_PT) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Hairline")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message(String.format("Page %d contains line thinner than %.2f pt (%.2f pt)",
                                        pageNumber, MIN_LINE_WIDTH_PT, lineInfo.getLineWidth()))
                                .page(pageNumber)
                                .autoFixable(true)
                                .fixDescription("Increase line width to at least 0.25pt")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(lineInfo.getX1())
                                    .y(lineInfo.getY1())
                                    .width(Math.abs(lineInfo.getX2() - lineInfo.getX1()))
                                    .height(Math.abs(lineInfo.getY2() - lineInfo.getY1()))
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking hairlines: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Hairline Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze hairlines: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkOverprint(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking overprint settings");
        
        try {
            Map<Integer, List<OverprintInfo>> overprintByPage = detectOverprint(pdfDoc);
            
            for (Map.Entry<Integer, List<OverprintInfo>> entry : overprintByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<OverprintInfo> overprintInfos = entry.getValue();
                
                for (OverprintInfo info : overprintInfos) {
                    if (info.hasInconsistentSettings()) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Inconsistent Overprint")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message(String.format("Page %d has inconsistent overprint settings which may cause unexpected results",
                                        pageNumber))
                                .page(pageNumber)
                                .autoFixable(true)
                                .fixDescription("Fix inconsistent overprint settings")
                                .build()
                        );
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking overprint: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Overprint Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze overprint settings: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkSpotColors(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking spot colors");
        
        try {
            List<String> spotColors = extractSpotColors(pdfDoc);
            
            if (!spotColors.isEmpty()) {
                String colorsList = String.join(", ", spotColors);
                
                issues.add(
                    PdfIssue.builder()
                        .type("Spot Colors")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message(String.format("Document contains %d spot color(s): %s", 
                                spotColors.size(), colorsList))
                        .autoFixable(false)
                        .fixDescription("Verify spot colors are intended for print")
                        .build()
                );
            }
        } catch (Exception e) {
            log.error("Error checking spot colors: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Spot Colors Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze spot colors: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkImageCompression(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking image compression");
        
        try {
            Map<Integer, List<ImageCompressionInfo>> compressionInfoByPage = analyzeImageCompression(pdfDoc);
            
            for (Map.Entry<Integer, List<ImageCompressionInfo>> entry : compressionInfoByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<ImageCompressionInfo> compressionInfos = entry.getValue();
                
                for (ImageCompressionInfo info : compressionInfos) {
                    if (info.getSizeBytes() > 1024 * 1024) { // 1MB
                        issues.add(
                            PdfIssue.builder()
                                .type("Large Uncompressed Image")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message(String.format("Page %d contains a large image (%.1f MB) that could be better compressed",
                                        pageNumber, info.getSizeBytes() / (1024.0 * 1024.0)))
                                .page(pageNumber)
                                .autoFixable(true)
                                .fixDescription("Optimize image compression")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(info.getX())
                                    .y(info.getY())
                                    .width(info.getWidth())
                                    .height(info.getHeight())
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image compression: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Image Compression Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze image compression: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkTrimSafeZones(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking trim and safe zones");
        
        try {
            // Safe zone is typically 5mm inside the trim box
            float safeZoneInset = 5.0f / 0.352778f; // Convert 5mm to points
            
            Map<Integer, List<ContentOutsideSafeZoneInfo>> contentOutsideSafeZone = detectContentOutsideSafeZone(pdfDoc, safeZoneInset);
            
            for (Map.Entry<Integer, List<ContentOutsideSafeZoneInfo>> entry : contentOutsideSafeZone.entrySet()) {
                int pageNumber = entry.getKey();
                List<ContentOutsideSafeZoneInfo> infoList = entry.getValue();
                
                if (!infoList.isEmpty()) {
                    for (ContentOutsideSafeZoneInfo info : infoList) {
                        issues.add(
                            PdfIssue.builder()
                                .type("Content Outside Safe Zone")
                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                .message(String.format("Page %d has %s too close to trim edge (inside 5mm safe zone)",
                                        pageNumber, info.getContentType()))
                                .page(pageNumber)
                                .autoFixable(false)
                                .fixDescription("Move content at least 5mm from trim edge")
                                .location(PdfIssue.IssueLocation.builder()
                                    .x(info.getX())
                                    .y(info.getY())
                                    .width(info.getWidth())
                                    .height(info.getHeight())
                                    .build())
                                .build()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking trim and safe zones: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Trim/Safe Zone Check Error")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Could not analyze trim and safe zones: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkIccProfiles(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking ICC profiles");
        
        try {
            Map<Integer, List<IccProfileInfo>> iccProfilesByPage = extractIccProfiles(pdfDoc);
            
            for (Map.Entry<Integer, List<IccProfileInfo>> entry : iccProfilesByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<IccProfileInfo> profiles = entry.getValue();
                
                for (IccProfileInfo profile : profiles) {
                    issues.add(
                        PdfIssue.builder()
                            .type("ICC Profile")
                            .severity(PdfIssue.IssueSeverity.LOW)
                            .message(String.format("Page %d uses ICC profile '%s'",
                                    pageNumber, profile.getProfileName()))
                            .page(pageNumber)
                            .autoFixable(false)
                            .fixDescription("Verify ICC profile is appropriate for print")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking ICC profiles: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("ICC Profile Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze ICC profiles: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkPageGeometry(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking page geometry");
        
        try {
            // Check if all pages have the same size and orientation
            boolean hasInconsistentSizes = false;
            Rectangle firstPageSize = null;
            
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle pageSize = page.getPageSize();
                
                if (firstPageSize == null) {
                    firstPageSize = pageSize;
                } else if (!isSameSize(firstPageSize, pageSize)) {
                    hasInconsistentSizes = true;
                    break;
                }
            }
            
            if (hasInconsistentSizes) {
                issues.add(
                    PdfIssue.builder()
                        .type("Inconsistent Page Sizes")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document contains pages with different sizes or orientations")
                        .autoFixable(false)
                        .fixDescription("Standardize page sizes throughout document")
                        .build()
                );
            }
            
            // Check for unusual page sizes
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                Rectangle pageSize = page.getPageSize();
                
                if (isUnusualSize(pageSize)) {
                    issues.add(
                        PdfIssue.builder()
                            .type("Non-Standard Page Size")
                            .severity(PdfIssue.IssueSeverity.LOW)
                            .message(String.format("Page %d has non-standard size: %.2f x %.2f points",
                                    i, pageSize.getWidth(), pageSize.getHeight()))
                            .page(i)
                            .autoFixable(false)
                            .fixDescription("Verify page size is appropriate for intended output")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking page geometry: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Page Geometry Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze page geometry: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkAnnotationsAndForms(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking annotations and forms");
        
        try {
            Map<Integer, List<AnnotationInfo>> annotationsByPage = extractAnnotations(pdfDoc);
            boolean hasAcroForm = pdfDoc.getCatalog().getPdfObject().containsKey(PdfName.AcroForm);
            
            if (hasAcroForm) {
                issues.add(
                    PdfIssue.builder()
                        .type("Interactive Form")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Document contains interactive form elements which may not be preserved in print")
                        .autoFixable(true)
                        .fixDescription("Flatten form fields")
                        .build()
                );
            }
            
            for (Map.Entry<Integer, List<AnnotationInfo>> entry : annotationsByPage.entrySet()) {
                int pageNumber = entry.getKey();
                List<AnnotationInfo> annotations = entry.getValue();
                
                if (!annotations.isEmpty()) {
                    issues.add(
                        PdfIssue.builder()
                            .type("Annotations")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message(String.format("Page %d contains %d annotation(s) which may not be preserved in print",
                                    pageNumber, annotations.size()))
                            .page(pageNumber)
                            .autoFixable(true)
                            .fixDescription("Flatten annotations")
                            .build()
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error checking annotations and forms: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Annotations Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze annotations and forms: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkMetadata(PdfDocument pdfDoc, List<PdfIssue> issues) {
        log.info("Checking metadata");
        
        try {
            // Check for potentially sensitive metadata
            PdfDocumentInfo docInfo = pdfDoc.getDocumentInfo();
            
            if (docInfo.getAuthor() != null && !docInfo.getAuthor().isEmpty()) {
                issues.add(
                    PdfIssue.builder()
                        .type("Author Metadata")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message("Document contains author information in metadata: " + docInfo.getAuthor())
                        .autoFixable(true)
                        .fixDescription("Remove author metadata")
                        .build()
                );
            }
            
            if (docInfo.getCreator() != null && !docInfo.getCreator().isEmpty()) {
                issues.add(
                    PdfIssue.builder()
                        .type("Creator Metadata")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message("Document contains creator information in metadata: " + docInfo.getCreator())
                        .autoFixable(true)
                        .fixDescription("Remove creator metadata")
                        .build()
                );
            }
            
            // Check for XMP metadata
            if (pdfDoc.getXmpMetadata() != null) {
                issues.add(
                    PdfIssue.builder()
                        .type("XMP Metadata")
                        .severity(PdfIssue.IssueSeverity.LOW)
                        .message("Document contains XMP metadata which may include sensitive information")
                        .autoFixable(true)
                        .fixDescription("Review and potentially remove XMP metadata")
                        .build()
                );
            }
        } catch (Exception e) {
            log.error("Error checking metadata: {}", e.getMessage(), e);
            issues.add(
                PdfIssue.builder()
                    .type("Metadata Check Error")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message("Could not analyze metadata: " + e.getMessage())
                    .autoFixable(false)
                    .build()
            );
        }
    }
    
    private void checkFileSize(long fileSize, List<PdfIssue> issues) {
        log.info("Checking file size");
        
        if (fileSize > MAX_RECOMMENDED_FILE_SIZE) {
            issues.add(
                PdfIssue.builder()
                    .type("Large File Size")
                    .severity(PdfIssue.IssueSeverity.LOW)
                    .message(String.format("File size exceeds %d MB (%.1f MB) which may cause issues with some printing workflows",
                            MAX_RECOMMENDED_FILE_SIZE / (1024 * 1024), fileSize / (1024.0 * 1024.0)))
                    .autoFixable(false)
                    .fixDescription("Optimize PDF to reduce file size")
                    .build()
            );
        }
    }
    
    // Helper methods for analyzing PDFs
    
    private Map<Integer, List<PdfImageInfo>> extractImageInfo(PdfDocument pdfDoc) {
        // In a real implementation, this would analyze images in the PDF
        // For demo purposes, we'll return a mock result
        Map<Integer, List<PdfImageInfo>> result = new HashMap<>();
        
        List<PdfImageInfo> page1Images = new ArrayList<>();
        page1Images.add(new PdfImageInfo(100, 500, 300, 200, 150));
        page1Images.add(new PdfImageInfo(400, 400, 200, 150, 350));
        result.put(1, page1Images);
        
        return result;
    }
    
    private Map<Integer, List<ColorSpaceInfo>> extractColorSpaces(PdfDocument pdfDoc) {
        // In a real implementation, this would analyze color spaces in the PDF
        Map<Integer, List<ColorSpaceInfo>> result = new HashMap<>();
        
        List<ColorSpaceInfo> page1ColorSpaces = new ArrayList<>();
        page1ColorSpaces.add(new ColorSpaceInfo(ColorSpaceType.RGB));
        page1ColorSpaces.add(new ColorSpaceInfo(ColorSpaceType.CMYK));
        result.put(1, page1ColorSpaces);
        
        List<ColorSpaceInfo> page2ColorSpaces = new ArrayList<>();
        page2ColorSpaces.add(new ColorSpaceInfo(ColorSpaceType.CMYK));
        page2ColorSpaces.add(new ColorSpaceInfo(ColorSpaceType.SPOT));
        result.put(2, page2ColorSpaces);
        
        return result;
    }
    
    private Map<Integer, List<FontInfo>> extractFontInfo(PdfDocument pdfDoc) {
        // In a real implementation, this would analyze fonts in the PDF
        Map<Integer, List<FontInfo>> result = new HashMap<>();
        
        List<FontInfo> page1Fonts = new ArrayList<>();
        page1Fonts.add(new FontInfo("Helvetica", true));
        page1Fonts.add(new FontInfo("Arial", false));
        result.put(1, page1Fonts);
        
        return result;
    }
    
    private Map<Integer, Boolean> detectTransparency(PdfDocument pdfDoc) {
        // In a real implementation, this would detect transparency in the PDF
        Map<Integer, Boolean> result = new HashMap<>();
        result.put(1, false);
        result.put(2, true);
        return result;
    }
    
    private Map<Integer, List<InkDensityInfo>> calculateInkDensity(PdfDocument pdfDoc) {
        // In a real implementation, this would calculate ink density in the PDF
        Map<Integer, List<InkDensityInfo>> result = new HashMap<>();
        
        List<InkDensityInfo> page1InkDensity = new ArrayList<>();
        page1InkDensity.add(new InkDensityInfo(200, 300, 100, 50, 280));
        result.put(1, page1InkDensity);
        
        List<InkDensityInfo> page2InkDensity = new ArrayList<>();
        page2InkDensity.add(new InkDensityInfo(150, 250, 120, 80, 320));
        result.put(2, page2InkDensity);
        
        return result;
    }
    
    private boolean isPdfXCompliant(PdfDocument pdfDoc) {
        // In a real implementation, this would check PDF/X compliance
        return false;
    }
    
    private Map<Integer, List<TextInfo>> extractTextInfo(PdfDocument pdfDoc) {
        // In a real implementation, this would extract text info from the PDF
        Map<Integer, List<TextInfo>> result = new HashMap<>();
        
        List<TextInfo> page1TextInfo = new ArrayList<>();
        page1TextInfo.add(new TextInfo(100, 500, 200, 20, 12));
        page1TextInfo.add(new TextInfo(300, 400, 150, 15, 5));
        result.put(1, page1TextInfo);
        
        return result;
    }
    
    private Map<Integer, List<LineInfo>> extractLineInfo(PdfDocument pdfDoc) {
        // In a real implementation, this would extract line info from the PDF
        Map<Integer, List<LineInfo>> result = new HashMap<>();
        
        List<LineInfo> page1LineInfo = new ArrayList<>();
        page1LineInfo.add(new LineInfo(100, 500, 300, 500, 0.5f));
        page1LineInfo.add(new LineInfo(200, 400, 200, 600, 0.1f));
        result.put(1, page1LineInfo);
        
        return result;
    }
    
    private Map<Integer, List<OverprintInfo>> detectOverprint(PdfDocument pdfDoc) {
        // In a real implementation, this would detect overprint settings
        Map<Integer, List<OverprintInfo>> result = new HashMap<>();
        
        List<OverprintInfo> page1Overprint = new ArrayList<>();
        page1Overprint.add(new OverprintInfo(true));
        result.put(1, page1Overprint);
        
        return result;
    }
    
    private List<String> extractSpotColors(PdfDocument pdfDoc) {
        // In a real implementation, this would extract spot colors
        List<String> spotColors = new ArrayList<>();
        spotColors.add("PANTONE 185 C");
        return spotColors;
    }
    
    private Map<Integer, List<ImageCompressionInfo>> analyzeImageCompression(PdfDocument pdfDoc) {
        // In a real implementation, this would analyze image compression
        Map<Integer, List<ImageCompressionInfo>> result = new HashMap<>();
        
        List<ImageCompressionInfo> page1Compression = new ArrayList<>();
        page1Compression.add(new ImageCompressionInfo(100, 500, 300, 200, 1500000));
        result.put(1, page1Compression);
        
        return result;
    }
    
    private Map<Integer, List<ContentOutsideSafeZoneInfo>> detectContentOutsideSafeZone(PdfDocument pdfDoc, float safeZoneInset) {
        // In a real implementation, this would detect content outside safe zones
        Map<Integer, List<ContentOutsideSafeZoneInfo>> result = new HashMap<>();
        
        List<ContentOutsideSafeZoneInfo> page1ContentOutside = new ArrayList<>();
        page1ContentOutside.add(new ContentOutsideSafeZoneInfo("text", 50, 50, 100, 20));
        result.put(1, page1ContentOutside);
        
        return result;
    }
    
    private Map<Integer, List<IccProfileInfo>> extractIccProfiles(PdfDocument pdfDoc) {
        // In a real implementation, this would extract ICC profiles
        Map<Integer, List<IccProfileInfo>> result = new HashMap<>();
        
        List<IccProfileInfo> page1IccProfiles = new ArrayList<>();
        page1IccProfiles.add(new IccProfileInfo("sRGB IEC61966-2.1"));
        result.put(1, page1IccProfiles);
        
        return result;
    }
    
    private Map<Integer, List<AnnotationInfo>> extractAnnotations(PdfDocument pdfDoc) {
        // In a real implementation, this would extract annotations
        Map<Integer, List<AnnotationInfo>> result = new HashMap<>();
        
        List<AnnotationInfo> page1Annotations = new ArrayList<>();
        page1Annotations.add(new AnnotationInfo("Comment", 100, 500, 20, 20));
        result.put(1, page1Annotations);
        
        return result;
    }
    
    private boolean isSameSize(Rectangle rect1, Rectangle rect2) {
        float tolerance = 1.0f; // 1 point tolerance
        return Math.abs(rect1.getWidth() - rect2.getWidth()) < tolerance &&
               Math.abs(rect1.getHeight() - rect2.getHeight()) < tolerance;
    }
    
    private boolean isUnusualSize(Rectangle pageSize) {
        // Check if page size matches common sizes (A4, Letter, etc.)
        // This is a simplified check
        float width = pageSize.getWidth();
        float height = pageSize.getHeight();
        
        // Check for A4 (595 x 842 points)
        if ((Math.abs(width - 595) < 2 && Math.abs(height - 842) < 2) ||
            (Math.abs(height - 595) < 2 && Math.abs(width - 842) < 2)) {
            return false;
        }
        
        // Check for US Letter (612 x 792 points)
        if ((Math.abs(width - 612) < 2 && Math.abs(height - 792) < 2) ||
            (Math.abs(height - 612) < 2 && Math.abs(width - 792) < 2)) {
            return false;
        }
        
        return true;
    }
    
    private int calculateQualityScore(List<PdfIssue> issues) {
        // Calculate quality score based on issues
        // Start with 100 and subtract based on severity
        int score = 100;
        
        for (PdfIssue issue : issues) {
            switch (issue.getSeverity()) {
                case HIGH:
                    score -= 10;
                    break;
                case MEDIUM:
                    score -= 5;
                    break;
                case LOW:
                    score -= 2;
                    break;
            }
        }
        
        return Math.max(0, score);
    }
    
    // Helper classes for PDF analysis results
    
    private static class PdfImageInfo {
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        private final float dpi;
        
        public PdfImageInfo(float x, float y, float width, float height, float dpi) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.dpi = dpi;
        }
        
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
        public float getDpi() { return dpi; }
    }
    
    private enum ColorSpaceType {
        RGB,
        CMYK,
        GRAYSCALE,
        SPOT
    }
    
    private static class ColorSpaceInfo {
        private final ColorSpaceType type;
        
        public ColorSpaceInfo(ColorSpaceType type) {
            this.type = type;
        }
        
        public ColorSpaceType getType() { return type; }
    }
    
    private static class FontInfo {
        private final String name;
        private final boolean embedded;
        
        public FontInfo(String name, boolean embedded) {
            this.name = name;
            this.embedded = embedded;
        }
        
        public String getName() { return name; }
        public boolean isEmbedded() { return embedded; }
    }
    
    private static class InkDensityInfo {
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        private final float density;
        
        public InkDensityInfo(float x, float y, float width, float height, float density) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.density = density;
        }
        
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
        public float getDensity() { return density; }
    }
    
    private static class TextInfo {
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        private final float fontSize;
        
        public TextInfo(float x, float y, float width, float height, float fontSize) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.fontSize = fontSize;
        }
        
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
        public float getFontSize() { return fontSize; }
    }
    
    private static class LineInfo {
        private final float x1;
        private final float y1;
        private final float x2;
        private final float y2;
        private final float lineWidth;
        
        public LineInfo(float x1, float y1, float x2, float y2, float lineWidth) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
            this.lineWidth = lineWidth;
        }
        
        public float getX1() { return x1; }
        public float getY1() { return y1; }
        public float getX2() { return x2; }
        public float getY2() { return y2; }
        public float getLineWidth() { return lineWidth; }
    }
    
    private static class OverprintInfo {
        private final boolean inconsistentSettings;
        
        public OverprintInfo(boolean inconsistentSettings) {
            this.inconsistentSettings = inconsistentSettings;
        }
        
        public boolean hasInconsistentSettings() { return inconsistentSettings; }
    }
    
    private static class ImageCompressionInfo {
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        private final long sizeBytes;
        
        public ImageCompressionInfo(float x, float y, float width, float height, long sizeBytes) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.sizeBytes = sizeBytes;
        }
        
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
        public long getSizeBytes() { return sizeBytes; }
    }
    
    private static class ContentOutsideSafeZoneInfo {
        private final String contentType;
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        
        public ContentOutsideSafeZoneInfo(String contentType, float x, float y, float width, float height) {
            this.contentType = contentType;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        
        public String getContentType() { return contentType; }
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
    }
    
    private static class IccProfileInfo {
        private final String profileName;
        
        public IccProfileInfo(String profileName) {
            this.profileName = profileName;
        }
        
        public String getProfileName() { return profileName; }
    }
    
    private static class AnnotationInfo {
        private final String annotationType;
        private final float x;
        private final float y;
        private final float width;
        private final float height;
        
        public AnnotationInfo(String annotationType, float x, float y, float width, float height) {
            this.annotationType = annotationType;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        
        public String getAnnotationType() { return annotationType; }
        public float getX() { return x; }
        public float getY() { return y; }
        public float getWidth() { return width; }
        public float getHeight() { return height; }
    }
}
