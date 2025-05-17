
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ValidationIssue, FontValidationType, ColorValidationType } from "@/types/validation"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to get appropriate fix types based on validation issues
 * @param fontIssues List of font-related issues
 * @param colorIssues List of color-related issues
 * @returns Array of fix types that should be applied
 */
export function getAutoFixTypesForIssues(
  fontIssues: ValidationIssue[] = [], 
  colorIssues: ValidationIssue[] = []
): string[] {
  const fixes: string[] = [];
  
  // Process font issues
  if (fontIssues.length > 0) {
    const hasEmbeddingIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.EMBEDDING);
    
    const hasCmapIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.CMAPS);
    
    const hasGlyphWidthIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.GLYPH_WIDTHS);
    
    const hasType3FontIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.TYPE3_FONTS);
      
    const hasSubsettingIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.SUBSETTING);
      
    const hasEncodingIssues = fontIssues.some(issue => 
      issue.type === FontValidationType.TEXT_ENCODING);
    
    if (hasEmbeddingIssues) fixes.push('embedFonts');
    if (hasCmapIssues) fixes.push('generateCmaps');
    if (hasGlyphWidthIssues) fixes.push('fixGlyphWidths');
    if (hasType3FontIssues) fixes.push('convertType3Fonts');
    if (hasSubsettingIssues) fixes.push('applyFontSubsetting');
    if (hasEncodingIssues) fixes.push('convertTextEncoding');
  }
  
  // Process color issues
  if (colorIssues.length > 0) {
    const hasRgbIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.RGB_IN_CMYK);
      
    const hasSpotColorIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.SPOT_COLORS);
      
    const hasIccProfileIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.ICC_PROFILES);
      
    const hasOverprintIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.OVERPRINT);
      
    const hasInkDensityIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.INK_DENSITY);
      
    const hasColorSpaceMismatchIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.COLOR_SPACE_MISMATCHES);
      
    const hasTransparencyIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.TRANSPARENCY);
      
    const hasLayerMisuseIssues = colorIssues.some(issue => 
      issue.type === ColorValidationType.LAYER_MISUSE);
    
    if (hasRgbIssues) fixes.push('convertRgbToCmyk');
    if (hasSpotColorIssues) fixes.push('convertSpotColors');
    if (hasIccProfileIssues) fixes.push('embedIccProfile');
    if (hasOverprintIssues) fixes.push('fixOverprintSettings');
    if (hasInkDensityIssues) fixes.push('reduceInkDensity');
    if (hasColorSpaceMismatchIssues) fixes.push('normalizeColorSpaces');
    if (hasTransparencyIssues) fixes.push('flattenTransparency');
    if (hasLayerMisuseIssues) fixes.push('flattenLayers');
  }
  
  return fixes;
}
