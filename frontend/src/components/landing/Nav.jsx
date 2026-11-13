import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { scrollToId } from "./shared";

const LINKS = [
  ["ozellikler", "Özellikler"],
  ["nasil", "Nasıl çalışır"],
  ["deneme", "Canlı deneme"],
  ["dersler", "Dersler"],
  ["sss", "SSS"],
];

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const go = (id) => { setOpen(false); scrollToId(id); };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6 no-print"
    >
      <nav className="brut mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-[#FFF6E9]/90 px-4 py-2.5 backdrop-blur-xl">
        <button data-testid="navbar-logo" onClick={() => window.__lenis?.scrollTo(0)} aria-label="Ana sayfa">
          <Logo />
        </button>
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map(([id, label]) => (
            <button
              key={id}
              data-testid={`nav-link-${id}`}
              onClick={() => go(id)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#16130F] hover:text-[#FFF6E9]"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="nav-cta-generate"
            onClick={() => go("deneme")}
            className="btn-pop brut-sm hidden items-center gap-2 rounded-full bg-[#2D5BFF] px-5 py-2.5 text-sm font-bold text-white sm:inline-flex"
          >
            <Sparkles size={16} /> Soru üret
          </button>
          <button
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen((o) => !o)}
            className="brut-sm rounded-xl bg-[#FFD43B] p-2 lg:hidden"
            aria-label="Menü"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="nav-mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="brut mx-auto mt-2 flex max-w-7xl flex-col rounded-2xl bg-[#FFF6E9] p-3 lg:hidden"
          >
            {LINKS.map(([id, label]) => (
              <button key={id} data-testid={`nav-mobile-link-${id}`} onClick={() => go(id)} className="rounded-xl px-4 py-3 text-left font-display text-xl font-bold hover:bg-[#FFD43B]">
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
