
package com.printifycheck.pdf.utils;

import lombok.extern.slf4j.Slf4j;
import com.ghostscript.GSInstance;
import com.ghostscript.GSError;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;

/**
 * Utility class for advanced PDF operations using GhostScript and MuPDF
 */
@Component
@Slf4j
public class PdfAdvancedUtils {
    
    // GhostScript version
    private static final String GHOSTSCRIPT_VERSION = "10.05.1";
    
    // Load the Ghostscript native library
    static {
        try {
            System.loadLibrary("gs");
            log.info("Ghostscript native library loaded successfully (v{})", GHOSTSCRIPT_VERSION);
        } catch (UnsatisfiedLinkError e) {
            log.error("Failed to load Ghostscript native library: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Renders a PDF to images using GhostScript
     * 
     * @param pdfPath Path to the PDF file
     * @param dpi Resolution in DPI
     * @return List of rendered images
     */
    public List<BufferedImage> renderPdfWithGhostScript(String pdfPath, int dpi) {
        List<BufferedImage> images = new ArrayList<>();
        File pdfFile = new File(pdfPath);
        
        if (!pdfFile.exists()) {
            log.error("PDF file not found: {}", pdfPath);
            return images;
        }
        
        // Create temporary directory for storing images
        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("gs_render_");
        } catch (IOException e) {
            log.error("Failed to create temporary directory: {}", e.getMessage(), e);
            return images;
        }
        
        GSInstance gsInstance = null;
        
        try {
            // Create Ghostscript instance
            gsInstance = new GSInstance();
            
            // Set up Ghostscript arguments for rendering PDF to images
            String outputPath = tempDir.toString() + "/page-%03d.png";
            String[] gsArgs = {
                "gs",
                "-dSAFER",
                "-dBATCH",
                "-dNOPAUSE",
                "-sDEVICE=png16m",
                "-dTextAlphaBits=4",
                "-dGraphicsAlphaBits=4",
                "-r" + dpi,
                "-dFirstPage=1",
                "-o", outputPath,
                pdfPath
            };
            
            // Execute Ghostscript
            gsInstance.initialize(gsArgs);
            gsInstance.execute();
            
            // Collect generated images
            File[] imageFiles = tempDir.toFile().listFiles((dir, name) -> name.startsWith("page-") && name.endsWith(".png"));
            if (imageFiles != null) {
                // Sort files by name to maintain page order
                Arrays.sort(imageFiles);
                
                for (File imageFile : imageFiles) {
                    try {
                        BufferedImage image = ImageIO.read(imageFile);
                        if (image != null) {
                            images.add(image);
                        }
                        // Delete the file after reading
                        imageFile.delete();
                    } catch (IOException e) {
                        log.error("Error reading rendered image: {}", e.getMessage(), e);
                    }
                }
            }
            
            log.info("Successfully rendered PDF with GhostScript: {} pages at {}dpi", 
                    images.size(), dpi);
            
        } catch (GSError e) {
            log.error("Ghostscript error: {} (code: {})", e.getMessage(), e.getCode(), e);
        } catch (Exception e) {
            log.error("Error rendering PDF with GhostScript: {}", e.getMessage(), e);
        } finally {
            // Clean up Ghostscript instance
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
            
            // Clean up temporary directory
            try {
                Files.deleteIfExists(tempDir);
            } catch (IOException e) {
                log.warn("Failed to delete temporary directory: {}", e.getMessage());
            }
        }
        
        return images;
    }
    
    /**
     * Optimizes a PDF using GhostScript (reduces file size)
     * 
     * @param inputPath Input PDF path
     * @param outputPath Output PDF path
     * @param quality Quality level (screen, ebook, printer, prepress)
     * @return true if optimization was successful
     */
    public boolean optimizePdfWithGhostScript(String inputPath, String outputPath, String quality) {
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            log.error("Input PDF file not found: {}", inputPath);
            return false;
        }
        
        GSInstance gsInstance = null;
        
        try {
            // Create Ghostscript instance
            gsInstance = new GSInstance();
            
            // Define GhostScript arguments for PDF optimization
            String[] gsArgs = {
                "gs",
                "-dSAFER",
                "-dBATCH",
                "-dNOPAUSE",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                "-dPDFSETTINGS=/" + quality,
                "-sOutputFile=" + outputPath,
                inputPath
            };
            
            // Execute Ghostscript
            gsInstance.initialize(gsArgs);
            int exitCode = gsInstance.execute();
            
            if (exitCode == 0) {
                log.info("Successfully optimized PDF with GhostScript: {} -> {}", inputPath, outputPath);
                return true;
            } else {
                log.error("GhostScript optimization failed with exit code: {}", exitCode);
                return false;
            }
        } catch (GSError e) {
            log.error("Ghostscript error during optimization: {} (code: {})", e.getMessage(), e.getCode(), e);
            return false;
        } catch (Exception e) {
            log.error("Error optimizing PDF with GhostScript: {}", e.getMessage(), e);
            return false;
        } finally {
            // Clean up Ghostscript instance
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
        }
    }
    
    /**
     * Converts PDF to images for each page using GhostScript
     * 
     * @param inputPath Input PDF path
     * @param outputDir Output directory for images
     * @param format Output format (png, jpg, tiff)
     * @param dpi Resolution in DPI
     * @return list of generated image paths
     */
    public List<String> convertPdfToImages(String inputPath, String outputDir, String format, int dpi) {
        List<String> imagePaths = new ArrayList<>();
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            log.error("Input PDF file not found: {}", inputPath);
            return imagePaths;
        }
        
        // Create output directory if it doesn't exist
        File outputDirFile = new File(outputDir);
        if (!outputDirFile.exists()) {
            if (!outputDirFile.mkdirs()) {
                log.error("Failed to create output directory: {}", outputDir);
                return imagePaths;
            }
        }
        
        GSInstance gsInstance = null;
        
        try {
            // Create Ghostscript instance
            gsInstance = new GSInstance();
            
            // Map format string to GhostScript device
            String device;
            switch (format.toLowerCase()) {
                case "jpg":
                case "jpeg":
                    device = "jpeg";
                    break;
                case "tiff":
                    device = "tiffg4";
                    break;
                case "png":
                default:
                    device = "png16m";
                    break;
            }
            
            // Normalize output path with proper file extension
            String fileExtension = format.toLowerCase().equals("jpg") ? "jpg" : format.toLowerCase();
            String outputPath = outputDir + "/page-%03d." + fileExtension;
            
            // Define GhostScript arguments for PDF to image conversion
            String[] gsArgs = {
                "gs",
                "-dSAFER",
                "-dBATCH",
                "-dNOPAUSE",
                "-sDEVICE=" + device,
                "-dTextAlphaBits=4",
                "-dGraphicsAlphaBits=4",
                "-r" + dpi,
                "-o", outputPath,
                inputPath
            };
            
            // Execute Ghostscript
            gsInstance.initialize(gsArgs);
            int exitCode = gsInstance.execute();
            
            if (exitCode == 0) {
                // Collect generated images
                File[] imageFiles = outputDirFile.listFiles((dir, name) -> 
                    name.startsWith("page-") && name.endsWith("." + fileExtension));
                
                if (imageFiles != null) {
                    // Sort files by name to maintain page order
                    Arrays.sort(imageFiles);
                    
                    for (File imageFile : imageFiles) {
                        imagePaths.add(imageFile.getAbsolutePath());
                    }
                }
                
                log.info("Successfully converted PDF to {} images with GhostScript", imagePaths.size());
                return imagePaths;
            } else {
                log.error("GhostScript conversion failed with exit code: {}", exitCode);
                return imagePaths;
            }
        } catch (GSError e) {
            log.error("Ghostscript error during conversion: {} (code: {})", e.getMessage(), e.getCode(), e);
            return imagePaths;
        } catch (Exception e) {
            log.error("Error converting PDF with GhostScript: {}", e.getMessage(), e);
            return imagePaths;
        } finally {
            // Clean up Ghostscript instance
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
        }
    }
    
    /**
     * Performs print-ready optimization and preparation using GhostScript
     * 
     * @param inputPath Input PDF path
     * @param outputPath Output PDF path
     * @param options Map of options for print preparation
     * @return true if preparation was successful
     */
    public boolean preparePrintReadyPdf(String inputPath, String outputPath, Map<String, Object> options) {
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            log.error("Input PDF file not found: {}", inputPath);
            return false;
        }
        
        GSInstance gsInstance = null;
        
        try {
            // Create Ghostscript instance
            gsInstance = new GSInstance();
            
            // Build arguments list based on options
            List<String> argsList = new ArrayList<>();
            argsList.add("gs");
            argsList.add("-dSAFER");
            argsList.add("-dBATCH");
            argsList.add("-dNOPAUSE");
            argsList.add("-sDEVICE=pdfwrite");
            
            // Default to PDF 1.6 compatibility unless specified
            String pdfVersion = options.containsKey("pdfVersion") 
                ? options.get("pdfVersion").toString() 
                : "1.6";
            argsList.add("-dCompatibilityLevel=" + pdfVersion);
            
            // Add quality setting
            String quality = options.containsKey("quality") 
                ? options.get("quality").toString() 
                : "printer";
            argsList.add("-dPDFSETTINGS=/" + quality);
            
            // Color conversion options
            if (options.containsKey("convertToCmyk") && (boolean) options.get("convertToCmyk")) {
                argsList.add("-sColorConversionStrategy=CMYK");
                argsList.add("-dProcessColorModel=/DeviceCMYK");
            }
            
            // Preserve black options
            if (options.containsKey("preserveBlack") && (boolean) options.get("preserveBlack")) {
                argsList.add("-dPreserveBlackPtComponent=true");
                argsList.add("-dPreserveBlackObject=true");
            }
            
            // Transparency flattening
            if (options.containsKey("flattenTransparency") && (boolean) options.get("flattenTransparency")) {
                argsList.add("-dHaveTransparency=false");
                argsList.add("-dFlattenTransparency=true");
            }
            
            // Image downsampling options
            if (options.containsKey("downsampleImages") && (boolean) options.get("downsampleImages")) {
                int resolution = options.containsKey("resolution") 
                    ? (int) options.get("resolution") 
                    : 300;
                argsList.add("-dColorImageResolution=" + resolution);
                argsList.add("-dGrayImageResolution=" + resolution);
                argsList.add("-dMonoImageResolution=" + resolution);
            }
            
            // Embedding options
            if (options.containsKey("embedAllFonts") && (boolean) options.get("embedAllFonts")) {
                argsList.add("-dEmbedAllFonts=true");
                argsList.add("-dSubsetFonts=true");
            }
            
            // ICC profile options
            if (options.containsKey("iccProfile") && options.get("iccProfile") != null) {
                String iccProfile = options.get("iccProfile").toString();
                if (!iccProfile.isEmpty()) {
                    argsList.add("-sOutputICCProfile=" + iccProfile);
                }
            }
            
            // Output path
            argsList.add("-sOutputFile=" + outputPath);
            
            // Input path (always last)
            argsList.add(inputPath);
            
            // Convert list to array
            String[] gsArgs = argsList.toArray(new String[0]);
            
            // Execute Ghostscript
            gsInstance.initialize(gsArgs);
            int exitCode = gsInstance.execute();
            
            if (exitCode == 0) {
                log.info("Successfully prepared print-ready PDF with GhostScript: {} -> {}", 
                        inputPath, outputPath);
                return true;
            } else {
                log.error("GhostScript print preparation failed with exit code: {}", exitCode);
                return false;
            }
        } catch (GSError e) {
            log.error("Ghostscript error during print preparation: {} (code: {})", 
                    e.getMessage(), e.getCode(), e);
            return false;
        } catch (Exception e) {
            log.error("Error preparing print-ready PDF with GhostScript: {}", e.getMessage(), e);
            return false;
        } finally {
            // Clean up Ghostscript instance
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
        }
    }
    
    /**
     * Adds bleed to a PDF using GhostScript
     * 
     * @param inputPath Input PDF path
     * @param outputPath Output PDF path
     * @param bleedMargin Bleed margin size in points
     * @return true if adding bleed was successful
     */
    public boolean addBleedToPdf(String inputPath, String outputPath, double bleedMargin) {
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            log.error("Input PDF file not found: {}", inputPath);
            return false;
        }
        
        GSInstance gsInstance = null;
        
        try {
            // Create Ghostscript instance
            gsInstance = new GSInstance();
            
            // Define GhostScript arguments for adding bleed
            String[] gsArgs = {
                "gs",
                "-dSAFER",
                "-dBATCH",
                "-dNOPAUSE",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.6",
                "-dPDFSETTINGS=/prepress",
                "-dUseCropBox",
                "-dUseTrimBox",
                "-dUseBleedBox",
                "-c", "[ /BleedBox [" + 
                      (-bleedMargin) + " " + 
                      (-bleedMargin) + " " + 
                      "595.28 " + bleedMargin + " " + 
                      "841.89 " + bleedMargin + 
                      "] /PAGES pdfmark",
                "-sOutputFile=" + outputPath,
                inputPath
            };
            
            // Execute Ghostscript
            gsInstance.initialize(gsArgs);
            int exitCode = gsInstance.execute();
            
            if (exitCode == 0) {
                log.info("Successfully added {}pt bleed to PDF with GhostScript: {} -> {}", 
                        bleedMargin, inputPath, outputPath);
                return true;
            } else {
                log.error("GhostScript bleed addition failed with exit code: {}", exitCode);
                return false;
            }
        } catch (GSError e) {
            log.error("Ghostscript error while adding bleed: {} (code: {})", 
                    e.getMessage(), e.getCode(), e);
            return false;
        } catch (Exception e) {
            log.error("Error adding bleed to PDF with GhostScript: {}", e.getMessage(), e);
            return false;
        } finally {
            // Clean up Ghostscript instance
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
        }
    }
    
    /**
     * Checks if MuPDF library is available
     * 
     * @return true if MuPDF is available
     */
    public boolean isMuPdfAvailable() {
        try {
            // Try to load MuPDF native library
            // Note: This is a placeholder. Actual implementation depends on the JNI bindings
            Class.forName("com.artifex.mupdf.MuPDFCore");
            return true;
        } catch (ClassNotFoundException e) {
            log.warn("MuPDF library not available: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extracts text from a PDF using MuPDF (placeholder)
     * 
     * @param pdfPath Path to the PDF file
     * @return Extracted text
     */
    public String extractTextWithMuPdf(String pdfPath) {
        // This is a placeholder. Actual implementation depends on MuPDF JNI bindings
        log.info("MuPDF text extraction called for: {}", pdfPath);
        return "MuPDF text extraction - implementation required with proper JNI bindings";
    }
    
    /**
     * Converts PDF to HTML using GhostScript and additional tools
     * 
     * @param pdfPath Path to the PDF file
     * @param outputPath Output HTML path
     * @return true if conversion was successful
     */
    public boolean convertPdfToHtml(String pdfPath, String outputPath) {
        try {
            // Define GhostScript command for PDF to HTML conversion
            // This requires additional tools like pdf2htmlEX
            String[] conversionCommand = {
                "pdf2htmlEX",
                "--zoom", "1.3",
                pdfPath,
                outputPath
            };
            
            Process process = Runtime.getRuntime().exec(conversionCommand);
            int exitCode = process.waitFor();
            
            if (exitCode == 0) {
                log.info("Successfully converted PDF to HTML: {} -> {}", pdfPath, outputPath);
                return true;
            } else {
                log.error("PDF to HTML conversion failed with exit code: {}", exitCode);
                return false;
            }
        } catch (IOException | InterruptedException e) {
            log.error("Error converting PDF to HTML: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Get Ghostscript version information
     * 
     * @return Map with version information
     */
    public Map<String, String> getGhostscriptVersionInfo() {
        Map<String, String> versionInfo = new HashMap<>();
        versionInfo.put("version", GHOSTSCRIPT_VERSION);
        
        GSInstance gsInstance = null;
        try {
            gsInstance = new GSInstance();
            String[] gsArgs = {"gs", "--version"};
            gsInstance.initialize(gsArgs);
            
            // This is a simplification - in a real implementation, you would
            // capture the output from Ghostscript to get the actual version
            
            versionInfo.put("fullVersion", GHOSTSCRIPT_VERSION);
            versionInfo.put("available", "true");
            
        } catch (GSError e) {
            log.error("Error getting Ghostscript version: {}", e.getMessage(), e);
            versionInfo.put("available", "false");
            versionInfo.put("error", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage(), e);
            versionInfo.put("available", "false");
            versionInfo.put("error", e.getMessage());
        } finally {
            if (gsInstance != null) {
                try {
                    gsInstance.exit();
                } catch (GSError e) {
                    log.error("Error while closing Ghostscript: {}", e.getMessage(), e);
                }
            }
        }
        
        return versionInfo;
    }
}
