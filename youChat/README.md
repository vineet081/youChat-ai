# 🤖 YouChat — AI-Powered REST API with Ollama

A Spring Boot REST API that connects to [Ollama](https://ollama.com) to provide AI-powered endpoints for chat, note summarization, code review, and quiz generation.

---

## 📋 Table of Contents
- [Option 1 — Run with Docker (Recommended)](#-option-1--run-with-docker-recommended)
- [Option 2 — Run Locally (For Developers)](#-option-2--run-locally-for-developers)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [Tech Stack](#-tech-stack)
- [Stopping the App](#-stopping-the-app)

---

## 🐳 Option 1 — Run with Docker (Recommended)

> **Best for:** Anyone who just wants to USE the app.
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
This single command will automatically:
- Download the official Ollama image
- Build your Spring Boot app into a container
- Start both the Ollama container and the Java app container
- Connect them together on a private Docker network

> ⏳ **First time takes a few minutes** to download images. Be patient!

### Step 3: Download the AI model (only once)
Open a **new terminal** and run:
```bash
docker exec -it ollama ollama pull qwen2.5:14b
```
This downloads the `qwen2.5:14b` model inside the Ollama container.
The model is saved permanently — you only need to do this **once**.

### Step 4: You're ready! 🎉
Hit your API at `http://localhost:8080`

---

## 💻 Option 2 — Run Locally (For Developers)

> **Best for:** Developers who want to develop or modify the project.
> **Requires:** Java 21, Maven, and Ollama installed on your PC.

### Prerequisites
- [Java 21](https://adoptium.net/)
- [Maven](https://maven.apache.org/) (or use the included `./mvnw`)
- [Ollama](https://ollama.com/download) installed and running

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/youChat.git
cd youChat
```

### Step 2: Pull the AI model
```bash
ollama pull qwen2.5:14b
```
This downloads the model to your local PC.

### Step 3: Make sure Ollama is running
```bash
ollama serve
```
> If Ollama is already running in the background, you can skip this step.

### Step 4: Run the Spring Boot app
```bash
./mvnw spring-boot:run
```

### Step 5: You're ready! 🎉
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

To use a different model, edit `docker-compose.yml`:
```yaml
environment:
  - OLLAMA_MODEL=mistral
```

Or when running locally, set the environment variable before starting:
```bash
OLLAMA_MODEL=mistral ./mvnw spring-boot:run
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Java 21** | Programming language |
| **Spring Boot** | REST API framework |
| **Lombok** | Reduces boilerplate code |
| **RestTemplate** | HTTP client to call Ollama |
| **Ollama** | Local AI engine |
| **Docker + Docker Compose** | Containerization |

---

## 🛑 Stopping the App

### If running with Docker:
```bash
docker compose down
```

To also delete the downloaded model (frees up disk space):
```bash
docker compose down -v
```

### If running locally:
Press `Ctrl + C` in the terminal where the app is running.
