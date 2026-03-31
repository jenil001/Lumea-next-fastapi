import os
import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq

router = APIRouter()

class CBTRequest(BaseModel):
    thought_text: str

@router.post("/api/cbt")
async def cbt(req: CBTRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "error": {"code": "SERVER_CONFIG_ERROR", "message": "Groq API key is not configured on server."}
        })

    system_prompt = (
        "You are Lumea, an empathetic AI mental health companion trained in automated CBT (Cognitive Behavioral Therapy). "
        "Analyze the thought below to identify if it matches a common Cognitive Distortion.\n\n"
        "Common Distortions:\n"
        "- Catastrophizing: Assuming the worst-case scenario.\n"
        "- All-or-Nothing Thinking: Seeing things in black and white lists.\n"
        "- Mind Reading: Assuming you know what others are thinking.\n"
        "- Fortune Telling: Predicting a negative future outcome.\n"
        "- Should Statements: Rigid demands ('I should/must be').\n"
        "- Labeling: Attaching global negative terms to yourself.\n\n"
        "Respond in JSON format with EXACTLY these keys:\n"
        "{\n"
        '  "distortion": "Name of distortion",\n'
        '  "description": "1-sentence warm explanation of why this thought matches.",\n'
        '  "reframe_prompt": "1-sentence supportive question guiding the user to challenge it."\n'
        "}"
    )

    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f'Automatic Thought: "{req.thought_text}"'}
        ],
        temperature=0.3,
        max_tokens=200,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    if not content:
        return JSONResponse(status_code=500, content={
            "status": "error",
            "error": {"code": "CBT_ANALYSIS_FAILED", "message": "Empty response from AI engine."}
        })

    return JSONResponse(content=json.loads(content))
