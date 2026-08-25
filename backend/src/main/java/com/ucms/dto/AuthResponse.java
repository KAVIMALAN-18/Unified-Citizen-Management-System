package com.ucms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    private CitizenDto citizen;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, CitizenDto citizen) {
        this.success = success;
        this.message = message;
        this.citizen = citizen;
    }

    public AuthResponse(boolean success, String message, String token, CitizenDto citizen) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.citizen = citizen;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public CitizenDto getCitizen() {
        return citizen;
    }

    public void setCitizen(CitizenDto citizen) {
        this.citizen = citizen;
    }
}
