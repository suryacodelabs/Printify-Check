package com.printifycheck.redaction;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.pdfsweep.PdfSweep;
import com.itextpdf.pdfsweep.PdfSweepConfig;
import com.itextpdf.pdfsweep.StandardPdfSweeper;
import com.itextpdf.pdfsweep.redaction.RedactionAppearance;
import com.itextpdf.pdfsweep.redaction.StandardRedactionAppearance;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.colors.Color;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class RedactionService {

    @Value("${pdf.processed.dir}")
    private String processedDir;
    
    @Value("${redaction.default.color.r:0}")
    private int defaultRedactionColorR;
    
    @Value("${redaction.default.color.g:0}")
    private int defaultRedactionColorG;
    
    @Value("${redaction.default.color.b:0}")
    private int defaultRedactionColorB;
    
    @Value("${redaction.default.text:REDACTED}")
    private String defaultRedactionText;
    
    /**
     * Redacts sensitive information from a PDF file with custom appearance
     * 
     * @param inputFilePath Path to the input PDF file
     * @param patterns List of regex patterns to redact
     * @param appearanceOptions Redaction appearance options
     * @return Path to the redacted PDF file
     */
    public String redactPdf(String inputFilePath, List<String> patterns, RedactionAppearanceOptions appearanceOptions) {
        File inputFile = new File(inputFilePath);
        String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_redacted_" + 
                UUID.randomUUID().toString().substring(0, 8) + ".pdf");
        
        try {
            log.info("Starting redaction for file: {} with {} patterns", inputFilePath, patterns.size());
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Create PDF reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Configure redaction
            PdfSweepConfig config = new PdfSweepConfig();
            
            // Set redaction appearance
            config.setRedactionAppearance(createRedactionAppearance(appearanceOptions));
            
            // Add custom regex patterns for redaction
            for (String pattern : patterns) {
                if (pattern != null && !pattern.trim().isEmpty()) {
                    try {
                        config.addTextPattern(Pattern.compile(pattern, Pattern.CASE_INSENSITIVE));
                    } catch (Exception e) {
                        log.warn("Invalid regex pattern: {}", pattern, e);
                    }
                }
            }
            
            // Perform redaction
            PdfSweep pdfSweep = new StandardPdfSweeper(config);
            pdfSweep.sweep(pdfDoc);
            
            pdfDoc.close();
            
            log.info("Redaction completed successfully: {}", outputFilePath);
            return outputFilePath;
            
        } catch (IOException e) {
            log.error("Error performing redaction: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Redacts sensitive information from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param patterns List of regex patterns to redact
     * @return Path to the redacted PDF file
     */
    public String redactPdf(String inputFilePath, List<String> patterns) {
        RedactionAppearanceOptions defaultOptions = new RedactionAppearanceOptions();
        return redactPdf(inputFilePath, patterns, defaultOptions);
    }
    
    /**
     * Redacts specific categories of sensitive information from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param categories List of categories to redact (e.g., "emails", "phones", "ssn", "creditcards")
     * @param appearanceOptions Redaction appearance options
     * @return Path to the redacted PDF file
     */
    public String redactByCategories(String inputFilePath, List<String> categories, RedactionAppearanceOptions appearanceOptions) {
        File inputFile = new File(inputFilePath);
        String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_redacted_" + 
                UUID.randomUUID().toString().substring(0, 8) + ".pdf");
        
        try {
            log.info("Starting category-based redaction for file: {} with categories: {}", inputFilePath, categories);
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Create PDF reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Configure redaction
            PdfSweepConfig config = new PdfSweepConfig();
            
            // Set redaction appearance
            config.setRedactionAppearance(createRedactionAppearance(appearanceOptions));
            
            // Add patterns based on categories
            for (String category : categories) {
                addPatternsByCategory(config, category);
            }
            
            // Perform redaction
            PdfSweep pdfSweep = new StandardPdfSweeper(config);
            pdfSweep.sweep(pdfDoc);
            
            pdfDoc.close();
            
            log.info("Category-based redaction completed successfully: {}", outputFilePath);
            return outputFilePath;
            
        } catch (IOException e) {
            log.error("Error performing category-based redaction: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Redacts specific categories of sensitive information from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param categories List of categories to redact (e.g., "emails", "phones", "ssn", "creditcards")
     * @return Path to the redacted PDF file
     */
    public String redactByCategories(String inputFilePath, List<String> categories) {
        RedactionAppearanceOptions defaultOptions = new RedactionAppearanceOptions();
        return redactByCategories(inputFilePath, categories, defaultOptions);
    }
    
    /**
     * Redacts specific text instances from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param textToRedact List of exact text strings to redact
     * @param appearanceOptions Redaction appearance options
     * @return Path to the redacted PDF file
     */
    public String redactText(String inputFilePath, List<String> textToRedact, RedactionAppearanceOptions appearanceOptions) {
        File inputFile = new File(inputFilePath);
        String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_redacted_" + 
                UUID.randomUUID().toString().substring(0, 8) + ".pdf");
        
        try {
            log.info("Starting text-based redaction for file: {} with {} text items", inputFilePath, textToRedact.size());
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Create PDF reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Configure redaction
            PdfSweepConfig config = new PdfSweepConfig();
            
            // Set redaction appearance
            config.setRedactionAppearance(createRedactionAppearance(appearanceOptions));
            
            // Add exact text matches to redact
            for (String text : textToRedact) {
                if (text != null && !text.trim().isEmpty()) {
                    config.addText(text);
                }
            }
            
            // Perform redaction
            PdfSweep pdfSweep = new StandardPdfSweeper(config);
            pdfSweep.sweep(pdfDoc);
            
            pdfDoc.close();
            
            log.info("Text-based redaction completed successfully: {}", outputFilePath);
            return outputFilePath;
            
        } catch (IOException e) {
            log.error("Error performing text-based redaction: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Redacts specific text instances from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param textToRedact List of exact text strings to redact
     * @return Path to the redacted PDF file
     */
    public String redactText(String inputFilePath, List<String> textToRedact) {
        RedactionAppearanceOptions defaultOptions = new RedactionAppearanceOptions();
        return redactText(inputFilePath, textToRedact, defaultOptions);
    }
    
    /**
     * Create a redaction appearance based on options
     */
    private RedactionAppearance createRedactionAppearance(RedactionAppearanceOptions options) {
        // Default to black if not specified
        int r = options.getColorR() != null ? options.getColorR() : defaultRedactionColorR;
        int g = options.getColorG() != null ? options.getColorG() : defaultRedactionColorG;
        int b = options.getColorB() != null ? options.getColorB() : defaultRedactionColorB;
        
        Color color = new DeviceRgb(r, g, b);
        
        // Create the redaction appearance
        StandardRedactionAppearance appearance = new StandardRedactionAppearance();
        appearance.setOverlayColor(color);
        
        // Set fill text if specified
        if (options.getFillText() != null) {
            appearance.setText(options.getFillText());
        } else if (defaultRedactionText != null && !defaultRedactionText.isEmpty()) {
            appearance.setText(defaultRedactionText);
        }
        
        // Set text color if specified (defaults to white for contrast)
        if (options.getTextColorR() != null && options.getTextColorG() != null && options.getTextColorB() != null) {
            Color textColor = new DeviceRgb(
                options.getTextColorR(),
                options.getTextColorG(),
                options.getTextColorB()
            );
            appearance.setTextColor(textColor);
        }
        
        // Set font size if specified
        if (options.getFontSize() != null) {
            appearance.setFontSize(options.getFontSize());
        }
        
        return appearance;
    }
    
    /**
     * Strips metadata from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @return Path to the PDF file with stripped metadata
     */
    public String stripMetadata(String inputFilePath) {
        File inputFile = new File(inputFilePath);
        String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_no_metadata.pdf");
        
        try {
            log.info("Starting metadata stripping for file: {}", inputFilePath);
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Create PDF reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Remove document information dictionary
            pdfDoc.getDocumentInfo().setAuthor(null);
            pdfDoc.getDocumentInfo().setCreator(null);
            pdfDoc.getDocumentInfo().setKeywords(null);
            pdfDoc.getDocumentInfo().setSubject(null);
            pdfDoc.getDocumentInfo().setTitle(null);
            pdfDoc.getDocumentInfo().setProducer(null);
            
            // Remove additional custom info entries
            for (String key : pdfDoc.getDocumentInfo().getKeys()) {
                pdfDoc.getDocumentInfo().remove(key);
            }
            
            // Clear XMP metadata
            pdfDoc.getXmpMetadata().clear();
            
            pdfDoc.close();
            
            log.info("Metadata stripping completed successfully: {}", outputFilePath);
            return outputFilePath;
            
        } catch (IOException e) {
            log.error("Error stripping metadata: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Strips specific metadata fields from a PDF file
     * 
     * @param inputFilePath Path to the input PDF file
     * @param fields List of metadata fields to strip (e.g., "author", "creator", "keywords")
     * @return Path to the PDF file with selective stripped metadata
     */
    public String stripSelectedMetadata(String inputFilePath, List<String> fields) {
        File inputFile = new File(inputFilePath);
        String outputFilePath = processedDir + "/" + inputFile.getName().replace(".pdf", "_partial_metadata.pdf");
        
        try {
            log.info("Starting selective metadata stripping for file: {} with fields: {}", inputFilePath, fields);
            
            // Create processed directory if it doesn't exist
            Path processedDirPath = Paths.get(processedDir);
            if (!Files.exists(processedDirPath)) {
                Files.createDirectories(processedDirPath);
            }
            
            // Create PDF reader and writer
            PdfReader reader = new PdfReader(inputFilePath);
            PdfWriter writer = new PdfWriter(outputFilePath);
            PdfDocument pdfDoc = new PdfDocument(reader, writer);
            
            // Remove specific document information fields
            for (String field : fields) {
                switch (field.toLowerCase()) {
                    case "author": 
                        pdfDoc.getDocumentInfo().setAuthor(null);
                        break;
                    case "creator": 
                        pdfDoc.getDocumentInfo().setCreator(null);
                        break;
                    case "keywords": 
                        pdfDoc.getDocumentInfo().setKeywords(null);
                        break;
                    case "subject": 
                        pdfDoc.getDocumentInfo().setSubject(null);
                        break;
                    case "title": 
                        pdfDoc.getDocumentInfo().setTitle(null);
                        break;
                    case "producer": 
                        pdfDoc.getDocumentInfo().setProducer(null);
                        break;
                    case "all_custom":
                        for (String key : pdfDoc.getDocumentInfo().getKeys()) {
                            // Keep standard fields, remove custom ones
                            if (!Arrays.asList("Author", "Creator", "Keywords", "Subject", "Title", "Producer").contains(key)) {
                                pdfDoc.getDocumentInfo().remove(key);
                            }
                        }
                        break;
                    case "xmp":
                        pdfDoc.getXmpMetadata().clear();
                        break;
                }
            }
            
            pdfDoc.close();
            
            log.info("Selective metadata stripping completed successfully: {}", outputFilePath);
            return outputFilePath;
            
        } catch (IOException e) {
            log.error("Error selectively stripping metadata: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Adds common PII patterns for redaction
     * 
     * @param config The PdfSweepConfig to add patterns to
     */
    private void addCommonPiiPatterns(PdfSweepConfig config) {
        // Email addresses
        config.addTextPattern(Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"));
        
        // Phone numbers (various formats)
        config.addTextPattern(Pattern.compile("\\b\\d{3}[-.\\s]\\d{3}[-.\\s]\\d{4}\\b")); // 123-456-7890
        config.addTextPattern(Pattern.compile("\\b\\(\\d{3}\\)[-.\\s]?\\d{3}[-.\\s]\\d{4}\\b")); // (123) 456-7890
        config.addTextPattern(Pattern.compile("\\b\\+\\d{1,3}[-.\\s]\\d{3}[-.\\s]\\d{3}[-.\\s]\\d{4}\\b")); // +1-123-456-7890
        
        // Social Security Numbers
        config.addTextPattern(Pattern.compile("\\b\\d{3}[-.\\s]\\d{2}[-.\\s]\\d{4}\\b")); // 123-45-6789
        
        // Credit Card Numbers (basic patterns)
        config.addTextPattern(Pattern.compile("\\b(?:\\d{4}[-.\\s]){3}\\d{4}\\b")); // 1234-5678-9012-3456
        config.addTextPattern(Pattern.compile("\\b\\d{16}\\b")); // 1234567890123456
        
        // Addresses
        // This is a simplistic pattern - real address detection would be more complex
        config.addTextPattern(Pattern.compile("\\b\\d+\\s+[A-Za-z]+\\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln|Way)\\b", Pattern.CASE_INSENSITIVE));
        
        // Dates of birth
        config.addTextPattern(Pattern.compile("\\b(?:0[1-9]|1[0-2])[/.-](?:0[1-9]|[12]\\d|3[01])[/.-](?:19|20)\\d{2}\\b")); // MM/DD/YYYY
        config.addTextPattern(Pattern.compile("\\b(?:0[1-9]|[12]\\d|3[01])[/.-](?:0[1-9]|1[0-2])[/.-](?:19|20)\\d{2}\\b")); // DD/MM/YYYY
        
        // Passport numbers (basic pattern - varies by country)
        config.addTextPattern(Pattern.compile("\\b[A-Z]{1,2}\\d{6,9}\\b")); // Basic passport format
        
        // Driver's license (basic pattern - varies by state/country)
        config.addTextPattern(Pattern.compile("\\b[A-Z]\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{3}\\b")); // Basic format
    }
    
    /**
     * Add patterns by category
     * 
     * @param config The PdfSweepConfig to add patterns to
     * @param category The category of patterns to add
     */
    private void addPatternsByCategory(PdfSweepConfig config, String category) {
        switch (category.toLowerCase()) {
            case "emails":
                config.addTextPattern(Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b"));
                break;
            
            case "phones":
                config.addTextPattern(Pattern.compile("\\b\\d{3}[-.\\s]\\d{3}[-.\\s]\\d{4}\\b")); // 123-456-7890
                config.addTextPattern(Pattern.compile("\\b\\(\\d{3}\\)[-.\\s]?\\d{3}[-.\\s]\\d{4}\\b")); // (123) 456-7890
                config.addTextPattern(Pattern.compile("\\b\\+\\d{1,3}[-.\\s]\\d{3}[-.\\s]\\d{3}[-.\\s]\\d{4}\\b")); // +1-123-456-7890
                break;
            
            case "ssn":
                config.addTextPattern(Pattern.compile("\\b\\d{3}[-.\\s]\\d{2}[-.\\s]\\d{4}\\b")); // 123-45-6789
                break;
            
            case "creditcards":
                config.addTextPattern(Pattern.compile("\\b(?:\\d{4}[-.\\s]){3}\\d{4}\\b")); // 1234-5678-9012-3456
                config.addTextPattern(Pattern.compile("\\b\\d{16}\\b")); // 1234567890123456
                // Visa
                config.addTextPattern(Pattern.compile("\\b4\\d{3}[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}\\b"));
                // MasterCard
                config.addTextPattern(Pattern.compile("\\b5[1-5]\\d{2}[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}\\b"));
                // American Express
                config.addTextPattern(Pattern.compile("\\b3[47]\\d{2}[-.\\s]?\\d{6}[-.\\s]?\\d{5}\\b"));
                // Discover
                config.addTextPattern(Pattern.compile("\\b6(?:011|5\\d{2})[-.\\s]?\\d{4}[-.\\s]?\\d{4}[-.\\s]?\\d{4}\\b"));
                break;
            
            case "addresses":
                config.addTextPattern(Pattern.compile("\\b\\d+\\s+[A-Za-z]+\\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln|Way)\\b", Pattern.CASE_INSENSITIVE));
                // Postal codes
                config.addTextPattern(Pattern.compile("\\b\\d{5}(?:-\\d{4})?\\b")); // US ZIP codes
                config.addTextPattern(Pattern.compile("\\b[A-Z]\\d[A-Z]\\s?\\d[A-Z]\\d\\b")); // Canadian postal codes
                break;
            
            case "dates":
                config.addTextPattern(Pattern.compile("\\b(?:0[1-9]|1[0-2])[/.-](?:0[1-9]|[12]\\d|3[01])[/.-](?:19|20)\\d{2}\\b")); // MM/DD/YYYY
                config.addTextPattern(Pattern.compile("\\b(?:0[1-9]|[12]\\d|3[01])[/.-](?:0[1-9]|1[0-2])[/.-](?:19|20)\\d{2}\\b")); // DD/MM/YYYY
                break;
            
            case "passports":
                config.addTextPattern(Pattern.compile("\\b[A-Z]{1,2}\\d{6,9}\\b")); // Basic passport format
                break;
            
            case "licenses":
                // Driver's license (basic pattern - varies by state/country)
                config.addTextPattern(Pattern.compile("\\b[A-Z]\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{3}\\b")); // Basic format
                break;
                
            case "ip_addresses":
                config.addTextPattern(Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b")); // IPv4
                config.addTextPattern(Pattern.compile("\\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\\b")); // IPv6
                break;
                
            case "names":
                // This is more speculative and might have false positives
                config.addTextPattern(Pattern.compile("\\b(?:[A-Z][a-z]+\\s+){1,2}[A-Z][a-z]+\\b")); // FirstName LastName
                break;
                
            case "medical_codes":
                // CPT codes
                config.addTextPattern(Pattern.compile("\\b\\d{5}(?:-\\d{2})?\\b"));
                // ICD-10 codes
                config.addTextPattern(Pattern.compile("\\b[A-Z]\\d{2}(?:\\.\\d{1,3})?\\b"));
                break;
            
            case "all_pii":
                addCommonPiiPatterns(config);
                break;
        }
    }
    
    /**
     * Options class for redaction appearance customization
     */
    public static class RedactionAppearanceOptions {
        private Integer colorR;
        private Integer colorG;
        private Integer colorB;
        private Integer textColorR;
        private Integer textColorG;
        private Integer textColorB;
        private String fillText;
        private Float fontSize;
        
        public Integer getColorR() {
            return colorR;
        }
        
        public void setColorR(Integer colorR) {
            this.colorR = colorR;
        }
        
        public Integer getColorG() {
            return colorG;
        }
        
        public void setColorG(Integer colorG) {
            this.colorG = colorG;
        }
        
        public Integer getColorB() {
            return colorB;
        }
        
        public void setColorB(Integer colorB) {
            this.colorB = colorB;
        }
        
        public Integer getTextColorR() {
            return textColorR;
        }
        
        public void setTextColorR(Integer textColorR) {
            this.textColorR = textColorR;
        }
        
        public Integer getTextColorG() {
            return textColorG;
        }
        
        public void setTextColorG(Integer textColorG) {
            this.textColorG = textColorG;
        }
        
        public Integer getTextColorB() {
            return textColorB;
        }
        
        public void setTextColorB(Integer textColorB) {
            this.textColorB = textColorB;
        }
        
        public String getFillText() {
            return fillText;
        }
        
        public void setFillText(String fillText) {
            this.fillText = fillText;
        }
        
        public Float getFontSize() {
            return fontSize;
        }
        
        public void setFontSize(Float fontSize) {
            this.fontSize = fontSize;
        }
    }
}
