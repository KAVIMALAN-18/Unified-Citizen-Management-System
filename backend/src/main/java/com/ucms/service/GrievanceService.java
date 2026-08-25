package com.ucms.service;

import com.ucms.dto.GrievanceCreateRequest;
import com.ucms.dto.GrievanceDto;
import com.ucms.model.Application;
import com.ucms.model.Citizen;
import com.ucms.model.Grievance;
import com.ucms.model.GrievanceStatus;
import com.ucms.repository.ApplicationRepository;
import com.ucms.repository.CitizenRepository;
import com.ucms.repository.GrievanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final CitizenRepository citizenRepository;
    private final ApplicationRepository applicationRepository;

    public GrievanceService(GrievanceRepository grievanceRepository,
                           CitizenRepository citizenRepository,
                           ApplicationRepository applicationRepository) {
        this.grievanceRepository = grievanceRepository;
        this.citizenRepository = citizenRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional
    public GrievanceDto createGrievance(String citizenEmail, GrievanceCreateRequest request) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        Grievance g = new Grievance();
        g.setGrievanceId("GRV" + System.currentTimeMillis() % 1000000);
        g.setCitizen(citizen);
        g.setCategory(request.getCategory().trim());
        g.setSubject(request.getSubject().trim());
        g.setDescription(request.getDescription().trim());
        g.setStatus(GrievanceStatus.SUBMITTED);

        if (request.getApplicationId() != null) {
            Application app = applicationRepository.findById(request.getApplicationId()).orElse(null);
            g.setApplication(app);
        }

        Grievance saved = grievanceRepository.save(g);
        return GrievanceDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<GrievanceDto> getCitizenGrievances(String citizenEmail) {
        Citizen citizen = citizenRepository.findByEmail(citizenEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found"));

        return grievanceRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId())
                .stream()
                .map(GrievanceDto::fromEntity)
                .collect(Collectors.toList());
    }
}
