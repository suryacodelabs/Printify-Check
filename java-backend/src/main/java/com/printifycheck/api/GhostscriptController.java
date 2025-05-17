
package com.printifycheck.api;

import com.printifycheck.pdf.utils.PdfAdvancedUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/ghostscript")
@Slf4j
@RequiredArgsConstructor
public class GhostscriptController {

    private final PdfAdvancedUtils pdfAdvancedUtils;

    @GetMapping("/version")
    public ResponseEntity<Map<String, String>> getVersionInfo() {
        return ResponseEntity.ok(pdfAdvancedUtils.getGhostscriptVersionInfo());
    }

    @PostMapping("/optimize")
    public ResponseEntity<Resource> optimizePdf(@RequestParam("file") MultipartFile file,
                                               @RequestParam("quality") String quality) {
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("gs_optimize_");
            
            // Save uploaded file
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null ? 
                                   originalFileName.substring(originalFileName.lastIndexOf(".")) : ".pdf";
            Path inputPath = tempDir.resolve("input" + fileExtension);
            file.transferTo(inputPath.toFile());
            
            // Create output path
            Path outputPath = tempDir.resolve("optimized" + fileExtension);
            
            // Optimize PDF
            boolean success = pdfAdvancedUtils.optimizePdfWithGhostScript(
                inputPath.toString(), outputPath.toString(), quality);
            
            if (success) {
                // Read the output file
                byte[] pdfBytes = Files.readAllBytes(outputPath);
                
                // Clean up temporary files
                Files.deleteIfExists(inputPath);
                Files.deleteIfExists(outputPath);
                Files.deleteIfExists(tempDir);
                
                // Create resource from bytes
                ByteArrayResource resource = new ByteArrayResource(pdfBytes);
                
                // Build response
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"optimized_" + originalFileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error optimizing PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/convert-to-images")
    public ResponseEntity<Resource> convertToImages(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("format") String format,
                                                   @RequestParam("dpi") int dpi) {
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("gs_convert_");
            Path imagesDir = tempDir.resolve("images");
            Files.createDirectories(imagesDir);
            
            // Save uploaded file
            String originalFileName = file.getOriginalFilename();
            Path inputPath = tempDir.resolve("input.pdf");
            file.transferTo(inputPath.toFile());
            
            // Convert PDF to images
            List<String> imagePaths = pdfAdvancedUtils.convertPdfToImages(
                inputPath.toString(), imagesDir.toString(), format, dpi);
            
            if (!imagePaths.isEmpty()) {
                // Create zip file containing all images
                Path zipPath = tempDir.resolve("images.zip");
                try (ZipOutputStream zipOut = new ZipOutputStream(Files.newOutputStream(zipPath))) {
                    for (String imagePath : imagePaths) {
                        File imageFile = new File(imagePath);
                        Path imageFilePath = imageFile.toPath();
                        String zipEntryName = imageFile.getName();
                        
                        zipOut.putNextEntry(new ZipEntry(zipEntryName));
                        Files.copy(imageFilePath, zipOut);
                        zipOut.closeEntry();
                    }
                }
                
                // Read the zip file
                byte[] zipBytes = Files.readAllBytes(zipPath);
                
                // Clean up temporary files
                Files.walk(tempDir)
                     .sorted((a, b) -> b.compareTo(a)) // reverse order to delete files first, then dirs
                     .forEach(path -> {
                         try {
                             Files.deleteIfExists(path);
                         } catch (IOException e) {
                             log.warn("Failed to delete temporary file: {}", path, e);
                         }
                     });
                
                // Create resource from bytes
                ByteArrayResource resource = new ByteArrayResource(zipBytes);
                
                // Build response with filename derived from original PDF
                String filename = originalFileName != null ? 
                                  originalFileName.replace(".pdf", "") + "_images.zip" : 
                                  "images.zip";
                
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(zipBytes.length)
                    .body(resource);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error converting PDF to images: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/print-ready")
    public ResponseEntity<Resource> preparePrintReady(@RequestParam("file") MultipartFile file,
                                                    @RequestParam(required = false) boolean convertToCmyk,
                                                    @RequestParam(required = false) boolean preserveBlack,
                                                    @RequestParam(required = false) boolean flattenTransparency,
                                                    @RequestParam(required = false) boolean downsampleImages,
                                                    @RequestParam(required = false, defaultValue = "300") int resolution,
                                                    @RequestParam(required = false) boolean embedAllFonts,
                                                    @RequestParam(required = false, defaultValue = "printer") String quality) {
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("gs_print_");
            
            // Save uploaded file
            String originalFileName = file.getOriginalFilename();
            Path inputPath = tempDir.resolve("input.pdf");
            file.transferTo(inputPath.toFile());
            
            // Create output path
            Path outputPath = tempDir.resolve("print_ready.pdf");
            
            // Prepare options
            Map<String, Object> options = new HashMap<>();
            options.put("convertToCmyk", convertToCmyk);
            options.put("preserveBlack", preserveBlack);
            options.put("flattenTransparency", flattenTransparency);
            options.put("downsampleImages", downsampleImages);
            options.put("resolution", resolution);
            options.put("embedAllFonts", embedAllFonts);
            options.put("quality", quality);
            
            // Process PDF
            boolean success = pdfAdvancedUtils.preparePrintReadyPdf(
                inputPath.toString(), outputPath.toString(), options);
            
            if (success) {
                // Read the output file
                byte[] pdfBytes = Files.readAllBytes(outputPath);
                
                // Clean up temporary files
                Files.deleteIfExists(inputPath);
                Files.deleteIfExists(outputPath);
                Files.deleteIfExists(tempDir);
                
                // Create resource from bytes
                ByteArrayResource resource = new ByteArrayResource(pdfBytes);
                
                // Build response with filename derived from original PDF
                String filename = originalFileName != null ? 
                                  "print_" + originalFileName : 
                                  "print_ready.pdf";
                
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error preparing print-ready PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/add-bleed")
    public ResponseEntity<Resource> addBleed(@RequestParam("file") MultipartFile file,
                                           @RequestParam(defaultValue = "9") double bleedMargin) {
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("gs_bleed_");
            
            // Save uploaded file
            String originalFileName = file.getOriginalFilename();
            Path inputPath = tempDir.resolve("input.pdf");
            file.transferTo(inputPath.toFile());
            
            // Create output path
            Path outputPath = tempDir.resolve("with_bleed.pdf");
            
            // Add bleed
            boolean success = pdfAdvancedUtils.addBleedToPdf(
                inputPath.toString(), outputPath.toString(), bleedMargin);
            
            if (success) {
                // Read the output file
                byte[] pdfBytes = Files.readAllBytes(outputPath);
                
                // Clean up temporary files
                Files.deleteIfExists(inputPath);
                Files.deleteIfExists(outputPath);
                Files.deleteIfExists(tempDir);
                
                // Create resource from bytes
                ByteArrayResource resource = new ByteArrayResource(pdfBytes);
                
                // Build response with filename derived from original PDF
                String filename = originalFileName != null ? 
                                  "bleed_" + originalFileName : 
                                  "with_bleed.pdf";
                
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error adding bleed to PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/render")
    public ResponseEntity<Map<String, Object>> renderPdfPages(@RequestParam("file") MultipartFile file,
                                                            @RequestParam(defaultValue = "150") int dpi,
                                                            @RequestParam(defaultValue = "1") int maxPages) {
        try {
            // Create temporary directory
            Path tempDir = Files.createTempDirectory("gs_render_");
            Path imagesDir = tempDir.resolve("images");
            Files.createDirectories(imagesDir);
            
            // Save uploaded file
            Path inputPath = tempDir.resolve("input.pdf");
            file.transferTo(inputPath.toFile());
            
            // Render PDF pages
            List<BufferedImage> images = pdfAdvancedUtils.renderPdfWithGhostScript(
                inputPath.toString(), dpi);
            
            // Limit number of pages if needed
            if (maxPages > 0 && images.size() > maxPages) {
                images = images.subList(0, maxPages);
            }
            
            // Save images to disk and collect paths
            List<String> imagePaths = new ArrayList<>();
            for (int i = 0; i < images.size(); i++) {
                BufferedImage image = images.get(i);
                Path imagePath = imagesDir.resolve("page-" + (i + 1) + ".png");
                ImageIO.write(image, "PNG", imagePath.toFile());
                imagePaths.add(imagePath.toString());
            }
            
            // Create result map
            Map<String, Object> result = new HashMap<>();
            result.put("totalPages", images.size());
            result.put("renderedPages", imagePaths.size());
            result.put("dpi", dpi);
            
            // Convert image paths to Base64 for frontend display (simplified version)
            // In a production app, you'd likely store these and return URLs instead
            List<Map<String, Object>> pages = imagePaths.stream()
                .map(path -> {
                    Map<String, Object> page = new HashMap<>();
                    try {
                        byte[] imageBytes = Files.readAllBytes(Paths.get(path));
                        String base64 = java.util.Base64.getEncoder().encodeToString(imageBytes);
                        page.put("image", "data:image/png;base64," + base64);
                        page.put("page", imagePaths.indexOf(path) + 1);
                    } catch (IOException e) {
                        log.error("Error reading image file: {}", e.getMessage(), e);
                    }
                    return page;
                })
                .collect(Collectors.toList());
            
            result.put("pages", pages);
            
            // Clean up temporary files
            Files.walk(tempDir)
                 .sorted((a, b) -> b.compareTo(a))
                 .forEach(path -> {
                     try {
                         Files.deleteIfExists(path);
                     } catch (IOException e) {
                         log.warn("Failed to delete temporary file: {}", path, e);
                     }
                 });
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error rendering PDF pages: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
