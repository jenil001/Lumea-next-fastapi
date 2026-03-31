# ✨ Lumea - Celestial Sanctuary

**Lumea** is a high-fidelity, AI-powered mental health companion designed to provide a "Sanctuary" for emotional processing. It features a stunning glassmorphism UI, real-time emotion detection, and advanced safety mechanisms.

---

## 🚀 Deployment Guide (Vercel)

Lumea is built with Next.js and optimized for **Vercel**. Follow these steps to take your sanctuary to the cloud:

### 1. Push to GitHub
If you haven't already, initialize a repository and push your code:
```bash
git init
git add .
git commit -m "🚀 Initial Sanctuary Delivery"
git remote add origin your_github_repo_url
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [Vercel](https://vercel.com/new).
2. Import your GitHub repository.
3. In the **Environment Variables** section, copy the values from your `.env.local`:

| Variable | Importance |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private** |
| `GROQ_API_KEY` | **Private** |
| `HF_TOKEN` | **Private** |

4. Click **Deploy**.

---

## 🛠️ Configuration & Database Setup

### Supabase Tables
Ensure your Supabase project has the following table for Journaling functionality:

**`journal_entries`**
- `id`: uuid (primary key)
- `user_id`: text (matches supabase auth)
- `title`: text
- `content`: text
- `created_at`: timestamp with time zone (default: now())
- `is_private`: boolean

---

## 🎨 Architecture: Celestial Sanctuary
- **Core**: Next.js 16 (App Router)
- **Database**: Supabase (Auth + PostgreSQL)
- **AI Brain**: Groq SDK (Llama 3.3 70B)
- **Emotion Engine**: Hugging Face Inference (DistilRoBERTa)
- **Design System**: Modular `PageHeader` & `GlassCard` + `theme.js`

---
*Created with care by the Celestial Sanctuary Team.*
