
package com.printifycheck.model;

import lombok.Getter;

@Getter
public enum PdfFixType {
    ADD_BLEED(
            "Add Bleed",
            "Extends the document edges to create the required bleed area",
            "Bleed is essential for printing to prevent white edges if cutting is slightly misaligned."
    ),
    CONVERT_TO_CMYK(
            "Convert to CMYK",
            "Converts all RGB colors to CMYK color space",
            "Print jobs require CMYK colors to ensure accurate color reproduction in print."
    ),
    CONVERT_SPOT_TO_PROCESS(
            "Convert Spot Colors to Process",
            "Converts spot/Pantone colors to process CMYK colors",
            "Enables printing without special inks while approximating spot colors using CMYK."
    ),
    EMBED_FONTS(
            "Embed Fonts",
            "Embeds all fonts used in the document",
            "Ensures text appears exactly as designed regardless of what fonts are installed."
    ),
    CONVERT_TEXT_TO_OUTLINES(
            "Convert Text to Outlines",
            "Converts all text to vector outlines",
            "Guarantees text appearance even if fonts cannot be embedded."
    ),
    FLATTEN_TRANSPARENCY(
            "Flatten Transparency",
            "Flattens transparent elements in the document",
            "Some print workflows cannot handle transparency and require flattened elements."
    ),
    REDUCE_INK_DENSITY(
            "Reduce Ink Density",
            "Reduces areas with excessive ink coverage",
            "Prevents printing issues like smudging, slow drying, and paper wrinkling."
    );
    
    private final String name;
    private final String description;
    private final String explanation;
    
    PdfFixType(String name, String description, String explanation) {
        this.name = name;
        this.description = description;
        this.explanation = explanation;
    }
    
    public static boolean isAutoFixable(String issueType) {
        return switch (issueType.toLowerCase()) {
            case "missing bleed" -> true;
            case "rgb color space" -> true;
            case "spot colors" -> true;
            case "non-embedded fonts" -> true;
            case "transparency" -> true;
            case "high ink density" -> true;
            default -> false;
        };
    }
    
    public static PdfFixType getFixTypeForIssue(String issueType) {
        return switch (issueType.toLowerCase()) {
            case "missing bleed" -> ADD_BLEED;
            case "rgb color space" -> CONVERT_TO_CMYK;
            case "spot colors" -> CONVERT_SPOT_TO_PROCESS;
            case "non-embedded fonts" -> EMBED_FONTS;
            case "transparency" -> FLATTEN_TRANSPARENCY;
            case "high ink density" -> REDUCE_INK_DENSITY;
            default -> null;
        };
    }
}
