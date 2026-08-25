package com.ucms.service;

import com.ucms.dto.CitizenDto;
import com.ucms.model.Citizen;
import com.ucms.repository.CitizenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SuppressWarnings("null")
@Service
public class CitizenService {

    private final CitizenRepository citizenRepository;

    public CitizenService(CitizenRepository citizenRepository) {
        this.citizenRepository = citizenRepository;
    }

    @Transactional(readOnly = true)
    public CitizenDto getProfileByEmail(String email) {
        Citizen citizen = citizenRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found for email: " + email));
        return CitizenDto.fromEntity(citizen);
    }

    @Transactional
    public CitizenDto updateProfile(String email, CitizenDto updateDto) {
        Citizen citizen = citizenRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Citizen profile not found for email: " + email));

        if (updateDto.getFullName() != null) citizen.setFullName(updateDto.getFullName().trim());
        if (updateDto.getPhoneNumber() != null) citizen.setPhoneNumber(updateDto.getPhoneNumber().trim());
        if (updateDto.getAddress() != null) citizen.setAddress(updateDto.getAddress().trim());
        if (updateDto.getVillage() != null) citizen.setVillage(updateDto.getVillage().trim());
        if (updateDto.getOccupation() != null) citizen.setOccupation(updateDto.getOccupation().trim());
        if (updateDto.getAnnualIncome() != null) citizen.setAnnualIncome(updateDto.getAnnualIncome());
        if (updateDto.getLandArea() != null) citizen.setLandArea(updateDto.getLandArea());
        if (updateDto.getFarmerStatus() != null) citizen.setFarmerStatus(updateDto.getFarmerStatus());

        Citizen saved = citizenRepository.save(citizen);
        return CitizenDto.fromEntity(saved);
    }
}
