# Lumea - AI Mental Health Companion 🌙

**Lumea** is a high-fidelity, empathetic, and supportive AI-powered mental health companion. Designed as a "Celestial Sanctuary," it provides a safe, judgment-free space for emotional processing, mood tracking, and mindful reflection. By leveraging ultra-fast Large Language Models and specialized NLP emotion classifiers, Lumea simulates the cadence and care of a reflective conversation.

> [!IMPORTANT]
> Lumea is an experimental AI companion designed for reflection, not clinical therapy. If you are experiencing a crisis, please reach out to professional emergency services. Lumea includes built-in safety halts to redirect distressed users to appropriate resources.

---

## ✨ Features: The Celestial Sanctuary

Lumea has been completely reimagined with a **Glassmorphism Design System**, utilizing deep, calming HSL aesthetics and a highly modular architecture.

### Core Modules

* **💬 Empathic Chat Engine** 
  * Real-time streaming AI conversation.
  * Custom 2-second "Reflection Loop" typing animations to introduce a calming, human-like tempo.
  * Context-aware memory across active sessions.

* **🎭 Dynamic Emotion Detection**
  * Seamless, parallel analysis of user input using state-of-the-art NLP models.
  * Sentiment tagged on user messages in real-time (e.g., *😊 Joy*, *😢 Sadness*).

* **🌌 Mood Galaxy Tracker**
  * Visualize your emotional journey on a temporal axis.
  * Log daily energy/valence states to discover underlying emotional patterns.

* **📓 Lunar Journal & 🧘 Mindset Reframe**
  * A private, encrypted space for deep reflection and long-form writing.
  * Built-in Cognitive Behavioral Therapy (CBT) guides to help you identify cognitive distortions and practice positive reframing.

* **🫁 Breath Sync Exercises**
  * Interactive, visually-guided breathing exercises aligned with rhythmic celestial aesthetics to lower immediate anxiety.

---

## 🚀 Technical Stack Matrix

Our modernized stack prioritizes speed, security, and developer ergonomics.

| Domain | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | Provides high-performance React rendering, optimized layouts, and easy integration of Server Actions for our API suite. |
| **Design System** | **Glassmorphism (Vanilla CSS)** | Custom-built UI using HSL thematic tokens for frosted glass effects, avoiding heavy UI libraries for raw performance. |
| **Iconography** | **Lucide & Material Symbols** | Sleek, modern visual language. |
| **Language Model Core** | **Groq API (Llama 3.3 70B)** | Chosen for its unprecedented tokens-per-second, enabling ultra-fast, empathetic response generation. |
| **NLP Feature Extraction**| **HF Inference Serverless** | Uses `DistilRoBERTa` for zero-shot text classification, securely predicting emotion layers synchronously. |
| **Backend & Persistence** | **Supabase Cloud** | Provides blazing-fast PostgreSQL database access, Row Level Security (RLS), and secure JWT Authentication. |

---

## 🛡️ Security & Boundaries

We place a high premium on digital wellness and user safety.
1. **Safety Shield (100+ Phrases)**: Immediate browser-level detection of distressed language. Terminates API requests and presents a safety card.
2. **Daily Spirit Limit (Rate Limiting)**: Caps interactions at 100 messages/day to prevent unhealthy AI dependence or circular rumination.
3. **Data Privacy**: End-to-end user isolation powered by Supabase Row-Level Security.

---

## 🛠️ Setup & Installation Guide

Follow these steps to deploy your local instance of the Celestial Sanctuary.

### 1. Prerequisites
- **Node.js**: v18.0 or higher.
- **Supabase**: A free Supabase Project (Database URL & Anon Key).
- **Groq API**: An active Groq API Key for the Llama model.
- **Hugging Face**: An active Access Token for the Inference API.

### 2. Standard Installation
Navigate to the frontend directory and install the necessary dependencies:
```bash
cd lumea-next
npm install
```

### 3. Environment Configuration
Create a `.env.local` file at the root of `lumea-next`. Map the required variables:

```properties
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Intelligence Configuration
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_hf_access_token
```

### 4. Database Schema
Execute the initial SQL tables via the Supabase SQL Editor. *(Refer to the ERD in `ARCHITECTURE.md` for schema layout)*. You will need to create the `users`, `chat_sessions`, `chat_messages`, `journal_entries`, and `mood_logs` tables.

### 5. Launch the Sanctuary
Start the Next.js development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to enter the sanctuary.

---

## 📐 System Architecture

For extremely detailed technical mapping—including **Use Case, Data Flow (DFD), System Architecture, Sequence Flow, and ERD Diagrams**—please refer to the [System Architecture Document](ARCHITECTURE.md).

---

## 👥 Contributors
- Bhargav Kikani
- Yash Rank
- Jenil Gandhi
- Viral Nayi

---
*Lumea - Your celestial guide to a calmer mind.*
