package com.ucms.controller;

import com.ucms.dto.AuthResponse;
import com.ucms.dto.CitizenDto;
import com.ucms.dto.CitizenLoginRequest;
import com.ucms.dto.CitizenRegisterRequest;
import com.ucms.service.AuthService;
import com.ucms.service.CitizenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CitizenService citizenService;

    public AuthController(AuthService authService, CitizenService citizenService) {
        this.authService = authService;
        this.citizenService = citizenService;
    }

    @PostMapping("/citizen/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody CitizenRegisterRequest request) {
        AuthResponse response = authService.registerCitizen(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/citizen/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody CitizenLoginRequest request) {
        AuthResponse response = authService.loginCitizen(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/officer/login")
    public ResponseEntity<AuthResponse> officerLogin(@Valid @RequestBody CitizenLoginRequest request) {
        AuthResponse response = authService.loginCitizen(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<CitizenDto> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CitizenDto profile = citizenService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(profile);
    }
}
