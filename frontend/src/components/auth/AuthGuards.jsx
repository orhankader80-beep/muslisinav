import { useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiJson } from "@/lib/api";

const FullLoader = ({ text }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FFF6E9]" data-testid="auth-loading">
    <Loader2 className="animate-spin" size={32} />
    {text && <p className="font-display text-xl font-bold">{text}</p>}
  </div>
);

export const AuthCallback = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const sid = new URLSearchParams(location.hash.slice(1)).get("session_id");
    (async () => {
      try {
        const u = await apiJson("/auth/google/session", { method: "POST", body: JSON.stringify({ session_id: sid }) });
        setUser(u);
        toast.success(`Hoş geldin${u?.name ? `, ${u.name}` : ""}!`);
        navigate(location.pathname === "/giris" ? "/yazililarim" : location.pathname, { replace: true });
      } catch (e) {
        setUser(false);
        toast.error(e?.message || "Google ile giriş yapılamadı.");
        navigate("/giris", { replace: true });
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <FullLoader text="Giriş yapılıyor…" />;
};

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) return <FullLoader />;
  if (!user) return <Navigate to="/giris" replace state={{ from: location.pathname }} />;
  return children;
};
