"use client";

import { Users, BookOpen, CheckCircle, GraduationCap, TrendingUp, LayoutDashboard } from "lucide-react";

interface DashboardProps {
  currentUser: any;
  initialStats: {
    overview: {
      totalStudents: number;
      totalCourses: number;
      totalCertificates: number;
      successRate: number;
    };
  };
}

export default function EtudiantDashboard({ currentUser, initialStats }: DashboardProps) {
  const { totalStudents, totalCourses, totalCertificates, successRate } = initialStats.overview;

  return (
    <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <LayoutDashboard size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Vue d'ensemble</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tableau de <span className="text-indigo-600">bord</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Bienvenue, <span className="text-slate-900 font-bold">{currentUser?.name || "Étudiant"}</span> 👋
          </p>
        </div>

        {/* Global Stats Badge */}
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-xl shadow-indigo-500/5 border border-indigo-50">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Communauté</p>
            <p className="text-lg font-black text-slate-900">{totalStudents} <span className="text-sm font-medium text-slate-400 text-transform-none">inscrits</span></p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <StatCard 
          label="Formations" 
          subLabel="Cours disponibles"
          value={totalCourses.toString()} 
          icon={<BookOpen size={28} />} 
          gradient="from-blue-600 to-indigo-600"
          bgLight="bg-blue-50"
        />
        <StatCard 
          label="Certifications" 
          subLabel="Diplômes délivrés"
          value={totalCertificates.toString()} 
          icon={<GraduationCap size={28} />} 
          gradient="from-emerald-500 to-teal-600"
          bgLight="bg-emerald-50"
        />
        <StatCard 
          label="Performance" 
          subLabel="Taux de réussite"
          value={`${successRate.toFixed(0)}%`} 
          icon={<TrendingUp size={28} />} 
          trend="Moyenne globale"
          gradient="from-amber-500 to-orange-600"
          bgLight="bg-amber-50"
        />
      </div>


    </div>
  );
}

function StatCard({ label, subLabel, value, icon, trend, gradient, bgLight }: any) {
  return (
    <div className="group bg-white p-1 rounded-[32px] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      <div className="p-7">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${bgLight} text-slate-900 group-hover:scale-110 transition-transform duration-300`}>
            {/* L'icône prend la couleur du dégradé au hover */}
            <div className={`bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                {icon}
            </div>
          </div>
          <span className="text-[10px] font-bold py-1 px-3 bg-slate-100 text-slate-500 rounded-full uppercase tracking-tighter">
            {trend}
          </span>
        </div>
        
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {value}
          </p>
          <p className="text-xs font-medium text-slate-500 italic">{subLabel}</p>
        </div>
      </div>
      
      {/* Barre de décoration au bas */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient} rounded-b-[32px] opacity-10 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  );
}