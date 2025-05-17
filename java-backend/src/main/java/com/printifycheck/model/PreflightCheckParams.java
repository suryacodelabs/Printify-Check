
package com.printifycheck.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PreflightCheckParams {
    // Image quality checks
    private int minImageDpi;
    private boolean checkImageResolution;
    
    // Color space checks
    private boolean requireCmyk;
    private boolean checkRgbColors;
    private boolean checkSpotColors;
    
    // Bleed checks
    private float minBleedMm;
    private boolean checkBleed;
    
    // Font checks
    private boolean checkEmbeddedFonts;
    private boolean checkOutlines;
    
    // PDF structure checks
    private boolean checkLayers;
    private boolean checkTransparency;
    private String minPdfVersion;
    
    // Overprint and ink density checks
    private boolean checkOverprint;
    private int maxInkDensity;
    private boolean checkInkDensity;
    
    // Additional checks
    private boolean checkAnnotations;
    private boolean checkMetadata;
    private boolean checkInteractive;
    private boolean checkCompression;
    
    public static PreflightCheckParams getDefaultParams() {
        return PreflightCheckParams.builder()
                .minImageDpi(300)
                .checkImageResolution(true)
                .requireCmyk(true)
                .checkRgbColors(true)
                .checkSpotColors(true)
                .minBleedMm(3.0f)
                .checkBleed(true)
                .checkEmbeddedFonts(true)
                .checkOutlines(true)
                .checkLayers(true)
                .checkTransparency(true)
                .minPdfVersion("1.7")
                .checkOverprint(true)
                .maxInkDensity(300)
                .checkInkDensity(true)
                .checkAnnotations(true)
                .checkMetadata(true)
                .checkInteractive(true)
                .checkCompression(true)
                .build();
    }
}
