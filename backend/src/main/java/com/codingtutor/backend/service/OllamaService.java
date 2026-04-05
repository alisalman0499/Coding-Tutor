package com.codingtutor.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class OllamaService implements LlmProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String OLLAMA_URL = "http://localhost:11434/api/chat";

    @Override
    public String generateResponse(String systemPrompt, List<Map<String, String>> messages) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            List<Map<String, String>> ollamaMessages = new ArrayList<>();
            ollamaMessages.add(Map.of("role", "system", "content", systemPrompt));
            
            for (Map<String, String> msg : messages) {
                String role = msg.getOrDefault("role", "user").toLowerCase();
                if (role.equals("student")) role = "user";
                if (role.equals("tutor")) role = "assistant";
                
                ollamaMessages.add(Map.of("role", role, "content", msg.getOrDefault("content", "")));
            }

            Map<String, Object> requestBody = Map.of(
                "model", "qwen2.5-coder:3b",
                "messages", ollamaMessages,
                "stream", false
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OLLAMA_URL, request, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("message")) {
                Map<String, Object> messageObj = (Map<String, Object>) response.getBody().get("message");
                return (String) messageObj.get("content");
            }
            return "Error: No valid response from Ollama chat endpoint.";
        } catch (Exception e) {
            return "Error calling local Ollama instance on port 11434: " + e.getMessage();
        }
    }
}
