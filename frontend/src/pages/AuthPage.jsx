import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";
import { Logo } from "@/components/landing/Logo";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
);

const Field = ({ label, testid, ...props }) => (
  <label className="block">
    <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest">{label}</span>
    <input data-testid={testid} {...props} className="h-12 w-full rounded-xl border-[2.5px] border-[#16130F] bg-white px-4 text-base font-semibold placeholder:text-[#16130F]/45 focus:outline-none focus:ring-4 focus:ring-[#FFD43B]" />
  </label>
);

const googleLogin = () => {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + "/yazililarim";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

const AuthForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.state?.mode === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "register" ? form : { email: form.email, password: form.password };
      const u = await apiJson(`/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      setUser(u);
      toast.success(mode === "register" ? "Hesabın oluşturuldu!" : `Tekrar hoş geldin${u?.name ? `, ${u.name}` : ""}!`);
      navigate(location.state?.from || "/yazililarim", { replace: true });
    } catch (err) {
      setError(err?.message || "Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brut w-full max-w-md rounded-3xl bg-white p-6 sm:p-8" data-testid="auth-card">
      <div className="brut-sm grid grid-cols-2 rounded-full bg-[#FFF6E9] p-1" role="tablist">
        {[["login", "Giriş yap"], ["register", "Kayıt ol"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} data-testid={`auth-tab-${id}`} onClick={() => { setMode(id); setError(""); }} className="relative rounded-full py-2.5 text-sm font-bold">
            {mode === id && <motion.span layoutId="authpill" className="absolute inset-0 rounded-full bg-[#16130F]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className={`relative ${mode === id ? "text-[#FFF6E9]" : ""}`}>{label}</span>
          </button>
        ))}
      </div>
      <button data-testid="auth-google-button" onClick={googleLogin} className="btn-pop brut-sm mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white font-bold">
        <GoogleIcon /> Google ile devam et
      </button>
      <div className="my-6 flex items-center gap-3 font-mono text-xs font-bold uppercase text-[#16130F]/60"><span className="h-0.5 flex-1 bg-[#16130F]/15" />veya e-posta ile<span className="h-0.5 flex-1 bg-[#16130F]/15" /></div>
      <form onSubmit={submit} className="space-y-4" data-testid="auth-form">
        {mode === "register" && <Field label="Adın" testid="auth-name-input" value={form.name} onChange={set("name")} required maxLength={60} placeholder="ör. Elif" autoComplete="given-name" />}
        <Field label="E-posta" testid="auth-email-input" type="email" value={form.email} onChange={set("email")} required placeholder="ornek@mail.com" autoComplete="email" />
        <Field label="Şifre" testid="auth-password-input" type="password" value={form.password} onChange={set("password")} required minLength={mode === "register" ? 6 : 1} placeholder={mode === "register" ? "En az 6 karakter" : "Şifren"} autoComplete={mode === "register" ? "new-password" : "current-password"} />
        {error && <p className="rounded-xl bg-[#FF5436]/15 px-4 py-3 text-sm font-semibold text-[#9E1F0A]" data-testid="auth-error">{error}</p>}
        <button data-testid="auth-submit-button" disabled={loading} className="btn-pop brut inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FF5436] font-display text-lg font-bold disabled:opacity-70">
          {loading && <Loader2 className="animate-spin" size={20} />}
          {mode === "register" ? "Hesabımı oluştur" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
};

export default function AuthPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/yazililarim" replace />;

  return (
    <div className="grain dot-grid relative grid min-h-screen lg:grid-cols-2" data-testid="auth-page">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-[#16130F] p-6 text-[#FFF6E9] sm:p-10 lg:min-h-screen">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 hidden h-full w-full object-cover opacity-25 mix-blend-luminosity lg:block" />
        <div className="relative flex items-center justify-between">
          <Link to="/" data-testid="auth-home-link" className="text-[#FFF6E9]"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD43B]" data-testid="auth-back-link"><ArrowLeft size={16} /> Ana sayfa</Link>
        </div>
        <div className="relative mt-10 lg:mt-0">
          <h1 className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
            Yazılıların, notların, <span className="text-[#FFD43B]">hepsi</span> <span className="italic font-light">bir arada.</span>
          </h1>
          <ul className="mt-6 hidden space-y-2 text-[#FFF6E9]/90 sm:block">
            <li>• Oluşturduğun her yazılı hesabına kaydedilir</li>
            <li>• Kontrol ettiğin cevaplar ve notların saklanır</li>
            <li>• İstediğin zaman geri dönüp tekrar çözersin</li>
          </ul>
        </div>
        <p className="relative mt-8 hidden font-mono text-xs font-bold lg:block">5–12. sınıf · ücretsiz kayıt</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <AuthForm />
      </main>
    </div>
  );
}
