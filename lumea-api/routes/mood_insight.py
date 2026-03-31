import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
from groq import Groq

router = APIRouter()

class MoodEntry(BaseModel):
    mood: int
    note: Optional[str] = None
    created_at: str

class MoodInsightRequest(BaseModel):
    entries: List[Any]
    themeId: Optional[str] = None

@router.post("/api/mood-insight")
async def mood_insight(req: MoodInsightRequest):
    if not req.entries:
        return JSONResponse(content={"insight": "No mood data yet. Start tracking to see your patterns unfold."})

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return JSONResponse(content={"insight": "AI insights unavailable — API key not configured."})

    mood_labels = {1: "Calm", 2: "Joyful", 3: "Anxious", 4: "Sad"}
    is_night_sky = req.themeId == "night-sky"

    summary_lines = []
    for e in req.entries[:7]:
        label = mood_labels.get(e.get("mood"), "Unknown")
        date_str = datetime.fromisoformat(e["created_at"]).strftime("%a, %b %d")
        note = e.get("note", "")
        line = f'{date_str}: {label}' + (f' — "{note}"' if note else "")
        summary_lines.append(line)
    summary = "\n".join(summary_lines)

    client = Groq(api_key=api_key)

    theme_instruction = (
        "Use gentle celestial and star-themed metaphors."
        if is_night_sky
        else "Use human-centric, grounded metaphors about growth, flow, and inner peace. Avoid celestial/star references."
    )

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are Lumea, a compassionate AI journaling companion.\n"
                    f"Analyze the user's recent mood entries and provide a warm, poetic, 1-2 sentence insight about their emotional patterns.\n"
                    f"Be encouraging and specific about what you notice.\n"
                    f"{theme_instruction}\n"
                    f"Never diagnose or give clinical advice. Keep it to 30 words max."
                )
            },
            {
                "role": "user",
                "content": f"Here are my recent mood entries:\n{summary}\n\nGive me a short insight."
            }
        ],
        temperature=0.75,
        max_tokens=80,
    )

    fallback = "Your stars are aligning." if is_night_sky else "Your emotional journey is unfolding beautifully."
    insight = completion.choices[0].message.content or f"{fallback} Keep tracking to reveal the patterns."
    return JSONResponse(content={"insight": insight})
