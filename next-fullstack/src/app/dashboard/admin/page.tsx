import { getAdminDashboardStats } from "@/app/actions/getAdminStats";
import { Users, BookOpen, GraduationCap, TrendingUp, User, Activity } from "lucide-react";
import AdminCharts from "@/components/AdminCharts"; // Import du composant client

export default async function AdminDashboardPage() {
  const statsData = await getAdminDashboardStats();

  const kpis = [
    { label: "Communauté", value: statsData.overview.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Catalogue", value: statsData.overview.totalCourses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Diplômes", value: statsData.overview.totalCertificates, icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Performance", value: `${statsData.overview.successRate.toFixed(1)}%`, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-8 space-y-10 bg-[#FBFBFE] min-h-screen">
      {/* HEADER AVEC DESIGN ÉPURÉ */}
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
          Analytics <span className="text-blue-600 font-light">Hub</span>
        </h1>
        <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="group bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`w-14 h-14 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <kpi.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <p className="text-4xl font-black text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* GRAPHIQUES CHART.JS */}
      <AdminCharts courseStats={statsData.courseDetails} />

      {/* TABLEAU DES DONNÉES PRISMA */}
      <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Répartition par formation</h2>
          <span className="text-[10px] font-bold py-1.5 px-4 bg-white border border-slate-200 text-slate-500 rounded-full shadow-sm">
            {statsData.courseDetails.length} MODULES ACTIFS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-400 text-[11px] uppercase tracking-widest">
                <th className="px-8 py-6 font-black">Formation</th>
                <th className="px-8 py-6 font-black">Expert</th>
                <th className="px-8 py-6 text-center font-black">Audience</th>
                <th className="px-8 py-6 text-right font-black">Progression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {statsData.courseDetails.map((course) => (
                <tr key={course.id} className="group hover:bg-blue-50/40 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-800 text-sm">{course.title}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-white shadow-sm">
                        {course.instructor.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-600 font-medium">{course.instructor}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center font-black text-slate-700">{course.studentsCount}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs font-black text-blue-600 italic">{course.conversionRate}%</span>
                      <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden p-[1px]">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${course.conversionRate}%` }}
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
    </div>
  );
}