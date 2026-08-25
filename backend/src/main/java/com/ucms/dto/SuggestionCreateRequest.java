package com.ucms.dto;

public class SuggestionCreateRequest {
    private String title;
    private String description;
    private String category;

    public SuggestionCreateRequest() {
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
