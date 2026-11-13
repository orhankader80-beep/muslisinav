import { Reveal, Eyebrow } from "./shared";

const STEPS = [
  { n: "01", t: "Sınıfını ve dersini seç", d: "5'ten 12'ye kadar sınıfını, ardından çalışacağın dersi işaretle.", bg: "bg-[#FFD43B]" },
  { n: "02", t: "Konunu yaz", d: "\"Kesirler\", \"Kuvvet ve hareket\" ya da öğretmeninin söylediği konu başlığı. Boş bırakırsan dönemin temel konularından sorar.", bg: "bg-[#FF9BD2]" },
  { n: "03", t: "Çöz, kontrol et, tekrarla", d: "Sorular puanlarıyla gelir. Çöz, cevabı aç, notunu hesapla. Yeni bir yazılı için tek tık yeter.", bg: "bg-[#2ED59A]" },
];

export const Steps = () => (
  <section id="nasil" className="border-y-[2.5px] border-[#16130F] bg-white" data-testid="how-section">
    <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal>
        <Eyebrow color="bg-[#2ED59A]">Nasıl çalışır</Eyebrow>
        <h2 className="font-display mt-5 max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
          Üç adım. <span className="italic font-light">Sıfır</span> stres.
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.12}>
            <div data-testid={`how-step-${i + 1}`} className={`group h-full border-t-[2.5px] border-[#16130F] pt-6 ${i === 1 ? "md:mt-16" : i === 2 ? "md:mt-32" : ""}`}>
              <span className={`brut-sm inline-block rounded-2xl ${s.bg} px-4 py-2 font-display text-5xl font-extrabold transition-transform duration-300 group-hover:-rotate-6`}>{s.n}</span>
              <h3 className="font-display mt-6 text-2xl font-extrabold sm:text-3xl">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-[#16130F]/80">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
