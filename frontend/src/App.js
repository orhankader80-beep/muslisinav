import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { AuthCallback, ProtectedRoute } from "@/components/auth/AuthGuards";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import MyExams from "@/pages/MyExams";
import ExamView from "@/pages/ExamView";

function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { window.__navigate = navigate; }, [navigate]);
  useEffect(() => { if (!location.hash) window.__lenis?.scrollTo(0, { immediate: true }); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/giris" element={<AuthPage />} />
      <Route path="/yazililarim" element={<ProtectedRoute><MyExams /></ProtectedRoute>} />
      <Route path="/yazili/:id" element={<ProtectedRoute><ExamView /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="bottom-center" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
