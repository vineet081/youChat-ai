package com.vineet.youChat.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {

    private final RestTemplate restTemplate;

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    /**
     * Sends a prompt to Ollama and returns the raw response string.
     */
    public String generateResponse(String systemPrompt, String userPrompt) {
        String fullPrompt = systemPrompt + "\n\nUser: " + userPrompt;

        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "prompt", fullPrompt,
                "stream", false);

        String apiEndpoint = ollamaUrl.trim() + "/api/generate";

        try {
            log.info("Calling Ollama at {} with model {}", apiEndpoint, ollamaModel);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(apiEndpoint, requestBody, Map.class);

            if (response != null && response.containsKey("response")) {
                return response.get("response").toString();
            }

            log.warn("Ollama returned an unexpected response format: {}", response);
            return "No response received from Ollama.";

        } catch (RestClientException e) {
            log.error("Failed to connect to Ollama: {}", e.getMessage());
            throw new RuntimeException("Ollama is not reachable at " + apiEndpoint
                    + ". Make sure Ollama is running. Error: " + e.getMessage());
        }
    }
}
