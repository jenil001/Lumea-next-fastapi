from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, emotion, cbt, mood_insight

app = FastAPI(title="Lumea API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(emotion.router)
app.include_router(cbt.router)
app.include_router(mood_insight.router)
