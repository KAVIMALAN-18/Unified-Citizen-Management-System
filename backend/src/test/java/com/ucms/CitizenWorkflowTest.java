package com.ucms;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucms.dto.ApplicationCreateRequest;
import com.ucms.dto.CertificateCreateRequest;
import com.ucms.dto.GrievanceCreateRequest;
import com.ucms.dto.SuggestionCreateRequest;
import com.ucms.model.CertificateType;
import com.ucms.model.Citizen;
import com.ucms.model.Gender;
import com.ucms.model.Role;
import com.ucms.repository.CitizenRepository;
import com.ucms.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("null")
@SpringBootTest
@AutoConfigureMockMvc
public class CitizenWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private String citizenToken;
    private Citizen testCitizen;

    @BeforeEach
    public void setUp() {
        if (!citizenRepository.existsByEmail("workflowtest@ucms.gov.in")) {
            Citizen citizen = new Citizen();
            citizen.setFullName("Workflow Test Citizen");
            citizen.setEmail("workflowtest@ucms.gov.in");
            citizen.setPhoneNumber("9123456789");
            citizen.setPassword(passwordEncoder.encode("Password@123"));
            citizen.setDateOfBirth(LocalDate.of(1992, 8, 20));
            citizen.setGender(Gender.MALE);
            citizen.setAddress("123 Main Street");
            citizen.setVillage("Keeranur");
            citizen.setOccupation("Artisan");
            citizen.setAnnualIncome(new BigDecimal("75000.00"));
            citizen.setLandArea(new BigDecimal("1.00"));
            citizen.setFarmerStatus(false);
            citizen.setRole(Role.CITIZEN);
            testCitizen = citizenRepository.save(citizen);
        } else {
            testCitizen = citizenRepository.findByEmail("workflowtest@ucms.gov.in").get();
        }
        citizenToken = jwtService.generateToken(testCitizen);
    }

    @Test
    public void testGetCitizenProfile_ReturnsProfile() throws Exception {
        mockMvc.perform(get("/api/citizen/profile")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("workflowtest@ucms.gov.in"))
                .andExpect(jsonPath("$.fullName").value("Workflow Test Citizen"));
    }

    @Test
    public void testCreateApplication_ReturnsCreated() throws Exception {
        ApplicationCreateRequest request = new ApplicationCreateRequest();
        request.setSchemeId("SCH001");
        request.setDeclaredIncome(new BigDecimal("75000.00"));
        request.setDeclaredLandArea(new BigDecimal("1.00"));
        request.setDocumentCount(2);

        mockMvc.perform(post("/api/citizen/applications")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationId").exists())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    public void testCreateCertificateRequest_ReturnsCreated() throws Exception {
        CertificateCreateRequest request = new CertificateCreateRequest();
        request.setCertificateType(CertificateType.INCOME);
        request.setSubmittedInfo("Income verification request");

        mockMvc.perform(post("/api/citizen/certificates")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").exists())
                .andExpect(jsonPath("$.certificateType").value("INCOME"));
    }

    @Test
    public void testCreateGrievance_ReturnsCreated() throws Exception {
        GrievanceCreateRequest request = new GrievanceCreateRequest();
        request.setCategory("Infrastructure");
        request.setSubject("Street Light Defect");
        request.setDescription("Street light near post office is not working.");

        mockMvc.perform(post("/api/citizen/grievances")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.grievanceId").exists())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    public void testCreateSuggestion_ReturnsCreated() throws Exception {
        SuggestionCreateRequest request = new SuggestionCreateRequest();
        request.setTitle("Community Library Project");
        request.setDescription("Establish a public reading room in the panchayat center.");
        request.setCategory("Education");

        mockMvc.perform(post("/api/citizen/suggestions")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.suggestionId").exists())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }
}
