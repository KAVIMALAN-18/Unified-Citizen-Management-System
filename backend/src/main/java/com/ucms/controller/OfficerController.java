package com.ucms.controller;

import com.ucms.dto.*;
import com.ucms.service.OfficerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = officerService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // Applications Management & AI Trigger
    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationDto>> getAllApplications() {
        List<ApplicationDto> list = officerService.getAllApplications();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/applications/{id}/ai-analyze")
    public ResponseEntity<AiAnalysisResponse> triggerAiAnalysis(@PathVariable Long id) {
        AiAnalysisResponse response = officerService.triggerAiAnalysis(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/{id}/ai-analysis")
    public ResponseEntity<AiAnalysisResponse> getAiAnalysis(@PathVariable Long id) {
        AiAnalysisResponse response = officerService.getAiAnalysis(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/applications/{id}/review")
    public ResponseEntity<ApplicationDto> reviewApplication(@PathVariable Long id, @RequestBody OfficerReviewRequest reviewRequest) {
        ApplicationDto dto = officerService.reviewApplication(id, reviewRequest);
        return ResponseEntity.ok(dto);
    }

    // Certificates Management
    @GetMapping("/certificates")
    public ResponseEntity<List<CertificateRequestDto>> getAllCertificateRequests() {
        List<CertificateRequestDto> list = officerService.getAllCertificateRequests();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/certificates/{id}/review")
    public ResponseEntity<CertificateRequestDto> reviewCertificate(@PathVariable Long id, @RequestBody OfficerReviewRequest reviewRequest) {
        CertificateRequestDto dto = officerService.reviewCertificate(id, reviewRequest);
        return ResponseEntity.ok(dto);
    }

    // Grievances Management
    @GetMapping("/grievances")
    public ResponseEntity<List<GrievanceDto>> getAllGrievances() {
        List<GrievanceDto> list = officerService.getAllGrievances();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/grievances/{id}/response")
    public ResponseEntity<GrievanceDto> respondGrievance(@PathVariable Long id, @RequestBody OfficerResponseRequest responseRequest) {
        GrievanceDto dto = officerService.respondGrievance(id, responseRequest);
        return ResponseEntity.ok(dto);
    }

    // Suggestions Management
    @GetMapping("/suggestions")
    public ResponseEntity<List<SuggestionDto>> getAllSuggestions() {
        List<SuggestionDto> list = officerService.getAllSuggestions();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/suggestions/{id}/status")
    public ResponseEntity<SuggestionDto> updateSuggestionStatus(@PathVariable Long id, @RequestBody OfficerReviewRequest reviewRequest) {
        SuggestionDto dto = officerService.updateSuggestionStatus(id, reviewRequest);
        return ResponseEntity.ok(dto);
    }

    // Development Works (OFFICER ONLY)
    @GetMapping("/development-works")
    public ResponseEntity<List<DevelopmentWorkDto>> getAllDevelopmentWorks() {
        List<DevelopmentWorkDto> list = officerService.getAllDevelopmentWorks();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/development-works")
    public ResponseEntity<DevelopmentWorkDto> createDevelopmentWork(@RequestBody DevelopmentWorkDto dto) {
        DevelopmentWorkDto created = officerService.createDevelopmentWork(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/development-works/{id}")
    public ResponseEntity<DevelopmentWorkDto> updateDevelopmentWork(@PathVariable Long id, @RequestBody DevelopmentWorkDto dto) {
        DevelopmentWorkDto updated = officerService.updateDevelopmentWork(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Budget & Financial Management (OFFICER ONLY)
    @GetMapping("/budget")
    public ResponseEntity<BudgetDto> getLatestBudget() {
        BudgetDto dto = officerService.getLatestBudget();
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/budget")
    public ResponseEntity<BudgetDto> updateBudget(@RequestBody BudgetDto dto) {
        BudgetDto updated = officerService.updateBudget(dto);
        return ResponseEntity.ok(updated);
    }
}
