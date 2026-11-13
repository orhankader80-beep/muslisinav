import asyncio
import json
import logging
import os
import uuid
from contextlib import suppress
from datetime import datetime, timedelta, timezone
from typing import Literal
from urllib.parse import urlparse

from core import client, db
from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage
from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware

import auth
import exams
from auth import client_ip, optional_user

LLM_KEY = os.environ['EMERGENT_LLM_KEY']
HOURLY_LIMIT = 12
CHECK_LIMIT = 30
GUEST_LIMIT = 2

INDEXES: dict[str, list[IndexModel]] = {
    "waitlist": [IndexModel([("email", ASCENDING)], name="email", unique=True)],
    "generations": [IndexModel([("ip", ASCENDING), ("kind", ASCENDING), ("created_at", DESCENDING)], name="ip_kind_created")],
    "users": [IndexModel([("email", ASCENDING)], name="email", unique=True),
              IndexModel([("user_id", ASCENDING)], name="user_id", unique=True)],
    "user_sessions": [IndexModel([("session_token", ASCENDING)], name="session_token"),
                      IndexModel([("expires_at", ASCENDING)], name="expires_ttl", expireAfterSeconds=0)],
    "login_attempts": [IndexModel([("identifier", ASCENDING)], name="identifier")],
    "exams": [IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)], name="user_created"),
              IndexModel([("id", ASCENDING)], name="id", unique=True)],
    "guest_usage": [IndexModel([("guest_id", ASCENDING)], name="guest_id")],
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


class CheckItem(BaseModel):
    index: int = Field(ge=0, le=9)
    question: str = Field(max_length=2000)
    answer_key: str = Field(max_length=2000)
    points: int = Field(ge=0, le=100)
    student_answer: str = Field(min_length=1, max_length=1500)


class CheckRequest(BaseModel):
    grade: int = Field(ge=5, le=12)
    subject: str = Field(min_length=2, max_length=60)
    items: list[CheckItem] = Field(min_length=1, max_length=10)


CHECK_PROMPT = (
    "Sen adil ve yapıcı bir öğretmensin. Öğrencinin yazılı cevaplarını cevap anahtarına göre puanla. "
    "Anlamı doğru olan farklı ifadeleri kabul et, kısmen doğru cevaplara kısmi puan ver. "
    "Yalnızca geçerli JSON döndür; açıklama, markdown veya kod bloğu yazma."
)


def build_check_prompt(r: CheckRequest) -> str:
    items = [{"index": it.index, "soru": it.question, "cevap_anahtari": it.answer_key,
              "puan": it.points, "ogrenci_cevabi": it.student_answer} for it in r.items]
    return (
        f"{r.grade}. sınıf {r.subject} yazılısı. Her cevabı 0 ile kendi puanı arasında puanla. "
        "Geri bildirim öğrenciye hitap etsin, en fazla 2 cümle, Türkçe olsun ve eksiği söylesin.\n"
        f"Cevaplar: {json.dumps(items, ensure_ascii=False)}\n"
        'Şema: {"results": [{"index": 0, "score": 15, "feedback": "..."}]}'
    )


def parse_json(text: str) -> dict:
    start, end = text.find("{"), text.rfind("}")
    return json.loads(text[start:end + 1]) if start >= 0 and end > start else {}


async def enforce_limit(kind: str, ip: str, limit: int) -> None:
    since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    used = await db.generations.count_documents({"ip": ip, "kind": kind, "created_at": {"$gte": since}})
    if used >= limit:
        raise HTTPException(status_code=429, detail="Saatlik deneme sınırına ulaştın. Biraz sonra tekrar dene.")
    await db.generations.insert_one({"id": str(uuid.uuid4()), "ip": ip, "kind": kind,
                                     "created_at": datetime.now(timezone.utc).isoformat()})


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


def guest_id_of(request: Request) -> str:
    return request.headers.get("x-guest-id", "").strip()[:64]


@api_router.get("/")
async def root():
    return {"message": "Mulisınav API"}


@api_router.get("/guest-usage")
async def guest_usage(request: Request):
    gid = guest_id_of(request)
    used = await db.guest_usage.count_documents({"guest_id": gid}) if gid else 0
    return {"used": used, "limit": GUEST_LIMIT}


@api_router.post("/generate")
async def generate(body: GenerateRequest, request: Request):
    user = await optional_user(request)
    gid = guest_id_of(request)
    if not user:
        if not gid:
            raise HTTPException(status_code=400, detail="Tarayıcı kimliği eksik, sayfayı yenile.")
        if await db.guest_usage.count_documents({"guest_id": gid}) >= GUEST_LIMIT:
            raise HTTPException(status_code=403, detail="Ücretsiz 2 yazılı hakkını kullandın. Devam etmek için ücretsiz kayıt ol.")
    ip = client_ip(request)
    await enforce_limit("generate", ip, HOURLY_LIMIT)

    chat = LlmChat(api_key=LLM_KEY, session_id=f"exam-{uuid.uuid4()}", system_message=SYSTEM_PROMPT) \
        .with_model("anthropic", "claude-sonnet-4-6")

    async def events():
        text = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=build_prompt(body))):
                if isinstance(ev, TextDelta):
                    text += ev.content
                    yield f"data: {json.dumps({'t': ev.content}, ensure_ascii=False)}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            exam = parse_json(text)
            if isinstance(exam.get("questions"), list) and exam["questions"]:
                if user:
                    exam_id = str(uuid.uuid4())
                    await db.exams.insert_one({
                        "id": exam_id, "user_id": user["user_id"], **body.model_dump(),
                        "title": str(exam.get("title", ""))[:200], "questions": exam["questions"][:10],
                        "total": sum(int(q.get("points") or 0) for q in exam["questions"][:10] if isinstance(q, dict)),
                        "answers": {}, "results": {}, "score": None, "checked_at": None,
                        "created_at": datetime.now(timezone.utc).isoformat()})
                    yield f"data: {json.dumps({'exam_id': exam_id})}\n\n"
                else:
                    await db.guest_usage.insert_one({"guest_id": gid, "ip": ip, "created_at": datetime.now(timezone.utc).isoformat()})
            yield "data: [DONE]\n\n"
        except Exception as exc:
            logger.error("generate failed: %s", exc)
            yield f"data: {json.dumps({'error': 'Sorular şu an üretilemedi, lütfen tekrar dene.'})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@api_router.post("/check")
async def check_answers(body: CheckRequest, request: Request):
    await enforce_limit("check", client_ip(request), CHECK_LIMIT)
    chat = LlmChat(api_key=LLM_KEY, session_id=f"check-{uuid.uuid4()}", system_message=CHECK_PROMPT) \
        .with_model("anthropic", "claude-sonnet-4-6")
    text = ""
    try:
        async for ev in chat.stream_message(UserMessage(text=build_check_prompt(body))):
            if isinstance(ev, TextDelta):
                text += ev.content
            elif isinstance(ev, StreamDone):
                break
        raw = {r.get("index"): r for r in parse_json(text).get("results", []) if isinstance(r, dict)}
    except Exception as exc:
        logger.error("check failed: %s", exc)
        raise HTTPException(status_code=502, detail="Cevaplar şu an kontrol edilemedi, tekrar dene.")
    results = []
    for it in body.items:
        r = raw.get(it.index, {})
        score = max(0, min(it.points, int(r.get("score", 0) or 0)))
        status = "ok" if score == it.points and it.points > 0 else "partial" if score > 0 else "no"
        results.append({"index": it.index, "score": score, "status": status, "feedback": str(r.get("feedback", ""))[:500]})
    return {"results": results}


@api_router.post("/waitlist")
async def join_waitlist(body: WaitlistRequest):
    email = body.email.lower()
    if await db.waitlist.find_one({"email": email}, {"_id": 1}):
        return {"ok": True, "already": True}
    await db.waitlist.insert_one({"id": str(uuid.uuid4()), "email": email,
                                  "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True, "already": False}


app.include_router(api_router)
app.include_router(auth.router)
app.include_router(exams.router)


@app.middleware("http")
async def origin_check(request: Request, call_next):
    has_auth_cookie = any(request.cookies.get(c) for c in ("access_token", "refresh_token", "session_token"))
    if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.url.path.startswith("/api") and has_auth_cookie:
        origin = request.headers.get("origin")
        host = request.headers.get("x-forwarded-host") or request.headers.get("host")
        if origin and urlparse(origin).netloc != host:
            return JSONResponse({"detail": "Geçersiz istek kaynağı."}, status_code=403)
    return await call_next(request)

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
