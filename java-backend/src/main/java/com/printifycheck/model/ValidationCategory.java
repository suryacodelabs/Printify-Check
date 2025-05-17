
package com.printifycheck.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ValidationCategory {
    STRUCTURAL("Structural", "PDF structure validation"),
    FONTS("Fonts", "Font embedding and compatibility"),
    COLOR("Color", "Color space and profile validation"),
    IMAGE("Image", "Image quality and resolution"),
    COMPLIANCE("Compliance", "PDF standards compliance"),
    SECURITY("Security", "PDF security and encryption"),
    PRINT_PRODUCTION("Print Production", "Print-ready validation");
    
    private final String name;
    private final String description;
}
