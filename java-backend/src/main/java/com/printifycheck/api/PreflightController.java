
package com.printifycheck.api;

import com.printifycheck.model.PdfCheckResult;
import com.printifycheck.model.PdfIssue;
import com.printifycheck.pdf.PreflightService;
import com.printifycheck.queue.JobQueueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/preflight")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // CORS enabled for all domains
public class PreflightController {

    private final PreflightService preflightService;
    private final JobQueueService jobQueueService;
    
    /**
     * Upload and check a PDF file
     */
    @PostMapping("/check")
    public ResponseEntity<?> uploadAndCheckPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId) {
        
        try {
            log.info("Received request to check PDF: {}, size: {}", file.getOriginalFilename(), file.getSize());
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.startsWith("image/jpeg") &&
                !contentType.startsWith("image/png") &&
                !contentType.startsWith("image/tiff"))) {
                
                return ResponseEntity.badRequest().body("Only PDF, JPEG, PNG, and TIFF files are allowed");
            }
            
            // Check file size
            if (file.getSize() > 52428800) { // 50 MB
                return ResponseEntity.badRequest().body("File size exceeds 50MB limit");
            }
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Submit job to queue
            UUID jobId = UUID.randomUUID(); // Generate job ID for tracking
            CompletableFuture<PdfCheckResult> future = jobQueueService.submitPreflightJob(filePath.toString(), userId);
            
            // Return immediate response with job ID
            return ResponseEntity.accepted().body(new PreflightJobResponse(jobId, userId, fileName, "pending"));
            
        } catch (IOException e) {
            log.error("Error processing file upload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing file: " + e.getMessage());
        }
    }
    
    /**
     * Get preflight check results
     */
    @GetMapping("/results/{checkId}")
    public ResponseEntity<?> getCheckResults(@PathVariable UUID checkId) {
        try {
            log.info("Fetching results for check ID: {}", checkId);
            
            // Query Supabase for results using the checkId
            // This would typically fetch from a database
            
            // For demo purposes, we'll return a mock result
            List<PdfIssue> mockIssues = List.of(
                PdfIssue.builder()
                    .type("Low Image Resolution")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("Image on page 1 has resolution below 300 DPI (150 DPI)")
                    .page(1)
                    .autoFixable(false)
                    .build(),
                PdfIssue.builder()
                    .type("Missing Bleed")
                    .severity(PdfIssue.IssueSeverity.MEDIUM)
                    .message("Document is missing the required 3mm bleed")
                    .page(1)
                    .autoFixable(true)
                    .build(),
                PdfIssue.builder()
                    .type("RGB Color Space")
                    .severity(PdfIssue.IssueSeverity.HIGH)
                    .message("RGB color space detected but CMYK is required for print")
                    .page(2)
                    .autoFixable(true)
                    .build()
            );
            
            PdfCheckResult mockResult = PdfCheckResult.builder()
                    .id(checkId)
                    .userId(UUID.randomUUID())
                    .fileName("sample.pdf")
                    .fileSize(1024000)
                    .qualityScore(75)
                    .status(PdfCheckResult.CheckStatus.COMPLETED)
                    .issuesCount(3)
                    .issues(mockIssues)
                    .build();
            
            return ResponseEntity.ok(mockResult);
            
        } catch (Exception e) {
            log.error("Error fetching check results: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching results: " + e.getMessage());
        }
    }
    
    /**
     * Apply fixes to a PDF based on preflight results
     */
    @PostMapping("/fix/{checkId}")
    public ResponseEntity<?> applyFixes(
            @PathVariable UUID checkId,
            @RequestParam("userId") UUID userId) {
        
        try {
            log.info("Received request to apply fixes for check ID: {}", checkId);
            
            // In a real implementation, this would submit a job to the queue
            // For now, we just return a response
            
            UUID fixJobId = UUID.randomUUID();
            return ResponseEntity.accepted().body(new FixJobResponse(fixJobId, checkId, userId, "pending"));
            
        } catch (Exception e) {
            log.error("Error submitting fix job: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error submitting fix job: " + e.getMessage());
        }
    }
    
    /**
     * Get annotated PDF with issues highlighted
     */
    @GetMapping("/annotated/{checkId}")
    public ResponseEntity<?> getAnnotatedPdf(@PathVariable UUID checkId) {
        try {
            log.info("Fetching annotated PDF for check ID: {}", checkId);
            
            // In a real implementation, this would fetch the annotated PDF from storage
            // and return it as a download
            
            return ResponseEntity.ok("Annotated PDF would be returned here");
            
        } catch (Exception e) {
            log.error("Error fetching annotated PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching annotated PDF: " + e.getMessage());
        }
    }
    
    /**
     * Download fixed PDF
     */
    @GetMapping("/fixed/{fixId}")
    public ResponseEntity<?> getFixedPdf(@PathVariable UUID fixId) {
        try {
            log.info("Fetching fixed PDF for fix ID: {}", fixId);
            
            // In a real implementation, this would fetch the fixed PDF from storage
            // and return it as a download
            
            return ResponseEntity.ok("Fixed PDF would be returned here");
            
        } catch (Exception e) {
            log.error("Error fetching fixed PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching fixed PDF: " + e.getMessage());
        }
    }
    
    /**
     * Response class for preflight job submission
     */
    private static class PreflightJobResponse {
        private final UUID jobId;
        private final UUID userId;
        private final String fileName;
        private final String status;
        
        public PreflightJobResponse(UUID jobId, UUID userId, String fileName, String status) {
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
     * Response class for fix job submission
     */
    private static class FixJobResponse {
        private final UUID fixJobId;
        private final UUID checkId;
        private final UUID userId;
        private final String status;
        
        public FixJobResponse(UUID fixJobId, UUID checkId, UUID userId, String status) {
            this.fixJobId = fixJobId;
            this.checkId = checkId;
            this.userId = userId;
            this.status = status;
        }
        
        public UUID getFixJobId() {
            return fixJobId;
        }
        
        public UUID getCheckId() {
            return checkId;
        }
        
        public UUID getUserId() {
            return userId;
        }
        
        public String getStatus() {
            return status;
        }
    }
}
