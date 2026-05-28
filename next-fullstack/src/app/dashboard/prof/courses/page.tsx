"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  Layout, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  BookOpen, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { 
  getProfessorCourses, 
  createCourseAction, 
  deleteCourseAction, 
  updateCourseAction 
} from "@/app/actions/courses";

export default function ManageCourses() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const loadCourses = useCallback(async (query?: string) => {
    setLoading(true);
    const res = await getProfessorCourses(query);
    if (res.success) setCourses(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (status === "authenticated") loadCourses(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, status, loadCourses]);

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce cours ?")) {
      const res = await deleteCourseAction(id);
      if (res.success) loadCourses(searchQuery);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingCourse 
      ? await updateCourseAction(editingCourse.id, formData)
      : await createCourseAction(formData);

    if (res.success) {
      setIsModalOpen(false);
      setEditingCourse(null);
      setFormData({ title: "", description: "" });
      loadCourses(searchQuery);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Mes <span className="text-blue-600 not-italic">Formations</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Gérez votre catalogue de cours et modules.</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setFormData({title:"", description:""}); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95 font-black text-sm uppercase tracking-wider"
        >
          <Plus size={20} strokeWidth={3} /> Créer un cours
        </button>
      </div>

      {/* --- BARRE DE RECHERCHE --- */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher par titre ou mot-clé..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest">
          <BookOpen size={14} /> {courses.length} Cours
        </div>
      </div>

      {/* --- GRILLE DE COURS --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Synchronisation...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 flex flex-col overflow-hidden border-b-4 border-b-transparent hover:border-b-blue-600">
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Layout size={28} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => { setEditingCourse(course); setFormData({title: course.title, description: course.description}); setIsModalOpen(true); }}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-xl text-slate-900 mb-3 leading-tight uppercase tracking-tighter">
                  {course.title}
                </h3>
                
                <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-auto">
                  <Link href={`/dashboard/prof/courses/${course.id}`} className="group/btn flex items-center justify-between w-full p-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200">
                    Gérer le module
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DESIGN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-white relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                 {editingCourse ? <Edit3 size={24} /> : <Plus size={24} />}
              </div>
              {editingCourse ? "Édition Cours" : "Nouveau Cours"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Titre du module</label>
                <input
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900"
                  placeholder="Ex: Architecture des Systèmes NoSQL"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Description détaillée</label>
                <textarea
                  className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900 h-40 resize-none"
                  placeholder="Décrivez les objectifs et le contenu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                  {editingCourse ? "Mettre à jour" : "Confirmer la création"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}