import { LogoMark } from "./Logo";

const LETTERS = ["A", "B", "C", "D", "E"];
const block = "pb-3";

export const PdfLayout = ({ exam, meta, withKey, innerRef }) => {
  const questions = Array.isArray(exam?.questions) ? exam.questions : [];
  const total = questions.reduce((s, q) => s + (Number(q?.points) || 0), 0);

  return (
    <div ref={innerRef} style={{ position: "fixed", left: -10000, top: 0, width: 760 }} className="bg-white p-0 text-[#16130F]" aria-hidden="true">
      <div data-pdf-block className={block}>
        <div className="flex items-center justify-between border-b-[3px] border-[#16130F] pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark size={40} />
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest">{meta?.grade}. sınıf · {meta?.subject} · {meta?.difficulty}</p>
              <p className="font-display text-2xl font-extrabold leading-tight">{exam?.title || "Deneme yazılısı"}</p>
            </div>
          </div>
          <p className="shrink-0 pl-3 font-mono text-sm font-bold">Toplam: {total} puan</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-[13px]">
          <span>Ad Soyad: ..............................</span><span>No: ...............</span><span>Tarih: ....../....../......</span>
        </div>
      </div>
      {questions.map((q, i) => {
        const opts = Array.isArray(q?.options) ? q.options : [];
        return (
          <div data-pdf-block key={i} className={`${block} border-b border-dashed border-[#16130F]/30 pt-3`}>
            <div className="flex gap-3">
              <span className="font-display text-xl font-extrabold">{i + 1}.</span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold leading-6">{q?.question} <span className="font-mono text-[11px] font-bold text-[#16130F]/70">({q?.points ?? 0} puan)</span></p>
                {opts.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[14px]">
                    {opts.map((o, k) => <span key={k}>{/^[A-E]\)/.test(o) ? o : `${LETTERS[k]}) ${o}`}</span>)}
                  </div>
                ) : (
                  <div className="mt-2 space-y-6 pt-4">{[0, 1, 2, 3].map((l) => <div key={l} className="border-b border-[#16130F]/25" />)}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {withKey && (
        <>
          <div data-pdf-block className={`${block} pt-6`}>
            <p className="font-display border-b-[3px] border-[#16130F] pb-2 text-2xl font-extrabold">Cevap anahtarı</p>
          </div>
          {questions.map((q, i) => (
            <div data-pdf-block key={`k${i}`} className={`${block} pt-2 text-[14px] leading-6`}>
              <p><b>{i + 1}.</b> <b>Cevap:</b> {q?.answer}</p>
              {q?.explanation && <p className="text-[#16130F]/80"><b>Çözüm:</b> {q.explanation}</p>}
            </div>
          ))}
        </>
      )}
      <div data-pdf-block className="pb-2 pt-4 text-center text-[12px] leading-5 text-[#16130F]/60">Mulisınav ile hazırlandı · Başarılar!</div>
    </div>
  );
};

const slug = (s) => String(s || "").toLocaleLowerCase("tr-TR")
  .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const exportPdf = async (root, meta, withKey) => {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);
  await document.fonts?.ready;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const usableW = 210 - margin * 2;
  let y = margin;
  for (const el of root.querySelectorAll("[data-pdf-block]")) {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", logging: false, windowWidth: 1280 });
    const h = (canvas.height * usableW) / canvas.width;
    if (y + h > 297 - margin && y > margin) { pdf.addPage(); y = margin; }
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, y, usableW, h);
    y += h + 2;
  }
  pdf.save(`mulisinav-${meta?.grade}-sinif-${slug(meta?.subject)}${withKey ? "-cevap-anahtarli" : ""}.pdf`);
};
