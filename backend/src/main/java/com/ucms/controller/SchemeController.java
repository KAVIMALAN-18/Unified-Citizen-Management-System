package com.ucms.controller;

import com.ucms.dto.SchemeDto;
import com.ucms.service.SchemeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {

    private final SchemeService schemeService;

    public SchemeController(SchemeService schemeService) {
        this.schemeService = schemeService;
    }

    @GetMapping
    public ResponseEntity<List<SchemeDto>> getAllSchemes() {
        List<SchemeDto> schemes = schemeService.getAllActiveSchemes();
        return ResponseEntity.ok(schemes);
    }

    @GetMapping("/{schemeId}")
    public ResponseEntity<SchemeDto> getSchemeById(@PathVariable String schemeId) {
        SchemeDto scheme = schemeService.getSchemeBySchemeId(schemeId);
        return ResponseEntity.ok(scheme);
    }
}
