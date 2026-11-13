from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from auth import current_user
from core import db

router = APIRouter(prefix="/api/exams")
LIST_FIELDS = {"_id": 0, "id": 1, "title": 1, "grade": 1, "subject": 1, "topic": 1, "difficulty": 1,
               "score": 1, "total": 1, "created_at": 1, "checked_at": 1}


class ResultIn(BaseModel):
    status: Literal["ok", "partial", "no", "empty"]
    score: int = Field(ge=0, le=100)
    feedback: str = Field(default="", max_length=600)


class AttemptIn(BaseModel):
    answers: dict[str, str] = Field(max_length=10)
    results: dict[str, ResultIn] = Field(max_length=10)


async def own_exam(exam_id: str, user: dict) -> dict:
    exam = await db.exams.find_one({"id": exam_id, "user_id": user["user_id"]}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Yazılı bulunamadı.")
    return exam


@router.get("")
async def list_exams(request: Request):
    user = await current_user(request)
    return await db.exams.find({"user_id": user["user_id"]}, LIST_FIELDS).sort("created_at", -1).to_list(200)


@router.get("/{exam_id}")
async def get_exam(exam_id: str, request: Request):
    return await own_exam(exam_id, await current_user(request))


@router.post("/{exam_id}/attempt")
async def save_attempt(exam_id: str, body: AttemptIn, request: Request):
    exam = await own_exam(exam_id, await current_user(request))
    pts = {str(i): int(q.get("points") or 0) for i, q in enumerate(exam.get("questions", []))}
    answers = {k: v[:1500] for k, v in body.answers.items() if k in pts}
    results = {k: {**r.model_dump(), "score": min(r.score, pts[k])} for k, r in body.results.items() if k in pts}
    score = sum(r["score"] for r in results.values())
    await db.exams.update_one({"id": exam_id}, {"$set": {
        "answers": answers, "results": results, "score": score,
        "checked_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True, "score": score}


@router.delete("/{exam_id}")
async def delete_exam(exam_id: str, request: Request):
    user = await current_user(request)
    res = await db.exams.delete_one({"id": exam_id, "user_id": user["user_id"]})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Yazılı bulunamadı.")
    return {"ok": True}
