"use client";

import { useState } from "react";
import { Search, BookOpen, User, XCircle, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { enrollStudent, unenrollStudent } from "@/app/actions/learning";
import { useRouter } from "next/navigation";

export default function CourseCatalog({ 
  courses = [], 
  userEnrollments = [], 
  userId,
  recommendedCourses = [] 
}: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleEnroll = async (courseId: string) => {
    const result = await enrollStudent(courseId, userId);
    if (result.success) {
      router.push(`/dashboard/etudiant/courses/${courseId}`);
    }
  };

  const handleContinue = (courseId: string) => {
    router.push(`/dashboard/etudiant/courses/${courseId}`);
  };

  const isEnrolled = (courseId: string) => 
    userEnrollments?.some((e: any) => e.courseId === courseId);

  const filteredCourses = (courses || []).filter((c: any) =>
    c?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c?.instructor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* BARRE DE RECHERCHE CORRIGÉE */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un cours (ex: Spring Boot, NoSQL...)"
         
          className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 font-bold border-2 border-slate-100 rounded-2xl shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* SECTION RECOMMANDATIONS IA */}
      {searchQuery === "" && recommendedCourses.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-xl text-blue-400">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter">
                  Suggestions sur mesure
                </h2>
                <p className="text-blue-200/60 text-xs font-medium uppercase tracking-widest">
                  Basé sur votre profil d'ingénieur
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedCourses.map((course: any) => (
                <div 
                  key={course.id} 
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group border-b-4 border-b-blue-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase">
                        Match : {course.matchReason || "Top"}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-4 leading-tight min-h-[3rem] uppercase">
                      {course.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full py-4 rounded-2xl font-black bg-white text-slate-900 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                  >
                    S'INSCRIRE
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* TITRE DU CATALOGUE */}
      <div className="flex items-center gap-4">
        <div className="h-[2px] flex-1 bg-slate-100"></div>
        <h2 className="text-slate-400 font-black text-sm uppercase tracking-[0.3em]">
          Catalogue Complet
        </h2>
        <div className="h-[2px] flex-1 bg-slate-100"></div>
      </div>

      {/* GRILLE DES COURS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course: any) => {
          const enrolled = isEnrolled(course.id);
          
          return (
            <div key={course.id} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between border-b-4 hover:border-b-blue-500">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-2xl transition-colors">
                    <BookOpen size={24} />
                  </div>
                  {enrolled && (
                    <span className="flex items-center gap-1 text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 rounded-full">
                      <CheckCircle2 size={12} /> INSCRIT
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase leading-tight group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                  <User size={16} />
                  <span className="font-medium">{course.instructor?.name || "Professeur"}</span>
                </div>
              </div>

              <div className="space-y-3">
                {enrolled ? (
                  <>
                    <button
                      onClick={() => handleContinue(course.id)}
                      className="w-full py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} /> CONTINUER LE COURS
                    </button>
                    <button
                      onClick={() => unenrollStudent(course.id, userId)}
                      className="w-full py-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> Se désister
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full py-4 rounded-2xl font-black bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                  >
                    S'INSCRIRE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold">Aucun cours ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}