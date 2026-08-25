package com.ucms;

import com.ucms.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class OfficerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String officerToken;
    private String citizenToken;

    @BeforeEach
    public void setUp() {
        com.ucms.model.Citizen officer = new com.ucms.model.Citizen();
        officer.setId(100L);
        officer.setEmail("officer@ucms.gov.in");
        officer.setRole(com.ucms.model.Role.OFFICER);
        officerToken = jwtService.generateToken(officer);

        com.ucms.model.Citizen citizen = new com.ucms.model.Citizen();
        citizen.setId(101L);
        citizen.setEmail("citizen@ucms.gov.in");
        citizen.setRole(com.ucms.model.Role.CITIZEN);
        citizenToken = jwtService.generateToken(citizen);
    }

    @Test
    public void testGetDashboardStats_OfficerAuthorized_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/officer/dashboard/stats")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCitizens").exists())
                .andExpect(jsonPath("$.totalApplications").exists());
    }

    @Test
    public void testGetDashboardStats_CitizenUnauthorized_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/officer/dashboard/stats")
                        .header("Authorization", "Bearer " + citizenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetAllApplications_OfficerAuthorized_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/officer/applications")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetAllDevelopmentWorks_OfficerAuthorized_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/officer/development-works")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetLatestBudget_OfficerAuthorized_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/officer/budget")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.financialYear").exists());
    }
}
