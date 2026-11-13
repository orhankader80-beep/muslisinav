import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { ArrowDownRight, Sparkles, Check } from "lucide-react";
import { scrollToId } from "./shared";

const EASE = [0.16, 1, 0.3, 1];
const LINES = [
  { text: "Yazılıya", cls: "" },
  { text: "çalışmanın", cls: "italic font-light" },
  { text: "en akıllı", cls: "text-[#FF5436]" },
  { text: "hali.", cls: "" },
];

const MaskLine = ({ children, i, cls }) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span
      className={`block ${cls}`}
      initial={{ y: "110%", rotate: 4 }}
      animate={{ y: "0%", rotate: 0 }}
      transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

const ExamCard = ({ rx, ry }) => (
  <motion.div
    style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
    className="brut ruled relative w-[min(88vw,340px)] rounded-2xl bg-white p-5"
    data-testid="hero-exam-card"
  >
    <div className="flex items-center justify-between border-b-2 border-dashed border-[#16130F]/30 pb-3">
      <span className="font-mono text-[11px] font-bold uppercase tracking-widest">7. Sınıf · Fen</span>
      <span className="rounded-full bg-[#2ED59A] px-2.5 py-0.5 font-mono text-[11px] font-bold">20 puan</span>
    </div>
    <p className="mt-4 text-[15px] font-semibold leading-8">
      1) Bir maddenin hâl değiştirmesi sırasında sıcaklığı neden sabit kalır? Açıklayınız.
    </p>
    <div style={{ transform: "translateZ(50px)" }} className="brut-sm mt-3 rounded-xl bg-[#FFD43B] p-3 text-sm leading-6">
      <span className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase"><Check size={14} /> Cevap anahtarı</span>
      Verilen ısı, tanecikler arası bağları koparmak için harcanır…
    </div>
    <div style={{ transform: "translateZ(80px)" }} className="brut-sm absolute -bottom-6 -right-5 rotate-12 rounded-full bg-[#FF5436] px-4 py-2 font-display text-2xl font-extrabold text-[#16130F]">
      100!
    </div>
  </motion.div>
);

export const Hero = () => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 14 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section ref={ref} onMouseMove={onMove} className="grain dot-grid relative overflow-hidden pb-20 pt-32 sm:pt-36 lg:pb-28" data-testid="hero-section">
      <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-[#FF9BD2] opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#FFD43B] opacity-60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="brut-sm inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em]"
            data-testid="hero-badge"
          >
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ED59A]" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2ED59A]" /></span>
            5–12. sınıf · yapay zekâ destekli
          </motion.span>
          <h1 className="font-display mt-7 text-[clamp(3.2rem,10vw,8.5rem)] font-extrabold leading-[0.88] tracking-[-0.04em]" data-testid="hero-title">
            {LINES.map((l, i) => <MaskLine key={l.text} i={i} cls={l.cls}>{l.text}</MaskLine>)}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[#16130F]/80 sm:text-lg"
          >
            Sınıfını, dersini ve konunu seç. Mulisınav sana gerçek bir yazılı kâğıdı gibi sorular hazırlasın: puanlarıyla, cevap anahtarıyla ve adım adım çözümüyle.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button data-testid="hero-cta-generate" onClick={() => scrollToId("deneme")} className="btn-pop brut group inline-flex items-center gap-3 rounded-full bg-[#FF5436] px-7 py-4 font-display text-lg font-bold text-[#16130F]">
              <Sparkles size={20} /> Ücretsiz deneme yazılısı oluştur
              <ArrowDownRight size={20} className="transition-transform duration-300 group-hover:rotate-[-45deg]" />
            </button>
            <button data-testid="hero-cta-how" onClick={() => scrollToId("nasil")} className="rounded-full px-5 py-4 font-semibold underline decoration-[#2D5BFF] decoration-[3px] underline-offset-[6px] transition-colors hover:text-[#2D5BFF]">
              Nasıl çalışır?
            </button>
          </motion.div>
        </div>

        <div className="relative flex min-h-[560px] justify-center lg:col-span-5 lg:min-h-[560px]" style={{ perspective: 1200 }}>
          <motion.div
            style={{ y: photoY }}
            initial={{ clipPath: "inset(100% 0% 0% 0% round 200px 200px 28px 28px)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 200px 200px 28px 28px)" }}
            transition={{ duration: 1.3, delay: 0.4, ease: EASE }}
            className="absolute right-0 top-0 h-[360px] w-[78%] overflow-hidden border-[2.5px] border-[#16130F] bg-[#2D5BFF] sm:h-[440px] lg:h-[480px]"
          >
            <img src="/images/hero.jpg" alt="Renkli kalemlerle defterine not alan öğrenci" className="h-full w-full scale-110 object-cover object-[60%_center] mix-blend-luminosity opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,transparent_20%,rgba(45,91,255,.55)_75%)]" />
          </motion.div>
          <motion.div style={{ y: cardY }} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 1.1, ease: EASE }} className="absolute bottom-0 left-0 z-10 sm:left-4">
            <ExamCard rx={rx} ry={ry} />
          </motion.div>
          <svg viewBox="0 0 120 120" className="spin-slow absolute -top-4 left-2 z-10 h-28 w-28" aria-hidden="true">
            <defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <circle cx="60" cy="60" r="58" fill="#FFD43B" stroke="#16130F" strokeWidth="2.5" />
            <text className="font-mono" fontSize="10.5" fontWeight="700" letterSpacing="1.6" fill="#16130F"><textPath href="#circ" textLength="268" lengthAdjust="spacing">YAZILI · HAZIRLIK · YAZILI · HAZIRLIK ·</textPath></text>
            <path d="M48 60h24M60 48v24" stroke="#16130F" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
};
