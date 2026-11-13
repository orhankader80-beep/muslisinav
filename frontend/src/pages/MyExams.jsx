import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Trash2, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const COLORS = ["bg-[#FFD43B]", "bg-[#2ED59A]", "bg-[#FF9BD2]", "bg-[#8FB1FF]", "bg-[#FF5436]"];
const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; } };

const Stat = ({ label, value, bg, testid }) => (
  <div className={`brut rounded-2xl ${bg} p-5`} data-testid={testid}>
    <p className="font-mono text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="font-display mt-1 text-4xl font-extrabold">{value}</p>
  </div>
);

const ExamCard = ({ e, i, onDelete }) => {
  const checked = e?.score !== null && e?.score !== undefined;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="brut group relative flex flex-col rounded-3xl bg-white p-6" data-testid={`my-exam-card-${i}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`brut-sm rounded-full ${COLORS[i % COLORS.length]} px-3 py-1 font-mono text-xs font-bold`}>{e?.grade}. sınıf · {e?.subject}</span>
        <button onClick={() => onDelete(e.id)} aria-label="Sil" data-testid={`my-exam-delete-${i}`} className="rounded-full p-2 text-[#16130F]/60 transition-colors hover:bg-[#FF5436]/20 hover:text-[#16130F]"><Trash2 size={18} /></button>
      </div>
      <h3 className="font-display mt-4 text-xl font-extrabold leading-tight">{e?.title || "Deneme yazılısı"}</h3>
      <p className="mt-1 text-sm text-[#16130F]/70">{fmtDate(e?.created_at)} · {e?.difficulty}</p>
      <div className="mt-6 flex items-end justify-between">
        {checked ? (
          <p className="font-display text-4xl font-extrabold" data-testid={`my-exam-score-${i}`}>{e.score}<span className="text-lg">/{e?.total ?? 100}</span></p>
        ) : (
          <p className="text-sm font-semibold text-[#16130F]/70" data-testid={`my-exam-score-${i}`}>Henüz kontrol edilmedi</p>
        )}
        <Link to={`/yazili/${e.id}`} data-testid={`my-exam-open-${i}`} className="btn-pop brut-sm inline-flex items-center gap-1 rounded-full bg-[#2D5BFF] px-4 py-2 text-sm font-bold text-white">
          {checked ? "İncele" : "Çöz"} <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default function MyExams() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState(null);

  useEffect(() => {
    apiJson("/exams").then((d) => setExams(Array.isArray(d) ? d : [])).catch(() => setExams([]));
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Bu yazılıyı silmek istediğine emin misin?")) return;
    try {
      await apiJson(`/exams/${id}`, { method: "DELETE" });
      setExams((xs) => xs.filter((x) => x.id !== id));
      toast.success("Yazılı silindi.");
    } catch (e) { toast.error(e.message); }
  };

  const list = exams || [];
  const checked = list.filter((e) => e?.score !== null && e?.score !== undefined);
  const avg = checked.length ? Math.round(checked.reduce((s, e) => s + e.score, 0) / checked.length) : "—";

  return (
    <>
      <Nav />
      <main className="dot-grid min-h-screen px-5 pb-24 pt-32 sm:px-8" data-testid="my-exams-page">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest">Yazılılarım</p>
              <h1 className="font-display mt-3 text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl" data-testid="my-exams-greeting">Merhaba{user?.name ? `, ${user.name}` : ""}!</h1>
            </div>
            <button onClick={() => navigate("/#deneme")} data-testid="my-exams-new-button" className="btn-pop brut inline-flex items-center gap-2 self-start rounded-full bg-[#FF5436] px-6 py-3.5 font-display text-lg font-bold">
              <Sparkles size={20} /> Yeni yazılı oluştur
            </button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Stat label="Toplam yazılı" value={list.length} bg="bg-[#FFD43B]" testid="my-exams-stat-total" />
            <Stat label="Kontrol edilen" value={checked.length} bg="bg-[#2ED59A]" testid="my-exams-stat-checked" />
            <div className="col-span-2 md:col-span-1"><Stat label="Not ortalaman" value={avg} bg="bg-[#FF9BD2]" testid="my-exams-stat-avg" /></div>
          </div>
          {exams === null ? (
            <div className="mt-16 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>
          ) : list.length === 0 ? (
            <div className="brut mt-12 rounded-3xl bg-white p-10 text-center" data-testid="my-exams-empty">
              <p className="font-display text-3xl font-extrabold">Henüz yazılın yok.</p>
              <p className="mt-2 text-[#16130F]/75">İlk deneme yazılını oluştur, burada seni beklesin.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="my-exams-list">
              {list.map((e, i) => <ExamCard key={e.id} e={e} i={i} onDelete={remove} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
