
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
public class ImageValidator {

    private static final int MIN_DPI = 300;
    private static final int MIN_HIGH_QUALITY_DPI = 600;

    public List<PdfIssue> validateImages(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check image resolution
            List<PdfIssue> resolutionIssues = checkResolution(pdfDoc);
            issues.addAll(resolutionIssues);
            
            // Check for JPEG2000/PNG artifacts
            List<PdfIssue> artifactIssues = checkArtifacts(pdfDoc);
            issues.addAll(artifactIssues);
            
            // Check image compression
            List<PdfIssue> compressionIssues = checkCompression(pdfDoc);
            issues.addAll(compressionIssues);
            
            // Check for resolution mismatches
            List<PdfIssue> mismatchIssues = checkResolutionMismatches(pdfDoc);
            issues.addAll(mismatchIssues);
            
            // Check image transparency
            List<PdfIssue> transparencyIssues = checkImageTransparency(pdfDoc);
            issues.addAll(transparencyIssues);
            
            // Check CCITT Group 4 images
            List<PdfIssue> ccittIssues = checkCcittImages(pdfDoc);
            issues.addAll(ccittIssues);
            
            // Check image size
            List<PdfIssue> sizeIssues = checkImageSize(pdfDoc);
            issues.addAll(sizeIssues);
            
            // Check color depth
            List<PdfIssue> colorDepthIssues = checkColorDepth(pdfDoc);
            issues.addAll(colorDepthIssues);
            
        } catch (IOException e) {
            log.error("Error validating PDF images: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Image Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing images: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkResolution(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Get image dimensions
                                    PdfNumber width = xObjectDict.getAsNumber(PdfName.Width);
                                    PdfNumber height = xObjectDict.getAsNumber(PdfName.Height);
                                    
                                    // Skip if missing dimensions
                                    if (width == null || height == null) continue;
                                    
                                    // Calculate DPI based on dimensions and intended display size
                                    // This is an approximation - real implementation would need transformation matrix
                                    int imageWidth = width.intValue();
                                    int imageHeight = height.intValue();
                                    
                                    // Estimate DPI (assuming image takes up significant page area)
                                    Rectangle pageSize = page.getPageSize();
                                    double pageDiagonal = Math.sqrt(pageSize.getWidth() * pageSize.getWidth() + 
                                                                   pageSize.getHeight() * pageSize.getHeight());
                                    double imageDiagonal = Math.sqrt(imageWidth * imageWidth + 
                                                                    imageHeight * imageHeight);
                                    
                                    // If image is very small compared to page, it might be a logo or small graphic
                                    if (imageDiagonal / pageDiagonal < 0.1) continue;
                                    
                                    // Estimate DPI based on 8.5x11 inch standard page
                                    int estimatedDpi = (int)(imageWidth / (pageSize.getWidth() / 72));
                                    
                                    if (estimatedDpi < MIN_DPI) {
                                        issues.add(PdfIssue.builder()
                                            .type("Low Resolution")
                                            .severity(PdfIssue.IssueSeverity.HIGH)
                                            .message("Image on page " + i + " has low resolution (approximately " + 
                                                    estimatedDpi + " DPI). Minimum recommended is " + MIN_DPI + " DPI")
                                            .page(i)
                                            .autoFixable(false)
                                            .fixDescription("Replace with higher resolution image")
                                            .build());
                                    } else if (estimatedDpi < MIN_HIGH_QUALITY_DPI) {
                                        issues.add(PdfIssue.builder()
                                            .type("Medium Resolution")
                                            .severity(PdfIssue.IssueSeverity.LOW)
                                            .message("Image on page " + i + " has medium resolution (approximately " + 
                                                    estimatedDpi + " DPI). For high quality, " + 
                                                    MIN_HIGH_QUALITY_DPI + " DPI is recommended")
                                            .page(i)
                                            .autoFixable(false)
                                            .fixDescription("Consider replacing with higher resolution image for premium quality")
                                            .build());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image resolution", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkArtifacts(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Check for JPEG2000 compression (may have artifacts at high compression ratios)
                                    PdfName filter = xObjectDict.getAsName(PdfName.Filter);
                                    if (filter != null && filter.toString().contains("JPXDecode")) {
                                        issues.add(PdfIssue.builder()
                                            .type("JPEG2000 Artifacts")
                                            .severity(PdfIssue.IssueSeverity.LOW)
                                            .message("JPEG2000 compressed image on page " + i + 
                                                     " may have compression artifacts. Verify image quality")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Recompress with higher quality or different compression")
                                            .build());
                                        
                                        // Only report one issue per page
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image artifacts", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkCompression(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Check for uncompressed images
                                    PdfName filter = xObjectDict.getAsName(PdfName.Filter);
                                    if (filter == null) {
                                        issues.add(PdfIssue.builder()
                                            .type("Image Compression")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Uncompressed image found on page " + i + 
                                                     ". This may significantly increase file size")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Apply lossless compression to image")
                                            .build());
                                    }
                                    
                                    // Check for high-quality JPEG when lossless would be better
                                    PdfName colorSpace = xObjectDict.getAsName(PdfName.ColorSpace);
                                    if (filter != null && filter.toString().contains("DCTDecode") && 
                                        PdfName.DeviceGray.equals(colorSpace)) {
                                        issues.add(PdfIssue.builder()
                                            .type("Image Compression")
                                            .severity(PdfIssue.IssueSeverity.LOW)
                                            .message("Grayscale image on page " + i + 
                                                     " using JPEG compression. CCITT or JBIG2 may be more appropriate")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Consider recompressing using lossless compression")
                                            .build());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image compression", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkResolutionMismatches(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        List<Integer> resolutions = new ArrayList<>();
                        
                        // First pass - collect resolutions
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Get image dimensions
                                    PdfNumber width = xObjectDict.getAsNumber(PdfName.Width);
                                    PdfNumber height = xObjectDict.getAsNumber(PdfName.Height);
                                    
                                    // Skip if missing dimensions
                                    if (width == null || height == null) continue;
                                    
                                    // Estimate DPI (similar to resolution check)
                                    Rectangle pageSize = page.getPageSize();
                                    int estimatedDpi = (int)(width.intValue() / (pageSize.getWidth() / 72));
                                    
                                    // Only consider significant images
                                    if (width.intValue() >= 100 && height.intValue() >= 100) {
                                        resolutions.add(estimatedDpi);
                                    }
                                }
                            }
                        }
                        
                        // Check for mismatches if we have multiple images
                        if (resolutions.size() > 1) {
                            int minRes = Integer.MAX_VALUE;
                            int maxRes = 0;
                            
                            for (int res : resolutions) {
                                minRes = Math.min(minRes, res);
                                maxRes = Math.max(maxRes, res);
                            }
                            
                            // If big difference in resolution
                            if (maxRes > minRes * 2) {
                                issues.add(PdfIssue.builder()
                                    .type("Resolution Mismatches")
                                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                                    .message("Images with significantly different resolutions found on page " + i + 
                                             " (ranging from " + minRes + " to " + maxRes + " DPI). " +
                                             "This may cause inconsistent print quality")
                                    .page(i)
                                    .autoFixable(false)
                                    .fixDescription("Standardize image resolutions")
                                    .build());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking resolution mismatches", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkImageTransparency(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Check for SMask (alpha transparency)
                                    if (xObjectDict.containsKey(PdfName.SMask) && 
                                        !PdfName.None.equals(xObjectDict.get(PdfName.SMask))) {
                                        
                                        issues.add(PdfIssue.builder()
                                            .type("Image Transparency")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Image with transparency found on page " + i + 
                                                     ". Transparency may cause issues in some print workflows")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Flatten image transparency")
                                            .build());
                                        
                                        // Only report one issue per page
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image transparency", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkCcittImages(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Check for CCITT Group 4 compression
                                    PdfArray filter = xObjectDict.getAsArray(PdfName.Filter);
                                    PdfName singleFilter = xObjectDict.getAsName(PdfName.Filter);
                                    
                                    boolean isCcitt = false;
                                    
                                    if (filter != null) {
                                        for (int j = 0; j < filter.size(); j++) {
                                            PdfName f = filter.getAsName(j);
                                            if (f != null && f.toString().contains("CCITTFaxDecode")) {
                                                isCcitt = true;
                                                break;
                                            }
                                        }
                                    } else if (singleFilter != null && singleFilter.toString().contains("CCITTFaxDecode")) {
                                        isCcitt = true;
                                    }
                                    
                                    if (isCcitt) {
                                        // Check for potential quality issues
                                        PdfDictionary decodeParms = xObjectDict.getAsDictionary(PdfName.DecodeParms);
                                        if (decodeParms != null) {
                                            PdfNumber k = decodeParms.getAsNumber(new PdfName("K"));
                                            if (k != null && k.intValue() != -1) {
                                                issues.add(PdfIssue.builder()
                                                    .type("CCITT Group 4")
                                                    .severity(PdfIssue.IssueSeverity.LOW)
                                                    .message("Image on page " + i + 
                                                             " uses CCITT compression but not Group 4 (K=-1). " +
                                                             "Group 4 is more efficient")
                                                    .page(i)
                                                    .autoFixable(true)
                                                    .fixDescription("Convert to CCITT Group 4 compression")
                                                    .build());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking CCITT images", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkImageSize(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                // Check actual stream size
                                int streamLength = 0;
                                try {
                                    byte[] bytes = xObject.getBytes();
                                    if (bytes != null) {
                                        streamLength = bytes.length;
                                    }
                                } catch (Exception e) {
                                    // If we can't get raw bytes, try using Length
                                    PdfNumber length = xObject.getAsNumber(PdfName.Length);
                                    if (length != null) {
                                        streamLength = length.intValue();
                                    }
                                }
                                
                                // Check for overly large images (>10MB)
                                if (streamLength > 10 * 1024 * 1024) {
                                    issues.add(PdfIssue.builder()
                                        .type("Image Size")
                                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                                        .message("Very large image (" + (streamLength / (1024 * 1024)) + 
                                                 " MB) found on page " + i + 
                                                 ". This may impact performance and increase file size")
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Optimize or resize image")
                                        .build());
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking image size", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkColorDepth(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                
                                if (PdfName.Image.equals(subtype)) {
                                    // Check bits per component
                                    PdfNumber bpc = xObjectDict.getAsNumber(PdfName.BitsPerComponent);
                                    if (bpc != null) {
                                        int bitsPerComponent = bpc.intValue();
                                        
                                        // Check color space
                                        PdfName colorSpace = xObjectDict.getAsName(PdfName.ColorSpace);
                                        
                                        // Check for 1-bit images that should be higher depth
                                        if (bitsPerComponent == 1 && PdfName.DeviceGray.equals(colorSpace)) {
                                            // Check image size to determine if it's possibly a photo
                                            PdfNumber width = xObjectDict.getAsNumber(PdfName.Width);
                                            PdfNumber height = xObjectDict.getAsNumber(PdfName.Height);
                                            
                                            if (width != null && height != null && 
                                                width.intValue() > 300 && height.intValue() > 300) {
                                                
                                                issues.add(PdfIssue.builder()
                                                    .type("Color Depth")
                                                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                                                    .message("Possible photo with 1-bit depth found on page " + i + 
                                                             ". This may result in poor image quality")
                                                    .page(i)
                                                    .autoFixable(false)
                                                    .fixDescription("Replace with higher bit-depth image")
                                                    .build());
                                            }
                                        }
                                        
                                        // Check for low depth in color images
                                        if (bitsPerComponent < 8 && 
                                            (PdfName.DeviceRGB.equals(colorSpace) || PdfName.DeviceCMYK.equals(colorSpace))) {
                                            
                                            issues.add(PdfIssue.builder()
                                                .type("Color Depth")
                                                .severity(PdfIssue.IssueSeverity.MEDIUM)
                                                .message("Low bit-depth (" + bitsPerComponent + 
                                                         "-bit) color image found on page " + i + 
                                                         ". This may result in color banding")
                                                .page(i)
                                                .autoFixable(false)
                                                .fixDescription("Replace with higher bit-depth image")
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
            log.error("Error checking color depth", e);
        }
        
        return issues;
    }
}
