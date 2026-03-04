package com.vineet.youChat.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.vineet.youChat.model.ChatMessage;
import com.vineet.youChat.repo.ChatMessageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {

    private final RestTemplate restTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    /**
     * Chat with persistent memory stored in PostgreSQL.
     *
     * 1. Loads full history for this sessionId from DB
     * 2. Builds a multi-turn prompt and calls Ollama
     * 3. Persists the user message and AI reply back to DB
     */
    public String chat(String sessionId, String userMessage) {
        // Load conversation history from DB
        List<ChatMessage> history = chatMessageRepository
                .findBySessionIdOrderByCreatedAtAsc(sessionId);

        // Build prompt
        String systemPrompt = "You are a friendly assistant for daily tips and general conversation";
        StringBuilder prompt = new StringBuilder();
        prompt.append("[System]: ").append(systemPrompt).append("\n\n");

        for (ChatMessage msg : history) {
            if ("assistant".equalsIgnoreCase(msg.getRole())) {
                prompt.append("Assistant: ").append(msg.getContent()).append("\n");
            } else {
                prompt.append("User: ").append(msg.getContent()).append("\n");
            }
        }
        prompt.append("User: ").append(userMessage);

        // Call Ollama
        String aiReply = callOllama(prompt.toString());

        // Persist both turns
        chatMessageRepository.save(ChatMessage.builder()
                .sessionId(sessionId)
                .role("user")
                .content(userMessage)
                .toolType("chat")
                .build());

        chatMessageRepository.save(ChatMessage.builder()
                .sessionId(sessionId)
                .role("assistant")
                .content(aiReply)
                .toolType("chat")
                .build());

        return aiReply;
    }

    /**
     * Single-turn prompt — used by summarize, quiz, and code review (no memory
     * needed).
     */
    public String generateResponse(String systemPrompt, String userPrompt) {
        String fullPrompt = systemPrompt + "\n\nUser: " + userPrompt;
        return callOllama(fullPrompt);
    }

    // ── private helper ────────────────────────────────────────────────────────

    private String callOllama(String fullPrompt) {
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
