"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/hooks/use-notification-store";
import {
  BookOpen,
  User,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Bell,
  Award,
  Users,
  ChevronLeft,
  ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const { hasUnreadMessages, setHasUnreadMessages } = useNotificationStore();

  useEffect(() => {
    if (pathname === "/dashboard/etudiant/communaute") {
      setHasUnreadMessages(false);
    }
  }, [pathname, setHasUnreadMessages]);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Vue d'ensemble", href: "/dashboard/etudiant", icon: LayoutDashboard },
    { name: "Mes Cours", href: "/dashboard/etudiant/courses", icon: BookOpen },
    { name: "Certifications", href: "/dashboard/etudiant/certifications", icon: Award },
    { name: "Profil", href: "/dashboard/etudiant/profile", icon: User },
    { 
      name: "Communauté", 
      href: "/dashboard/etudiant/communaute", 
      icon: Users,
      hasBadge: hasUnreadMessages && pathname !== "/dashboard/etudiant/communaute"
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* --- SIDEBAR (Style Admin Dark) --- */}
      <aside
        className={`${
          isOpen ? "w-72" : "w-24"
        } bg-slate-900 text-slate-400 transition-all duration-500 ease-in-out p-6 flex flex-col shadow-2xl relative z-50`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-10 bg-blue-600 text-white p-1.5 rounded-full border-4 border-[#f8fafc] hover:bg-blue-700 transition-colors shadow-md z-[60]"
        >
          <ChevronLeft className={`transition-transform duration-500 ${!isOpen ? "rotate-180" : ""}`} size={16} />
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-grow mt-10">
          <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-3 ${!isOpen && "text-center"}`}>
            {isOpen ? "Menu Étudiant" : "•••"}
          </p>

          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={isActive(item.href) ? "text-white" : "group-hover:text-blue-400"} />
                {isOpen && <span className="font-medium text-sm">{item.name}</span>}
              </div>

              {/* Badge Notification */}
              {item.hasBadge && (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Sidebar / Logout */}
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-4 p-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200"
          >
            <LogOut size={22} />
            {isOpen && <span className="font-bold text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN SECTION --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- HEADER (Style Admin Premium) --- */}
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

 {/* Right Section: Espace Étudiant Only */}
          <div className="flex items-center gap-4">
            

            {/* Badge Espace Étudiant - Design Premium */}
            <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-slate-200 transition-all hover:scale-105 border border-slate-800 cursor-default group">
              <div className="bg-blue-500/20 p-1.5 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <GraduationCap size={18} className="text-blue-400" />
              </div>
              <div className="flex flex-col">

                <span className="text-xs font-bold uppercase tracking-wider mt-1 text-slate-100">
                  Espace Étudiant
                </span>
              </div>
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