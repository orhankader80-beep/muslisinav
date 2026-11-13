# Mulisınav — PRD

## Original problem statement
"Bir iniş sayfası oluşturun: Knk bana herkesin yazılılara çalışabileceği profesyonel bir uygulama yap."
User choices: Tanıtım + çalışan deneme; Ortaokul ve lise (5–12); ad: Mulisınav; Enerjik ve renkli görünüm.

## Architecture
- React (CRA) landing page, framer-motion + lenis, shadcn Select/Accordion, sonner. Components in `src/components/landing/`.
- FastAPI: `POST /api/generate` (SSE stream, Claude Sonnet 4.6 via Emergent LLM key, 12 req/hour/IP limit), `POST /api/waitlist` (dedupe by email). MongoDB: `waitlist`, `generations`.
- Images saved locally in `public/images/` (Unsplash). Favicon/logo: `public/favicon.svg`.

## User personas
- 5–12. sınıf öğrencileri, veliler, öğretmenler.

## Implemented (2026-11-13)
- Neo-brutalist pop landing: kinetic masked hero, 3D tilt exam card + parallax photo, slow marquee, 12-col bento, 3 steps, live AI demo (grade/subject/topic/difficulty/type → 5-question 100-point exam, answer reveal, self-scoring, print/PDF), subject chips that preset the demo, waitlist, FAQ, giant footer wordmark.

## Backlog
- P1: Konu bazlı soru geçmişi (tarayıcıda kayıtlı), PDF indirme (print yerine gerçek PDF)
- P2: Öğrenci hesapları ve ilerleme takibi, öğretmen modu
