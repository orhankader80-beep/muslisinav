import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "./shared";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : null;

export const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!API) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/waitlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDone(true);
      toast.success(data?.already ? "Bu e-posta zaten listede." : "Listeye eklendin! Yenilikleri ilk sen duyacaksın.");
    } catch {
      toast.error("Geçerli bir e-posta adresi gir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-5 sm:px-8" data-testid="waitlist-section">
      <Reveal className="mx-auto max-w-7xl">
        <div className="brut relative overflow-hidden rounded-[2.5rem] bg-[#2D5BFF] px-6 py-16 text-white sm:px-14 lg:py-24">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-[38%] border-[2.5px] border-[#FFD43B]" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-[42%] bg-[#FF9BD2]/30" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <h2 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">Yenilikler geliyor. <span className="text-[#FFD43B]">İlk sen haberdar ol.</span></h2>
            <div>
              <p className="text-white/90 sm:text-lg">E-postanı bırak; Mulisınav'a yeni özellikler eklendiğinde ilk sen öğren.</p>
              {done ? (
                <p className="brut-sm mt-6 rounded-2xl bg-[#2ED59A] px-5 py-4 font-bold text-[#16130F]" data-testid="waitlist-success">Harika, listedesin!</p>
              ) : (
                <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row" data-testid="waitlist-form">
                  <input data-testid="waitlist-email-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-posta adresin" className="h-14 flex-1 rounded-full border-[2.5px] border-[#16130F] bg-white px-6 text-base font-semibold text-[#16130F] placeholder:text-[#16130F]/55 focus:outline-none focus:ring-4 focus:ring-[#FFD43B]" />
                  <button data-testid="waitlist-submit-button" disabled={loading} className="btn-pop brut-sm inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#FFD43B] px-7 font-bold text-[#16130F]">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Haber ver
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
