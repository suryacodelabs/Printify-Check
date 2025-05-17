
package com.printifycheck.queue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printifycheck.entity.Job;
import com.printifycheck.entity.PdfCheckEntity;
import com.printifycheck.model.PdfCheckResult;
import com.printifycheck.ocr.OcrService;
import com.printifycheck.pdf.PreflightService;
import com.printifycheck.redaction.RedactionService;
import com.printifycheck.repository.JobRepository;
import com.printifycheck.repository.PdfCheckRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobQueueService {

    private final PreflightService preflightService;
    private final OcrService ocrService;
    private final RedactionService redactionService;
    private final JobRepository jobRepository;
    private final PdfCheckRepository pdfCheckRepository;
    private final ObjectMapper objectMapper;
    
    // Track running jobs and their status
    private final ConcurrentHashMap<UUID, JobStatus> jobStatusMap = new ConcurrentHashMap<>();
    
    @Value("${job.queue.max-concurrent-jobs:4}")
    private int maxConcurrentJobs;
    
    /**
     * Submit a preflight job to the queue
     */
    @Async
    public CompletableFuture<PdfCheckResult> submitPreflightJob(String filePath, UUID userId) {
        UUID jobId = UUID.randomUUID();
        log.info("Submitting preflight job: {}, Job ID: {}", filePath, jobId);
        
        // Create job record in PostgreSQL
        createJobRecord(JobType.PREFLIGHT, jobId, filePath, userId);
        
        // Process the job asynchronously
        return CompletableFuture.supplyAsync(() -> {
            try {
                updateJobStatus(jobId, "processing");
                
                // Perform the preflight check
                PdfCheckResult result = preflightService.performPreflightCheck(filePath, userId);
                
                // Create annotated PDF
                String annotatedFilePath = preflightService.createAnnotatedPdf(filePath, result.getIssues());
                
                // Update job with result
                updateJobWithResults(jobId, result, annotatedFilePath);
                
                return result;
            } catch (Exception e) {
                log.error("Error processing preflight job: {}", e.getMessage(), e);
                updateJobStatus(jobId, "failed");
                throw new RuntimeException("Preflight job failed", e);
            }
        });
    }
    
    /**
     * Submit an OCR job to the queue
     */
    @Async
    public CompletableFuture<String> submitOcrJob(String filePath, UUID userId, boolean pdfA) {
        UUID jobId = UUID.randomUUID();
        log.info("Submitting OCR job: {}, PDF/A: {}, Job ID: {}", filePath, pdfA, jobId);
        
        // Create job record in PostgreSQL
        createJobRecord(JobType.OCR, jobId, filePath, userId);
        
        // Process the job asynchronously
        return CompletableFuture.supplyAsync(() -> {
            try {
                updateJobStatus(jobId, "processing");
                
                // Perform OCR
                String outputFilePath;
                if (pdfA) {
                    outputFilePath = ocrService.performOcrWithPdfA(filePath);
                } else {
                    outputFilePath = ocrService.performOcr(filePath);
                }
                
                // Extract text
                String extractedText = ocrService.extractTextFromPdf(outputFilePath);
                
                // Update job with result
                updateOcrJobWithResults(jobId, outputFilePath, extractedText);
                
                return outputFilePath;
            } catch (Exception e) {
                log.error("Error processing OCR job: {}", e.getMessage(), e);
                updateJobStatus(jobId, "failed");
                throw new RuntimeException("OCR job failed", e);
            }
        });
    }
    
    /**
     * Submit a redaction job to the queue
     */
    @Async
    public CompletableFuture<String> submitRedactionJob(String filePath, UUID userId, List<String> patterns) {
        UUID jobId = UUID.randomUUID();
        log.info("Submitting redaction job: {}, patterns: {}, Job ID: {}", filePath, patterns, jobId);
        
        // Create job record in PostgreSQL
        createJobRecord(JobType.REDACTION, jobId, filePath, userId);
        
        // Process the job asynchronously
        return CompletableFuture.supplyAsync(() -> {
            try {
                updateJobStatus(jobId, "processing");
                
                // Perform redaction
                String outputFilePath = redactionService.redactPdf(filePath, patterns);
                
                // Update job with result
                updateRedactionJobWithResults(jobId, outputFilePath);
                
                return outputFilePath;
            } catch (Exception e) {
                log.error("Error processing redaction job: {}", e.getMessage(), e);
                updateJobStatus(jobId, "failed");
                throw new RuntimeException("Redaction job failed", e);
            }
        });
    }
    
    /**
     * Submit a metadata stripping job to the queue
     */
    @Async
    public CompletableFuture<String> submitMetadataStrippingJob(String filePath, UUID userId) {
        UUID jobId = UUID.randomUUID();
        log.info("Submitting metadata stripping job: {}, Job ID: {}", filePath, jobId);
        
        // Create job record in PostgreSQL
        createJobRecord(JobType.METADATA_STRIPPING, jobId, filePath, userId);
        
        // Process the job asynchronously
        return CompletableFuture.supplyAsync(() -> {
            try {
                updateJobStatus(jobId, "processing");
                
                // Strip metadata
                String outputFilePath = redactionService.stripMetadata(filePath);
                
                // Update job with result
                updateRedactionJobWithResults(jobId, outputFilePath);
                
                return outputFilePath;
            } catch (Exception e) {
                log.error("Error processing metadata stripping job: {}", e.getMessage(), e);
                updateJobStatus(jobId, "failed");
                throw new RuntimeException("Metadata stripping job failed", e);
            }
        });
    }
    
    /**
     * Get job status
     */
    public JobStatus getJobStatus(UUID jobId) {
        return jobStatusMap.getOrDefault(jobId, new JobStatus("unknown", null));
    }
    
    /**
     * Create a job record in PostgreSQL
     */
    private void createJobRecord(JobType jobType, UUID jobId, String filePath, UUID userId) {
        try {
            // Store job in local tracking map
            jobStatusMap.put(jobId, new JobStatus("pending", null));
            
            // Create job entity and save to PostgreSQL
            Job job = Job.builder()
                .id(jobId)
                .userId(userId)
                .type(jobType.name())
                .filePath(filePath)
                .status("pending")
                .createdAt(OffsetDateTime.now())
                .build();
            
            jobRepository.save(job);
            
        } catch (Exception e) {
            log.error("Error creating job record in PostgreSQL: {}", e.getMessage(), e);
            // Continue processing even if PostgreSQL insertion fails
        }
    }
    
    /**
     * Update job status in PostgreSQL
     */
    private void updateJobStatus(UUID jobId, String status) {
        try {
            // Update local tracking map
            jobStatusMap.put(jobId, new JobStatus(status, null));
            
            // Update job status in PostgreSQL
            jobRepository.findById(jobId).ifPresent(job -> {
                job.setStatus(status);
                job.setUpdatedAt(OffsetDateTime.now());
                jobRepository.save(job);
                log.info("Updated job status: {}, status: {}", jobId, status);
            });
            
        } catch (Exception e) {
            log.error("Error updating job status in PostgreSQL: {}", e.getMessage(), e);
            // Continue processing even if PostgreSQL update fails
        }
    }
    
    /**
     * Update preflight job with results in PostgreSQL
     */
    private void updateJobWithResults(UUID jobId, PdfCheckResult result, String annotatedFilePath) {
        try {
            // Update local tracking map
            jobStatusMap.put(jobId, new JobStatus("completed", result));
            
            // Update job with results in PostgreSQL
            jobRepository.findById(jobId).ifPresent(job -> {
                job.setStatus("completed");
                try {
                    job.setResults(objectMapper.writeValueAsString(convertResultToMap(result)));
                } catch (JsonProcessingException e) {
                    log.error("Error converting result to JSON: {}", e.getMessage());
                }
                job.setAnnotatedFilePath(annotatedFilePath);
                job.setUpdatedAt(OffsetDateTime.now());
                jobRepository.save(job);
                log.info("Updated job with results: {}, issues: {}", jobId, result.getIssuesCount());
            });
            
        } catch (Exception e) {
            log.error("Error updating job results in PostgreSQL: {}", e.getMessage(), e);
            // Continue processing even if PostgreSQL update fails
        }
    }
    
    /**
     * Update OCR job with results in PostgreSQL
     */
    private void updateOcrJobWithResults(UUID jobId, String outputFilePath, String extractedText) {
        try {
            // Update job with results in PostgreSQL
            jobRepository.findById(jobId).ifPresent(job -> {
                job.setStatus("completed");
                job.setOutputFilePath(outputFilePath);
                job.setExtractedText(extractedText);
                job.setUpdatedAt(OffsetDateTime.now());
                jobRepository.save(job);
                log.info("Updated OCR job with results: {}, output: {}", jobId, outputFilePath);
            });
            
            // Update local tracking map
            jobStatusMap.put(jobId, new JobStatus("completed", null));
            
        } catch (Exception e) {
            log.error("Error updating OCR job results in PostgreSQL: {}", e.getMessage(), e);
            // Continue processing even if PostgreSQL update fails
        }
    }
    
    /**
     * Update redaction job with results in PostgreSQL
     */
    private void updateRedactionJobWithResults(UUID jobId, String outputFilePath) {
        try {
            // Update job with results in PostgreSQL
            jobRepository.findById(jobId).ifPresent(job -> {
                job.setStatus("completed");
                job.setOutputFilePath(outputFilePath);
                job.setUpdatedAt(OffsetDateTime.now());
                jobRepository.save(job);
                log.info("Updated redaction job with results: {}, output: {}", jobId, outputFilePath);
            });
            
            // Update local tracking map
            jobStatusMap.put(jobId, new JobStatus("completed", null));
            
        } catch (Exception e) {
            log.error("Error updating redaction job results in PostgreSQL: {}", e.getMessage(), e);
            // Continue processing even if PostgreSQL update fails
        }
    }
    
    /**
     * Convert PdfCheckResult to a Map for JSON storage
     */
    private Map<String, Object> convertResultToMap(PdfCheckResult result) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("id", result.getId().toString());
        resultMap.put("user_id", result.getUserId().toString());
        resultMap.put("file_name", result.getFileName());
        resultMap.put("file_size", result.getFileSize());
        resultMap.put("quality_score", result.getQualityScore());
        resultMap.put("status", result.getStatus().name());
        resultMap.put("issues_count", result.getIssuesCount());
        
        // Convert issues to maps
        List<Map<String, Object>> issuesList = result.getIssues().stream()
            .map(this::convertIssueToMap)
            .toList();
        
        resultMap.put("issues", issuesList);
        return resultMap;
    }
    
    /**
     * Convert PdfIssue to a Map for JSON storage
     */
    private Map<String, Object> convertIssueToMap(PdfIssue issue) {
        Map<String, Object> issueMap = new HashMap<>();
        issueMap.put("type", issue.getType());
        issueMap.put("severity", issue.getSeverity().name());
        issueMap.put("message", issue.getMessage());
        issueMap.put("page", issue.getPage());
        issueMap.put("auto_fixable", issue.isAutoFixable());
        issueMap.put("fix_description", issue.getFixDescription());
        
        if (issue.getLocation() != null) {
            Map<String, Object> locationMap = new HashMap<>();
            locationMap.put("x", issue.getLocation().getX());
            locationMap.put("y", issue.getLocation().getY());
            locationMap.put("width", issue.getLocation().getWidth());
            locationMap.put("height", issue.getLocation().getHeight());
            issueMap.put("location", locationMap);
        }
        
        return issueMap;
    }
    
    /**
     * Job type enum
     */
    private enum JobType {
        PREFLIGHT,
        OCR,
        REDACTION,
        METADATA_STRIPPING
    }
    
    /**
     * Job status class
     */
    public static class JobStatus {
        private final String status;
        private final PdfCheckResult result;
        
        public JobStatus(String status, PdfCheckResult result) {
            this.status = status;
            this.result = result;
        }
        
        public String getStatus() {
            return status;
        }
        
        public PdfCheckResult getResult() {
            return result;
        }
    }
}
