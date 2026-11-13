import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { subjectsForGrade } from "./shared";

const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];
const LEVELS = ["Kolay", "Orta", "Zor"];
const TYPES = ["Açık uçlu", "Test", "Karma"];

const Label = ({ children }) => <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-[#FFF6E9]/80">{children}</span>;

const Segment = ({ items, value, onChange, testid }) => (
  <div className="grid grid-cols-3 gap-2" data-testid={testid}>
    {items.map((it) => (
      <button
        key={it}
        type="button"
        data-testid={`${testid}-${it.toLowerCase().replace(/\s/g, "-")}`}
        onClick={() => onChange(it)}
        className={`rounded-xl border-2 border-[#FFF6E9] px-2 py-2.5 text-sm font-bold transition-colors ${value === it ? "bg-[#FFD43B] text-[#16130F]" : "text-[#FFF6E9] hover:bg-[#FFF6E9]/10"}`}
      >
        {it}
      </button>
    ))}
  </div>
);

const triggerCls = "h-12 rounded-xl border-2 border-[#FFF6E9] bg-transparent text-base font-semibold text-[#FFF6E9] focus:ring-[#FFD43B]";

export const DemoForm = ({ form, setForm, onSubmit, loading }) => {
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setGrade = (g) => setForm((f) => {
    const list = subjectsForGrade(g);
    return { ...f, grade: g, subject: list.includes(f.subject) ? f.subject : list[0] };
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6" data-testid="demo-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sınıf</Label>
          <Select value={String(form.grade)} onValueChange={(v) => v && setGrade(Number(v))}>
            <SelectTrigger className={triggerCls} data-testid="demo-grade-select"><SelectValue /></SelectTrigger>
            <SelectContent data-lenis-prevent>
              {GRADES.map((g) => <SelectItem key={g} value={String(g)} data-testid={`demo-grade-option-${g}`}>{g}. sınıf</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Ders</Label>
          <Select value={form.subject} onValueChange={(v) => v && set("subject")(v)}>
            <SelectTrigger className={triggerCls} data-testid="demo-subject-select"><SelectValue /></SelectTrigger>
            <SelectContent data-lenis-prevent>
              {subjectsForGrade(form.grade).map((s) => <SelectItem key={s} value={s} data-testid={`demo-subject-option-${s}`}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Konu</Label>
        <input
          data-testid="demo-topic-input"
          value={form.topic}
          maxLength={120}
          onChange={(e) => set("topic")(e.target.value)}
          placeholder="ör. Kesirlerle işlemler"
          className="h-12 w-full rounded-xl border-2 border-[#FFF6E9] bg-transparent px-4 text-base font-semibold text-[#FFF6E9] placeholder:text-[#FFF6E9]/55 focus:outline-none focus:ring-2 focus:ring-[#FFD43B]"
        />
      </div>
      <div><Label>Zorluk</Label><Segment items={LEVELS} value={form.difficulty} onChange={set("difficulty")} testid="demo-difficulty" /></div>
      <div><Label>Soru tipi</Label><Segment items={TYPES} value={form.qtype} onChange={set("qtype")} testid="demo-qtype" /></div>
      <button
        type="submit"
        disabled={loading}
        data-testid="demo-generate-button"
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full border-[2.5px] border-[#FFF6E9] bg-[#FF5436] px-6 py-4 font-display text-lg font-bold text-[#16130F] shadow-[5px_5px_0_#FFF6E9] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="transition-transform duration-300 group-hover:rotate-12" />}
        {loading ? "Yazılın hazırlanıyor…" : "Deneme yazılımı oluştur"}
      </button>
      <p className="text-xs text-[#FFF6E9]/70">Yapay zekâ ile üretilir; bazen hata yapabilir. Önemli bilgileri ders kitabından kontrol et.</p>
    </form>
  );
};
