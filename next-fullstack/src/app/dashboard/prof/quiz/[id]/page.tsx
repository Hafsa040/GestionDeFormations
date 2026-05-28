"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getQuizWithQuestionsAction, 
  addQuestionToQuizAction, 
  updateQuestionAction, 
  deleteQuestionAction,
  updateQuizTitleAction 
} from "@/app/actions/quiz";
import { 
  Plus, HelpCircle, Trash2, Edit3, X, Save, ArrowLeft, CheckCircle, Circle, Loader2, Check 
} from "lucide-react";

export default function ProfQuizManager() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<{ id?: string; text: string; isCorrect: boolean }[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false }
  ]);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getQuizWithQuestionsAction(id);
    if (res.success) {
      setQuiz(res.data);
      setTitleInput(res.data.title || "Configuration du Quiz");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  // --- LOGIQUE DE MODIFICATION DU TITRE ---
  const handleSaveTitle = async () => {
    if (!titleInput.trim()) return;
    const res = await updateQuizTitleAction(id, titleInput);
    if (res.success) {
      setIsEditingTitle(false);
      setQuiz({ ...quiz, title: titleInput });
    } else {
      alert("Erreur lors de la mise à jour du titre");
    }
  };

  // --- LOGIQUE DES QUESTIONS ET OPTIONS ---
  const handleAddOptionField = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOptionField = (index: number) => {
    if (options.length <= 2) return alert("Il faut au moins 2 options par question !");
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleOptionCorrectChange = (index: number) => {
    const updated = options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index 
    }));
    setOptions(updated);
  };

  const openCreateModal = () => {
    setQuestionText("");
    setOptions([{ text: "", isCorrect: true }, { text: "", isCorrect: false }]);
    setEditingQuestionId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (question: any) => {
    setQuestionText(question.text);
    setOptions(question.options.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.isCorrect
    })));
    setEditingQuestionId(question.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return alert("Veuillez saisir la question.");
    if (options.some(opt => !opt.text.trim())) return alert("Toutes les options doivent avoir du texte.");
    if (!options.some(opt => opt.isCorrect)) return alert("Veuillez sélectionner au moins une option correcte.");

    setIsSubmitting(true);
    let res = editingQuestionId 
      ? await updateQuestionAction(editingQuestionId, questionText, options)
      : await addQuestionToQuizAction(id, questionText, options);

    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setIsSubmitting(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Supprimer cette question et ses options ?")) {
      const res = await deleteQuestionAction(questionId, id);
      if (res.success) loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 py-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Chargement du questionnaire...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* HEADER AVEC TITRE MODIFIABLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all border border-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="text-xl font-black text-slate-800 border-b-2 border-indigo-500 outline-none bg-transparent w-full"
                  autoFocus
                />
                <button onClick={handleSaveTitle} className="text-emerald-500 p-2 hover:bg-emerald-50 rounded-xl">
                  <Check size={20} />
                </button>
                <button onClick={() => setIsEditingTitle(false)} className="text-slate-400 p-2">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-black text-slate-800 flex items-center gap-2 group cursor-pointer"
              >
                <HelpCircle className="text-indigo-600" /> {quiz?.title || "Configuration du Quiz"}
                <Edit3 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}
            <p className="text-xs font-semibold text-slate-400">
              Module: <span className="text-slate-600 italic">Quiz d'évaluation</span>
            </p>
          </div>
        </div>

        <button 
          onClick={openCreateModal} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
        >
          <Plus size={20} /> Nouvelle Question
        </button>
      </div>

      {/* COMPTEUR DE QUESTIONS */}
      <div className="bg-indigo-50/50 border border-indigo-100/60 p-4 rounded-2xl flex justify-between items-center text-sm font-bold text-indigo-700">
        <span className="flex items-center gap-2">📊 Progression de création :</span>
        <span className="bg-white px-3 py-1 rounded-xl shadow-sm border border-indigo-100/50">
          {quiz?.questions?.length || 0} Question(s)
        </span>
      </div>

      {/* LISTE DES QUESTIONS */}
      <div className="space-y-4">
        {quiz?.questions && quiz.questions.length > 0 ? (
          quiz.questions.map((question: any, qIndex: number) => (
            <div key={question.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black rounded-full shrink-0">{qIndex + 1}</span>
                    <h3 className="text-base font-bold text-slate-800">{question.text}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 pl-10 mt-2">
                    {question.options?.map((opt: any) => (
                      <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${opt.isCorrect ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-800 font-bold" : "bg-slate-50/60 border-slate-100 text-slate-600"}`}>
                        {opt.isCorrect ? <CheckCircle className="text-emerald-600 shrink-0" size={18} /> : <Circle className="text-slate-300 shrink-0" size={18} />}
                        <span className="line-clamp-2">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(question)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-[32px]">
            <HelpCircle className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-600 font-black text-lg">Aucune question pour l'instant</p>
          </div>
        )}
      </div>

      {/* MODAL DE QUESTION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl p-8 rounded-[32px] shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-150">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
            
            <h2 className="text-xl font-black text-slate-800">{editingQuestionId ? "Modifier" : "Ajouter"} la Question</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 ">Intitulé de la question</label>
              <input 
                autoFocus 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-semibold text-slate-900 placeholder:text-slate-400 " 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Réponses possibles</label>
                <button type="button" onClick={handleAddOptionField} className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1">
                  <Plus size={14} /> Ajouter Option
                </button>
              </div>

              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                    <button type="button" onClick={() => handleOptionCorrectChange(index)} className={opt.isCorrect ? "text-emerald-600" : "text-slate-300"}>
                      {opt.isCorrect ? <CheckCircle size={24} /> : <Circle size={24} />}
                    </button>
                    <input 
                      type="text" 
                      className="w-full bg-transparent border-none outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400" 
                      value={opt.text} 
                      onChange={(e) => handleOptionTextChange(index, e.target.value)} 
                      required 
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => handleRemoveOptionField(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 font-bold text-slate-400">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}