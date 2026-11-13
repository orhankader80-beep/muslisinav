import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { scrollToId } from "@/components/landing/shared";

export default function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash || hash.includes("session_id=")) return undefined;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 350);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
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
    </>
  );
}
