import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

from core import db

router = APIRouter(prefix="/api/auth")
JWT_ALG = "HS256"
ACCESS_MIN = 15
REFRESH_DAYS = 7
SESSION_DAYS = 7
MAX_ATTEMPTS = 5
LOCK_MIN = 15
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
COOKIE = dict(httponly=True, secure=True, samesite="none", path="/")


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleIn(BaseModel):
    session_id: str = Field(min_length=1, max_length=512)


def now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def secret() -> str:
    return os.environ["JWT_SECRET"]


def public_user(u: dict) -> dict:
    return {"user_id": u["user_id"], "email": u["email"], "name": u.get("name", ""), "picture": u.get("picture")}


def set_jwt_cookies(response: Response, user_id: str, email: str) -> None:
    access = jwt.encode({"sub": user_id, "email": email, "type": "access", "exp": now() + timedelta(minutes=ACCESS_MIN)}, secret(), algorithm=JWT_ALG)
    refresh = jwt.encode({"sub": user_id, "type": "refresh", "exp": now() + timedelta(days=REFRESH_DAYS)}, secret(), algorithm=JWT_ALG)
    response.set_cookie("access_token", access, max_age=ACCESS_MIN * 60, **COOKIE)
    response.set_cookie("refresh_token", refresh, max_age=REFRESH_DAYS * 86400, **COOKIE)


def aware(dt) -> datetime:
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


async def optional_user(request: Request) -> dict | None:
    bearer = request.headers.get("Authorization", "")
    bearer = bearer[7:] if bearer.startswith("Bearer ") else ""
    token = request.cookies.get("access_token") or bearer
    if token:
        try:
            payload = jwt.decode(token, secret(), algorithms=[JWT_ALG])
            if payload.get("type") == "access":
                u = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                if u:
                    return u
        except jwt.InvalidTokenError:
            pass
    session = request.cookies.get("session_token") or bearer
    if session:
        s = await db.user_sessions.find_one({"session_token": session}, {"_id": 0})
        if s and aware(s["expires_at"]) > now():
            return await db.users.find_one({"user_id": s["user_id"]}, {"_id": 0, "password_hash": 0})
    return None


async def current_user(request: Request) -> dict:
    u = await optional_user(request)
    if not u:
        raise HTTPException(status_code=401, detail="Giriş yapman gerekiyor.")
    return u


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


@router.post("/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 1})
    if existing:
        msg = "Bu e-posta ile zaten bir hesap var." if existing.get("password_hash") else "Bu e-posta Google ile kayıtlı. Google ile giriş yap."
        raise HTTPException(status_code=400, detail=msg)
    user = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": body.name.strip(),
            "picture": None, "password_hash": hash_password(body.password), "created_at": now()}
    await db.users.insert_one(user)
    set_jwt_cookies(response, user["user_id"], email)
    return public_user(user)


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    ident = f"{client_ip(request)}:{email}"
    att = await db.login_attempts.find_one({"identifier": ident}, {"_id": 0})
    if att and att.get("locked_until") and aware(att["locked_until"]) > now():
        raise HTTPException(status_code=429, detail="Çok fazla hatalı deneme. 15 dakika sonra tekrar dene.")
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        count = (att or {}).get("count", 0) + 1
        update = {"count": count, "locked_until": now() + timedelta(minutes=LOCK_MIN) if count >= MAX_ATTEMPTS else None}
        await db.login_attempts.update_one({"identifier": ident}, {"$set": update}, upsert=True)
        if user and not user.get("password_hash"):
            raise HTTPException(status_code=401, detail="Bu hesap Google ile oluşturuldu. Google ile giriş yap.")
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")
    await db.login_attempts.delete_one({"identifier": ident})
    set_jwt_cookies(response, user["user_id"], email)
    return public_user(user)


@router.post("/google/session")
async def google_session(body: GoogleIn, response: Response):
    async with httpx.AsyncClient(timeout=15) as http:
        r = await http.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Google ile giriş doğrulanamadı.")
    data = r.json()
    email = str(data["email"]).lower()
    user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    if user:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {
            "name": user.get("name") or data.get("name", ""), "picture": data.get("picture") or user.get("picture")}})
    else:
        user = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": data.get("name", ""),
                "picture": data.get("picture"), "created_at": now()}
        await db.users.insert_one(dict(user))
    await db.user_sessions.insert_one({"user_id": user["user_id"], "session_token": data["session_token"],
                                       "expires_at": now() + timedelta(days=SESSION_DAYS), "created_at": now()})
    response.set_cookie("session_token", data["session_token"], max_age=SESSION_DAYS * 86400, **COOKIE)
    fresh = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return public_user(fresh)


@router.get("/me")
async def me(request: Request):
    return public_user(await current_user(request))


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Oturum bulunamadı.")
    try:
        payload = jwt.decode(token, secret(), algorithms=[JWT_ALG])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Oturum süresi doldu.")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Geçersiz oturum.")
    user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
    set_jwt_cookies(response, user["user_id"], user["email"])
    return public_user(user)


@router.post("/logout")
async def logout(request: Request, response: Response):
    session = request.cookies.get("session_token")
    if session:
        await db.user_sessions.delete_one({"session_token": session})
    for name in ("access_token", "refresh_token", "session_token"):
        response.delete_cookie(name, **COOKIE)
    return {"ok": True}
