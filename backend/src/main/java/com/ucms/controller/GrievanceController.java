package com.ucms.controller;

import com.ucms.dto.GrievanceCreateRequest;
import com.ucms.dto.GrievanceDto;
import com.ucms.service.GrievanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen/grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    @PostMapping
    public ResponseEntity<GrievanceDto> createGrievance(Authentication authentication, @RequestBody GrievanceCreateRequest request) {
        GrievanceDto dto = grievanceService.createGrievance(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<GrievanceDto>> getMyGrievances(Authentication authentication) {
        List<GrievanceDto> list = grievanceService.getCitizenGrievances(authentication.getName());
        return ResponseEntity.ok(list);
    }
}
