package com.vineet.youChat.repo;

import com.vineet.youChat.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // get all messages of a session in order
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // get history by tool type
    List<ChatMessage> findByToolTypeOrderByCreatedAtDesc(String toolType);

}
