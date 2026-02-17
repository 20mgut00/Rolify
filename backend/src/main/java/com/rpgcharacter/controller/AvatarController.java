package com.rpgcharacter.controller;

import com.rpgcharacter.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/avatars")
@CrossOrigin(origins = "*.vercel.app") // Permitir CORS para todas las fuentes (ajustar según sea necesario)
public class AvatarController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${app.upload.avatar-path:./uploads/avatars}")
    private String avatarPath;

    private Path uploadDir;

    @PostConstruct
    public void init() throws IOException {
        uploadDir = Paths.get(avatarPath).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
        log.info("Avatar upload directory: {}", uploadDir);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestParam("file") MultipartFile file) throws IOException {

        // Validate file
        if (file.isEmpty()) {
            throw new ValidationException("File is empty", Map.of("file", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ValidationException("Invalid file type",
                    Map.of("file", "Only JPEG, PNG, GIF, and WebP images are allowed"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File too large",
                    Map.of("file", "Maximum file size is 5MB"));
        }

        // Generate unique filename
        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;

        // Save file
        Path targetPath = uploadDir.resolve(filename).normalize();

        // Security check: prevent path traversal
        if (!targetPath.startsWith(uploadDir)) {
            throw new ValidationException("Invalid file path",
                    Map.of("file", "Invalid filename"));
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("Avatar uploaded: {}", filename);

        // Return the URL to access the file
        String avatarUrl = "/api/avatars/" + filename;
        return ResponseEntity.ok(Map.of("url", avatarUrl));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) throws MalformedURLException {
        // Security: sanitize filename
        String sanitized = Paths.get(filename).getFileName().toString();
        Path filePath = uploadDir.resolve(sanitized).normalize();

        if (!filePath.startsWith(uploadDir)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Detect content type
        String contentType;
        try {
            contentType = Files.probeContentType(filePath);
        } catch (IOException e) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot) : ".jpg";
    }
}
