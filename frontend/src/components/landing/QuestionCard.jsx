import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, CircleDashed, MinusCircle } from "lucide-react";

export const LETTERS = ["A", "B", "C", "D", "E"];

const STATUS = {
  ok: { label: "Doğru", bg: "bg-[#2ED59A]", Icon: Check },
  partial: { label: "Kısmen doğru", bg: "bg-[#FFD43B]", Icon: MinusCircle },
  no: { label: "Yanlış", bg: "bg-[#FF5436]", Icon: X },
  empty: { label: "Boş bırakıldı", bg: "bg-white", Icon: CircleDashed },
};

const Result = ({ r, points, n }) => {
  const s = STATUS[r.status] || STATUS.no;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`brut-sm mt-4 rounded-2xl ${s.bg} p-4`} data-testid={`demo-result-${n}`}>
      <p className="flex items-center gap-2 font-display text-lg font-extrabold"><s.Icon size={18} /> {s.label} · {r.score}/{points} puan</p>
      {r.feedback && <p className="mt-1 leading-relaxed">{r.feedback}</p>}
    </motion.div>
  );
};

export const QuestionCard = ({ q, i, answer, onAnswer, result }) => {
  const [open, setOpen] = useState(false);
  const options = Array.isArray(q?.options) ? q.options : [];
  const n = i + 1;

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="border-b-2 border-dashed border-[#16130F]/25 py-6 last:border-0"
      data-testid={`demo-question-card-${n}`}
    >
      <div className="flex items-start gap-4">
        <span className="font-display text-3xl font-extrabold text-[#2D5BFF]">{n}.</span>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-[#16130F] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase">{q?.type === "test" ? "Test" : "Açık uçlu"}</span>
            <span className="rounded-full bg-[#2ED59A] px-2.5 py-0.5 font-mono text-[11px] font-bold" data-testid={`demo-question-points-${n}`}>{q?.points ?? 0} puan</span>
          </div>
          <p className="whitespace-pre-line text-base font-semibold leading-7 sm:text-lg">{q?.question}</p>
          {options.length > 0 && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {options.map((o, k) => {
                const picked = answer === LETTERS[k];
                return (
                  <li key={k}>
                    <button
                      type="button"
                      data-testid={`demo-option-${n}-${LETTERS[k]}`}
                      aria-pressed={picked}
                      onClick={() => onAnswer(picked ? "" : LETTERS[k])}
                      className={`w-full rounded-xl border-2 px-3 py-2 text-left text-sm transition-colors ${picked ? "border-[#16130F] bg-[#2D5BFF] font-bold text-white" : "border-[#16130F]/20 hover:border-[#16130F] hover:bg-[#FFF6E9]"}`}
                    >
                      {/^[A-E]\)/.test(o) ? o : `${LETTERS[k]}) ${o}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {q?.type !== "test" && (
            <textarea
              data-testid={`demo-answer-input-${n}`}
              data-lenis-prevent
              rows={4}
              value={answer || ""}
              onChange={(e) => onAnswer(e.target.value)}
              maxLength={1500}
              placeholder="Cevabını buraya yaz…"
              aria-label={`${n}. sorunun cevabı`}
              className="ruled mt-3 w-full resize-y rounded-xl border-2 border-dashed border-[#16130F]/30 bg-transparent px-3 pt-1 text-base leading-8 text-[#16130F] placeholder:text-[#16130F]/50 focus:border-solid focus:border-[#2D5BFF] focus:outline-none print:h-40"
            />
          )}

          <div className="no-print mt-4 flex flex-wrap items-center gap-2">
            <button data-testid={`demo-toggle-answer-${n}`} onClick={() => setOpen((o) => !o)} className="btn-pop brut-sm inline-flex items-center gap-2 rounded-full bg-[#FFD43B] px-4 py-2 text-sm font-bold">
              {open ? <EyeOff size={16} /> : <Eye size={16} />} {open ? "Cevabı gizle" : "Cevabı göster"}
            </button>
          </div>

          {result && <Result r={result} points={q?.points ?? 0} n={n} />}

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl bg-[#FFF6E9] p-4 ring-2 ring-[#16130F]" data-testid={`demo-answer-${n}`}>
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#2D5BFF]">Cevap</p>
                  <p className="mt-1 font-semibold">{q?.answer}</p>
                  {q?.explanation && (<>
                    <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest text-[#2D5BFF]">Çözüm</p>
                    <p className="mt-1 whitespace-pre-line leading-relaxed text-[#16130F]/85">{q.explanation}</p>
                  </>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
};
