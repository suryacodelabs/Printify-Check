
package com.printifycheck.api;

import com.printifycheck.api.enums.ValidationLevel;
import com.printifycheck.model.PdfIssue;
import com.printifycheck.pdf.fixers.VeraPdfFixer;
import com.printifycheck.pdf.fixers.VeraPdfTagFixer;
import com.printifycheck.pdf.validators.VeraPdfProfileValidator;
import com.printifycheck.pdf.validators.VeraPdfTagValidator;
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
import java.util.*;

@RestController
@RequestMapping("/api/compliance/extended")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ComplianceExtendedController {
    
    private final VeraPdfValidator veraPdfValidator;
    private final VeraPdfProfileValidator veraPdfProfileValidator;
    private final VeraPdfTagValidator veraPdfTagValidator;
    private final VeraPdfFixer veraPdfFixer;
    private final VeraPdfTagFixer veraPdfTagFixer;
    
    @PostMapping("/validate/multi-level")
    public ResponseEntity<?> validateMultiLevel(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "levels", required = false) List<String> levels) {
        
        try {
            // Save file to disk
            Path filePath = saveFile(file);
            
            // If no specific levels provided, check all common ones
            if (levels == null || levels.isEmpty()) {
                levels = Arrays.asList("PDFA_1B", "PDFUA_1", "WCAG_2_1_AA");
            }
            
            Map<String, Object> response = new HashMap<>();
            Map<String, Object> results = new HashMap<>();
            boolean isCompliant = true;
            
            // Validate against each requested level
            for (String levelStr : levels) {
                try {
                    ValidationLevel level = ValidationLevel.valueOf(levelStr);
                    Map<String, Object> levelResult = validateSingleLevel(filePath.toString(), level);
                    
                    results.put(levelStr, levelResult);
                    
                    // Update overall compliance status
                    if (levelResult.containsKey("isCompliant") && !(boolean)levelResult.get("isCompliant")) {
                        isCompliant = false;
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid validation level: {}", levelStr);
                }
            }
            
            response.put("results", results);
            response.put("isCompliant", isCompliant);
            response.put("fileName", file.getOriginalFilename());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during multi-level validation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during multi-level validation: " + e.getMessage());
        }
    }
    
    @PostMapping("/tag-structure")
    public ResponseEntity<?> validateTagStructure(@RequestParam("file") MultipartFile file) {
        try {
            // Save file to disk
            Path filePath = saveFile(file);
            
            // Validate tag structure
            List<PdfIssue> issues = veraPdfTagValidator.validateTagStructure(filePath.toString());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("issues", issues);
            response.put("isAccessible", issues.isEmpty());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error validating tag structure: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error validating tag structure: " + e.getMessage());
        }
    }
    
    @PostMapping("/fix/enhance-accessibility")
    public ResponseEntity<?> enhanceAccessibility(@RequestParam("file") MultipartFile file) {
        try {
            // Save input file to disk
            Path inputPath = saveFile(file);
            
            // Create output file path
            String outputFileName = "accessible-" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path outputPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "fixed", outputFileName);
            Files.createDirectories(outputPath.getParent());
            
            // Enhance accessibility
            boolean success = veraPdfTagFixer.enhanceAccessibility(inputPath.toString(), outputPath.toString());
            
            if (success) {
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Successfully enhanced accessibility");
                response.put("outputPath", outputPath.toString());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to enhance accessibility");
            }
            
        } catch (Exception e) {
            log.error("Error enhancing accessibility: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error enhancing accessibility: " + e.getMessage());
        }
    }
    
    @PostMapping("/fix/add-language")
    public ResponseEntity<?> addLanguageSpecification(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        
        try {
            // Save input file to disk
            Path inputPath = saveFile(file);
            
            // Create output file path
            String outputFileName = "language-" + UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path outputPath = Paths.get(System.getProperty("java.io.tmpdir"), "printify-check", "fixed", outputFileName);
            Files.createDirectories(outputPath.getParent());
            
            // Add language specification
            boolean success = veraPdfTagFixer.addLanguageSpecification(inputPath.toString(), outputPath.toString(), language);
            
            if (success) {
                // Create response
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Successfully added language specification: " + language);
                response.put("outputPath", outputPath.toString());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to add language specification");
            }
            
        } catch (Exception e) {
            log.error("Error adding language specification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding language specification: " + e.getMessage());
        }
    }
    
    /**
     * Validates a PDF file against a specific validation level
     * 
     * @param pdfPath Path to the PDF file
     * @param level Validation level
     * @return Map containing validation results
     */
    private Map<String, Object> validateSingleLevel(String pdfPath, ValidationLevel level) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<PdfIssue> issues;
            
            switch (level) {
                case PDFA_1B:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_1_B);
                    break;
                case PDFA_1A:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_1_A);
                    break;
                case PDFA_2B:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_2_B);
                    break;
                case PDFA_2A:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_2_A);
                    break;
                case PDFA_3B:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_3_B);
                    break;
                case PDFA_3A:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_3_A);
                    break;
                case PDFA_4:
                    issues = veraPdfValidator.validatePdfA(pdfPath, PDFAFlavour.PDFA_4);
                    break;
                case PDFUA_1:
                    issues = veraPdfValidator.validatePdfUA(pdfPath);
                    break;
                case PDFVT_1:
                    issues = veraPdfProfileValidator.validateWithProfile(pdfPath, "pdfvt-1");
                    break;
                case PDFX_1A:
                    issues = veraPdfProfileValidator.validateWithProfile(pdfPath, "pdfx-1a");
                    break;
                case PDFX_4:
                    issues = veraPdfProfileValidator.validateWithProfile(pdfPath, "pdfx-4");
                    break;
                case WCAG_2_1_AA:
                    issues = veraPdfValidator.validateWcag(pdfPath);
                    break;
                default:
                    issues = new ArrayList<>();
                    break;
            }
            
            result.put("issues", issues);
            result.put("isCompliant", issues.isEmpty());
            result.put("level", level.name());
            
        } catch (Exception e) {
            log.error("Error validating at level {}: {}", level, e.getMessage(), e);
            result.put("error", e.getMessage());
            result.put("isCompliant", false);
        }
        
        return result;
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
}
