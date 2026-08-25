package com.ucms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucms.model.Citizen;
import com.ucms.repository.CitizenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("null")
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        citizenRepository.deleteAll();
    }

    private Map<String, Object> createValidRegistrationPayload() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("fullName", "Kavimalan");
        payload.put("email", "kavi@example.com");
        payload.put("phoneNumber", "9876543210");
        payload.put("password", "Password@123");
        payload.put("confirmPassword", "Password@123");
        payload.put("dateOfBirth", "2005-06-15");
        payload.put("gender", "MALE");
        payload.put("address", "Example Address");
        payload.put("village", "Melur");
        payload.put("occupation", "Agriculture");
        payload.put("annualIncome", 83884.00);
        payload.put("landArea", 1.05);
        payload.put("farmerStatus", true);
        return payload;
    }

    @Test
    void testHealthEndpoint_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.service").value("UCMS Backend"));
    }

    @Test
    void testCitizenRegistration_Success() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();

        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Citizen registered successfully"))
                .andExpect(jsonPath("$.citizen.id").isNumber())
                .andExpect(jsonPath("$.citizen.fullName").value("Kavimalan"))
                .andExpect(jsonPath("$.citizen.email").value("kavi@example.com"))
                .andExpect(jsonPath("$.citizen.phoneNumber").value("9876543210"))
                .andExpect(jsonPath("$.citizen.dateOfBirth").value("2005-06-15"))
                .andExpect(jsonPath("$.citizen.gender").value("MALE"))
                .andExpect(jsonPath("$.citizen.address").value("Example Address"))
                .andExpect(jsonPath("$.citizen.village").value("Melur"))
                .andExpect(jsonPath("$.citizen.occupation").value("Agriculture"))
                .andExpect(jsonPath("$.citizen.annualIncome").value(83884.0))
                .andExpect(jsonPath("$.citizen.landArea").value(1.05))
                .andExpect(jsonPath("$.citizen.farmerStatus").value(true))
                .andExpect(jsonPath("$.citizen.role").value("CITIZEN"))
                .andExpect(jsonPath("$.citizen.password").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void testCitizenRegistration_DuplicateEmail_Returns409Conflict() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();

        // Register first time
        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        // Register duplicate email
        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void testCitizenRegistration_InvalidEmail_Returns400BadRequest() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();
        payload.put("email", "invalid-email-address");

        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void testCitizenRegistration_WeakPassword_Returns400BadRequest() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();
        payload.put("password", "short");
        payload.put("confirmPassword", "short");

        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.password").value("Password must contain at least 8 characters"));
    }

    @Test
    void testCitizenRegistration_PasswordMismatch_Returns400BadRequest() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();
        payload.put("password", "Password@123");
        payload.put("confirmPassword", "DifferentPassword@123");

        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Passwords do not match"));
    }

    @Test
    void testCitizenRegistration_ClientCannotInjectAdminRole() throws Exception {
        Map<String, Object> payload = createValidRegistrationPayload();
        payload.put("role", "ADMIN");

        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.citizen.role").value("CITIZEN"));

        Citizen saved = citizenRepository.findByEmail("kavi@example.com").orElseThrow();
        assertEquals(com.ucms.model.Role.CITIZEN, saved.getRole());
    }

    @Test
    void testCitizenLogin_Success() throws Exception {
        // Register first
        Map<String, Object> regPayload = createValidRegistrationPayload();
        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regPayload)))
                .andExpect(status().isCreated());

        // Login
        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", "kavi@example.com");
        loginPayload.put("password", "Password@123");

        mockMvc.perform(post("/api/auth/citizen/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.token", not(emptyOrNullString())))
                .andExpect(jsonPath("$.citizen.id").isNumber())
                .andExpect(jsonPath("$.citizen.fullName").value("Kavimalan"))
                .andExpect(jsonPath("$.citizen.email").value("kavi@example.com"))
                .andExpect(jsonPath("$.citizen.role").value("CITIZEN"))
                .andExpect(jsonPath("$.citizen.password").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void testCitizenLogin_WrongPassword_Returns401Unauthorized() throws Exception {
        // Register first
        Map<String, Object> regPayload = createValidRegistrationPayload();
        mockMvc.perform(post("/api/auth/citizen/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regPayload)))
                .andExpect(status().isCreated());

        // Attempt login with wrong password
        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", "kavi@example.com");
        loginPayload.put("password", "WrongPassword@123");

        mockMvc.perform(post("/api/auth/citizen/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void testCitizenLogin_NonExistentEmail_Returns401Unauthorized() throws Exception {
        Map<String, String> loginPayload = new HashMap<>();
        loginPayload.put("email", "nonexistent@example.com");
        loginPayload.put("password", "Password@123");

        mockMvc.perform(post("/api/auth/citizen/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.token").doesNotExist());
    }
}
