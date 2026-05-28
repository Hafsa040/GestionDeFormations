import { getInstructorDashboardStats } from "@/app/actions/getInstructorStats";
import { Users, GraduationCap, Laptop, BarChart3, Globe } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherCharts from "@/components/TeacherCharts"; // Ton nouveau composant Chart.js

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "PROF") {
    redirect("/login");
  }

  const data = await getInstructorDashboardStats(session.user.id);

  const kpis = [
    { label: "Mes Formations", value: data.stats.nombreDeCours, icon: Laptop, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Étudiants", value: data.stats.totalInscrits, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Certificats émis", value: data.stats.totalCertifs, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Communauté (Profs)", value: data.stats.totalProfsPlatform, icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-8 space-y-10 bg-[#f9fafb] min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Espace Formateur</h1>
        <p className="text-slate-500">Suivi d'activité et impact sur la communauté.</p>
      </div>

      {/* CARTES KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm transition-hover hover:shadow-md">
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* SECTION GRAPHIQUES (CHART.JS) */}
      <TeacherCharts courses={data.courses} />

      {/* TABLEAU DES COURS */}
      <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Performances par cours</h2>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
            Mise à jour en temps réel
          </span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
            <tr>
              <th className="px-6 py-4">Titre du cours</th>
              <th className="px-6 py-4 text-center">Étudiants</th>
              <th className="px-6 py-4 text-center">Certificats</th>
              <th className="px-6 py-4 text-right">Taux de succès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {data.courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{course.title}</td>
                <td className="px-6 py-4 text-center font-medium text-slate-500">{course.students}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                    {course.certificates}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-indigo-600">{course.progression}%</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${course.progression}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}