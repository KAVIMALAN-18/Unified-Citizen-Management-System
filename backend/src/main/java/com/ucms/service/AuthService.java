package com.ucms.service;

import com.ucms.dto.AuthResponse;
import com.ucms.dto.CitizenDto;
import com.ucms.dto.CitizenLoginRequest;
import com.ucms.dto.CitizenRegisterRequest;
import com.ucms.exception.EmailAlreadyExistsException;
import com.ucms.exception.InvalidCredentialsException;
import com.ucms.model.Citizen;
import com.ucms.model.Role;
import com.ucms.repository.CitizenRepository;
import com.ucms.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(CitizenRepository citizenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse registerCitizen(CitizenRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (citizenRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        Citizen citizen = new Citizen();
        citizen.setFullName(request.getFullName().trim());
        citizen.setEmail(request.getEmail().trim().toLowerCase());
        citizen.setPhoneNumber(request.getPhoneNumber().trim());
        citizen.setPassword(passwordEncoder.encode(request.getPassword()));
        citizen.setDateOfBirth(request.getDateOfBirth());
        citizen.setGender(request.getGender());
        citizen.setAddress(request.getAddress().trim());
        citizen.setVillage(request.getVillage().trim());
        citizen.setOccupation(request.getOccupation().trim());
        citizen.setAnnualIncome(request.getAnnualIncome());
        citizen.setLandArea(request.getLandArea());
        citizen.setFarmerStatus(request.getFarmerStatus());
        // Enforce CITIZEN role strictly
        citizen.setRole(Role.CITIZEN);

        Citizen savedCitizen = citizenRepository.save(citizen);

        return new AuthResponse(
                true,
                "Citizen registered successfully",
                CitizenDto.fromEntity(savedCitizen)
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse loginCitizen(CitizenLoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Citizen citizen = citizenRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), citizen.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(citizen);

        return new AuthResponse(
                true,
                "Login successful",
                token,
                CitizenDto.forLogin(citizen)
        );
    }
}
