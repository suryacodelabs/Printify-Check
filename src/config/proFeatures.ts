
export interface ProFeatureConfig {
  name: string;
  description: string;
  icon: string;
}

export const PRO_FEATURES: Record<string, ProFeatureConfig> = {
  ocr: {
    name: "OCR Technology",
    description: "Extract text from images and scanned documents",
    icon: "scan",
  },
  redaction: {
    name: "Document Redaction",
    description: "Securely remove sensitive information from PDFs",
    icon: "scissors",
  },
  advancedFixes: {
    name: "Advanced PDF Fixes",
    description: "Advanced PDF repair and optimization tools",
    icon: "tool",
  },
  complianceChecks: {
    name: "Compliance Validation",
    description: "Advanced checks for PDF/A, PDF/X, WCAG, and more",
    icon: "check-circle",
  },
  batchProcessing: {
    name: "Batch Processing",
    description: "Process multiple files at once",
    icon: "layers",
  },
};

// Feature categories
export const FEATURE_CATEGORIES = {
  ESSENTIAL: 'essential',
  STANDARD: 'standard',
  PRO: 'pro',
};

// Feature availability by subscription level
export const FEATURE_AVAILABILITY = {
  // Features available to free users
  free: [
    'basic-validation',
    'font-checks',
    'color-checks',
    'basic-fixes',
  ],
  
  // Features available to Pro users (includes all free features)
  pro: [
    'ocr',
    'redaction',
    'advancedFixes',
    'complianceChecks',
    'batchProcessing',
  ],
};
