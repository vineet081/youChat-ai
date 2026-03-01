package com.vineet.youChat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vineet.youChat.dto.ChatRequest;
import com.vineet.youChat.dto.ChatResponse;
import com.vineet.youChat.dto.CodeReviewRequest;
import com.vineet.youChat.dto.CodeReviewResponse;
import com.vineet.youChat.dto.QuizRequest;
import com.vineet.youChat.dto.QuizResponse;
import com.vineet.youChat.dto.SummarizeRequest;
import com.vineet.youChat.dto.SummarizeResponse;
import com.vineet.youChat.service.OllamaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AiController {

    private final OllamaService ollamaService;

    // ───────────────────────── 1. Chat ─────────────────────────

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String systemPrompt = "You are a friendly assistant for daily tips and general conversation";
        String response = ollamaService.generateResponse(systemPrompt, request.getMessage());
        return ResponseEntity.ok(new ChatResponse(response));
    }

    // ───────────────────────── 2. Summarize ─────────────────────────

    @PostMapping("/summarize")
    public ResponseEntity<SummarizeResponse> summarize(@RequestBody SummarizeRequest request) {
        String systemPrompt = "You are a note summarizer. Summarize the given notes clearly and provide 3 actionable suggestions. "
                + "Format your response as:\nSUMMARY:\n<summary here>\n\nSUGGESTIONS:\n<suggestions here>";
        String response = ollamaService.generateResponse(systemPrompt, request.getNotes());

        String summary = response;
        String suggestions = "";

        if (response.contains("SUGGESTIONS:")) {
            String[] parts = response.split("SUGGESTIONS:", 2);
            summary = parts[0].replace("SUMMARY:", "").trim();
            suggestions = parts[1].trim();
        }

        return ResponseEntity.ok(new SummarizeResponse(summary, suggestions));
    }

    // ───────────────────────── 3. Code Review ─────────────────────────

    @PostMapping("/review-code")
    public ResponseEntity<CodeReviewResponse> reviewCode(@RequestBody CodeReviewRequest request) {
        String systemPrompt = "You are an expert code reviewer. Review the code, find issues, suggest improvements and best practices. "
                + "Format your response as:\nREVIEW:\n<review here>\n\nIMPROVEMENTS:\n<improvements here>";
        String userPrompt = "Language: " + request.getLanguage() + "\n\nCode:\n" + request.getCode();
        String response = ollamaService.generateResponse(systemPrompt, userPrompt);

        String review = response;
        String improvements = "";

        if (response.contains("IMPROVEMENTS:")) {
            String[] parts = response.split("IMPROVEMENTS:", 2);
            review = parts[0].replace("REVIEW:", "").trim();
            improvements = parts[1].trim();
        }

        return ResponseEntity.ok(new CodeReviewResponse(review, improvements));
    }

    // ───────────────────────── 4. Quiz ─────────────────────────

    @PostMapping("/quiz")
    public ResponseEntity<QuizResponse> quiz(@RequestBody QuizRequest request) {
        String systemPrompt = "You are a quiz master. Generate one multiple choice question with 4 options (A,B,C,D) and provide the correct answer with explanation. "
                + "Format your response as:\nQUESTION:\n<question here>\n\nOPTIONS:\n<options here>\n\nANSWER:\n<answer with explanation here>";
        String response = ollamaService.generateResponse(systemPrompt, "Topic: " + request.getTopic());

        String question = response;
        String options = "";
        String answer = "";

        if (response.contains("OPTIONS:") && response.contains("ANSWER:")) {
            String[] questionParts = response.split("OPTIONS:", 2);
            question = questionParts[0].replace("QUESTION:", "").trim();

            String[] optionsParts = questionParts[1].split("ANSWER:", 2);
            options = optionsParts[0].trim();
            answer = optionsParts[1].trim();
        }

        return ResponseEntity.ok(new QuizResponse(question, options, answer));
    }
}
