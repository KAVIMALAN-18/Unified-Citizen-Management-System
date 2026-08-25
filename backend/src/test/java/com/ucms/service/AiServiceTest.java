package com.ucms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucms.dto.AiAnalysisRequest;
import com.ucms.dto.AiAnalysisResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@SuppressWarnings("null")
@SpringBootTest
public class AiServiceTest {

    @Autowired
    private AiService aiService;

    private MockRestServiceServer mockServer;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(aiService.getRestTemplate());
    }

    @Test
    public void testAnalyzeApplication_ReturnsSuccessfulResponse() throws Exception {
        // Arrange
        AiAnalysisRequest.CitizenInfo citizen = new AiAnalysisRequest.CitizenInfo();
        citizen.setCitizen_id("CIT10001");
        citizen.setAge(42);
        citizen.setGender("Male");
        citizen.setAnnual_income(new BigDecimal("85000.00"));
        citizen.setOccupation("Artisan");
        citizen.setLand_area(new BigDecimal("1.00"));

        AiAnalysisRequest.ApplicationInfo app = new AiAnalysisRequest.ApplicationInfo();
        app.setApplication_id("APP10001");
        app.setCitizen_id("CIT10001");
        app.setScheme_id("SCH010");
        app.setDeclared_income(new BigDecimal("85000.00"));
        app.setDeclared_land_area(new BigDecimal("1.00"));
        app.setDocument_count(4);
        app.setApplication_date("2026-08-24");

        AiAnalysisRequest request = new AiAnalysisRequest(citizen, app);

        AiAnalysisResponse mockResponse = new AiAnalysisResponse();
        mockResponse.setCitizen_id("CIT10001");
        mockResponse.setApplication_id("APP10001");
        mockResponse.setFinal_status("PENDING OFFICER REVIEW");
        mockResponse.setOfficer_decision_required(true);

        AiAnalysisResponse.FraudAnalysisOutput fraud = new AiAnalysisResponse.FraudAnalysisOutput();
        fraud.setPrediction("NORMAL");
        fraud.setFraud_probability(0.0);
        fraud.setRisk_level("LOW");
        fraud.setVerification_requirement("Standard Verification");
        mockResponse.setFraud_analysis(fraud);

        String mockResponseJson = objectMapper.writeValueAsString(mockResponse);

        mockServer.expect(requestTo("http://localhost:8000/api/v1/ai/analyze"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(mockResponseJson, MediaType.APPLICATION_JSON));

        // Act
        AiAnalysisResponse result = aiService.analyze(request);

        // Assert
        mockServer.verify();
        assertNotNull(result);
        assertEquals("CIT10001", result.getCitizen_id());
        assertEquals("APP10001", result.getApplication_id());
        assertEquals("PENDING OFFICER REVIEW", result.getFinal_status());
        assertTrue(result.isOfficer_decision_required());
        assertNotNull(result.getFraud_analysis());
        assertEquals("NORMAL", result.getFraud_analysis().getPrediction());
        assertEquals(0.0, result.getFraud_analysis().getFraud_probability());
        assertEquals("LOW", result.getFraud_analysis().getRisk_level());
        assertEquals("Standard Verification", result.getFraud_analysis().getVerification_requirement());
    }
}
