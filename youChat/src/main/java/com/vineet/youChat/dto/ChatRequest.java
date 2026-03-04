package com.vineet.youChat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;

    /**
     * Unique session identifier for this conversation (e.g. a UUID from the
     * frontend).
     * The backend uses it to load and save history in PostgreSQL.
     * History is no longer sent from the browser — it lives entirely in the DB.
     */
    private String sessionId;
}
