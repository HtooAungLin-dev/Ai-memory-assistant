# 🧠 Mem0 + OpenMemory Autonomous Assistant: Continuous Multi-Agent Vector Memory

A production-grade, stateful AI assistant architecture designed to solve the **"zero-context amnesia"** problem in Large Language Model (LLM) applications. Powered by **Mem0**, **OpenMemory MCP**, **LangChain**, and **CrewAI multi-agent orchestration**, this platform maintains continuous cross-session long-term memory with automatic factual extraction, sentiment polarity analysis, semantic deduplication, and topic tagging.

---

## ⚡ The Problem: LLM Amnesia
Traditional conversational LLMs start with a clean slate every time a session ends or the context window resets. Users constantly repeat identity details, tech stack preferences, workflows, and system constraints. 

**Mem0 + OpenMemory Assistant** addresses this by indexing factual propositions into a persistent vector memory graph, dynamically recalling only relevant context shards prior to model reasoning, and updating memory propositions asynchronously in the background.

---

## 🚀 Key Features

### 1. 🔍 Cross-Session Persistent Memory (Mem0 Architecture)
- **Continuous Knowledge Graph**: Retains user identity, technical preferences, project blueprints, workflows, and strict constraints across multiple independent sessions.
- **Dynamic Context Injection**: Prior to answering, queries the persistent vector store to retrieve high-confidence memory shards and dynamically primes the agent context.
- **Heuristic & Gemini Fallback**: Dual-engine extraction ensures memory recall and indexing never fail, even during network latency or API rate limits.

### 2. 🎭 Sentiment Polarity & Valence Analysis
- **Emotional & Functional Polarity**: Evaluates each proposition upon extraction:
  - **Positive (😊)**: Desires, favorites, preferred workflows, and project visions.
  - **Neutral (😐)**: Architectural definitions, identifiers, and factual specifications.
  - **Negative (⚠️)**: Strict system constraints, avoidances, prohibitions, and negative preferences (e.g. *"Never wipe context across sessions"*).
- Visual indicators and sentiment filter controls in the Memory Inspector.

### 3. 🏷️ Automated Descriptive Topic Tagging
- Automatically categorizes new memories with 2–4 descriptive topic tags (e.g. `#TypeScript`, `#Architecture`, `#VectorStore`, `#CrewAI`).
- Rendered as colored chips with a click-to-filter carousel and search integration.

### 4. 🗃️ Memory Inspector & Bulk Management
- **Full Vector CRUD**: Add, edit, pin, unpin, search, and delete memory shards.
- **Bulk Selection Actions**:
  - **Bulk Tagging**: Simultaneously attach new topic tags to multiple selected memories.
  - **Bulk Deletion**: Clean up redundant or expired shards with safe preview dialogs.
  - **Cold Storage Archiving**: Isolate rarely accessed memory shards to keep your active workspace decluttered, with one-click restore.
- **Global Search & Sorting**: Real-time filtering across keywords, categories, sentiment states, and tags.

### 5. 🎙️ Floating 'Record Quick Note' (Browser Microphone API)
- **Zero-Friction Voice Ingestion**: Instant floating recorder button with real-time audio waveform visualizer powered by `AudioContext` and `AnalyserNode`.
- **Dual-Path Speech Transcription**:
  - **Web Speech API**: Real-time live streaming transcription directly in the browser as words are spoken.
  - **Gemini Multimodal Audio Proxy**: Fallback `/api/transcribe-audio` endpoint for accurate verbatim transcription.
- **Direct Memory Indexing**: Automatically runs captured speech through proposition extraction, assigns sentiment, attaches `#VoiceNote` tags, and injects into persistent vector storage.

### 6. ✨ AI Semantic Deduplication & Consolidation
- Evaluates the vector memory graph to detect redundant, overlapping, or rephrased statements.
- Proposes unified, consolidated factual statements with editable previews before committing changes.

### 7. 🤖 Multi-Agent Orchestration Swarm (CrewAI)
- **Mem0 Ingest Agent**: Listens to conversational streams, extracts factual propositions, and calculates confidence embeddings.
- **OpenMemory MCP Bridge**: Standardizes memory access across tools and models using the Model Context Protocol.
- **LangChain Retrieval Agent**: Performs cosine similarity search to retrieve relevant shards.
- **CrewAI Coordinator**: Synthesizes cross-agent outputs into coherent responses.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite |
| **Backend & Proxy** | Node.js, Express, tsx |
| **AI & LLM Services** | Google Gemini API (`@google/genai`), Multi-Model Fallbacks |
| **Memory & MCP** | Mem0 Protocol, OpenMemory MCP, LangChain Memory Patterns |
| **Multi-Agent Runtime** | CrewAI Collaborative Multi-Agent Simulation Pipeline |

---

## 🏛️ System Architecture Flow

```
[ User Input ]
      │
      ▼
[ Express API Proxy ] ───► [ Persistent Vector Store (Mem0 Graph) ]
      │                                       │
      ▼                                       ▼
[ Dual-Engine Memory Extractor ]      [ Context Recall & Injection ]
  ├─ Gemini Flash Engine                      │
  └─ Intelligent Heuristic Fallback           ▼
      │                                [ LLM Generation ]
      ├── Extract Factual Propositions        │
      ├── Sentiment Analysis (Pos/Neu/Neg)   ▼
      └── Descriptive Topic Tagging     [ Response to User ]
```

---

## 📦 API Specification

### `POST /api/chat`
Processes conversational queries with dynamic vector memory context recall.
- **Request Body**:
  ```json
  {
    "message": "What is our architecture strategy for vector retention?",
    "history": [],
    "memories": [...]
  }
  ```
- **Response**: Returns assistant reply with list of recalled memory IDs.

### `POST /api/extract-memories`
Extracts long-term factual propositions, evaluates sentiment, and generates topic tags.
- **Request Body**:
  ```json
  {
    "text": "User prefers TypeScript and strict architectural constraints against wiping context."
  }
  ```
- **Response**:
  ```json
  {
    "memories": [
      {
        "content": "User prefers TypeScript",
        "category": "preference",
        "confidence": 0.98,
        "sentiment": "positive",
        "tags": ["TypeScript", "Frontend", "Preferences"]
      }
    ],
    "source": "gemini"
  }
  ```

### `POST /api/dedup-memories`
Detects semantic duplicates and proposes merged memory records.

---

## 🏃 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/mem0-openmemory-assistant.git
   cd mem0-openmemory-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.
