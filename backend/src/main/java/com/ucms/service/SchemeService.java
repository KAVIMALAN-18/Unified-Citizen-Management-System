package com.ucms.service;

import com.ucms.dto.SchemeDto;
import com.ucms.model.Scheme;
import com.ucms.repository.SchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchemeService {

    private final SchemeRepository schemeRepository;

    public SchemeService(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Transactional(readOnly = true)
    public List<SchemeDto> getAllActiveSchemes() {
        return schemeRepository.findByActiveTrue()
                .stream()
                .map(SchemeDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SchemeDto getSchemeBySchemeId(String schemeId) {
        Scheme scheme = schemeRepository.findBySchemeId(schemeId)
                .orElseThrow(() -> new IllegalArgumentException("Scheme not found with ID: " + schemeId));
        return SchemeDto.fromEntity(scheme);
    }
}
