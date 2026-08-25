package com.ucms.controller;

import com.ucms.dto.CertificateCreateRequest;
import com.ucms.dto.CertificateRequestDto;
import com.ucms.service.CertificateService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/citizen/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping
    public ResponseEntity<CertificateRequestDto> createRequest(Authentication authentication, @RequestBody CertificateCreateRequest request) {
        CertificateRequestDto dto = certificateService.createRequest(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<CertificateRequestDto>> getMyRequests(Authentication authentication) {
        List<CertificateRequestDto> list = certificateService.getCitizenRequests(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<String> downloadCertificate(Authentication authentication, @PathVariable Long id) {
        String content = certificateService.downloadCertificate(id, authentication.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate_" + id + ".txt\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }
}
