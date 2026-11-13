import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiJson } from "@/lib/api";
import { Nav } from "@/components/landing/Nav";
import { ExamPaper } from "@/components/landing/ExamPaper";

export default function ExamView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiJson(`/exams/${id}`).then(setExam).catch((e) => setError(e.message));
  }, [id]);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#16130F] px-5 pb-24 pt-32 sm:px-8" data-testid="exam-view-page">
        <div className="mx-auto max-w-4xl">
          <Link to="/yazililarim" data-testid="exam-view-back" className="mb-6 inline-flex items-center gap-2 font-semibold text-[#FFF6E9] hover:text-[#FFD43B]"><ArrowLeft size={18} /> Yazılılarım</Link>
          {error ? (
            <p className="brut rounded-3xl bg-white p-8 font-display text-2xl font-bold" data-testid="exam-view-error">{error}</p>
          ) : !exam ? (
            <div className="flex justify-center py-20 text-[#FFF6E9]"><Loader2 className="animate-spin" size={32} /></div>
          ) : (
            <ExamPaper
              exam={exam}
              meta={{ grade: exam.grade, subject: exam.subject, difficulty: exam.difficulty }}
              examId={exam.id}
              initialAnswers={exam.answers}
              initialResults={exam.results}
              onNew={() => navigate("/#deneme")}
            />
          )}
        </div>
      </main>
    </>
  );
}
