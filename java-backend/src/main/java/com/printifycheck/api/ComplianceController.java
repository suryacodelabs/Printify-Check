
package com.printifycheck.api;

import com.printifycheck.pdf.fixers.VeraPdfFixer;
import com.printifycheck.pdf.validators.VeraPdfValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.verapdf.pdfa.flavours.PDFAFlavour;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ComplianceController {
    
    private final VeraPdfValidator veraPdfValidator;
    private final VeraPdfFixer veraPdfFixer;
    
    @PostMapping("/validate/pdfa")
    public ResponseEntity<?> validatePdfA(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "flavour", defaultValue = "1b") String flavour) {
        
        try {
            // Save file to disk
            Path filePath = saveFile(file);
            
            // Determine PDF/A flavour
            PDFAFlavour pdfaFlavour = mapStringToPdfaFlavour(flavour);
            
            // Validate PDF/A
            var issues = veraPdfValidator.validatePdfA(filePath.toString(), pdfaFlavour);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("issues", issues);
            response.put("isCompliant", issues.isEmpty());
            response.put("flavour", pdfaFlavour.toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error validating PDF/A: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error validating PDF/A: " + e.getMessage());
        }
    }
    
    @PostMapping("/validate/pdfua")
    public ResponseEntity<?> validatePdfUA(@RequestParam("file") MultipartFile file) {
        try {
            // Save file to disk
            Path filePath = saveFile(file);
            
            // Validate PDF/UA
            var issues = veraPdfValidator.validatePdfUA(filePath.toString());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("issues", issues);
            response.put("isCompliant", issues.isEmpty());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error validating PDF/UA: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error validating PDF/UA: " + e.getMessage());
        }
    }
    
    @PostMapping("/validate/wcag")
    public ResponseEntity<?> validateWcag(@RequestParam("file") MultipartFile file) {
        try {
            // Save file to disk
            Path filePath = saveFile(file);
            
            // Validate WCAG
            var issues = veraPdfValidator.validateWcag(filePath.toString());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("issues", issues);
            response.put("isCompliant", issues.isEmpty());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error validating WCAG: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error validating WCAG: " + e.getMessage());
        }
    }
    
    @PostMapping("/fix/convert-to-pdfa")
    public ResponseEntity<?> convertToPdfA(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "flavour", defaultValue = "1b") String flavour) {
        
        try {
            // Save input file to disk
            Path inputPath = saveFile(file);
            
            // Create output file path
            String outputFileName = "pdfa-" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path outputPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "fixed", outputFileName);
            Files.createDirectories(outputPath.getParent());
            
            // Determine PDF/A flavour
            PDFAFlavour pdfaFlavour = mapStringToPdfaFlavour(flavour);
            
            // Convert to PDF/A
            boolean success = veraPdfFixer.convertToPdfA(inputPath.toString(), outputPath.toString(), pdfaFlavour);
            
            if (success) {
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Successfully converted to PDF/A");
                response.put("outputPath", outputPath.toString());
                response.put("flavour", pdfaFlavour.toString());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to convert to PDF/A");
            }
            
        } catch (Exception e) {
            log.error("Error converting to PDF/A: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error converting to PDF/A: " + e.getMessage());
        }
    }
    
    @PostMapping("/fix/sanitize-metadata")
    public ResponseEntity<?> sanitizeMetadata(@RequestParam("file") MultipartFile file) {
        try {
            // Save input file to disk
            Path inputPath = saveFile(file);
            
            // Create output file path
            String outputFileName = "sanitized-" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path outputPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "fixed", outputFileName);
            Files.createDirectories(outputPath.getParent());
            
            // Sanitize metadata
            boolean success = veraPdfFixer.sanitizeMetadata(inputPath.toString(), outputPath.toString());
            
            if (success) {
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Successfully sanitized metadata");
                response.put("outputPath", outputPath.toString());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to sanitize metadata");
            }
            
        } catch (Exception e) {
            log.error("Error sanitizing metadata: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sanitizing metadata: " + e.getMessage());
        }
    }
    
    /**
     * Saves a MultipartFile to disk
     * 
     * @param file MultipartFile to save
     * @return Path to the saved file
     * @throws IOException If an I/O error occurs
     */
    private Path saveFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "uploads");
        Files.createDirectories(uploadPath);
        
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        return filePath;
    }
    
    /**
     * Maps a string representation of a PDF/A flavour to a PDFAFlavour enum
     * 
     * @param flavour String representation of the flavour (e.g., "1b", "2a")
     * @return PDFAFlavour enum
     */
    private PDFAFlavour mapStringToPdfaFlavour(String flavour) {
        switch (flavour.toLowerCase()) {
            case "1a":
                return PDFAFlavour.PDFA_1_A;
            case "1b":
                return PDFAFlavour.PDFA_1_B;
            case "2a":
                return PDFAFlavour.PDFA_2_A;
            case "2b":
                return PDFAFlavour.PDFA_2_B;
            case "2u":
                return PDFAFlavour.PDFA_2_U;
            case "3a":
                return PDFAFlavour.PDFA_3_A;
            case "3b":
                return PDFAFlavour.PDFA_3_B;
            case "3u":
                return PDFAFlavour.PDFA_3_U;
            case "4":
                return PDFAFlavour.PDFA_4;
            case "4e":
                return PDFAFlavour.PDFA_4_E;
            case "4f":
                return PDFAFlavour.PDFA_4_F;
            default:
                return PDFAFlavour.PDFA_1_B; // Default to PDF/A-1b
        }
    }
}
