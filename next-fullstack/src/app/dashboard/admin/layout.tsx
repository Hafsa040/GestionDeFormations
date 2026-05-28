 "use client";



import { useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {

  UserCog,

  LayoutDashboard,

  LogOut,

  ChevronLeft,

  GraduationCap,

  ShieldCheck,

  Search,

  Settings 

} from "lucide-react";



export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const [isOpen, setIsOpen] = useState(true);

  const pathname = usePathname();



  const isActive = (path: string) => pathname === path;



  return (

    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Sidebar */}

      <aside

        className={`${

          isOpen ? "w-72" : "w-24"

        } bg-slate-900 text-slate-400 transition-all duration-500 ease-in-out p-6 flex flex-col shadow-2xl relative z-50`}

      >

        {/* Toggle Button - Floating Style */}

        <button

          onClick={() => setIsOpen(!isOpen)}

          className="absolute -right-3 top-10 bg-blue-600 text-white p-1.5 rounded-full border-4 border-[#f8fafc] hover:bg-blue-700 transition-colors shadow-md z-[60]"

        >

          <ChevronLeft className={`transition-transform duration-500 ${!isOpen ? "rotate-180" : ""}`} size={16} />

        </button>



        {/* Navigation - Ajustement de la marge haute */}

        <nav className="flex flex-col gap-2 flex-grow mt-10">

          <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-3 ${!isOpen && "text-center"}`}>

            {isOpen ? "Menu Principal" : "•••"}

          </p>

         

          <Link

            href="/dashboard/admin"

            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 group ${

              isActive("/dashboard/admin")

                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"

                : "hover:bg-slate-800 hover:text-slate-200"

            }`}

          >

            <LayoutDashboard size={22} className={isActive("/dashboard/admin") ? "text-white" : "group-hover:text-blue-400"} />

            {isOpen && <span className="font-medium text-sm">Vue d'ensemble</span>}

          </Link>

         

          <Link

            href="/dashboard/admin/users"

            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 group ${

              isActive("/dashboard/admin/users")

                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"

                : "hover:bg-slate-800 hover:text-slate-200"

            }`}

          >

            <UserCog size={22} className={isActive("/dashboard/admin/users") ? "text-white" : "group-hover:text-blue-400"} />

            {isOpen && <span className="font-medium text-sm">Gérer les Utilisateurs</span>}

          </Link>



         

        </nav>



        {/* Footer Sidebar / Logout */}

        <div className="pt-6 border-t border-slate-800 flex flex-col gap-4">

          <Link

            href="/login"

            className="flex items-center gap-4 p-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200"

          >

            <LogOut size={22} />

            {isOpen && <span className="font-bold text-sm">Déconnexion</span>}

          </Link>

        </div>

      </aside>



      {/* Main Section */}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

       

        {/* --- HEADER --- */}

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">

         

          {/* Logo & App Name */}

          <div className="flex items-center gap-3">

            <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-100">

              <GraduationCap className="text-white" size={24} />

            </div>

            <div className="hidden sm:block">

              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">

                LMS <span className="text-blue-600 underline decoration-blue-200">Intelligent</span>

              </h1>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Plateforme d'ingénierie</p>

            </div>

          </div>



          {/* Right Section: Espace Admin */}

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg shadow-slate-200 transition-transform hover:scale-105 cursor-default">

              <ShieldCheck size={18} className="text-blue-400" />

              <span className="text-xs font-bold uppercase tracking-wider">Espace Admin</span>

            </div>

          </div>

        </header>



        {/* --- CONTENT AREA --- */}

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8">

          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            {children}

          </div>

        </main>

      </div>

    </div>

  );

}