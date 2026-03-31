import os
import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

EMOTION_MAP = {
    "joy": "😊 Joy",
    "sadness": "😢 Sadness",
    "anger": "😠 Anger",
    "fear": "😨 Fear",
    "surprise": "😲 Surprise",
    "disgust": "🤢 Disgust",
    "neutral": "😐 Neutral",
}

HF_API_URL = "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base"

class EmotionRequest(BaseModel):
    text: str

@router.post("/api/emotion")
async def emotion(req: EmotionRequest):
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "error": {"code": "SERVER_CONFIG_ERROR", "message": "Hugging Face token is not configured on server."}
        })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            HF_API_URL,
            headers={"Authorization": f"Bearer {hf_token}", "Content-Type": "application/json"},
            json={"inputs": req.text},
            timeout=30,
        )

    if response.status_code == 503:
        return JSONResponse(status_code=200, content={"status": "loading", "message": "⏳ Loading Hugging Face Model..."})

    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            predictions = data[0]
            top_pred = max(predictions, key=lambda x: x["score"])
            label = top_pred["label"].lower()
            score = top_pred["score"]
            mapped_label = EMOTION_MAP.get(label, label.capitalize())
            return JSONResponse(content={"emotion": mapped_label, "score": round(score * 100 * 10) / 10})

    return JSONResponse(status_code=response.status_code, content={
        "status": "error",
        "error": {"code": "UPSTREAM_API_ERROR", "message": f"Hugging Face API returned error status: {response.status_code}"}
    })
