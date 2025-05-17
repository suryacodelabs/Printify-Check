
package com.printifycheck.pdf.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.printifycheck.pdf.utils.MuPdfUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/mupdf")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MuPdfController {

    private final MuPdfUtils muPdfUtils;
    private final ObjectMapper objectMapper;
    
    /**
     * Get basic document information
     */
    @PostMapping("/info")
    public ResponseEntity<?> getDocumentInfo(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Getting document info for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Get document info
            Map<String, Object> docInfo = muPdfUtils.getDocumentInfo(tempFile.toString());
            
            // Clean up temp file
            Files.deleteIfExists(tempFile);
            
            return ResponseEntity.ok(docInfo);
        } catch (Exception e) {
            log.error("Error getting document info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting document information: " + e.getMessage());
        }
    }
    
    /**
     * Get document fonts
     */
    @PostMapping("/fonts")
    public ResponseEntity<?> getFonts(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Getting font info for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Get font info
            List<Map<String, Object>> fontInfo = muPdfUtils.getFonts(tempFile.toString());
            
            // Clean up temp file
            Files.deleteIfExists(tempFile);
            
            return ResponseEntity.ok(fontInfo);
        } catch (Exception e) {
            log.error("Error getting font info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting font information: " + e.getMessage());
        }
    }
    
    /**
     * Get document color spaces
     */
    @PostMapping("/colorspaces")
    public ResponseEntity<?> getColorSpaces(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Getting color space info for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Get color space info
            List<Map<String, Object>> colorSpaceInfo = muPdfUtils.getColorSpaces(tempFile.toString());
            
            // Clean up temp file
            Files.deleteIfExists(tempFile);
            
            return ResponseEntity.ok(colorSpaceInfo);
        } catch (Exception e) {
            log.error("Error getting color space info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting color space information: " + e.getMessage());
        }
    }
    
    /**
     * Get document structure
     */
    @PostMapping("/structure")
    public ResponseEntity<?> getDocumentStructure(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Getting structure info for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Get structure info
            List<Map<String, Object>> structureInfo = muPdfUtils.getDocumentStructure(tempFile.toString());
            
            // Clean up temp file
            Files.deleteIfExists(tempFile);
            
            return ResponseEntity.ok(structureInfo);
        } catch (Exception e) {
            log.error("Error getting structure info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting document structure: " + e.getMessage());
        }
    }
    
    /**
     * Get page information
     */
    @PostMapping("/page/{pageNum}/info")
    public ResponseEntity<?> getPageInfo(
            @RequestParam("file") MultipartFile file,
            @PathVariable("pageNum") int pageNum) {
        try {
            log.info("Getting page info for file: {}, page: {}", file.getOriginalFilename(), pageNum);
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Get page info
            Map<String, Object> pageInfo = muPdfUtils.getPageInfo(tempFile.toString(), pageNum);
            
            // Clean up temp file
            Files.deleteIfExists(tempFile);
            
            return ResponseEntity.ok(pageInfo);
        } catch (Exception e) {
            log.error("Error getting page info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting page information: " + e.getMessage());
        }
    }
    
    /**
     * Repair PDF structure
     */
    @PostMapping("/repair")
    public ResponseEntity<?> repairPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "options", required = false) String optionsJson) {
        try {
            log.info("Repairing structure for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Parse options
            Map<String, Boolean> options = optionsJson != null ? 
                    objectMapper.readValue(optionsJson, Map.class) : 
                    new HashMap<>();
            
            // Repair document
            Path outputPath = Paths.get(
                    System.getProperty("java.io.tmpdir"),
                    UUID.randomUUID().toString() + "-repaired.pdf");
            
            muPdfUtils.repairPdfStructure(tempFile.toString(), outputPath.toString(), options);
            
            // Return the repaired PDF
            byte[] pdfBytes = Files.readAllBytes(outputPath);
            
            // Clean up temp files
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(outputPath);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "repaired.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error repairing PDF: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error repairing PDF structure: " + e.getMessage());
        }
    }
    
    /**
     * Embed missing fonts
     */
    @PostMapping("/embed-fonts")
    public ResponseEntity<?> embedFonts(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "options", required = false) String optionsJson) {
        try {
            log.info("Embedding fonts for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Parse options
            Map<String, Object> options = optionsJson != null ? 
                    objectMapper.readValue(optionsJson, Map.class) : 
                    new HashMap<>();
            
            // Process document
            Path outputPath = Paths.get(
                    System.getProperty("java.io.tmpdir"),
                    UUID.randomUUID().toString() + "-fonts-embedded.pdf");
            
            muPdfUtils.embedFonts(tempFile.toString(), outputPath.toString(), options);
            
            // Return the processed PDF
            byte[] pdfBytes = Files.readAllBytes(outputPath);
            
            // Clean up temp files
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(outputPath);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "fonts-embedded.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error embedding fonts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error embedding fonts: " + e.getMessage());
        }
    }
    
    /**
     * Convert color spaces
     */
    @PostMapping("/convert-colorspace")
    public ResponseEntity<?> convertColorSpace(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "options", required = false) String optionsJson) {
        try {
            log.info("Converting color space for file: {}", file.getOriginalFilename());
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Parse options
            Map<String, Object> options = optionsJson != null ? 
                    objectMapper.readValue(optionsJson, Map.class) : 
                    new HashMap<>();
            
            // Process document
            Path outputPath = Paths.get(
                    System.getProperty("java.io.tmpdir"),
                    UUID.randomUUID().toString() + "-color-converted.pdf");
            
            muPdfUtils.convertColorSpace(tempFile.toString(), outputPath.toString(), options);
            
            // Return the processed PDF
            byte[] pdfBytes = Files.readAllBytes(outputPath);
            
            // Clean up temp files
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(outputPath);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "color-converted.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error converting color space: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error converting color space: " + e.getMessage());
        }
    }
    
    /**
     * Flatten transparency
     */
    @PostMapping("/flatten-transparency")
    public ResponseEntity<?> flattenTransparency(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "quality", defaultValue = "high") String quality) {
        try {
            log.info("Flattening transparency for file: {}, quality: {}", file.getOriginalFilename(), quality);
            
            // Save temporary file
            Path tempFile = saveTempFile(file);
            
            // Process document
            Path outputPath = Paths.get(
                    System.getProperty("java.io.tmpdir"),
                    UUID.randomUUID().toString() + "-flattened.pdf");
            
            muPdfUtils.flattenTransparency(tempFile.toString(), outputPath.toString(), quality);
            
            // Return the processed PDF
            byte[] pdfBytes = Files.readAllBytes(outputPath);
            
            // Clean up temp files
            Files.deleteIfExists(tempFile);
            Files.deleteIfExists(outputPath);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "transparency-flattened.pdf");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error flattening transparency: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error flattening transparency: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to save a temporary file
     */
    private Path saveTempFile(MultipartFile file) throws Exception {
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "mupdf-processing");
        Files.createDirectories(tempDir);
        
        Path tempFile = tempDir.resolve(UUID.randomUUID() + "-" + file.getOriginalFilename());
        file.transferTo(tempFile.toFile());
        
        return tempFile;
    }
}
