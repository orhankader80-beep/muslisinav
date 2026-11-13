import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, Eyebrow } from "./shared";

const QA = [
  ["Mulisınav ücretli mi?", "Canlı deneme şu an ücretsiz. Sayfadaki formdan hemen deneme yazılısı oluşturabilirsin."],
  ["Hangi sınıflar ve dersler var?", "5'ten 12'ye kadar tüm sınıflar. Ortaokulda Matematik, Fen, Türkçe, Sosyal Bilgiler, İnkılap Tarihi, İngilizce ve Din Kültürü; lisede bunlara Fizik, Kimya, Biyoloji, Edebiyat, Tarih, Coğrafya ve Felsefe eklenir."],
  ["Sorular müfredata uygun mu?", "Sorular yapay zekâ tarafından MEB müfredatı esas alınarak, seçtiğin sınıf seviyesine göre hazırlanır. Yapay zekâ bazen hata yapabilir; önemli bilgileri ders kitabından kontrol etmeni öneririz."],
  ["Açık uçlu sorular da geliyor mu?", "Evet. Açık uçlu, test ya da ikisinin karışımı olarak seçebilirsin. Her sorunun puanı, cevabı ve çözümü vardır."],
  ["Öğretmenler kullanabilir mi?", "Elbette. Oluşturulan sınav kâğıdını 'Yazdır / PDF' ile çıktı alıp sınıfta prova olarak kullanabilirsin."],
];

export const Faq = () => (
  <section id="sss" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:py-36" data-testid="faq-section">
    <Reveal className="lg:col-span-4">
      <Eyebrow>SSS</Eyebrow>
      <h2 className="font-display mt-5 text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">Merak <span className="italic font-light">edilenler</span></h2>
    </Reveal>
    <Reveal delay={0.1} className="lg:col-span-8">
      <Accordion type="single" collapsible className="space-y-4">
        {QA.map(([q, a], i) => (
          <AccordionItem key={q} value={`i${i}`} className="brut-sm rounded-2xl border-b-2 bg-white px-6" data-testid={`faq-accordion-item-${i + 1}`}>
            <AccordionTrigger className="font-display text-left text-lg font-bold hover:no-underline sm:text-xl" data-testid={`faq-trigger-${i + 1}`}>{q}</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-[#16130F]/80">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Reveal>
  </section>
);
