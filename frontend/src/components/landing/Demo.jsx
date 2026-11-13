import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Reveal, Eyebrow, scrollToId } from "./shared";
import { DemoForm } from "./DemoForm";
import { ExamPaper } from "./ExamPaper";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

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
  const outRef = useRef(null);

  useEffect(() => {
    const onPreset = (e) => setForm((f) => ({ ...f, ...(e.detail || {}) }));
    window.addEventListener("muli:preset", onPreset);
    return () => window.removeEventListener("muli:preset", onPreset);
  }, []);

  const generate = async () => {
    if (!API) { toast.error("Sunucuya ulaşılamıyor."); return; }
    setLoading(true); setExam(null); setCount(0);
    if (window.innerWidth < 1024) setTimeout(() => scrollToId("demo-output"), 50);
    let text = "";
    try {
      const res = await fetch(`${API}/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Bir şeyler ters gitti, tekrar dene.");
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
          text += msg.t || "";
        }
        setCount((text.match(/"question"\s*:/g) || []).length);
      }
      const data = parseExam(text);
      if (!data) throw new Error("Sorular okunamadı, lütfen tekrar dene.");
      setExam(data); setMeta({ ...form }); setRunId((r) => r + 1);
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
          <p className="mt-5 max-w-2xl text-base text-[#FFF6E9]/85 sm:text-lg">Kayıt yok, kurulum yok. Seç, bas, çöz.</p>
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28"><DemoForm form={form} setForm={setForm} onSubmit={generate} loading={loading} /></div>
          </div>
          <div id="demo-output" ref={outRef} className="lg:col-span-8">
            {loading ? <Writing count={count} /> : exam ? <ExamPaper key={runId} exam={exam} meta={meta} onNew={() => { setExam(null); scrollToId("deneme"); }} /> : <Empty />}
          </div>
        </div>
      </div>
    </section>
  );
};
