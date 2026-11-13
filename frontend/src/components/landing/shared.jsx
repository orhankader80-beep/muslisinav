import { motion } from "framer-motion";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: "smooth" });
};

export const Reveal = ({ children, delay = 0, y = 40, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export const Eyebrow = ({ children, color = "bg-[#FFD43B]" }) => (
  <span className={`brut-sm inline-flex items-center gap-2 rounded-full ${color} px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.18em]`}>
    {children}
  </span>
);

export const SUBJECTS = {
  ortaokul: ["Matematik", "Fen Bilimleri", "Türkçe", "Sosyal Bilgiler", "T.C. İnkılap Tarihi ve Atatürkçülük", "İngilizce", "Din Kültürü ve Ahlak Bilgisi"],
  lise: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türk Dili ve Edebiyatı", "Tarih", "Coğrafya", "İngilizce", "Felsefe", "Din Kültürü ve Ahlak Bilgisi"],
};

export const subjectsForGrade = (g) => (Number(g) <= 8 ? SUBJECTS.ortaokul : SUBJECTS.lise);
