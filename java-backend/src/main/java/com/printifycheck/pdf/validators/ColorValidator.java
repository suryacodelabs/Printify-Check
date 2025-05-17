
package com.printifycheck.pdf.validators;

import com.itextpdf.kernel.colors.DeviceCmyk;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.*;
import com.printifycheck.model.PdfIssue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class ColorValidator {

    public List<PdfIssue> validateColors(String pdfPath) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try (PdfReader reader = new PdfReader(pdfPath);
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            
            // Check RGB in CMYK workflow
            List<PdfIssue> rgbIssues = checkRgbInCmyk(pdfDoc);
            issues.addAll(rgbIssues);
            
            // Check spot colors
            List<PdfIssue> spotColorIssues = checkSpotColors(pdfDoc);
            issues.addAll(spotColorIssues);
            
            // Check ICC profiles
            List<PdfIssue> iccProfileIssues = checkIccProfiles(pdfDoc);
            issues.addAll(iccProfileIssues);
            
            // Check overprint settings
            List<PdfIssue> overprintIssues = checkOverprint(pdfDoc);
            issues.addAll(overprintIssues);
            
            // Check ink density
            List<PdfIssue> inkDensityIssues = checkInkDensity(pdfDoc);
            issues.addAll(inkDensityIssues);
            
            // Check color space mismatches
            List<PdfIssue> colorSpaceMismatchIssues = checkColorSpaceMismatches(pdfDoc);
            issues.addAll(colorSpaceMismatchIssues);
            
            // Check transparency
            List<PdfIssue> transparencyIssues = checkTransparency(pdfDoc);
            issues.addAll(transparencyIssues);
            
            // Check layer misuse
            List<PdfIssue> layerMisuseIssues = checkLayerMisuse(pdfDoc);
            issues.addAll(layerMisuseIssues);
            
        } catch (IOException e) {
            log.error("Error validating PDF colors: {}", e.getMessage(), e);
            issues.add(PdfIssue.builder()
                .type("Color Validation")
                .severity(PdfIssue.IssueSeverity.HIGH)
                .message("Error analyzing colors: " + e.getMessage())
                .autoFixable(false)
                .build());
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkRgbInCmyk(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            boolean hasCmykIntent = false;
            boolean hasRgbColors = false;
            
            // Check for output intent
            PdfArray outputIntents = pdfDoc.getCatalog().getPdfObject().getAsArray(PdfName.OutputIntents);
            if (outputIntents != null) {
                for (int i = 0; i < outputIntents.size(); i++) {
                    PdfDictionary intent = outputIntents.getAsDictionary(i);
                    if (intent != null) {
                        PdfName outputConditionIdentifier = intent.getAsName(new PdfName("OutputConditionIdentifier"));
                        if (outputConditionIdentifier != null && 
                            (outputConditionIdentifier.toString().contains("CMYK") || 
                             outputConditionIdentifier.toString().contains("FOGRA"))) {
                            hasCmykIntent = true;
                            break;
                        }
                    }
                }
            }
            
            // Only check for RGB colors if there's a CMYK intent
            if (hasCmykIntent) {
                // Check for RGB color spaces
                for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                    PdfPage page = pdfDoc.getPage(i);
                    PdfDictionary resources = page.getResources();
                    
                    if (resources != null) {
                        PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                        if (colorSpaces != null) {
                            for (PdfName key : colorSpaces.keySet()) {
                                PdfObject cs = colorSpaces.get(key);
                                if (cs.isArray()) {
                                    PdfArray csArray = (PdfArray) cs;
                                    if (csArray.size() > 0) {
                                        PdfName csName = csArray.getAsName(0);
                                        if (PdfName.DeviceRGB.equals(csName) || 
                                            PdfName.CalRGB.equals(csName) ||
                                            PdfName.Lab.equals(csName)) {
                                            
                                            hasRgbColors = true;
                                            
                                            issues.add(PdfIssue.builder()
                                                .type("RGB in CMYK")
                                                .severity(PdfIssue.IssueSeverity.HIGH)
                                                .message("RGB color space found on page " + i + 
                                                         " but document has CMYK output intent")
                                                .page(i)
                                                .autoFixable(true)
                                                .fixDescription("Convert RGB to CMYK")
                                                .build());
                                            
                                            // Break after first issue to avoid multiple similar issues
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Also check for RGB in XObjects
                        PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                        if (xObjects != null) {
                            for (PdfName key : xObjects.keySet()) {
                                PdfStream xObject = xObjects.getAsStream(key);
                                if (xObject != null) {
                                    PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                    PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                    if (PdfName.Image.equals(subtype)) {
                                        PdfName colorSpace = xObjectDict.getAsName(PdfName.ColorSpace);
                                        if (PdfName.DeviceRGB.equals(colorSpace)) {
                                            hasRgbColors = true;
                                            
                                            issues.add(PdfIssue.builder()
                                                .type("RGB Images in CMYK")
                                                .severity(PdfIssue.IssueSeverity.HIGH)
                                                .message("RGB image found on page " + i + 
                                                         " but document has CMYK output intent")
                                                .page(i)
                                                .autoFixable(true)
                                                .fixDescription("Convert image to CMYK")
                                                .build());
                                            
                                            // Break after first issue to avoid multiple similar issues
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // If we already found issues, no need to continue checking more pages
                    if (hasRgbColors) {
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking RGB in CMYK", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkSpotColors(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                    if (colorSpaces != null) {
                        for (PdfName key : colorSpaces.keySet()) {
                            PdfObject cs = colorSpaces.get(key);
                            if (cs.isArray()) {
                                PdfArray csArray = (PdfArray) cs;
                                if (csArray.size() > 0) {
                                    PdfName csName = csArray.getAsName(0);
                                    if (PdfName.Separation.equals(csName) || PdfName.DeviceN.equals(csName)) {
                                        
                                        // For Separation, the spot color name is in position 1
                                        String colorName = "Unknown";
                                        if (PdfName.Separation.equals(csName) && csArray.size() > 1) {
                                            PdfObject nameObj = csArray.get(1);
                                            if (nameObj.isName()) {
                                                colorName = ((PdfName)nameObj).getValue();
                                            }
                                        }
                                        
                                        issues.add(PdfIssue.builder()
                                            .type("Spot Colors")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Spot color '" + colorName + "' found on page " + i + 
                                                     ". Verify that spot colors are intended for printing")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Convert spot colors to process colors if not needed")
                                            .build());
                                        
                                        // Break after first issue to avoid multiple similar issues
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking spot colors", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkIccProfiles(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for missing output intent
            PdfArray outputIntents = pdfDoc.getCatalog().getPdfObject().getAsArray(PdfName.OutputIntents);
            if (outputIntents == null || outputIntents.isEmpty()) {
                issues.add(PdfIssue.builder()
                    .type("ICC Profiles")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Document does not have an output intent ICC profile")
                    .autoFixable(true)
                    .fixDescription("Add appropriate output intent ICC profile (e.g., FOGRA39)")
                    .build());
            } else {
                // Check if ICC profiles are embedded
                boolean hasIccProfile = false;
                
                for (int i = 0; i < outputIntents.size(); i++) {
                    PdfDictionary intent = outputIntents.getAsDictionary(i);
                    if (intent != null) {
                        PdfStream destProfile = intent.getAsStream(PdfName.DestOutputProfile);
                        if (destProfile != null) {
                            hasIccProfile = true;
                            break;
                        }
                    }
                }
                
                if (!hasIccProfile) {
                    issues.add(PdfIssue.builder()
                        .type("ICC Profiles")
                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                        .message("Output intent does not have an embedded ICC profile")
                        .autoFixable(true)
                        .fixDescription("Embed ICC profile in output intent")
                        .build());
                }
            }
        } catch (Exception e) {
            log.error("Error checking ICC profiles", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkOverprint(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
                    if (extGState != null) {
                        for (PdfName key : extGState.keySet()) {
                            PdfDictionary gs = extGState.getAsDictionary(key);
                            if (gs != null) {
                                // Check for overprint mode
                                if (gs.containsKey(PdfName.OPM)) {
                                    PdfNumber opm = gs.getAsNumber(PdfName.OPM);
                                    if (opm != null && opm.intValue() == 1) {
                                        issues.add(PdfIssue.builder()
                                            .type("Overprint")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Overprint mode 1 found on page " + i + 
                                                     ". Verify overprint settings for printing")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Adjust overprint settings")
                                            .build());
                                        
                                        // Break after first issue to avoid multiple similar issues
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking overprint", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkInkDensity(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        // This is a complex check that would require color analysis
        // A simplified implementation is provided here
        
        try {
            // In a real implementation, we would analyze colors in content streams
            // For now, we'll just add a generic issue suggesting to check ink density
            
            issues.add(PdfIssue.builder()
                .type("Ink Density")
                .severity(PdfIssue.IssueSeverity.MEDIUM)
                .message("Check document for areas with total ink density exceeding 300%")
                .autoFixable(true)
                .fixDescription("Reduce ink density in areas exceeding 300% TAC")
                .build());
            
        } catch (Exception e) {
            log.error("Error checking ink density", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkColorSpaceMismatches(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for mixed color spaces on the same page
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary colorSpaces = resources.getAsDictionary(PdfName.ColorSpace);
                    
                    boolean hasRgb = false;
                    boolean hasCmyk = false;
                    boolean hasGray = false;
                    
                    if (colorSpaces != null) {
                        for (PdfName key : colorSpaces.keySet()) {
                            PdfObject cs = colorSpaces.get(key);
                            if (cs.isArray()) {
                                PdfArray csArray = (PdfArray) cs;
                                if (csArray.size() > 0) {
                                    PdfName csName = csArray.getAsName(0);
                                    
                                    if (PdfName.DeviceRGB.equals(csName) || 
                                        PdfName.CalRGB.equals(csName) ||
                                        PdfName.Lab.equals(csName)) {
                                        hasRgb = true;
                                    } else if (PdfName.DeviceCMYK.equals(csName)) {
                                        hasCmyk = true;
                                    } else if (PdfName.DeviceGray.equals(csName) || 
                                              PdfName.CalGray.equals(csName)) {
                                        hasGray = true;
                                    }
                                }
                            } else if (cs.isName()) {
                                PdfName csName = (PdfName) cs;
                                
                                if (PdfName.DeviceRGB.equals(csName)) {
                                    hasRgb = true;
                                } else if (PdfName.DeviceCMYK.equals(csName)) {
                                    hasCmyk = true;
                                } else if (PdfName.DeviceGray.equals(csName)) {
                                    hasGray = true;
                                }
                            }
                        }
                    }
                    
                    // Also check for color spaces in XObjects
                    PdfDictionary xObjects = resources.getAsDictionary(PdfName.XObject);
                    if (xObjects != null) {
                        for (PdfName key : xObjects.keySet()) {
                            PdfStream xObject = xObjects.getAsStream(key);
                            if (xObject != null) {
                                PdfDictionary xObjectDict = new PdfDictionary(xObject);
                                PdfName subtype = xObjectDict.getAsName(PdfName.Subtype);
                                if (PdfName.Image.equals(subtype)) {
                                    PdfName colorSpace = xObjectDict.getAsName(PdfName.ColorSpace);
                                    
                                    if (PdfName.DeviceRGB.equals(colorSpace)) {
                                        hasRgb = true;
                                    } else if (PdfName.DeviceCMYK.equals(colorSpace)) {
                                        hasCmyk = true;
                                    } else if (PdfName.DeviceGray.equals(colorSpace)) {
                                        hasGray = true;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Check for mixed color spaces
                    if ((hasRgb && hasCmyk) || (hasRgb && hasGray && hasCmyk)) {
                        issues.add(PdfIssue.builder()
                            .type("Color Space Mismatches")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Mixed color spaces found on page " + i + 
                                     ". This may cause color inconsistencies when printed")
                            .page(i)
                            .autoFixable(true)
                            .fixDescription("Normalize all colors to a single color space (preferably CMYK)")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking color space mismatches", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkTransparency(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            for (int i = 1; i <= pdfDoc.getNumberOfPages(); i++) {
                PdfPage page = pdfDoc.getPage(i);
                PdfDictionary resources = page.getResources();
                
                if (resources != null) {
                    PdfDictionary extGState = resources.getAsDictionary(PdfName.ExtGState);
                    if (extGState != null) {
                        for (PdfName key : extGState.keySet()) {
                            PdfDictionary gs = extGState.getAsDictionary(key);
                            if (gs != null) {
                                // Check for transparency (soft mask or opacity not 1)
                                if (gs.containsKey(PdfName.SMask) && !PdfName.None.equals(gs.get(PdfName.SMask))) {
                                    issues.add(PdfIssue.builder()
                                        .type("Transparency")
                                        .severity(PdfIssue.IssueSeverity.MEDIUM)
                                        .message("Transparency found on page " + i + 
                                                 ". This may cause issues with some print workflows")
                                        .page(i)
                                        .autoFixable(true)
                                        .fixDescription("Flatten transparency")
                                        .build());
                                    
                                    // Break after first issue to avoid multiple similar issues
                                    break;
                                } else if (gs.containsKey(PdfName.CA)) {
                                    PdfNumber opacity = gs.getAsNumber(PdfName.CA);
                                    if (opacity != null && opacity.floatValue() < 1.0) {
                                        issues.add(PdfIssue.builder()
                                            .type("Transparency")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Transparency (opacity < 1) found on page " + i + 
                                                     ". This may cause issues with some print workflows")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Flatten transparency")
                                            .build());
                                        
                                        // Break after first issue to avoid multiple similar issues
                                        break;
                                    }
                                } else if (gs.containsKey(PdfName.ca)) {
                                    PdfNumber opacity = gs.getAsNumber(PdfName.ca);
                                    if (opacity != null && opacity.floatValue() < 1.0) {
                                        issues.add(PdfIssue.builder()
                                            .type("Transparency")
                                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                                            .message("Fill transparency (opacity < 1) found on page " + i + 
                                                     ". This may cause issues with some print workflows")
                                            .page(i)
                                            .autoFixable(true)
                                            .fixDescription("Flatten transparency")
                                            .build());
                                        
                                        // Break after first issue to avoid multiple similar issues
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking transparency", e);
        }
        
        return issues;
    }
    
    private List<PdfIssue> checkLayerMisuse(PdfDocument pdfDoc) {
        List<PdfIssue> issues = new ArrayList<>();
        
        try {
            // Check for Optional Content Groups (Layers)
            PdfDictionary catalog = pdfDoc.getCatalog().getPdfObject();
            if (catalog.containsKey(PdfName.OCProperties)) {
                PdfDictionary ocProperties = catalog.getAsDictionary(PdfName.OCProperties);
                if (ocProperties != null) {
                    PdfArray ocgs = ocProperties.getAsArray(PdfName.OCGs);
                    if (ocgs != null && !ocgs.isEmpty()) {
                        issues.add(PdfIssue.builder()
                            .type("Layer Misuse")
                            .severity(PdfIssue.IssueSeverity.MEDIUM)
                            .message("Document contains layers (" + ocgs.size() + " layers found). " + 
                                     "Ensure all relevant content is visible and printable")
                            .autoFixable(true)
                            .fixDescription("Flatten layers or ensure all needed layers are visible")
                            .build());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error checking layer misuse", e);
        }
        
        return issues;
    }
}
