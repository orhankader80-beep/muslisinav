import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { scrollToId } from "./shared";

const LINKS = [["ozellikler", "Özellikler"], ["nasil", "Nasıl çalışır"], ["deneme", "Canlı deneme"], ["dersler", "Dersler"], ["sss", "SSS"]];

export const Footer = () => (
  <footer className="no-print relative overflow-hidden border-t-[2.5px] border-[#16130F] bg-[#FFD43B]" data-testid="footer">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pt-16 sm:px-8 md:flex-row md:items-start md:justify-between">
      <div>
        <Logo />
        <p className="mt-4 max-w-sm text-[#16130F]/80">5–12. sınıf öğrencileri için yazılı sınav çalışma uygulaması.</p>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-3">
        {LINKS.map(([id, label]) => (
          <button key={id} data-testid={`footer-link-${id}`} onClick={() => scrollToId(id)} className="font-semibold underline-offset-4 hover:underline">{label}</button>
        ))}
      </nav>
    </div>
    <motion.p
      initial={{ y: "40%", opacity: 0 }}
      whileInView={{ y: "0%", opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="font-display select-none whitespace-nowrap px-3 pt-10 text-center text-[17.5vw] font-extrabold leading-[0.8] tracking-[-0.06em]"
      aria-hidden="true"
    >
      mulisınav
    </motion.p>
    <div className="mx-auto flex max-w-7xl justify-between border-t-2 border-[#16130F] px-5 py-5 font-mono text-xs font-bold sm:px-8">
      <span>© 2026 Mulisınav</span>
      <span>İyi çalışmalar!</span>
    </div>
  </footer>
);
