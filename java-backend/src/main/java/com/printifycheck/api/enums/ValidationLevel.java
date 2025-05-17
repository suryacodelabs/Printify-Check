
package com.printifycheck.api.enums;

/**
 * Enumeration of validation levels for veraPDF validations
 */
public enum ValidationLevel {
    /**
     * Check for PDF/A-1b compliance, basic level
     */
    PDFA_1B,
    
    /**
     * Check for PDF/A-1a compliance, accessible level
     */
    PDFA_1A,
    
    /**
     * Check for PDF/A-2b compliance, basic level
     */
    PDFA_2B,
    
    /**
     * Check for PDF/A-2a compliance, accessible level
     */
    PDFA_2A,
    
    /**
     * Check for PDF/A-3b compliance, basic level
     */
    PDFA_3B,
    
    /**
     * Check for PDF/A-3a compliance, accessible level
     */
    PDFA_3A,
    
    /**
     * Check for PDF/A-4 compliance
     */
    PDFA_4,
    
    /**
     * Check for PDF/UA-1 compliance (Universal Accessibility)
     */
    PDFUA_1,
    
    /**
     * Check for PDF/VT-1 compliance (Variable Transactional)
     */
    PDFVT_1,
    
    /**
     * Check for PDF/X-1a compliance (Print Production)
     */
    PDFX_1A,
    
    /**
     * Check for PDF/X-4 compliance (Print Production)
     */
    PDFX_4,
    
    /**
     * Check for WCAG 2.1 AA compliance (Web Content Accessibility Guidelines)
     */
    WCAG_2_1_AA
}
