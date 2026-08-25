package com.ucms.controller;

import com.ucms.dto.SuggestionCreateRequest;
import com.ucms.dto.SuggestionDto;
import com.ucms.service.SuggestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen/suggestions")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    @PostMapping
    public ResponseEntity<SuggestionDto> createSuggestion(Authentication authentication, @RequestBody SuggestionCreateRequest request) {
        SuggestionDto dto = suggestionService.createSuggestion(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<SuggestionDto>> getMySuggestions(Authentication authentication) {
        List<SuggestionDto> list = suggestionService.getCitizenSuggestions(authentication.getName());
        return ResponseEntity.ok(list);
    }
}
