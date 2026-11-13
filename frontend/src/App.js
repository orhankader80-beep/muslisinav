import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Bento } from "@/components/landing/Bento";
import { Steps } from "@/components/landing/Steps";
import { Demo } from "@/components/landing/Demo";
import { Subjects } from "@/components/landing/Subjects";
import { Waitlist } from "@/components/landing/Waitlist";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    let id;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); window.__lenis = null; };
  }, []);

  return (
    <div className="App overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Bento />
        <Steps />
        <Demo />
        <Subjects />
        <Waitlist />
        <Faq />
      </main>
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
