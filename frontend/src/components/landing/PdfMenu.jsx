import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Loader2, FileText, KeyRound, Printer } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PdfLayout, exportPdf } from "./ExamPdf";

export const PdfMenu = ({ exam, meta }) => {
  const [mode, setMode] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!mode) return undefined;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        await exportPdf(ref.current, meta, mode === "key");
        if (!cancelled) toast.success("PDF indirildi.");
      } catch {
        if (!cancelled) toast.error("PDF oluşturulamadı, tekrar dene.");
      } finally {
        if (!cancelled) setMode(null);
      }
    }, 50);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mode, meta]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!!mode}>
          <button data-testid="demo-download-pdf-button" className="btn-pop brut-sm inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold">
            {mode ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {mode ? "Hazırlanıyor…" : "PDF indir"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl border-2 border-[#16130F]">
          <DropdownMenuItem data-testid="pdf-option-blank" onSelect={() => setMode("blank")} className="gap-2 font-semibold"><FileText size={16} /> Soru kâğıdı</DropdownMenuItem>
          <DropdownMenuItem data-testid="pdf-option-key" onSelect={() => setMode("key")} className="gap-2 font-semibold"><KeyRound size={16} /> Cevap anahtarlı</DropdownMenuItem>
          <DropdownMenuItem data-testid="pdf-option-print" onSelect={() => window.print()} className="gap-2 font-semibold"><Printer size={16} /> Yazdır</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {mode && createPortal(<PdfLayout exam={exam} meta={meta} withKey={mode === "key"} innerRef={ref} />, document.body)}
    </>
  );
};
