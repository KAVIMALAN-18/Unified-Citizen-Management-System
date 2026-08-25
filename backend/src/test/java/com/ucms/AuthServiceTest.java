package com.ucms;

import com.ucms.dto.AuthResponse;
import com.ucms.dto.CitizenLoginRequest;
import com.ucms.dto.CitizenRegisterRequest;
import com.ucms.exception.EmailAlreadyExistsException;
import com.ucms.exception.InvalidCredentialsException;
import com.ucms.model.Citizen;
import com.ucms.model.Gender;
import com.ucms.model.Role;
import com.ucms.repository.CitizenRepository;
import com.ucms.security.JwtService;
import com.ucms.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("null")
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CitizenRepository citizenRepository;

    @Mock
    private JwtService jwtService;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(citizenRepository, passwordEncoder, jwtService);
    }

    private CitizenRegisterRequest createValidRegisterRequest() {
        return new CitizenRegisterRequest(
                "Kavimalan",
                "kavi@example.com",
                "9876543210",
                "Password@123",
                "Password@123",
                LocalDate.of(2005, 6, 15),
                Gender.MALE,
                "Example Address",
                "Melur",
                "Agriculture",
                new BigDecimal("83884.00"),
                new BigDecimal("1.05"),
                true
        );
    }

    @Test
    void testRegisterCitizen_Success() {
        CitizenRegisterRequest request = createValidRegisterRequest();

        when(citizenRepository.existsByEmail("kavi@example.com")).thenReturn(false);
        when(citizenRepository.save(any(Citizen.class))).thenAnswer(invocation -> {
            Citizen saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        AuthResponse response = authService.registerCitizen(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Citizen registered successfully", response.getMessage());
        assertNotNull(response.getCitizen());
        assertEquals(1L, response.getCitizen().getId());
        assertEquals("Kavimalan", response.getCitizen().getFullName());
        assertEquals("kavi@example.com", response.getCitizen().getEmail());
        assertEquals(Role.CITIZEN, response.getCitizen().getRole());

        ArgumentCaptor<Citizen> citizenCaptor = ArgumentCaptor.forClass(Citizen.class);
        verify(citizenRepository).save(citizenCaptor.capture());
        Citizen capturedCitizen = citizenCaptor.getValue();
        assertEquals(Role.CITIZEN, capturedCitizen.getRole());
        assertTrue(passwordEncoder.matches("Password@123", capturedCitizen.getPassword()));
    }

    @Test
    void testRegisterCitizen_PasswordMismatch_ThrowsException() {
        CitizenRegisterRequest request = createValidRegisterRequest();
        request.setConfirmPassword("DifferentPassword@123");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authService.registerCitizen(request)
        );

        assertEquals("Passwords do not match", ex.getMessage());
        verify(citizenRepository, never()).save(any());
    }

    @Test
    void testRegisterCitizen_DuplicateEmail_ThrowsEmailAlreadyExistsException() {
        CitizenRegisterRequest request = createValidRegisterRequest();
        when(citizenRepository.existsByEmail("kavi@example.com")).thenReturn(true);

        EmailAlreadyExistsException ex = assertThrows(
                EmailAlreadyExistsException.class,
                () -> authService.registerCitizen(request)
        );

        assertEquals("Email already registered", ex.getMessage());
        verify(citizenRepository, never()).save(any());
    }

    @Test
    void testLoginCitizen_Success() {
        Citizen citizen = new Citizen();
        citizen.setId(1L);
        citizen.setFullName("Kavimalan");
        citizen.setEmail("kavi@example.com");
        citizen.setPassword(passwordEncoder.encode("Password@123"));
        citizen.setRole(Role.CITIZEN);

        when(citizenRepository.findByEmail("kavi@example.com")).thenReturn(Optional.of(citizen));
        when(jwtService.generateToken(citizen)).thenReturn("mocked.jwt.token");

        CitizenLoginRequest loginRequest = new CitizenLoginRequest("kavi@example.com", "Password@123");
        AuthResponse response = authService.loginCitizen(loginRequest);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Login successful", response.getMessage());
        assertEquals("mocked.jwt.token", response.getToken());
        assertNotNull(response.getCitizen());
        assertEquals(1L, response.getCitizen().getId());
        assertEquals("kavi@example.com", response.getCitizen().getEmail());
        assertEquals(Role.CITIZEN, response.getCitizen().getRole());
    }

    @Test
    void testLoginCitizen_WrongPassword_ThrowsInvalidCredentialsException() {
        Citizen citizen = new Citizen();
        citizen.setId(1L);
        citizen.setEmail("kavi@example.com");
        citizen.setPassword(passwordEncoder.encode("Password@123"));
        citizen.setRole(Role.CITIZEN);

        when(citizenRepository.findByEmail("kavi@example.com")).thenReturn(Optional.of(citizen));

        CitizenLoginRequest loginRequest = new CitizenLoginRequest("kavi@example.com", "WrongPassword@123");
        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.loginCitizen(loginRequest)
        );
    }

    @Test
    void testLoginCitizen_NonExistentEmail_ThrowsInvalidCredentialsException() {
        when(citizenRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        CitizenLoginRequest loginRequest = new CitizenLoginRequest("unknown@example.com", "Password@123");
        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.loginCitizen(loginRequest)
        );
    }
}
