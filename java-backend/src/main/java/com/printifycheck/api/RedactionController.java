
package com.printifycheck.api;

import com.printifycheck.queue.JobQueueService;
import com.printifycheck.redaction.RedactionService;
import com.printifycheck.redaction.RedactionService.RedactionAppearanceOptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/redaction")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RedactionController {

    private final RedactionService redactionService;
    private final JobQueueService jobQueueService;
    
    /**
     * Redact sensitive information from a PDF
     */
    @PostMapping("/redact")
    public ResponseEntity<?> redactPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam(value = "patterns", required = false) List<String> patterns,
            @RequestParam(value = "categories", required = false) List<String> categories,
            @RequestParam(value = "texts", required = false) List<String> texts,
            @RequestParam(value = "redactionColor", required = false) String redactionColor,
            @RequestParam(value = "redactionText", required = false) String redactionText,
            @RequestParam(value = "textColor", required = false) String textColor,
            @RequestParam(value = "fontSize", required = false) Float fontSize) {
        
        try {
            log.info("Received request to redact PDF: {}, size: {}", 
                     file.getOriginalFilename(), file.getSize());
            
            // Validate file type
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed for redaction");
            }
            
            // Check file size
            if (file.getSize() > 52428800) { // 50 MB
                return ResponseEntity.badRequest().body("File size exceeds 50MB limit");
            }
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "-" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Create redaction appearance options
            RedactionAppearanceOptions appearanceOptions = new RedactionAppearanceOptions();
            
            // Parse colors if provided
            if (redactionColor != null && !redactionColor.isEmpty()) {
                try {
                    // Parse hex color #RRGGBB
                    String hexColor = redactionColor.startsWith("#") ? redactionColor.substring(1) : redactionColor;
                    int r = Integer.parseInt(hexColor.substring(0, 2), 16);
                    int g = Integer.parseInt(hexColor.substring(2, 4), 16);
                    int b = Integer.parseInt(hexColor.substring(4, 6), 16);
                    
                    appearanceOptions.setColorR(r);
                    appearanceOptions.setColorG(g);
                    appearanceOptions.setColorB(b);
                } catch (Exception e) {
                    log.warn("Invalid redaction color format: {}", redactionColor);
                }
            }
            
            // Parse text color if provided
            if (textColor != null && !textColor.isEmpty()) {
                try {
                    // Parse hex color #RRGGBB
                    String hexColor = textColor.startsWith("#") ? textColor.substring(1) : textColor;
                    int r = Integer.parseInt(hexColor.substring(0, 2), 16);
                    int g = Integer.parseInt(hexColor.substring(2, 4), 16);
                    int b = Integer.parseInt(hexColor.substring(4, 6), 16);
                    
                    appearanceOptions.setTextColorR(r);
                    appearanceOptions.setTextColorG(g);
                    appearanceOptions.setTextColorB(b);
                } catch (Exception e) {
                    log.warn("Invalid text color format: {}", textColor);
                }
            }
            
            // Set fill text if provided
            if (redactionText != null && !redactionText.isEmpty()) {
                appearanceOptions.setFillText(redactionText);
            }
            
            // Set font size if provided
            if (fontSize != null) {
                appearanceOptions.setFontSize(fontSize);
            }
            
            // Submit job to queue with specific redaction method based on provided parameters
            UUID jobId = jobQueueService.submitRedactionJob(
                filePath.toString(), 
                userId, 
                patterns, 
                categories, 
                texts, 
                appearanceOptions
            );
            
            // Return immediate response with job ID
            return ResponseEntity.accepted().body(new RedactionJobResponse(jobId, userId, fileName, "pending"));
            
        } catch (IOException e) {
            log.error("Error processing redaction request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing redaction request: " + e.getMessage());
        }
    }
    
    /**
     * Strip metadata from a PDF
     */
    @PostMapping("/strip-metadata")
    public ResponseEntity<?> stripMetadata(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam(value = "fields", required = false) List<String> fields) {
        
        try {
            log.info("Received request to strip metadata from PDF: {}, size: {}", 
                     file.getOriginalFilename(), file.getSize());
            
            // Validate file type
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed");
            }
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "-" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Submit job to queue
            UUID jobId;
            if (fields != null && !fields.isEmpty()) {
                jobId = jobQueueService.submitMetadataStrippingJob(filePath.toString(), userId, fields);
            } else {
                jobId = jobQueueService.submitMetadataStrippingJob(filePath.toString(), userId);
            }
            
            // Return immediate response with job ID
            return ResponseEntity.accepted().body(
                new RedactionJobResponse(jobId, userId, fileName, "pending"));
            
        } catch (IOException e) {
            log.error("Error processing metadata stripping request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing metadata stripping request: " + e.getMessage());
        }
    }
    
    /**
     * Get redaction job status
     */
    @GetMapping("/status/{jobId}")
    public ResponseEntity<?> getRedactionJobStatus(@PathVariable UUID jobId) {
        try {
            log.info("Fetching status for redaction job: {}", jobId);
            
            // In a real implementation, this would query job status from Supabase or database
            // For demo purposes, we'll return a mock status
            
            return ResponseEntity.ok(new RedactionJobStatus(jobId, "completed", "sample_redacted.pdf"));
            
        } catch (Exception e) {
            log.error("Error fetching redaction job status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching job status: " + e.getMessage());
        }
    }
    
    /**
     * Download redacted PDF
     */
    @GetMapping("/download/{jobId}")
    public ResponseEntity<?> downloadRedactedPdf(@PathVariable UUID jobId) {
        try {
            log.info("Download request for redacted PDF, job ID: {}", jobId);
            
            // In a real implementation, this would fetch the redacted PDF
            // and return it as a download
            
            return ResponseEntity.ok("Redacted PDF would be returned here");
            
        } catch (Exception e) {
            log.error("Error downloading redacted PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading redacted PDF: " + e.getMessage());
        }
    }
    
    /**
     * Response class for redaction job submission
     */
    private static class RedactionJobResponse {
        private final UUID jobId;
        private final UUID userId;
        private final String fileName;
        private final String status;
        
        public RedactionJobResponse(UUID jobId, UUID userId, String fileName, String status) {
            this.jobId = jobId;
            this.userId = userId;
            this.fileName = fileName;
            this.status = status;
        }
        
        public UUID getJobId() {
            return jobId;
        }
        
        public UUID getUserId() {
            return userId;
        }
        
        public String getFileName() {
            return fileName;
        }
        
        public String getStatus() {
            return status;
        }
    }
    
    /**
     * Status class for redaction job
     */
    private static class RedactionJobStatus {
        private final UUID jobId;
        private final String status;
        private final String outputFile;
        
        public RedactionJobStatus(UUID jobId, String status, String outputFile) {
            this.jobId = jobId;
            this.status = status;
            this.outputFile = outputFile;
        }
        
        public UUID getJobId() {
            return jobId;
        }
        
        public String getStatus() {
            return status;
        }
        
        public String getOutputFile() {
            return outputFile;
        }
    }
}
