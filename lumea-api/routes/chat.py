import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from groq import Groq

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    current_emotion: Optional[str] = None
    themeId: Optional[str] = None

@router.post("/api/chat")
async def chat(req: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "error": {"code": "SERVER_CONFIG_ERROR", "message": "Groq API key is not configured on server."}
        })

    is_night_sky = req.themeId == "night-sky"

    if is_night_sky:
        system_prompt = (
            "You are Lumea, the compassionate AI guardian of the Celestial Sanctuary. "
            "Your purpose is to provide an empathetic, non-judgmental space for emotional processing. "
            "Use warm, poetic, and grounding language inspired by the stars and the moon. "
        )
    else:
        system_prompt = (
            "You are Lumea, the compassionate AI. "
            "Your purpose is to provide an empathetic, non-judgmental space for emotional processing. "
            "Use warm, kind, and grounding language. "
        )

    system_prompt += (
        "Guidelines:\n"
        "- Be concise and deeply empathetic.\n"
        "- Never provide medical or clinical advice.\n"
        "- If the user expresses extreme distress, de-escalate with profound care and gently direct them to the professional resources available in their safety panel."
    )

    if req.current_emotion and not req.current_emotion.startswith("⚠️"):
        context_prefix = "[Celestial Context: The seeker" if is_night_sky else "[Emotional Context: The user"
        context_suffix = "Align your cosmic resonance with this state.]" if is_night_sky else "Align your empathetic response with this state.]"
        system_prompt += f"\n\n{context_prefix} is currently experiencing {req.current_emotion}. {context_suffix}"

    clean_messages = [{"role": "system", "content": system_prompt}] + [
        {"role": msg.role, "content": msg.content}
        for msg in req.messages
        if msg.role in ("user", "assistant")
    ]

    client = Groq(api_key=api_key)

    def stream_response():
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=clean_messages,
            temperature=0.7,
            max_tokens=500,
            stream=True,
        )
        for chunk in completion:
            content = chunk.choices[0].delta.content or ""
            if content:
                yield content

    return StreamingResponse(stream_response(), media_type="text/plain; charset=utf-8")
