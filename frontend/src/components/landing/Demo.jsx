import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PencilLine, Lock, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, apiJson, errText } from "@/lib/api";
import { Reveal, Eyebrow, scrollToId } from "./shared";
import { DemoForm } from "./DemoForm";
import { ExamPaper } from "./ExamPaper";

const GuestLimit = () => {
  const navigate = useNavigate();
  return (
    <div className="brut flex min-h-[420px] flex-col items-start justify-center rounded-3xl bg-[#FFD43B] p-8 text-[#16130F] sm:p-12" data-testid="demo-guest-limit">
      <span className="brut-sm inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white"><Lock /></span>
      <p className="font-display mt-6 text-3xl font-extrabold leading-tight sm:text-4xl">2 ücretsiz yazılı hakkını kullandın.</p>
      <p className="mt-3 max-w-md text-[#16130F]/85">Ücretsiz kayıt ol; yeni yazılılar oluştur, notların ve cevapların hesabında saklansın.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button data-testid="demo-guest-register" onClick={() => navigate("/giris", { state: { mode: "register", from: "/#deneme" } })} className="btn-pop brut-sm rounded-full bg-[#FF5436] px-6 py-3 font-bold">Ücretsiz kayıt ol</button>
        <button data-testid="demo-guest-login" onClick={() => navigate("/giris", { state: { from: "/#deneme" } })} className="btn-pop brut-sm rounded-full bg-white px-6 py-3 font-bold">Giriş yap</button>
      </div>
    </div>
  );
};

const parseExam = (text) => {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e < 0) return null;
  try {
    const data = JSON.parse(text.slice(s, e + 1));
    return Array.isArray(data?.questions) && data.questions.length ? data : null;
  } catch { return null; }
};

const Writing = ({ count }) => (
  <div className="brut flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center text-[#16130F]" data-testid="demo-loading">
    <motion.div animate={{ rotate: [-12, 12, -12], x: [-10, 10, -10] }} transition={{ duration: 1.2, repeat: Infinity }}>
      <PencilLine size={56} className="text-[#2D5BFF]" />
    </motion.div>
    <p className="font-display mt-6 text-3xl font-extrabold">Soruların yazılıyor<span className="caret">_</span></p>
    <p className="mt-2 font-mono text-sm font-bold" data-testid="demo-progress-count">{Math.min(count, 5)}/5 soru hazır</p>
    <div className="mt-5 h-4 w-full max-w-xs overflow-hidden rounded-full border-2 border-[#16130F]">
      <motion.div className="h-full bg-[#2ED59A]" animate={{ width: `${Math.max(8, Math.min(count, 5) * 20)}%` }} transition={{ duration: 0.4 }} />
    </div>
  </div>
);

const Empty = () => (
  <div className="brut relative flex min-h-[420px] overflow-hidden rounded-3xl bg-[#FFD43B]" data-testid="demo-empty">
    <img src="/images/laptop.jpg" alt="Masada ders çalışan öğrenci ve dizüstü bilgisayar" className="absolute inset-0 h-full w-full object-cover opacity-90" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#16130F]/85 via-[#16130F]/20 to-transparent" />
    <div className="relative mt-auto p-8 text-[#FFF6E9]">
      <p className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Sınav kâğıdın burada belirecek.</p>
      <p className="mt-2 text-[#FFF6E9]/90">Soldan seçimini yap ve "Deneme yazılımı oluştur"a bas.</p>
    </div>
  </div>
);

export const Demo = () => {
  const [form, setForm] = useState({ grade: 7, subject: "Matematik", topic: "", difficulty: "Orta", qtype: "Karma" });
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [exam, setExam] = useState(null);
  const [meta, setMeta] = useState(null);
  const [runId, setRunId] = useState(0);
  const [examId, setExamId] = useState(null);
  const [limitHit, setLimitHit] = useState(false);
  const [usage, setUsage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const outRef = useRef(null);

  useEffect(() => {
    if (user !== false) { setUsage(null); setLimitHit(false); return; }
    apiJson("/guest-usage").then((d) => { setUsage(d); setLimitHit((d?.used ?? 0) >= (d?.limit ?? 2)); }).catch(() => setUsage(null));
  }, [user]);

  useEffect(() => {
    const onPreset = (e) => setForm((f) => ({ ...f, ...(e.detail || {}) }));
    window.addEventListener("muli:preset", onPreset);
    return () => window.removeEventListener("muli:preset", onPreset);
  }, []);

  const generate = async () => {
    if (limitHit) { scrollToId("demo-output"); return; }
    setLoading(true); setExam(null); setCount(0); setExamId(null);
    if (window.innerWidth < 1024) setTimeout(() => scrollToId("demo-output"), 50);
    let text = "";
    let newId = null;
    let serverExam = null;
    try {
      const res = await apiFetch("/generate", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 403 && !user) { setLimitHit(true); return; }
        throw new Error(errText(err?.detail));
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          const line = p.replace(/^data: /, "").trim();
          if (!line || line === "[DONE]") continue;
          const msg = JSON.parse(line);
          if (msg.error) throw new Error(msg.error);
          if (msg.reset) text = "";
          if (msg.exam_id) newId = msg.exam_id;
          if (msg.exam) serverExam = msg.exam;
          text += msg.t || "";
        }
        setCount((text.match(/"question"\s*:/g) || []).length);
      }
      const data = Array.isArray(serverExam?.questions) && serverExam.questions.length ? serverExam : parseExam(text);
      if (!data) throw new Error("Sorular okunamadı, lütfen tekrar dene.");
      setExam(data); setMeta({ ...form }); setRunId((r) => r + 1); setExamId(newId);
      if (newId) toast.success("Yazılın Yazılılarım'a kaydedildi.");
      if (!user) setUsage((u) => (u ? { ...u, used: u.used + 1 } : u));
    } catch (err) {
      toast.error(err?.message || "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="deneme" className="grain relative bg-[#16130F] text-[#FFF6E9]" data-testid="demo-section">
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <Eyebrow color="bg-[#FF5436]">Canlı deneme</Eyebrow>
          <h2 className="font-display mt-5 max-w-4xl text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
            Hadi, ilk yazılını <span className="text-[#FFD43B]">şimdi</span> oluştur.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[#FFF6E9]/85 sm:text-lg">Kayıt olmadan 2 yazılı ücretsiz. Seç, bas, çöz.</p>
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <DemoForm form={form} setForm={setForm} onSubmit={generate} loading={loading} />
              {user === false && usage && (
                <p className="mt-4 rounded-xl border-2 border-dashed border-[#FFF6E9]/40 px-4 py-3 text-sm text-[#FFF6E9]/90" data-testid="demo-guest-usage">
                  Ücretsiz hakkın: <b>{Math.max(0, usage.limit - usage.used)}/{usage.limit}</b> yazılı. <button onClick={() => navigate("/giris", { state: { mode: "register", from: "/#deneme" } })} className="font-bold text-[#FFD43B] underline underline-offset-4" data-testid="demo-usage-register-link">Kayıt ol</button>, yazılıların kaydedilsin.
                </p>
              )}
              {user && (
                <button onClick={() => navigate("/yazililarim")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#FFF6E9] underline underline-offset-4 hover:text-[#FFD43B]" data-testid="demo-my-exams-link">
                  <BookOpenCheck size={16} /> Yazılıların hesabına kaydediliyor
                </button>
              )}
            </div>
          </div>
          <div id="demo-output" ref={outRef} className="lg:col-span-8">
            {loading ? <Writing count={count} /> : exam ? <ExamPaper key={runId} exam={exam} meta={meta} examId={examId} onNew={() => { setExam(null); scrollToId("deneme"); }} /> : limitHit ? <GuestLimit /> : <Empty />}
          </div>
        </div>
      </div>
    </section>
  );
};
