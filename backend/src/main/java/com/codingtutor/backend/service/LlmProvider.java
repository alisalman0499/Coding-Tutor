package com.codingtutor.backend.service;

import java.util.List;
import java.util.Map;

public interface LlmProvider {
    String generateResponse(String systemPrompt, List<Map<String, String>> messages);
}
