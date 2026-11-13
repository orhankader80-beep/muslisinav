import { motion } from "framer-motion";
import { Wand2, KeyRound, Calculator, GraduationCap, Gauge, Printer } from "lucide-react";
import { Reveal, Eyebrow } from "./shared";

const Card = ({ span, bg, children, testid, delay = 0 }) => (
  <Reveal delay={delay} className={span}>
    <motion.div
      whileHover={{ y: -6, rotate: -0.6 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      data-testid={testid}
      className={`brut relative h-full overflow-hidden rounded-3xl p-7 sm:p-8 ${bg}`}
    >
      {children}
    </motion.div>
  </Reveal>
);

const Icon = ({ children, bg = "bg-white" }) => (
  <span className={`brut-sm inline-flex h-12 w-12 items-center justify-center rounded-2xl ${bg}`}>{children}</span>
);

export const Bento = () => (
  <section id="ozellikler" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36" data-testid="features-section">
    <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
      <Reveal className="lg:col-span-7">
        <Eyebrow>Özellikler</Eyebrow>
        <h2 className="font-display mt-5 text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
          Bir öğretmen, bir soru bankası ve bir çalışma arkadaşı. <span className="text-[#2D5BFF]">Tek yerde.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="lg:col-span-5">
        <p className="text-base leading-relaxed text-[#16130F]/80 sm:text-lg">
          Ezber kartlarıyla vakit kaybetme. Yazılıda karşına çıkacak türden soruları çöz, hatanı anında gör, eksik konunu kapat.
        </p>
      </Reveal>
    </div>

    <div className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12 lg:auto-rows-[260px]">
      <Card testid="bento-generator" bg="bg-[#2D5BFF] text-white" span="md:col-span-6 lg:col-span-7 lg:row-span-2">
        <Icon bg="bg-[#FFD43B] text-[#16130F]"><Wand2 /></Icon>
        <h3 className="font-display mt-6 max-w-md text-3xl font-extrabold leading-tight sm:text-5xl">Konunu yaz, yazılın saniyeler içinde hazır.</h3>
        <p className="mt-4 max-w-md leading-relaxed text-white/90">Yapay zekâ, seçtiğin sınıf ve derse göre MEB müfredatını esas alarak 5 soruluk, 100 puanlık bir deneme yazılısı hazırlar.</p>
        <div className="mt-8 flex flex-wrap gap-2 lg:absolute lg:bottom-8 lg:left-8 lg:right-8">
          {["Rasyonel sayılar", "Hücre bölünmesi", "Osmanlı kuruluş", "Present Perfect", "Mol kavramı"].map((t, i) => (
            <span key={t} className={`brut-sm rounded-full px-4 py-2 font-mono text-xs font-bold text-[#16130F] ${["bg-[#FFD43B]", "bg-[#2ED59A]", "bg-[#FF9BD2]", "bg-white", "bg-[#FF5436]"][i]}`}>{t}</span>
          ))}
        </div>
      </Card>
      <Card testid="bento-answer-key" delay={0.08} bg="bg-[#FFD43B]" span="md:col-span-3 lg:col-span-5">
        <Icon><KeyRound /></Icon>
        <h3 className="font-display mt-5 text-2xl font-extrabold sm:text-3xl">Cevap anahtarı + çözüm</h3>
        <p className="mt-2 leading-relaxed text-[#16130F]/85">Önce kendin dene, sonra tek dokunuşla doğru cevabı ve adım adım açıklamasını aç.</p>
      </Card>
      <Card testid="bento-score" delay={0.16} bg="bg-[#2ED59A]" span="md:col-span-3 lg:col-span-5">
        <Icon><Calculator /></Icon>
        <h3 className="font-display mt-5 text-2xl font-extrabold sm:text-3xl">Notunu hesapla</h3>
        <p className="mt-2 leading-relaxed text-[#16130F]/85">Her soruyu doğru ya da yanlış işaretle, alacağın puanı anında gör.</p>
      </Card>
      <Card testid="bento-grades" delay={0.05} bg="bg-[#FF9BD2]" span="md:col-span-2 lg:col-span-4">
        <Icon><GraduationCap /></Icon>
        <h3 className="font-display mt-5 text-2xl font-extrabold">Ortaokul ve lise</h3>
        <p className="mt-2 leading-relaxed text-[#16130F]/85">5. sınıftan 12. sınıfa kadar 15'ten fazla ders.</p>
      </Card>
      <Card testid="bento-difficulty" delay={0.12} bg="bg-white" span="md:col-span-2 lg:col-span-4">
        <Icon bg="bg-[#FF5436]"><Gauge /></Icon>
        <h3 className="font-display mt-5 text-2xl font-extrabold">Seviyeni seç</h3>
        <div className="mt-4 flex gap-2">
          {["Kolay", "Orta", "Zor"].map((d, i) => (
            <span key={d} className={`brut-sm flex-1 rounded-xl py-2 text-center font-mono text-xs font-bold ${["bg-[#2ED59A]", "bg-[#FFD43B]", "bg-[#FF5436]"][i]}`}>{d}</span>
          ))}
        </div>
      </Card>
      <Card testid="bento-print" delay={0.2} bg="bg-[#16130F] text-[#FFF6E9]" span="md:col-span-2 lg:col-span-4">
        <img src="/images/books.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative">
          <Icon bg="bg-[#FFD43B] text-[#16130F]"><Printer /></Icon>
          <h3 className="font-display mt-5 text-2xl font-extrabold">Yazdır, kâğıtta çöz</h3>
          <p className="mt-2 leading-relaxed text-[#FFF6E9]/90">Sınav kâğıdını yazdır, gerçek sınav provası yap.</p>
        </div>
      </Card>
    </div>
  </section>
);
