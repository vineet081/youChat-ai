/* ══════════════════════════════════════════════════════════
   YouChat Frontend – app.js
   Connects to Spring Boot backend at http://localhost:8080
   ══════════════════════════════════════════════════════════ */

const API_BASE = "http://localhost:8080/api";

// ── Tab switching ────────────────────────────────────────
const tabBtns = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    panels.forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    document.getElementById(`panel-${target}`).classList.add("active");
  });
});

// ── Toast helper ─────────────────────────────────────────
const toast = document.getElementById("toast");
let toastTimer;

function showToast(msg, color = "#ef4444") {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.style.background = color;
  toast.classList.remove("hidden");
  // Force reflow so transition fires
  void toast.offsetWidth;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, 3500);
}

// ── Button loading state helpers ─────────────────────────
function setLoading(btn, isLoading) {
  const spinner = btn.querySelector(".btn-spinner");
  const label = btn.querySelector(".btn-label");
  if (isLoading) {
    btn.disabled = true;
    spinner?.classList.remove("hidden");
    if (label) label.textContent = "Thinking…";
  } else {
    btn.disabled = false;
    spinner?.classList.add("hidden");
  }
}

// ── Generic POST helper ──────────────────────────────────
async function postAPI(endpoint, body) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`Server error ${response.status}: ${err}`);
  }
  return response.json();
}

// ════════════════════════════════════════════════════════
// 1. CHAT
// ════════════════════════════════════════════════════════
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatWindow = document.getElementById("chat-window");
const chatSendBtn = document.getElementById("chat-send-btn");

// Unique session ID for this browser session — backend uses this to load/save
// history in PostgreSQL. Stays the same for the whole page session.
const sessionId = crypto.randomUUID();

function appendBubble(text, role) {
  // Clear welcome message on first real bubble
  const welcome = chatWindow.querySelector(".chat-welcome");
  if (welcome) welcome.remove();

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;

  if (role === "ai") {
    const meta = document.createElement("div");
    meta.className = "bubble-meta";
    meta.textContent = "YouChat AI";
    bubble.appendChild(meta);
  }

  const content = document.createElement("span");
  content.textContent = text;
  bubble.appendChild(content);

  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typing-indicator";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  chatWindow.appendChild(indicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById("typing-indicator")?.remove();
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = "";
  appendBubble(message, "user");

  chatSendBtn.disabled = true;
  chatInput.disabled = true;
  showTypingIndicator();

  try {
    // Send message + sessionId — backend loads/saves history in PostgreSQL
    const data = await postAPI("/chat", { message, sessionId });
    removeTypingIndicator();
    const aiText = data.response || data.message || JSON.stringify(data);
    appendBubble(aiText, "ai");
  } catch (err) {
    removeTypingIndicator();
    showToast("⚠️ " + err.message);
  } finally {
    chatSendBtn.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
});

// Allow Shift+Enter for new line, Enter to submit in chat
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// ════════════════════════════════════════════════════════
// 2. SUMMARIZE
// ════════════════════════════════════════════════════════
const summarizeForm = document.getElementById("summarize-form");
const summarizeNotes = document.getElementById("summarize-notes");
const summarizeBtn = document.getElementById("summarize-btn");
const summarizeResult = document.getElementById("summarize-result");
const summarizeSummaryText = document.getElementById("summarize-summary-text");
const summarizeSuggestText = document.getElementById("summarize-suggestions-text");

summarizeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const notes = summarizeNotes.value.trim();
  if (!notes) return;

  const origLabel = summarizeBtn.querySelector(".btn-label").textContent;
  setLoading(summarizeBtn, true);
  summarizeResult.classList.add("hidden");

  try {
    const data = await postAPI("/summarize", { notes });
    summarizeSummaryText.textContent = data.summary || "(No summary returned)";
    summarizeSuggestText.textContent = data.suggestions || "(No suggestions returned)";
    summarizeResult.classList.remove("hidden");
    summarizeResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    showToast("⚠️ " + err.message);
  } finally {
    setLoading(summarizeBtn, false);
    summarizeBtn.querySelector(".btn-label").textContent = origLabel;
  }
});

// ════════════════════════════════════════════════════════
// 3. CODE REVIEW
// ════════════════════════════════════════════════════════
const reviewForm = document.getElementById("review-form");
const reviewLanguage = document.getElementById("review-language");
const reviewCode = document.getElementById("review-code");
const reviewBtn = document.getElementById("review-btn");
const reviewResult = document.getElementById("review-result");
const reviewReviewText = document.getElementById("review-review-text");
const reviewImproveText = document.getElementById("review-improvements-text");

reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const language = reviewLanguage.value;
  const code = reviewCode.value.trim();

  if (!language) { showToast("Please select a programming language."); return; }
  if (!code) { showToast("Please paste some code to review."); return; }

  const origLabel = reviewBtn.querySelector(".btn-label").textContent;
  setLoading(reviewBtn, true);
  reviewResult.classList.add("hidden");

  try {
    const data = await postAPI("/review-code", { code, language });
    reviewReviewText.textContent = data.review || "(No review returned)";
    reviewImproveText.textContent = data.improvements || "(No improvements returned)";
    reviewResult.classList.remove("hidden");
    reviewResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    showToast("⚠️ " + err.message);
  } finally {
    setLoading(reviewBtn, false);
    reviewBtn.querySelector(".btn-label").textContent = origLabel;
  }
});

// ════════════════════════════════════════════════════════
// 4. QUIZ
// ════════════════════════════════════════════════════════
const quizForm = document.getElementById("quiz-form");
const quizTopic = document.getElementById("quiz-topic");
const quizBtn = document.getElementById("quiz-btn");
const quizResult = document.getElementById("quiz-result");
const quizQuestionEl = document.getElementById("quiz-question-text");
const quizOptionsList = document.getElementById("quiz-options-list");
const quizRevealBtn = document.getElementById("quiz-reveal-btn");
const quizAnswerBox = document.getElementById("quiz-answer-box");
const quizAnswerText = document.getElementById("quiz-answer-text");

/** Parse the options string from the AI into an array of { letter, text } */
function parseOptions(optionsRaw) {
  if (!optionsRaw) return [];
  // Match patterns like: "A) ...", "A. ...", "A: ..."
  const lines = optionsRaw.split(/\n/).map(l => l.trim()).filter(Boolean);
  const options = [];
  for (const line of lines) {
    const match = line.match(/^([A-D])[).:\s]+(.+)$/i);
    if (match) {
      options.push({ letter: match[1].toUpperCase(), text: match[2].trim() });
    } else if (line.length > 0 && options.length < 4) {
      // fallback: just use the raw line
      const letters = ["A", "B", "C", "D"];
      options.push({ letter: letters[options.length], text: line });
    }
  }
  return options.slice(0, 4);
}

quizForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = quizTopic.value.trim();
  if (!topic) return;

  const origLabel = quizBtn.querySelector(".btn-label").textContent;
  setLoading(quizBtn, true);
  quizResult.classList.add("hidden");
  quizAnswerBox.classList.add("hidden");
  quizRevealBtn.classList.add("hidden");
  quizOptionsList.innerHTML = "";

  try {
    const data = await postAPI("/quiz", { topic });

    quizQuestionEl.textContent = data.question || "Could not parse question.";

    const options = parseOptions(data.options);

    if (options.length > 0) {
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.type = "button";
        btn.setAttribute("aria-label", `Option ${opt.letter}: ${opt.text}`);
        btn.innerHTML = `<span class="option-letter">${opt.letter}</span><span>${opt.text}</span>`;
        btn.addEventListener("click", () => {
          // Highlight selected option
          document.querySelectorAll(".quiz-option-btn").forEach(b => {
            b.style.borderColor = "";
            b.style.background = "";
          });
          btn.style.borderColor = "var(--accent-1)";
          btn.style.background = "rgba(124,58,237,0.18)";
        });
        quizOptionsList.appendChild(btn);
      });
    } else {
      // Fallback: show raw options text
      const pre = document.createElement("pre");
      pre.style.cssText = "font-size:14px;color:var(--text-secondary);white-space:pre-wrap;line-height:1.7";
      pre.textContent = data.options || "(No options returned)";
      quizOptionsList.appendChild(pre);
    }

    quizAnswerText.textContent = data.answer || "(No answer returned)";
    quizRevealBtn.classList.remove("hidden");
    quizResult.classList.remove("hidden");
    quizResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (err) {
    showToast("⚠️ " + err.message);
  } finally {
    setLoading(quizBtn, false);
    quizBtn.querySelector(".btn-label").textContent = origLabel;
  }
});

quizRevealBtn.addEventListener("click", () => {
  quizAnswerBox.classList.remove("hidden");
  quizRevealBtn.classList.add("hidden");
  // Disable option buttons after reveal
  document.querySelectorAll(".quiz-option-btn").forEach(b => b.disabled = true);
  quizAnswerBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
