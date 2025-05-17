
package com.printifycheck.api;

import com.printifycheck.ocr.OcrService;
import com.printifycheck.queue.JobQueueService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OcrController {

    private final OcrService ocrService;
    private final JobQueueService jobQueueService;
    
    private static final Set<String> SUPPORTED_FILE_TYPES = new HashSet<>(Arrays.asList(
        "application/pdf", "image/jpeg", "image/jpg", "image/png", "image/tiff", "image/bmp", "image/heic"
    ));
    
    private static final Set<String> SUPPORTED_LANGUAGES = new HashSet<>(Arrays.asList(
        "eng", "fra", "deu", "spa", "ita", "chi_sim", "chi_tra", "jpn", "rus", "ara", 
        "hin", "kor", "por", "nld", "swe", "fin", "dan", "nor", "pol", "tur",
        "ces", "slk", "ron", "bul", "hrv", "ell", "lav", "lit", "hun", "ukr"
    ));
    
    private static final long MAX_FILE_SIZE = 104857600L; // 100 MB

    /**
     * Process a PDF file with OCR
     */
    @PostMapping("/process")
    public ResponseEntity<?> processWithOcr(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam(value = "languages", defaultValue = "eng") List<String> languages,
            @RequestParam(value = "pdfA", defaultValue = "false") boolean pdfA,
            @RequestParam(value = "pdfAVersion", required = false) String pdfAVersion,
            @RequestParam(value = "dpi", defaultValue = "300") Integer dpi,
            @RequestParam(value = "quality", defaultValue = "high") String quality,
            @RequestParam(value = "imageType", defaultValue = "auto") String imageType,
            @RequestParam(value = "pageRanges", required = false) String pageRanges,
            @RequestParam(value = "ocrMode", defaultValue = "text") String ocrMode,
            @RequestParam(value = "detectOrientation", defaultValue = "true") boolean detectOrientation,
            @RequestParam(value = "enhanceImage", defaultValue = "true") boolean enhanceImage) {
        
        try {
            log.info("Received request to process PDF with OCR: {}, size: {}, PDF/A: {}, DPI: {}, Quality: {}, Languages: {}",
                     file.getOriginalFilename(), file.getSize(), pdfA, dpi, quality, languages);
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !SUPPORTED_FILE_TYPES.contains(contentType.toLowerCase())) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Unsupported file type", 
                          "supported", SUPPORTED_FILE_TYPES)
                );
            }
            
            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "File size exceeds 100MB limit", 
                          "maxSize", MAX_FILE_SIZE)
                );
            }
            
            // Validate languages
            List<String> validLanguages = languages.stream()
                .filter(SUPPORTED_LANGUAGES::contains)
                .collect(Collectors.toList());
            
            if (validLanguages.isEmpty()) {
                validLanguages.add("eng"); // Default to English if no valid languages
            }
            
            // Validate OCR settings
            int validDpi = Math.min(Math.max(dpi, 150), 600); // Between 150 and 600 DPI
            String validQuality = Arrays.asList("low", "medium", "high").contains(quality.toLowerCase()) 
                ? quality.toLowerCase() : "high";
                
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "_" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Create OCR configuration map
            Map<String, Object> ocrConfig = new HashMap<>();
            ocrConfig.put("languages", validLanguages);
            ocrConfig.put("pdfA", pdfA);
            ocrConfig.put("pdfAVersion", pdfAVersion);
            ocrConfig.put("dpi", validDpi);
            ocrConfig.put("quality", validQuality);
            ocrConfig.put("imageType", imageType);
            ocrConfig.put("pageRanges", pageRanges);
            ocrConfig.put("ocrMode", ocrMode);
            ocrConfig.put("detectOrientation", detectOrientation);
            ocrConfig.put("enhanceImage", enhanceImage);
            
            // Submit job to queue with priority
            UUID jobId = jobQueueService.submitOcrJob(
                filePath.toString(), 
                userId, 
                ocrConfig
            );
            
            // Return immediate response with job ID
            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("userId", userId);
            response.put("fileName", fileName);
            response.put("status", "pending");
            response.put("config", ocrConfig);
            
            return ResponseEntity.accepted().body(response);
            
        } catch (IOException e) {
            log.error("Error processing OCR request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing OCR request: " + e.getMessage()));
        }
    }
    
    /**
     * Process specific pages with OCR
     */
    @PostMapping("/process-pages")
    public ResponseEntity<?> processSpecificPagesWithOcr(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam("pageRanges") String pageRanges,
            @RequestParam(value = "languages", defaultValue = "eng") List<String> languages,
            @RequestParam(value = "dpi", defaultValue = "300") Integer dpi) {
        
        try {
            log.info("Received request to process specific pages with OCR: {}, pages: {}", 
                    file.getOriginalFilename(), pageRanges);
            
            // Validate file type and size
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are supported for page-specific OCR");
            }
            
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body("File size exceeds 100MB limit");
            }
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "_" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Validate languages
            List<String> validLanguages = languages.stream()
                .filter(SUPPORTED_LANGUAGES::contains)
                .collect(Collectors.toList());
            
            if (validLanguages.isEmpty()) {
                validLanguages.add("eng"); // Default to English if no valid languages
            }
            
            // Create OCR configuration map
            Map<String, Object> ocrConfig = new HashMap<>();
            ocrConfig.put("languages", validLanguages);
            ocrConfig.put("dpi", dpi);
            ocrConfig.put("pageRanges", pageRanges);
            ocrConfig.put("mode", "page_specific");
            
            // Submit job to queue
            UUID jobId = jobQueueService.submitOcrJob(
                filePath.toString(), 
                userId, 
                ocrConfig
            );
            
            // Return immediate response with job ID
            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("userId", userId);
            response.put("fileName", fileName);
            response.put("pageRanges", pageRanges);
            response.put("status", "pending");
            
            return ResponseEntity.accepted().body(response);
            
        } catch (IOException e) {
            log.error("Error processing page-specific OCR request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing OCR request: " + e.getMessage()));
        }
    }
    
    /**
     * Extract text from a PDF using OCR
     */
    @PostMapping("/extract-text")
    public ResponseEntity<?> extractTextWithOcr(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam(value = "languages", defaultValue = "eng") List<String> languages,
            @RequestParam(value = "withLayout", defaultValue = "false") boolean withLayout) {
        
        try {
            log.info("Received request to extract text with OCR: {}, withLayout: {}", 
                    file.getOriginalFilename(), withLayout);
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "_" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Validate languages
            List<String> validLanguages = languages.stream()
                .filter(SUPPORTED_LANGUAGES::contains)
                .collect(Collectors.toList());
            
            if (validLanguages.isEmpty()) {
                validLanguages.add("eng"); // Default to English if no valid languages
            }
            
            // Create OCR configuration map
            Map<String, Object> ocrConfig = new HashMap<>();
            ocrConfig.put("languages", validLanguages);
            ocrConfig.put("withLayout", withLayout);
            ocrConfig.put("mode", "extract_text");
            
            // Submit job to queue
            UUID jobId = jobQueueService.submitOcrJob(
                filePath.toString(), 
                userId, 
                ocrConfig
            );
            
            // Return immediate response with job ID
            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("userId", userId);
            response.put("fileName", fileName);
            response.put("withLayout", withLayout);
            response.put("status", "pending");
            
            return ResponseEntity.accepted().body(response);
            
        } catch (IOException e) {
            log.error("Error processing text extraction with OCR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing text extraction: " + e.getMessage()));
        }
    }
    
    /**
     * Get OCR job status and result
     */
    @GetMapping("/status/{jobId}")
    public ResponseEntity<?> getOcrJobStatus(@PathVariable UUID jobId) {
        try {
            log.info("Fetching status for OCR job: {}", jobId);
            
            // In a real implementation, this would query job status from the database
            // For this example, we'll return a mock response
            
            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("status", "completed");
            response.put("outputFile", "sample_ocr.pdf");
            response.put("progress", 100);
            response.put("processingTimeMs", 12500);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching OCR job status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching job status: " + e.getMessage()));
        }
    }
    
    /**
     * Download OCR-processed PDF
     */
    @GetMapping("/download/{jobId}")
    public ResponseEntity<?> downloadOcrPdf(@PathVariable UUID jobId) {
        try {
            log.info("Download request for OCR job: {}", jobId);
            
            // In a real implementation, this would fetch the OCR-processed PDF
            // and return it as a download
            
            // For now, we'll return a placeholder response
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header("Content-Disposition", "attachment; filename=\"ocr_processed.pdf\"")
                    .body("OCR-processed PDF would be returned here".getBytes());
            
        } catch (Exception e) {
            log.error("Error downloading OCR PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error downloading OCR PDF: " + e.getMessage()));
        }
    }
    
    /**
     * Extract text from a PDF using OCR
     */
    @GetMapping("/extract-text/{jobId}")
    public ResponseEntity<?> extractText(@PathVariable UUID jobId) {
        try {
            log.info("Text extraction request for OCR job: {}", jobId);
            
            // In a real implementation, this would fetch the extracted text
            // For now, we'll return a placeholder response
            Map<String, Object> extractedText = new HashMap<>();
            extractedText.put("jobId", jobId);
            extractedText.put("text", "Sample extracted text from the OCR-processed PDF...");
            extractedText.put("pageCount", 5);
            extractedText.put("wordCount", 1250);
            
            return ResponseEntity.ok(extractedText);
            
        } catch (Exception e) {
            log.error("Error extracting text: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error extracting text: " + e.getMessage()));
        }
    }
    
    /**
     * Get supported OCR languages
     */
    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getSupportedLanguages() {
        Map<String, Object> response = new HashMap<>();
        response.put("languages", SUPPORTED_LANGUAGES);
        
        // Add language names for UI display
        Map<String, String> languageNames = new HashMap<>();
        languageNames.put("eng", "English");
        languageNames.put("fra", "French");
        languageNames.put("deu", "German");
        languageNames.put("spa", "Spanish");
        languageNames.put("ita", "Italian");
        languageNames.put("chi_sim", "Chinese (Simplified)");
        languageNames.put("chi_tra", "Chinese (Traditional)");
        languageNames.put("jpn", "Japanese");
        languageNames.put("rus", "Russian");
        languageNames.put("ara", "Arabic");
        languageNames.put("hin", "Hindi");
        languageNames.put("kor", "Korean");
        languageNames.put("por", "Portuguese");
        languageNames.put("nld", "Dutch");
        languageNames.put("swe", "Swedish");
        languageNames.put("fin", "Finnish");
        languageNames.put("dan", "Danish");
        languageNames.put("nor", "Norwegian");
        languageNames.put("pol", "Polish");
        languageNames.put("tur", "Turkish");
        languageNames.put("ces", "Czech");
        languageNames.put("slk", "Slovak");
        languageNames.put("ron", "Romanian");
        languageNames.put("bul", "Bulgarian");
        languageNames.put("hrv", "Croatian");
        languageNames.put("ell", "Greek");
        languageNames.put("lav", "Latvian");
        languageNames.put("lit", "Lithuanian");
        languageNames.put("hun", "Hungarian");
        languageNames.put("ukr", "Ukrainian");
        
        response.put("languageNames", languageNames);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Advanced OCR with custom options
     */
    @PostMapping("/advanced")
    public ResponseEntity<?> performAdvancedOcr(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId,
            @RequestParam(value = "outputType", defaultValue = "pdf") String outputType,
            @RequestParam(value = "languages", defaultValue = "eng") List<String> languages,
            @RequestParam(value = "dpi", defaultValue = "300") Integer dpi,
            @RequestParam(value = "psmMode", required = false) Integer psmMode,
            @RequestParam(value = "ocrMode", required = false) String ocrMode,
            @RequestParam(value = "enhanceContrast", required = false) Double enhanceContrast,
            @RequestParam(value = "customParameters", required = false) String customParameters) {
        
        try {
            log.info("Received request for advanced OCR: {}, outputType: {}", 
                    file.getOriginalFilename(), outputType);
            
            // Save file to disk
            String fileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
            Files.createDirectories(uploadPath);
            
            Path filePath = uploadPath.resolve(UUID.randomUUID() + "_" + fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Parse custom parameters if provided
            Map<String, String> tessParams = new HashMap<>();
            if (customParameters != null && !customParameters.isEmpty()) {
                String[] params = customParameters.split(";");
                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2) {
                        tessParams.put(keyValue[0].trim(), keyValue[1].trim());
                    }
                }
            }
            
            // Create advanced OCR configuration
            Map<String, Object> advancedConfig = new HashMap<>();
            advancedConfig.put("languages", languages);
            advancedConfig.put("dpi", dpi);
            advancedConfig.put("outputType", outputType);
            
            if (psmMode != null) {
                advancedConfig.put("psmMode", psmMode);
            }
            
            if (ocrMode != null) {
                advancedConfig.put("ocrMode", ocrMode);
            }
            
            if (enhanceContrast != null) {
                advancedConfig.put("enhanceContrast", enhanceContrast);
            }
            
            if (!tessParams.isEmpty()) {
                advancedConfig.put("tessParams", tessParams);
            }
            
            // Submit job to queue
            UUID jobId = jobQueueService.submitOcrJob(
                filePath.toString(), 
                userId, 
                advancedConfig
            );
            
            // Return immediate response with job ID
            Map<String, Object> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("userId", userId);
            response.put("fileName", fileName);
            response.put("outputType", outputType);
            response.put("status", "pending");
            response.put("config", advancedConfig);
            
            return ResponseEntity.accepted().body(response);
            
        } catch (IOException e) {
            log.error("Error processing advanced OCR request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error processing advanced OCR request: " + e.getMessage()));
        }
    }
}
