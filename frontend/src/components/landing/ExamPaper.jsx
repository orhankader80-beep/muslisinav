import { useMemo } from "react";
import { Printer, RotateCcw, ClipboardCheck, Loader2 } from "lucide-react";
import { LogoMark } from "./Logo";
import { QuestionCard } from "./QuestionCard";
import { useExamCheck } from "./useExamCheck";

export const ExamPaper = ({ exam, meta, onNew }) => {
  const questions = useMemo(() => (Array.isArray(exam?.questions) ? exam.questions : []), [exam]);
  const { answers, setAnswer, results, checking, check } = useExamCheck(questions, meta);
  const total = questions.reduce((s, q) => s + (Number(q?.points) || 0), 0);
  const checked = Object.keys(results).length > 0;
  const score = Object.values(results).reduce((s, r) => s + (Number(r?.score) || 0), 0);

  return (
    <div id="exam-paper" className="brut relative rounded-3xl bg-white p-6 text-[#16130F] sm:p-10" data-testid="demo-exam-paper">
      <header className="flex flex-col gap-4 border-b-[2.5px] border-[#16130F] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={44} />
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-[#16130F]/70">{meta.grade}. sınıf · {meta.subject} · {meta.difficulty}</p>
            <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl" data-testid="demo-exam-title">{exam?.title || "Deneme yazılısı"}</h3>
          </div>
        </div>
        <div className="brut-sm shrink-0 rounded-2xl bg-[#FFD43B] px-5 py-3 text-center" data-testid="demo-score">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest">Notun</p>
          <p className="font-display text-3xl font-extrabold">{score}<span className="text-lg font-bold">/{total}</span></p>
        </div>
      </header>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <span>Ad Soyad: ..................</span><span>No: ..........</span><span className="hidden sm:block">Tarih: ....../....../......</span>
      </div>
      <ol className="mt-2">
        {questions.map((q, i) => (
          <QuestionCard key={i} q={q} i={i} answer={answers[i]} onAnswer={(v) => setAnswer(i, v)} result={results[i]} />
        ))}
      </ol>
      <button
        data-testid="demo-check-answers-button"
        onClick={check}
        disabled={checking}
        className="no-print btn-pop brut mt-4 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#FF5436] px-6 py-4 font-display text-lg font-bold text-[#16130F] disabled:opacity-70"
      >
        {checking ? <Loader2 className="animate-spin" size={20} /> : <ClipboardCheck size={20} />}
        {checking ? "Cevapların kontrol ediliyor…" : checked ? "Cevaplarımı tekrar kontrol et" : "Cevaplarımı kontrol et"}
      </button>
      <footer className="no-print mt-6 flex flex-col gap-3 border-t-[2.5px] border-[#16130F] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#16130F]/75" data-testid="demo-score-hint">
          {!checked ? "Cevaplarını yaz ya da şıkkını seç, sonra “Cevaplarımı kontrol et”e bas. Notun otomatik hesaplanır." : score >= 85 ? "Harika! Bu konuya hazırsın." : score >= 50 ? "İyi gidiyorsun. Yanlışlarının çözümüne bir göz at." : "Çözümleri oku ve yeni bir deneme oluştur."}
        </p>
        <div className="flex gap-2">
          <button data-testid="demo-download-pdf-button" onClick={() => window.print()} className="btn-pop brut-sm inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold">
            <Printer size={16} /> Yazdır / PDF
          </button>
          <button data-testid="demo-new-exam-button" onClick={onNew} className="btn-pop brut-sm inline-flex items-center gap-2 rounded-full bg-[#2D5BFF] px-4 py-2.5 text-sm font-bold text-white">
            <RotateCcw size={16} /> Yeni yazılı
          </button>
        </div>
      </footer>
    </div>
  );
};
