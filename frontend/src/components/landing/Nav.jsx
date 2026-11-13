import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogIn, LogOut, BookOpenCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const go = (id) => { setOpen(false); scrollToId(id); };
  const to = (path) => { setOpen(false); navigate(path); };
  const doLogout = async () => { setOpen(false); await logout(); toast.success("Çıkış yaptın."); navigate("/"); };
  const home = () => (pathname === "/" ? window.__lenis?.scrollTo(0) : navigate("/"));

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6 no-print"
    >
      <nav className="brut mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-[#FFF6E9]/90 px-4 py-2.5 backdrop-blur-xl">
        <button data-testid="navbar-logo" onClick={home} aria-label="Ana sayfa">
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
          {user ? (
            <>
              <button data-testid="nav-my-exams" onClick={() => to("/yazililarim")} className="btn-pop brut-sm hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold md:inline-flex">
                {user.picture ? <img src={user.picture} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" /> : <BookOpenCheck size={16} />} Yazılılarım
              </button>
              <button data-testid="nav-logout" onClick={doLogout} aria-label="Çıkış yap" title="Çıkış yap" className="hidden rounded-full p-2.5 transition-colors hover:bg-[#16130F] hover:text-[#FFF6E9] md:inline-flex"><LogOut size={18} /></button>
            </>
          ) : user === false && (
            <button data-testid="nav-login" onClick={() => to("/giris")} className="btn-pop brut-sm hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold md:inline-flex">
              <LogIn size={16} /> Giriş yap
            </button>
          )}
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
            <div className="mt-2 border-t-2 border-[#16130F] pt-2">
              {user ? (
                <>
                  <button data-testid="nav-mobile-my-exams" onClick={() => to("/yazililarim")} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-display text-xl font-bold hover:bg-[#2ED59A]"><BookOpenCheck size={20} /> Yazılılarım</button>
                  <button data-testid="nav-mobile-logout" onClick={doLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-display text-xl font-bold hover:bg-[#FF5436]"><LogOut size={20} /> Çıkış yap</button>
                </>
              ) : (
                <button data-testid="nav-mobile-login" onClick={() => to("/giris")} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-display text-xl font-bold hover:bg-[#2ED59A]"><LogIn size={20} /> Giriş yap / Kayıt ol</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
