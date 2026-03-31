# Lumea - System Architecture & Diagrams 📐

This document provides a highly detailed visual and structural overview of the **Lumea - Celestial Sanctuary**, integrating the latest schemas mapping user flows, safety, layouts, and data.

---

## 🔄 1. Data Flow Diagram
Tracks the complex flow of information from user input through processing, safety engines, and AI generations.

```mermaid
%%{init: {'themeVariables': { 'fontSize': '30px' }}}%%
flowchart TD

%% ================= STYLES =================
classDef process fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000;
classDef store fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000;
classDef external fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#000;

%% ================= CORE FLOW =================
User[User]

P1((1 Validate & Rate Limit))
P2((2 Safety Scan))
P3((3 Emotion Detect))
P4((4 Prompt Builder))
P5((5 Response Generator))

%% ================= SIDE MODULES =================
P6((CBT Distortion))
P7((Audio TTS))

%% ================= EXTERNAL =================
GroqAPI[Groq API]
HFAPI[HF Emotion API]
TTSAPI[Edge TTS]

%% ================= DATABASE =================
D1[(Profiles)]
D2[(Sessions)]
D3[(Messages)]
D4[(Mood)]
D5[(Journal)]

%% ================= FLOW =================

%% Main Pipeline
User -->|Text / Voice| P1 --> P2 --> P3 --> P4 --> P5

%% AI Connections
P3 --> HFAPI --> P3
P5 --> GroqAPI --> P5

%% Side Features
User -->|CBT Thought| P6
P6 --> GroqAPI --> P6
P5 --> P7 --> TTSAPI --> P7

%% Outputs
P2 -->|If Risk| User
P5 -->|Text Output| User
P7 -->|Audio Output| User
P6 -->|CBT Reframe| User

%% Database
User --> D1
User --> D4
User --> D5

P5 --> D3
P5 --> D2
P4 --> D3

%% ================= STYLING =================
class User,GroqAPI,HFAPI,TTSAPI external;
class P1,P2,P3,P4,P5,P6,P7 process;
class D1,D2,D3,D4,D5 store;
```

---

## 🏛️ 2. Layered Architecture
Highlights the modular decomposition of the architecture from the interface down to persistent storage.

```mermaid
%%{init: {'themeVariables': { 'fontSize': '30px' }}}%%

flowchart TB
 subgraph Client_Tier["Client Layer"]
    direction LR
        User(("User"))
        UI["Streamlit UI"]
        CSS["Theme CSS"]
  end
 subgraph Views["Views"]
    direction LR
        AuthView["Auth"]
        Dashboard["Dashboard"]
        ChatView["Chat"]
        CBTTool["CBT Tool"]
        MoodView["Mood"]
        JournalView["Journal"]
        PlaygroundView["Playground"]
  end
 subgraph Middle_Layer["Components + Control"]
    direction LR
        Sidebar["Sidebar"]
        UICards["UI Cards"]
        RateLimit["Rate Limiter"]
        Safety["Safety Engine"]
  end
 subgraph Service_Layer["AI + DB Services"]
    direction LR
        LLM_Sys["LLM Controller"]
        Emo_Sys["Emotion Analyzer"]
        CBT_NLP["CBT Analyzer"]
        Audio_Sys["TTS"]
        DB_Client["Supabase Client"]
  end
 subgraph App_Tier["Application Layer"]
    direction TB
        Main["app.py Router"]
        Views
        Middle_Layer
        Service_Layer
  end
 subgraph External_AI["AI Services"]
    direction LR
        Groq["Groq"]
        HF["HuggingFace"]
        TTS["Edge TTS"]
  end
 subgraph Database["Database"]
    direction LR
        SupAuth["Auth"]
        T_Profiles[("profiles")]
        T_Mood[("mood")]
        T_Journal[("journal")]
        T_Sessions[("sessions")]
        T_Msgs[("messages")]
  end
    User --> UI
    UI --> Main
    Main --> Views
    Views --> Middle_Layer
    Middle_Layer --> Service_Layer
    LLM_Sys <--> Groq
    Emo_Sys <--> HF
    CBT_NLP <--> Groq
    Audio_Sys <--> TTS
    DB_Client <--> SupAuth & T_Profiles & T_Mood & T_Journal & T_Sessions & T_Msgs
    ChatView --> LLM_Sys & Emo_Sys & Audio_Sys & Safety
    CBTTool --> CBT_NLP
    ChatView -.-> RateLimit
    Safety --> Emo_Sys & UICards

     User:::client
     UI:::client
     CSS:::client
     AuthView:::view
     Dashboard:::view
     ChatView:::view
     CBTTool:::view
     MoodView:::view
     JournalView:::view
     PlaygroundView:::view
     Sidebar:::comp
     UICards:::comp
     RateLimit:::security
     Safety:::security
     LLM_Sys:::comp
     Emo_Sys:::comp
     CBT_NLP:::comp
     Audio_Sys:::comp
     DB_Client:::comp
     Main:::entry
     Groq:::ai
     HF:::ai
     TTS:::ai
     SupAuth:::db
     T_Profiles:::db
     T_Mood:::db
     T_Journal:::db
     T_Sessions:::db
     T_Msgs:::db
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000
    classDef entry fill:#bbdefb,stroke:#0d47a1,stroke-width:2px,color:#000
    classDef view fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef comp fill:#b3e5fc,stroke:#0277bd,stroke-width:1px,color:#000
    classDef security fill:#ffcdd2,stroke:#b71c1c,stroke-width:2px,color:#000
    classDef ai fill:#e1bee7,stroke:#4a148c,stroke-width:2px,color:#000
    classDef db fill:#ffe0b2,stroke:#e65100,stroke-width:2px,color:#000
```

---

## 👥 3. System Use Case Diagram
Maps out exactly what the user can do within the sanctuary, linking front-end functions to backend intelligence.

```mermaid
---
config:
  layout: elk
---
%%{init: {'themeVariables': { 'fontSize': '30px' }}}%%
flowchart TB
 subgraph Primary["User Functionalities"]
    direction TB
        Auth(("Account Authentication and Profiling"))
        Dashboard(("Access Stellar Dashboard"))
        Chat(("Engage in Empathetic Chat"))
        CBT(("Utilize CBT Mindset Reframer"))
        Mood(("Track and Log Daily Mood"))
        Journal(("Manage Private Journal Entries"))
        Breathing(("Interactive Breathing Sync"))
        Playground(("Explore Star Playground"))
  end
 subgraph System_Process["Background Intelligence"]
    direction LR
        Emotion(("Analyze Sentiment via DistilRoBERTa"))
        Distortion(("Detect JSON Cognitive Distortions"))
  end
 subgraph Safety_Block["Safety System"]
    direction TB
        Safety(("Interrupt Imminent Self Harm Risk"))
  end
 subgraph Lumea_Platform["Lumea Application Domain"]
    direction TB
        Primary
        System_Process
        Safety_Block
  end
    User(["User"]) --> Auth & Dashboard & Chat & CBT & Mood & Journal & Breathing & Playground
    Chat -. includes .-> Emotion
    CBT -. includes .-> Distortion
    Safety -. extends if risk detected .-> Chat
    Safety --> Helplines(["National Emergency Helplines"])

     User:::actor
     Helplines:::actor
     Auth:::primary_case
     Dashboard:::primary_case
     Chat:::primary_case
     CBT:::primary_case
     Mood:::primary_case
     Journal:::primary_case
     Breathing:::primary_case
     Playground:::primary_case
     Emotion:::sub_case
     Distortion:::sub_case
     Safety:::safety_case
    classDef actor fill:#f5f5f5,stroke:#333,stroke-width:2px,color:#000
    classDef primary_case fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    classDef sub_case fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000,stroke-dasharray: 4 4
    classDef safety_case fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
```

---

## 🛡️ 4. Safety Protocol
Demonstrates the secure safety interception layer that preemptively blocks harm risks before context reaches the LLM.

```mermaid
%%{init: {'themeVariables': { 'fontSize': '20px' }}}%%

flowchart LR
    A[User Types Message] --> B{Safety Keyword Scanner}
    B -->|Self-Harm Detected| C[Drop LLM Context]
    B -->|Safe| D[Route to Emotion API]
    C --> E[Force-Render Emergency Support Card]
    E --> F((Local 24/7 Helplines))
```

---

## 🚀 4. System Overview
Provides a generalized top-level map of the major user interaction pathways and AI intelligence branches.

```mermaid
flowchart TD
    %% Define Clean Styles for Intro Readability
    classDef start_node fill:#1565c0,stroke:#0d47a1,stroke-width:2px,color:#fff;
    classDef decision_node fill:#ff8f00,stroke:#ff6f00,stroke-width:2px,color:#fff;
    classDef action_node fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px,color:#000;
    classDef ai_node fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#000;
    classDef calm_node fill:#e0f7fa,stroke:#00838f,stroke-width:2px,color:#000;
    classDef secure_db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000;

    %% Entry
    Start([User Logs into Lumea])
    Hub{What kind of support<br/>do you need today?}
    
    %% Branch 1: AI Chat Companion
    Chat(Start Empathetic Chat)
    Safety[Safety Check: Interrupts if Harm Risk]
    Emotion[DistilRoBERTa: Analyzes Emotion]
    Groq[Llama 3.3: Generates AI Reply]
    Voice[Edge-TTS: Speaks Reply Aloud]
    
    %% Branch 2: EXPLICIT CBT BRANCH
    CBT_Tool(Open Cognitive Behavioral Therapy Tool)
    Identify[User Inputs a Negative Automatic Thought]
    Detect[AI Analyzes Thought for Cognitive Distortions]
    Reframe[AI Guides User to a Positive Reframe]
    
    %% Branch 3: Box Breathing
    Breathe(Open Guided Box Breathing)
    Animation[Follow 4-4-4-4 Visual Pacing]
    Focus[Regulate Nervous System & Reduce Anxiety]
    
    %% Branch 4: Mood & Journaling
    Tracker(Open Mood & Journaling Suite)
    LogMood[User Logs Daily Mood Level on 1-5 Scale]
    Diary[User Writes a Private Diary Entry]

    %% Convergence / Persistent Storage
    DB[(Data Saved Securely via Supabase RLS)]
    
    %% Flow Mapping
    Start --> Hub
    
    %% Chat Path
    Hub -->|Seek Emotional Support| Chat
    Chat --> Safety
    Safety -->|If Input is Safe| Emotion
    Emotion --> Groq
    Groq --> Voice
    Voice --> DB
    
    %% Explicit CBT Path
    Hub -->|Start Cognitive Restructuring| CBT_Tool
    CBT_Tool --> Identify
    Identify --> Detect
    Detect --> Reframe
    Reframe --> DB
    
    %% Breathing Path
    Hub -->|Manage Acute Stress or Anxiety| Breathe
    Breathe --> Animation
    Animation --> Focus
    Focus -.->|Return to Hub or Log Activity| Hub
    
    %% Tracker Path
    Hub -->|Document Feelings| Tracker
    Tracker --> LogMood
    LogMood --> Diary
    Diary --> DB

    %% Explicit Class Assignments
    class Start start_node;
    class Hub decision_node;
    class Chat,Identify,LogMood,Diary,CBT_Tool,Tracker action_node;
    class Safety,Emotion,Groq,Voice,Detect,Reframe ai_node;
    class Breathe,Animation,Focus calm_node;
    class DB secure_db;
```

---

## 🗄️ 5. Entity Relationship Schema (ERD)
The robust backend schema managing the expanded structure of `auth_users_id`, `profiles`, `chat_history`, `mood_entries`, and `journal_entries`.

```mermaid
---
config:
  layout: dagre
---
%%{init: {'themeVariables': { 'fontSize': '30px' }}}%%

erDiagram
	direction TB
	auth_users_id {
		uuid id PK ""  
	}

	profiles {
		uuid id PK ""  
		uuid user_id FK ""  
		text username  ""  
		text email  ""  
		text bio  ""  
		text phone  ""  
		text avatar_url  ""  
		timestamptz created_at  ""  
		timestamptz updated_at  ""  
	}

	chat_messages {
		uuid id PK ""  
		uuid session_id FK ""  
		text role  ""  
		text content  ""  
		text emotion  ""  
		numeric score  ""  
		timestamptz created_at  ""  
	}

	chat_history {
		uuid id PK ""  
		uuid user_id FK ""  
		text message  ""  
		text response  ""  
		bool is_ai  ""  
		timestamptz created_at  ""  
	}

	journal_entries {
		uuid id PK ""  
		uuid user_id FK ""  
		text title  ""  
		text content  ""  
		int4 mood_before  ""  
		int4 mood_after  ""  
		bool is_private  ""  
		text image_url  ""  
		text audio_url  ""  
		timestamptz created_at  ""  
		timestamptz updated_at  ""  
	}

	mood_entries {
		uuid id PK ""  
		uuid user_id FK ""  
		int4 mood  ""  
		text note  ""  
		text tags  ""  
		timestamptz created_at  ""  
	}

	chat_sessions {
		uuid id PK ""  
		uuid user_id FK ""  
		text title  ""  
		timestamptz created_at  ""  
	}

	auth_users_id||--o|profiles:"links to"
	auth_users_id||--o{chat_sessions:"starts"
	auth_users_id||--o{chat_history:"has"
	auth_users_id||--o{journal_entries:"writes"
	auth_users_id||--o{mood_entries:"logs"
	chat_sessions||--o{chat_messages:"contains"
```
