
package com.printifycheck.api;

import com.printifycheck.pdf.utils.ITextAdvancedUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/pdf/advanced")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // For development; restrict in production
public class AdvancedPdfController {

    private final ITextAdvancedUtils iTextAdvancedUtils;

    /**
     * Linearize PDF for web optimization
     */
    @PostMapping("/linearize")
    public ResponseEntity<?> linearizePdf(@RequestParam("file") MultipartFile file) {
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "linearize");
            String outputPath = createOutputPath(inputPath, "linearized");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.linearizePdf(inputPath, outputPath);
                log.info("Linearization job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "PDF linearization started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing linearize request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Embed fonts in PDF
     */
    @PostMapping("/embed-fonts")
    public ResponseEntity<?> embedFonts(@RequestParam("file") MultipartFile file) {
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "fonts");
            String outputPath = createOutputPath(inputPath, "embedded_fonts");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.embedFonts(inputPath, outputPath);
                log.info("Font embedding job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "Font embedding started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing embed fonts request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Convert RGB to CMYK in PDF
     */
    @PostMapping("/convert-to-cmyk")
    public ResponseEntity<?> convertToCmyk(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "preserveBlack", defaultValue = "true") boolean preserveBlack) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "color");
            String outputPath = createOutputPath(inputPath, "cmyk_converted");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.convertRgbToCmyk(inputPath, outputPath, preserveBlack);
                log.info("RGB to CMYK conversion job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing", 
                        "message", "RGB to CMYK conversion started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing RGB to CMYK conversion request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Apply ICC profile to PDF
     */
    @PostMapping("/apply-icc-profile")
    public ResponseEntity<?> applyIccProfile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "profileName", defaultValue = "sRGB") String profileName) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "color");
            String outputPath = createOutputPath(inputPath, "icc_applied");
            
            // In production, we would map profile names to actual profile paths
            // For simplicity here, we just use the default
            String iccProfilePath = iTextAdvancedUtils.getDefaultIccProfilePath();
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.applyIccProfile(inputPath, outputPath, iccProfilePath);
                log.info("ICC profile application job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "ICC profile application started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing ICC profile application request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Flatten transparency in PDF
     */
    @PostMapping("/flatten-transparency")
    public ResponseEntity<?> flattenTransparency(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "quality", defaultValue = "high") String quality) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "transparency");
            String outputPath = createOutputPath(inputPath, "flattened");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.flattenTransparency(inputPath, outputPath, quality);
                log.info("Transparency flattening job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "Transparency flattening started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing transparency flattening request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Convert PDF to PDF/A standard
     */
    @PostMapping("/convert-to-pdfa")
    public ResponseEntity<?> convertToPdfA(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conformanceLevel", defaultValue = "1B") String conformanceLevel) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "compliance");
            String outputPath = createOutputPath(inputPath, "pdfa_converted");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.convertToPdfA(inputPath, outputPath, conformanceLevel);
                log.info("PDF/A conversion job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "PDF/A conversion started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing PDF/A conversion request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Convert PDF to PDF/X standard
     */
    @PostMapping("/convert-to-pdfx")
    public ResponseEntity<?> convertToPdfX(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "standard", defaultValue = "3") String standard) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "compliance");
            String outputPath = createOutputPath(inputPath, "pdfx_converted");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.convertToPdfX(inputPath, outputPath, standard);
                log.info("PDF/X conversion job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "PDF/X conversion started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing PDF/X conversion request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Add bleed to PDF
     */
    @PostMapping("/add-bleed")
    public ResponseEntity<?> addBleed(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bleedMargin", defaultValue = "9") float bleedMargin) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "bleed");
            String outputPath = createOutputPath(inputPath, "with_bleed");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.addBleed(inputPath, outputPath, bleedMargin);
                log.info("Add bleed job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "Adding bleed started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing add bleed request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Prepare print-ready PDF with multiple optimizations
     */
    @PostMapping("/prepare-print-ready")
    public ResponseEntity<?> preparePrintReady(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "addBleed", defaultValue = "true") boolean addBleed,
            @RequestParam(value = "convertToCmyk", defaultValue = "true") boolean convertToCmyk,
            @RequestParam(value = "flattenTransparency", defaultValue = "true") boolean flattenTransparency) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "print_ready");
            String outputPath = createOutputPath(inputPath, "print_ready");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.preparePrintReadyPdf(inputPath, outputPath, 
                        addBleed, convertToCmyk, flattenTransparency);
                log.info("Print-ready preparation job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "Print-ready preparation started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing print-ready preparation request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Generate a preflight report PDF
     */
    @PostMapping("/generate-preflight-report")
    public ResponseEntity<?> generatePreflightReport(
            @RequestParam("file") MultipartFile file,
            @RequestBody List<Map<String, Object>> issues,
            @RequestParam(value = "qualityScore", defaultValue = "100") int qualityScore) {
        
        String jobId = UUID.randomUUID().toString();
        
        try {
            String inputPath = saveUploadedFile(file, "preflight");
            String outputPath = createOutputPath(inputPath, "preflight_report");
            
            CompletableFuture.runAsync(() -> {
                boolean success = iTextAdvancedUtils.generatePreflightReport(inputPath, outputPath, issues, qualityScore);
                log.info("Preflight report generation job {} completed: {}", jobId, success);
            });
            
            return ResponseEntity.accepted().body(
                    Map.of(
                        "jobId", jobId,
                        "status", "processing",
                        "message", "Preflight report generation started"
                    )
            );
        } catch (IOException e) {
            log.error("Error processing preflight report generation request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Get job status
     */
    @GetMapping("/job-status/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable String jobId) {
        // In a real implementation, we would check a database or cache for job status
        // For this demonstration, we'll always return completed
        
        return ResponseEntity.ok(
                Map.of(
                    "jobId", jobId,
                    "status", "completed",
                    "progress", 100,
                    "resultId", jobId
                )
        );
    }
    
    /**
     * Download processed file
     */
    @GetMapping("/download/{jobId}")
    public ResponseEntity<?> downloadProcessedFile(@PathVariable String jobId) {
        // In a real implementation, we would lookup the file path based on the job ID
        // For now, we'll return a placeholder
        
        // We would return the actual file here
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=\"processed.pdf\"")
                .body("PDF file would be returned here");
    }
    
    /**
     * Save an uploaded file to a temporary location
     */
    private String saveUploadedFile(MultipartFile file, String typeFolder) throws IOException {
        // Create directory if it doesn't exist
        Path dir = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", typeFolder);
        Files.createDirectories(dir);
        
        // Generate a unique filename
        String originalFilename = file.getOriginalFilename();
        String filename = UUID.randomUUID() + "-" + 
                (originalFilename != null ? originalFilename : "document.pdf");
        
        // Save the file
        Path filepath = dir.resolve(filename);
        Files.copy(file.getInputStream(), filepath);
        
        return filepath.toString();
    }
    
    /**
     * Create an output file path
     */
    private String createOutputPath(String inputPath, String suffix) {
        File inputFile = new File(inputPath);
        String directory = inputFile.getParent();
        String filename = inputFile.getName();
        
        // Insert suffix before extension
        int dotIndex = filename.lastIndexOf('.');
        String nameWithoutExt = (dotIndex > 0) ? filename.substring(0, dotIndex) : filename;
        String extension = (dotIndex > 0) ? filename.substring(dotIndex) : "";
        
        return directory + File.separator + nameWithoutExt + "_" + suffix + extension;
    }
}
