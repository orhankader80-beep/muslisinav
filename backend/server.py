import asyncio
import json
import logging
import os
import uuid
from contextlib import suppress
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
LLM_KEY = os.environ['EMERGENT_LLM_KEY']
HOURLY_LIMIT = 12

INDEXES: dict[str, list[IndexModel]] = {
    "waitlist": [IndexModel([("email", ASCENDING)], name="email", unique=True)],
    "generations": [IndexModel([("ip", ASCENDING), ("created_at", DESCENDING)], name="ip_created")],
}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


app = FastAPI()
api_router = APIRouter(prefix="/api")


class GenerateRequest(BaseModel):
    grade: int = Field(ge=5, le=12)
    subject: str = Field(min_length=2, max_length=60)
    topic: str = Field(default="", max_length=120)
    difficulty: Literal["Kolay", "Orta", "Zor"] = "Orta"
    qtype: Literal["Açık uçlu", "Test", "Karma"] = "Karma"


class WaitlistRequest(BaseModel):
    email: EmailStr


SYSTEM_PROMPT = (
    "Sen Türkiye'de MEB müfredatını çok iyi bilen deneyimli bir öğretmensin. "
    "Öğrenciler için okul yazılı sınavına hazırlık soruları hazırlarsın. "
    "Yalnızca geçerli JSON döndür; açıklama, markdown veya kod bloğu yazma."
)


def build_prompt(r: GenerateRequest) -> str:
    topic = r.topic.strip() or "dönemin temel konuları"
    type_rule = {
        "Açık uçlu": "Tüm sorular açık uçlu (klasik yazılı) olsun.",
        "Test": "Tüm sorular 4 seçenekli (A, B, C, D) çoktan seçmeli olsun.",
        "Karma": "3 açık uçlu ve 2 adet 4 seçenekli (A, B, C, D) çoktan seçmeli soru olsun.",
    }[r.qtype]
    return (
        f"{r.grade}. sınıf {r.subject} dersi için '{topic}' konusunda, {r.difficulty} zorlukta "
        f"5 soruluk bir yazılı sınav hazırla. {type_rule} Puanların toplamı tam 100 olsun. "
        "Sorular Türkçe, sınıf seviyesine uygun ve net olsun. Şu JSON şemasını kullan:\n"
        '{"title": "kısa sınav başlığı", "questions": [{"type": "acik" veya "test", '
        '"question": "soru metni", "options": ["A) ...", "B) ...", "C) ...", "D) ..."] (açık uçluda boş liste), '
        '"answer": "doğru cevap (testte harf ve seçenek)", "explanation": "adım adım kısa çözüm", "points": 20}]}'
    )


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


@api_router.get("/")
async def root():
    return {"message": "Mulisınav API"}


@api_router.post("/generate")
async def generate(body: GenerateRequest, request: Request):
    ip = client_ip(request)
    since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    used = await db.generations.count_documents({"ip": ip, "created_at": {"$gte": since}})
    if used >= HOURLY_LIMIT:
        raise HTTPException(status_code=429, detail="Saatlik deneme sınırına ulaştın. Biraz sonra tekrar dene.")
    await db.generations.insert_one({
        "id": str(uuid.uuid4()), "ip": ip, "grade": body.grade, "subject": body.subject,
        "topic": body.topic, "created_at": datetime.now(timezone.utc).isoformat(),
    })

    chat = LlmChat(api_key=LLM_KEY, session_id=f"exam-{uuid.uuid4()}", system_message=SYSTEM_PROMPT) \
        .with_model("anthropic", "claude-sonnet-4-6")

    async def events():
        try:
            async for ev in chat.stream_message(UserMessage(text=build_prompt(body))):
                if isinstance(ev, TextDelta):
                    yield f"data: {json.dumps({'t': ev.content}, ensure_ascii=False)}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("generate failed: %s", exc)
            yield f"data: {json.dumps({'error': 'Sorular şu an üretilemedi, lütfen tekrar dene.'})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api_router.post("/waitlist")
async def join_waitlist(body: WaitlistRequest):
    email = body.email.lower()
    if await db.waitlist.find_one({"email": email}, {"_id": 1}):
        return {"ok": True, "already": True}
    await db.waitlist.insert_one({"id": str(uuid.uuid4()), "email": email,
                                  "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True, "already": False}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def start_index_build():
    app.state.index_task = asyncio.create_task(ensure_indexes())


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
