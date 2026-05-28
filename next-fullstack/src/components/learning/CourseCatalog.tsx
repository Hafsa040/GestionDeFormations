"use client";

import { useState } from "react";
import { Search, BookOpen, User, CheckCircle2, PlayCircle, Sparkles, XCircle } from "lucide-react";
import { enrollStudent, unenrollStudent } from "@/app/actions/learning";
import { useRouter } from "next/navigation";

export default function CourseCatalog({ courses = [], userEnrollments = [], userId, recommendedCourses = [] }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleEnroll = async (courseId: string) => {
    const result = await enrollStudent(courseId, userId);
    if (result.success) router.push(`/dashboard/etudiant/courses/${courseId}`);
  };

  const handleContinue = (courseId: string) => {
    router.push(`/dashboard/etudiant/courses/${courseId}`);
  };

  const isEnrolled = (id: string) => userEnrollments?.some((e: any) => e.courseId === id);

  const filtered = courses.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* SECTION IA */}
      {recommendedCourses.length > 0 && searchQuery === "" && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Sparkles size={24} />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Suggéré pour votre profil</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedCourses.map((course: any) => (
              <div key={course.id} className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 text-white shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase mb-4 inline-block">Score IA: {course.score}</span>
                  <h3 className="text-xl font-black uppercase mb-2 leading-tight">{course.title}</h3>
<p className="text-indigo-100 text-[10px] italic mb-6 leading-relaxed">
  {course.matchReason 
    ? `Inspiré par votre intérêt pour : ${course.matchReason}`
    : "Découvrez ce cours populaire"}
</p>
                </div>
                <button onClick={() => handleEnroll(course.id)} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black uppercase text-xs">S'inscrire</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RECHERCHE */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 transition-all shadow-sm"
          placeholder="Rechercher un cours..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* CATALOGUE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course: any) => {
          const enrolled = isEnrolled(course.id);
          return (
            <div key={course.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={24} /></div>
                  {enrolled && <span className="bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Inscrit</span>}
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase mb-2">{course.title}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-6 font-bold uppercase tracking-widest">
                   <User size={14} /> {course.instructor?.name || "Professeur"}
                </div>
              </div>
              
              <div className="space-y-3">
                {enrolled ? (
                  <button onClick={() => handleContinue(course.id)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                    <PlayCircle size={16} /> Continuer
                  </button>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase">S'inscrire</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}