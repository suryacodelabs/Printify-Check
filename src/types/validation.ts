import { PDFIssue } from './pdf';

/**
 * PDF Validation Issue Severity Levels
 */
export enum ValidationSeverity {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info"
}

/**
 * Categories of validation checks
 */
export enum ValidationCategory {
  STRUCTURAL = 'STRUCTURAL',
  FONTS = 'FONTS',
  COLOR = 'COLOR',
  IMAGE = 'IMAGE',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY',
  PRINT_PRODUCTION = 'PRINT_PRODUCTION',
  VERAPDF = 'VERAPDF'
}

/**
 * Types of structural validation checks
 */
export enum StructuralValidationType {
  LINEARIZATION = "Linearization",
  OBJECT_STREAMS = "Object Streams",
  XREF_TABLE = "XREF Table",
  XREF_STREAM = "XREF Stream",
  DAMAGED_OBJECTS = "Damaged Objects",
  PDF_VERSION = "PDF Version",
  SYNTAX_ERROR = "Syntax Error",
  FILE_SIZE = "File Size",
  PAGE_COUNT = "Page Count",
  EMBEDDED_FILES = "Embedded Files",
  ANNOTATIONS = "Annotations",
  FORMS = "Forms",
  ACTIONS = "Actions"
}

/**
 * Types of font validation checks
 */
export enum FontValidationType {
  EMBEDDING = "Font Embedding",
  CMAPS = "CMap Validation",
  GLYPH_WIDTHS = "Glyph Widths",
  TYPE3_FONTS = "Type3 Fonts",
  SUBSETTING = "Font Subsetting",
  TEXT_ENCODING = "Text Encoding",
  SMALL_TEXT = "Small Text",
  LICENSING = "Font Licensing"
}

/**
 * Types of color validation checks
 */
export enum ColorValidationType {
  RGB_IN_CMYK = "RGB in CMYK",
  SPOT_COLORS = "Spot Colors",
  ICC_PROFILES = "ICC Profiles",
  OVERPRINT = "Overprint Settings",
  INK_DENSITY = "Ink Density",
  COLOR_SPACE_MISMATCHES = "Color Space Mismatches",
  TRANSPARENCY = "Transparency",
  LAYER_MISUSE = "Layer Misuse"
}

/**
 * Types of image validation checks
 */
export enum ImageValidationType {
  LOW_RESOLUTION = "Low Resolution",
  JPEG2000_PNG_ARTIFACTS = "JPEG2000/PNG Artifacts",
  COMPRESSION = "Compression",
  RESOLUTION_MISMATCHES = "Resolution Mismatches",
  TRANSPARENCY = "Image Transparency",
  CCITT_GROUP4 = "CCITT Group 4",
  IMAGE_SIZE = "Image Size",
  COLOR_DEPTH = "Color Depth"
}

/**
 * Types of compliance validation checks
 */
export enum ComplianceValidationType {
  PDF_A = "PDF/A Compliance",
  PDF_X = "PDF/X Compliance",
  PDF_UA = "PDF/UA Compliance",
  WCAG = "WCAG 2.1 Compliance",
  GWG = "GWG 2022 Compliance",
  ISO_32000 = "ISO 32000-2 Compliance",
  SECTION_508 = "Section 508 Compliance",
  PDF_VERSION_2 = "PDF 2.0 Version"
}

/**
 * Types of security validation checks
 */
export enum SecurityValidationType {
  ENCRYPTION_STRENGTH = "Encryption Strength",
  DIGITAL_SIGNATURES = "Digital Signatures",
  JAVASCRIPT = "JavaScript",
  HIDDEN_LAYERS = "Hidden Layers",
  EMBEDDED_ATTACHMENTS = "Embedded Attachments",
  PASSWORD_PROTECTION = "Password Protection",
  ACCESS_PERMISSIONS = "Access Permissions",
  METADATA_SENSITIVITY = "Metadata Sensitivity"
}

/**
 * Types of print production validation checks
 */
export enum PrintProductionValidationType {
  BLEED = "Bleed",
  TRIM_SAFE_ZONES = "Trim/Safe Zones",
  PAGE_GEOMETRY = "Page Geometry",
  REGISTRATION_MARKS = "Registration Marks",
  DIE_LINE = "Die Line",
  VARNISH_LAYER = "Varnish Layer",
  BARCODE_READABILITY = "Barcode Readability",
  FOLD_MARKS = "Fold Marks"
}

/**
 * Location of an issue within a PDF page
 */
export interface IssueLocation {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents a single issue found during PDF validation
 */
export interface ValidationIssue {
  id: string;
  type: string;
  severity: ValidationSeverity;
  message: string;
  page?: number;
  location?: IssueLocation;
  autoFixable: boolean;
  fixDescription?: string;
  fixType?: string;
  libraryUsed?: string; // Which library can fix this issue
  technicalDetails?: string; // For developers
}

/**
 * Groups validation issues by category
 */
export interface ValidationIssuesByCategory {
  [ValidationCategory.STRUCTURAL]?: ValidationIssue[];
  [ValidationCategory.FONTS]?: ValidationIssue[];
  [ValidationCategory.COLOR]?: ValidationIssue[];
  [ValidationCategory.IMAGE]?: ValidationIssue[];
  [ValidationCategory.COMPLIANCE]?: ValidationIssue[];
  [ValidationCategory.SECURITY]?: ValidationIssue[];
  [ValidationCategory.PRINT_PRODUCTION]?: ValidationIssue[];
  [ValidationCategory.VERAPDF]?: ValidationIssue[];
}

/**
 * Available fix types that can be applied automatically
 */
export interface SupportedFixes {
  // Structural Fixes
  linearization?: boolean;
  fontEmbedding?: boolean;
  rgbToCmyk?: boolean;
  addBleed?: boolean;
  fixOverprint?: boolean;
  optimizeImages?: boolean;
  pdfA?: boolean;
  pdfX?: boolean;
  removeJavaScript?: boolean;
  sanitizeMetadata?: boolean;
  repairXref?: boolean;
  convertToXrefStream?: boolean;
  repairDamagedObjects?: boolean;
  updatePdfVersion?: boolean;
  removeEmbeddedFiles?: boolean;
  flattenAnnotations?: boolean;
  flattenForms?: boolean;
  
  // Font Fixes
  embedFonts?: boolean;
  generateCmaps?: boolean;
  fixGlyphWidths?: boolean;
  convertType3Fonts?: boolean;
  applyFontSubsetting?: boolean;
  convertTextEncoding?: boolean;
  
  // Color Fixes
  convertRgbToCmyk?: boolean;
  convertSpotColors?: boolean;
  embedIccProfile?: boolean;
  fixOverprintSettings?: boolean;
  reduceInkDensity?: boolean;
  normalizeColorSpaces?: boolean;
  flattenTransparency?: boolean;
  flattenLayers?: boolean;
  
  // Image Fixes
  optimizeResolution?: boolean;
  fixImageCompression?: boolean;
  reconcileResolutions?: boolean;
  convertCcittGroup4?: boolean;
  resizeImages?: boolean;
  adjustColorDepth?: boolean;
  
  // Compliance Fixes
  convertToPdfA?: boolean;
  convertToPdfX?: boolean;
  enhancePdfUa?: boolean;
  fixWcagIssues?: boolean;
  
  // Security Fixes
  enhanceEncryption?: boolean;
  removeJavaScriptSecurity?: boolean;
  redactSensitiveContent?: boolean;
  
  // Print Production Fixes
  addBleedMarks?: boolean;
  addTrimMarks?: boolean;
  fixPageGeometry?: boolean;
  addRegistrationMarks?: boolean;
  enhanceBarcodes?: boolean;
  addFoldMarks?: boolean;
}

/**
 * PDF Library information
 */
export interface PDFLibraryInfo {
  name: string;
  version: string;
  status: "available" | "unavailable" | "error";
  capabilities: string[];
}

/**
 * Complete validation result for a PDF file
 */
export interface ValidationResult {
  checkId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  issuesByCategory: ValidationIssuesByCategory;
  totalIssues: number;
  qualityScore: number;
  supportedFixes: SupportedFixes;
  usedLibraries?: PDFLibraryInfo[];
  status?: string;
  processingTimeMs?: number;
  metadata?: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    pdfVersion?: string;
    pageCount?: number;
  };
}

/**
 * Parameters for validation API request
 */
export interface ValidationParams {
  checkStructural: boolean;
  checkFonts: boolean;
  checkColor: boolean;
  checkImage: boolean;
  checkCompliance: boolean;
  checkSecurity: boolean;
  checkPrintProduction: boolean;
}

/**
 * Response from the validation API when a job is submitted
 */
export interface ValidationJobResponse {
  processId: string;
  userId: string;
  fileName: string;
  status: string;
  estimatedTimeSeconds?: number;
}

/**
 * Response from checking the status of a validation job
 */
export interface ValidationStatusResponse {
  processId: string;
  status: string;
  progress: number;
  resultId?: string;
  errorMessage?: string;
}

/**
 * Fix job parameters
 */
export interface FixParams {
  userId: string;
  fixTypes: string[];
  options?: {
    pdfALevel?: "1b" | "1a" | "2b" | "2a" | "3b" | "3a";
    pdfXLevel?: "1a" | "3" | "4";
    iccProfileName?: string;
    bleedMargin?: number; // in mm
  };
}

/**
 * Fix job response
 */
export interface FixJobResponse {
  fixJobId: string;
  userId: string;
  fileName: string;
  status: string;
  estimatedTimeSeconds?: number;
}

/**
 * Fix status response
 */
export interface FixStatusResponse {
  fixJobId: string;
  status: string;
  progress: number;
  resultId?: string;
  errorMessage?: string;
  fixedIssuesCount?: number;
  totalFixesApplied?: number;
  downloadUrl?: string;
}

/**
 * PDF Library capabilities
 */
export interface LibraryCapabilities {
  name: string;
  version: string;
  supports: {
    validation: string[];
    fixes: string[];
  };
}

/**
 * Full system capabilities including available libraries
 */
export interface SystemCapabilities {
  libraries: LibraryCapabilities[];
  supports: {
    validation: {
      [key in ValidationCategory]: boolean;
    };
    fixes: {
      [key: string]: boolean;
    };
  };
}

/**
 * VeraPDF-specific types
 */
export interface VeraPDFValidationResult {
  issues: PDFIssue[];
  isCompliant: boolean;
  flavour?: string;
}

export interface VeraPDFConversionResult {
  success: boolean;
  message: string;
  outputPath: string;
  flavour?: string;
}

export interface VeraPDFSanitizationResult {
  success: boolean;
  message: string;
  outputPath: string;
}
