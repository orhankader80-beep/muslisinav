import { Asterisk } from "lucide-react";

const ITEMS = ["Açık uçlu sorular", "Cevap anahtarı", "Adım adım çözüm", "Puanlı sınav kâğıdı", "5'ten 12'ye her sınıf", "Yazdır & çalış", "Kolay · Orta · Zor"];

const Row = ({ ariaHidden }) => (
  <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
    {ITEMS.map((t, i) => (
      <span key={t} className="flex items-center">
        <span className={`font-display px-8 text-4xl font-extrabold tracking-tight sm:text-6xl ${i % 2 ? "italic font-light" : ""}`}>{t}</span>
        <Asterisk className={i % 3 === 0 ? "text-[#FF5436]" : i % 3 === 1 ? "text-[#FFD43B]" : "text-[#2ED59A]"} size={44} strokeWidth={3} />
      </span>
    ))}
  </div>
);

export const Marquee = () => (
  <section className="marquee-wrap -rotate-1 overflow-hidden border-y-[2.5px] border-[#16130F] bg-[#16130F] py-6 text-[#FFF6E9]" data-testid="marquee">
    <div className="marquee-track flex">
      <Row />
      <Row ariaHidden />
    </div>
  </section>
);
