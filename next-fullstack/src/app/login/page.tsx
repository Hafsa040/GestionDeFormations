"use client";

import { loginUser } from "@/app/actions/login";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { Mail, Lock, LogIn, Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    
    const res = await loginUser(formData) as { success?: boolean; error?: string };

    if (res?.success) {
      const session = await getSession(); 
      const role = session?.user?.role; 

      if (role === 'ADMIN') {
        router.push("/dashboard/admin");
      } else if (role === 'ETUDIANT') {
        router.push("/dashboard/etudiant");
      } else {
        router.push("/dashboard/prof");
      }
    } else {
      setError(res?.error || "Identifiants invalides");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4 text-slate-900">
      <div className="w-full max-w-md">
        
        {/* Logo / Header - Identique au Register */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bon retour !
          </h1>
          <p className="text-slate-500 mt-2 text-center font-medium">
            Accédez à votre espace de formation
          </p>
        </div>

        <div className="bg-white p-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100">
          
          {/* Alerte d'erreur stylisée Blue/Red */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-in fade-in slide-in-from-top-1">
              <p className="font-bold">Erreur de connexion</p>
              <p>{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            
            {/* Champ Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
             </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="block w-full pl-10 pr-3 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Bouton de soumission - Bleu identique au Register */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 font-medium">
              Nouveau ici ?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold">
          LMS Intelligent • Sécurité renforcée
        </p>
      </div>
    </div>
  );
}