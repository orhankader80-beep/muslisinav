import { useState } from "react";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;
const keyLetter = (a) => (String(a || "").trim().match(/^([A-E])\b/i)?.[1] || "").toUpperCase();

export const useExamCheck = (questions, meta) => {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(false);

  const setAnswer = (i, v) => setAnswers((p) => ({ ...p, [i]: v }));

  const check = async () => {
    const out = {};
    const items = [];
    questions.forEach((q, i) => {
      const pts = Number(q?.points) || 0;
      const ans = String(answers[i] || "").trim();
      const letter = keyLetter(q?.answer);
      if (!ans) out[i] = { status: "empty", score: 0, feedback: "Bu soruyu boş bıraktın." };
      else if (q?.type === "test" && letter) {
        out[i] = ans === letter
          ? { status: "ok", score: pts, feedback: "" }
          : { status: "no", score: 0, feedback: `Senin cevabın ${ans}, doğru cevap ${letter}.` };
      } else {
        const opts = Array.isArray(q?.options) ? q.options : [];
        items.push({ index: i, question: String(q?.question || ""), answer_key: String(q?.answer || ""), points: pts,
          student_answer: q?.type === "test" ? opts.find((o) => o.startsWith(ans)) || ans : ans });
      }
    });
    setChecking(true);
    try {
      if (items.length) {
        if (!API) throw new Error();
        const res = await fetch(`${API}/check`, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade: meta.grade, subject: meta.subject, items }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail);
        (Array.isArray(data?.results) ? data.results : []).forEach((r) => { out[r.index] = r; });
      }
      setResults(out);
    } catch (err) {
      toast.error(typeof err?.message === "string" && err.message ? err.message : "Cevaplar şu an kontrol edilemedi, tekrar dene.");
    } finally {
      setChecking(false);
    }
  };

  return { answers, setAnswer, results, checking, check };
};
