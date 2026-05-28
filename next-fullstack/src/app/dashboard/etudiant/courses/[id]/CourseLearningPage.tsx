"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getQuizQuestions, submitFinalExam, markContentAsComplete } from "@/app/actions/learning"; 
import { 
  PlayCircle, FileText, CheckCircle, Lock, 
  HelpCircle, X, CheckCircle2, XCircle, Award,
  ExternalLink, Maximize2
} from "lucide-react";

export default function CourseLearningPage({ course, enrollment, progress }: any) {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const router = useRouter();

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({}); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<{ passed: boolean; score: number; wasUnenrolled?: boolean } | null>(null);

  const handleMarkAsComplete = async (contentId: string, score?: number) => {
    try {
      const res = await markContentAsComplete(contentId, score);
      if (res.success) {
        router.refresh(); 
      }
    } catch (error) {
      console.error("Erreur progression:", error);
    }
  };

  const stats = useMemo(() => {
    const allQuizContents = course.modules
      .flatMap((m: any) => m.contents)
      .filter((c: any) => c.type === "QUIZ");

    const completedQuizCount = allQuizContents.filter(quiz => {
      const p = progress?.find((item: any) => String(item.contentId) === String(quiz.id));
      return p && p.completed && Number(p.score || 0) >= 80;
    }).length;

    return {
      total: allQuizContents.length,
      completedCount: completedQuizCount,
      percentage: allQuizContents.length > 0 
        ? Math.round((completedQuizCount / allQuizContents.length) * 100) 
        : 0
    };
  }, [course, progress]);

  useEffect(() => {
    if (selectedContent && selectedContent.type !== "QUIZ") {
      const alreadyDone = enrollment.progress?.some(
        (p: any) => p.contentId === selectedContent.id && p.completed
      );
      
      if (!alreadyDone) {
        handleMarkAsComplete(selectedContent.id);
      }
    }
  }, [selectedContent?.id, enrollment.progress]);

  const handleStartQuiz = async () => {
    if (!selectedContent) return;
    setLoadingQuiz(true);
    setIsSubmitted(false);
    setExamResult(null);
    setUserAnswers({});
    
    try {
      const result = await getQuizQuestions(selectedContent.id);
      if (result.success) {
        setQuizQuestions(result.questions);
        setIsQuizOpen(true);
      } else {
        alert(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleValidateQuiz = async () => {
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      const selectedOptId = userAnswers[q.id];
      const isCorrect = q.options.find((o: any) => o.id === selectedOptId)?.isCorrect;
      if (isCorrect) correctCount++;
    });

    const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
    const currentModule = course.modules.find((m: any) => 
        m.contents.some((c: any) => c.id === selectedContent.id)
    );

    const isPassing = scorePercentage >= 80;

    if (currentModule?.isFinal) {
      const res = await submitFinalExam(course.id, selectedContent.id, scorePercentage);
      if (res.passed && isPassing) {
        await handleMarkAsComplete(selectedContent.id, scorePercentage);
      }
      setExamResult({ 
        passed: (res.passed && isPassing), 
        score: scorePercentage, 
        wasUnenrolled: res.wasUnenrolled 
      });
    } else {
      if (isPassing) {
        await handleMarkAsComplete(selectedContent.id, scorePercentage);
      }
      setExamResult({ passed: isPassing, score: scorePercentage });
    }
    setIsSubmitted(true);
  };

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <Lock size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Accès Refusé</h2>
        <p className="text-slate-500">Inscrivez-vous pour accéder aux ressources.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {selectedContent ? (
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-black text-slate-900 uppercase italic">{selectedContent.title}</h1>
                
                {/* ACTIONS DE CONTENU (AGRANDIR / NOUVEL ONGLET) */}
                {(selectedContent.type === "PDF" || selectedContent.type === "VIDEO") && (
                  <div className="flex gap-2">
                    <a 
                      href={selectedContent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold uppercase"
                      title="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink size={18} />
                      Détacher
                    </a>
                  </div>
                )}
              </div>
              
              <div className="aspect-video bg-slate-900 rounded-2xl mb-6 overflow-hidden flex items-center justify-center text-white shadow-xl relative group">
                {selectedContent.type === "VIDEO" && (
                  <iframe 
                    className="w-full h-full" 
                    src={selectedContent.url?.replace("watch?v=", "embed/")} 
                    title={selectedContent.title} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen 
                  />
                )}
                {selectedContent.type === "PDF" && (
                  <iframe 
                    src={`${selectedContent.url}#view=FitH`} 
                    className="w-full h-full border-none" 
                    title={selectedContent.title} 
                  />
                )}
                {selectedContent.type === "TEXT" && (
                  <div className="w-full h-full bg-white p-8 overflow-y-auto text-slate-800">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedContent.description}</p>
                  </div>
                )}
                {selectedContent.type === "QUIZ" && (
                  <div className="flex flex-col items-center gap-4 p-10 text-center">
                    <div className="p-5 bg-amber-500/20 rounded-full mb-2">
                        <HelpCircle size={60} className="text-amber-500" />
                    </div>
                    <p className="text-xl font-bold uppercase italic text-white">Évaluation du module</p>
                    <button onClick={handleStartQuiz} disabled={loadingQuiz} className="px-8 py-3 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-all uppercase text-sm disabled:opacity-50">
                      {loadingQuiz ? "Chargement..." : "Démarrer le Quiz"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 italic font-black text-slate-200 uppercase text-4xl select-none">
              Sélectionnez un chapitre
            </div>
          )}
        </div>
      </div>

      {/* MODAL QUIZ */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black uppercase text-xl italic flex items-center gap-2 text-slate-800">
                {selectedContent?.title}
              </h2>
              <button onClick={() => setIsQuizOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-10">
              {isSubmitted && examResult && (
                <div className={`p-6 rounded-3xl text-center space-y-2 border-2 ${examResult.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                   {examResult.passed ? (
                     <>
                       <CheckCircle2 className="mx-auto text-green-500" size={48} />
                       <h3 className="text-green-800 font-black text-xl uppercase italic">Félicitations !</h3>
                       <p className="text-green-600 font-bold text-lg">Score: {examResult.score}% </p>
                     </>
                   ) : (
                     <>
                       <XCircle className="mx-auto text-red-500" size={48} />
                       <h3 className="text-red-800 font-black text-xl uppercase italic">{examResult.wasUnenrolled ? "Échec & Désinscription" : "Échec"}</h3>
                       <p className="text-red-600 font-bold text-lg">Score: {examResult.score}% (Requis: 80%)</p>
                     </>
                   )}
                </div>
              )}

              {quizQuestions.map((q, idx) => {
                const showCorrection = isSubmitted && examResult?.passed;
                return (
                  <div key={q.id} className="space-y-4">
                    <p className="font-bold text-lg text-slate-900"><span className="text-indigo-600 mr-2">{idx + 1}.</span> {q.text}</p>
                    <div className="grid grid-cols-1 gap-3">
                      {q.options?.map((opt: any) => {
                        const isSelected = userAnswers[q.id] === opt.id;
                        let style = "border-slate-200 hover:bg-slate-50 text-slate-900"; 
                        let icon = null;

                        if (showCorrection) {
                          if (opt.isCorrect) {
                            style = "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                            icon = <CheckCircle2 size={18} />;
                          } else if (isSelected) {
                            style = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                            icon = <XCircle size={18} />;
                          }
                        } else if (isSelected) {
                          style = "border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100";
                        }

                        return (
                          <button 
                            key={opt.id} 
                            onClick={() => handleSelectOption(q.id, opt.id)} 
                            disabled={isSubmitted} 
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left font-bold ${style}`}
                          >
                            <span>{opt.text}</span> {icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-slate-50 border-t flex flex-col gap-3">
              {!isSubmitted ? (
                <button onClick={handleValidateQuiz} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase hover:bg-indigo-700 shadow-lg">
                  Valider mon score
                </button>
              ) : (
                <div className="flex gap-3">
                   {examResult?.wasUnenrolled ? (
                     <button onClick={() => window.location.href = "/dashboard/etudiant/courses"} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase">Quitter</button>
                   ) : (examResult && !examResult.passed) ? (
                     <button onClick={() => {setIsSubmitted(false); setExamResult(null); setUserAnswers({});}} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase">Réessayer le Quiz</button>
                   ) : (
                     <button onClick={() => setIsQuizOpen(false)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase">Continuer</button>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-full lg:w-96 bg-white border-l p-6 overflow-y-auto h-screen sticky top-0 shadow-2xl lg:shadow-none">
        <div className="mb-8 p-6 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-100">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Ma Progression</span>
            <span className="text-2xl font-black italic">{stats.percentage}%</span>
          </div>
          <div className="h-3 w-full bg-indigo-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-1000 ease-in-out" style={{ width: `${stats.percentage}%` }} />
          </div>
          <p className="text-[10px] mt-3 italic opacity-70 uppercase font-bold">
            {stats.completedCount} sur {stats.total} quiz réussis
          </p>
        </div>

        <h2 className="text-xl font-black mb-6 uppercase italic border-b pb-2 text-slate-800">Sommaire</h2>
        <div className="space-y-6">
          {course.modules?.map((module: any) => (
            <div key={module.id} className={`p-4 rounded-2xl border ${module.isFinal ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <h3 className={`font-black text-[11px] uppercase mb-3 ${module.isFinal ? 'text-amber-600' : 'text-slate-400'}`}>
                {module.isFinal ? "🎓 Certification" : module.title}
              </h3>
              <div className="space-y-2">
                {module.contents?.map((content: any) => {
                  const progressEntry = enrollment.progress?.find((p: any) => p.contentId === content.id);
                  const isDone = progressEntry?.completed && (content.type !== "QUIZ" || (progressEntry.score || 0) >= 80);
                  const isActive = selectedContent?.id === content.id;
                  
                  return (
                    <button 
                      key={content.id} 
                      onClick={() => { setSelectedContent(content); setIsQuizOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white hover:bg-indigo-50 text-slate-600 border border-transparent'}`}
                    >
                      <div className={`${isDone ? 'text-green-500' : (isActive ? 'text-white' : 'text-slate-400')}`}>
                        {isDone ? <CheckCircle2 size={16} /> : (
                          content.type === "VIDEO" ? <PlayCircle size={16} /> : 
                          content.type === "PDF" ? <FileText size={16} /> : <HelpCircle size={16} />
                        )}
                      </div>
                      <span className={`text-sm font-bold truncate flex-1 ${isDone && !isActive ? 'opacity-50 line-through' : ''}`}>
                        {content.title}
                      </span>
                      {content.type === "QUIZ" && progressEntry?.score && (
                        <span className="text-[9px] font-black">{progressEntry.score}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}