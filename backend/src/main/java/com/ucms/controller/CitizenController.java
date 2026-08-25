package com.ucms.controller;

import com.ucms.dto.CitizenDto;
import com.ucms.service.CitizenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citizen/profile")
public class CitizenController {

    private final CitizenService citizenService;

    public CitizenController(CitizenService citizenService) {
        this.citizenService = citizenService;
    }

    @GetMapping
    public ResponseEntity<CitizenDto> getProfile(Authentication authentication) {
        CitizenDto dto = citizenService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<CitizenDto> updateProfile(Authentication authentication, @RequestBody CitizenDto updateDto) {
        CitizenDto updated = citizenService.updateProfile(authentication.getName(), updateDto);
        return ResponseEntity.ok(updated);
    }
}
