package com.ucms.controller;

import com.ucms.dto.ApplicationCreateRequest;
import com.ucms.dto.ApplicationDto;
import com.ucms.dto.DocumentDto;
import com.ucms.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> createApplication(Authentication authentication, @RequestBody ApplicationCreateRequest request) {
        ApplicationDto dto = applicationService.createApplication(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationDto>> getMyApplications(Authentication authentication) {
        List<ApplicationDto> apps = applicationService.getCitizenApplications(authentication.getName());
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDto> getApplicationDetails(Authentication authentication, @PathVariable Long id) {
        ApplicationDto dto = applicationService.getApplicationDetails(id, authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<DocumentDto> uploadDocument(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String documentType,
            @RequestParam String fileName,
            @RequestParam String filePath
    ) {
        DocumentDto doc = applicationService.uploadDocument(id, authentication.getName(), documentType, fileName, filePath);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }
}
