import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Eyebrow, SUBJECTS, scrollToId } from "./shared";

const COLORS = ["bg-[#FFD43B]", "bg-[#2ED59A]", "bg-[#FF9BD2]", "bg-white", "bg-[#FF5436]", "bg-[#8FB1FF]"];
const TABS = [["ortaokul", "Ortaokul · 5–8", 7], ["lise", "Lise · 9–12", 10]];

export const Subjects = () => {
  const [tab, setTab] = useState("ortaokul");
  const grade = TABS.find((t) => t[0] === tab)[2];

  const pick = (subject) => {
    window.dispatchEvent(new CustomEvent("muli:preset", { detail: { grade, subject } }));
    scrollToId("deneme");
  };

  return (
    <section id="dersler" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32" data-testid="subjects-section">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <Eyebrow color="bg-[#FF9BD2]">Dersler</Eyebrow>
          <h2 className="font-display mt-5 max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">Hangi yazılı yaklaşıyor?</h2>
          <p className="mt-4 max-w-xl text-[#16130F]/80">Bir derse dokun, deneme yazılısı formu o dersle açılsın.</p>
        </Reveal>
        <div className="brut-sm inline-flex self-start rounded-full bg-white p-1.5 lg:self-auto" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} data-testid={`subjects-tab-${id}`} onClick={() => setTab(id)} className="relative rounded-full px-5 py-2.5 text-sm font-bold">
              {tab === id && <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-[#16130F]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <span className={`relative ${tab === id ? "text-[#FFF6E9]" : ""}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-14 flex flex-wrap gap-4" data-testid="subjects-list">
        {SUBJECTS[tab].map((s, i) => (
          <motion.button
            key={`${tab}-${s}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ rotate: i % 2 ? 2 : -2, y: -4 }}
            onClick={() => pick(s)}
            data-testid={`subject-chip-${tab}-${i}`}
            className={`brut group inline-flex items-center gap-3 rounded-full ${COLORS[i % COLORS.length]} px-6 py-4 font-display text-xl font-bold sm:text-2xl`}
          >
            {s}
            <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:rotate-45" />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
