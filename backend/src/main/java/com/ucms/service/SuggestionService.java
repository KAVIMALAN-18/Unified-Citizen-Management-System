package com.ucms.service;

import com.ucms.dto.SuggestionCreateRequest;
import com.ucms.dto.SuggestionDto;
import com.ucms.model.Citizen;
import com.ucms.model.Suggestion;
import com.ucms.model.SuggestionStatus;
import com.ucms.repository.CitizenRepository;
import com.ucms.repository.SuggestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final CitizenRepository citizenRepository;

    public SuggestionService(SuggestionRepository suggestionRepository,
                             CitizenRepository citizenRepository) {
        this.suggestionRepository = suggestionRepository;
        this.citizenRepository = citizenRepository;
    }

    @Transactional
    public SuggestionDto createSuggestion(String citizenEmail, SuggestionCreateRequest request) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        Suggestion s = new Suggestion();
        s.setSuggestionId("SUG" + System.currentTimeMillis() % 1000000);
        s.setCitizen(citizen);
        s.setTitle(request.getTitle().trim());
        s.setDescription(request.getDescription().trim());
        s.setCategory(request.getCategory().trim());
        s.setStatus(SuggestionStatus.SUBMITTED);

        Suggestion saved = suggestionRepository.save(s);
        return SuggestionDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SuggestionDto> getCitizenSuggestions(String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        return suggestionRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId())
                .stream()
                .map(SuggestionDto::fromEntity)
                .collect(Collectors.toList());
    }
}
