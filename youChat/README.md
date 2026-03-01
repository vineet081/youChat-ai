# 🤖 YouChat — AI-Powered REST API with Ollama

A Spring Boot REST API that connects to a locally running [Ollama](https://ollama.com) instance to provide AI-powered endpoints for chat, note summarization, code review, and quiz generation.

---

## 🚀 Getting Started (Docker — Recommended)

> **You only need [Docker](https://www.docker.com/products/docker-desktop/) installed. Nothing else!**

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/youChat.git
cd youChat
```

### Step 2: Start everything
```bash
docker compose up --build
```
This will automatically:
- Pull the Ollama image from Docker Hub
- Build the Spring Boot app
- Start both containers together

> ⏳ First time takes a few minutes to download images. Be patient!

### Step 3: Download the AI model (only once)
```bash
docker compose exec ollama ollama pull qwen2.5:14b
```

### Step 4: You're ready! 🎉
Hit your API at `http://localhost:8080`

---

## 📡 API Endpoints

### 1. 💬 Chat
```
POST /api/chat
```
```json
// Request
{ "message": "Give me a productivity tip!" }

// Response
{ "response": "..." }
```

---

### 2. 📝 Summarize Notes
```
POST /api/summarize
```
```json
// Request
{ "notes": "Your notes here..." }

// Response
{
  "summary": "...",
  "suggestions": "..."
}
```

---

### 3. 🔍 Code Review
```
POST /api/review-code
```
```json
// Request
{
  "language": "Java",
  "code": "public class Hello { ... }"
}

// Response
{
  "review": "...",
  "improvements": "..."
}
```

---

### 4. 🧠 Quiz Generator
```
POST /api/quiz
```
```json
// Request
{ "topic": "Java OOP" }

// Response
{
  "question": "...",
  "options": "A)... B)... C)... D)...",
  "answer": "..."
}
```

---

## ⚙️ Configuration

You can customize the Ollama model and URL using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5:14b` | Model to use |

To use a different model, edit the `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_MODEL=mistral
```

---

## 🛠 Tech Stack

- **Java 21**
- **Spring Boot 4**
- **Lombok**
- **RestTemplate** (for Ollama communication)
- **Docker + Docker Compose**
- **Ollama** (local AI engine)

---

## 🛑 Stopping the App
```bash
docker compose down
```

To also remove the downloaded model volume (frees up disk space):
```bash
docker compose down -v
```
