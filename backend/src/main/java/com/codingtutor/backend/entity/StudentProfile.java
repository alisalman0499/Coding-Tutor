package com.codingtutor.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class StudentProfile {
    @Id
    private Long id = 1L; // Local app, primary key always 1

    private Integer currentSemester;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> weakAreas;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> priorTopics;

    private Boolean isFirstSession = true;
    
    private String preferredLanguage = "Danish";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(Integer currentSemester) { this.currentSemester = currentSemester; }
    
    public List<String> getWeakAreas() { return weakAreas; }
    public void setWeakAreas(List<String> weakAreas) { this.weakAreas = weakAreas; }
    
    public List<String> getPriorTopics() { return priorTopics; }
    public void setPriorTopics(List<String> priorTopics) { this.priorTopics = priorTopics; }
    
    public Boolean getIsFirstSession() { return isFirstSession; }
    public void setIsFirstSession(Boolean isFirstSession) { this.isFirstSession = isFirstSession; }
    
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
}
