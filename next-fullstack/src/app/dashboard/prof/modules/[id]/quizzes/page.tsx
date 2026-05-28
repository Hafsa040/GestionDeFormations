"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Search, Trash2, Edit, HelpCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getModuleQuizzesAction, createQuizAction, deleteQuizAction } from "@/app/actions/quiz";

export default function ModuleQuizzesList() {
  const { id: moduleId } = useParams() as { id: string };
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadQuizzes = async () => {
    setLoading(true);
    const res = await getModuleQuizzesAction(moduleId);
    if (res.success) setQuizzes(res.data);
    setLoading(false);
  };

  useEffect(() => { loadQuizzes(); }, [moduleId]);

  // Logique de recherche
  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateQuiz = async () => {
    const title = prompt("Titre du nouveau quiz :");
    if (!title) return;
    const res = await createQuizAction(moduleId, title);
    if (res.success) loadQuizzes();
  };

  const handleDelete = async (quizId: string) => {
    if (confirm("Supprimer ce quiz et toutes ses questions ?")) {
      const res = await deleteQuizAction(quizId);
      if (res.success) loadQuizzes();
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Évaluations du Module</h1>
          <p className="text-sm text-slate-400">Gérez les différents quiz de ce cours</p>
        </div>
        <button 
          onClick={handleCreateQuiz}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={20} /> Nouveau Quiz
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Rechercher un quiz par titre..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 ring-indigo-500/20 font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* GRILLE DES QUIZ */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl w-fit mb-3">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">{quiz._count?.questions || 0} Questions</p>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/prof/quiz-manager/${quiz.id}`} // Lien vers ton code actuel
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <Link 
                href={`/prof/quiz-manager/${quiz.id}`}
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-2xl font-bold text-sm transition-all"
              >
                Gérer les questions <ExternalLink size={16} />
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-medium">Aucun quiz trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}