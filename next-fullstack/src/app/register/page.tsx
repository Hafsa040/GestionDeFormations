"use client";

import { registerUser } from "@/app/actions/register";
import { useState } from "react";
import { User, Mail, Lock, Loader2, GraduationCap } from "lucide-react"; // Pense à installer lucide-react si besoin
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    
    const result = await registerUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4 text-slate-900">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Créer un compte
          </h1>
          <p className="text-slate-500 mt-2 text-center">
            Rejoignez l'avenir de l'apprentissage intelligent
          </p>
        </div>

        <div className="bg-white p-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100">
          {/* Message d'erreur stylisé */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-in fade-in slide-in-from-top-1">
              <p className="font-bold">Attention</p>
              <p>{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            {/* Champ Nom */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Nom Complet</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                  placeholder="Hafsa ..."
                />
              </div>
            </div>

            {/* Champ Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Professionnel</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 ml-1">
                Utilisez 8+ caractères avec majuscules et chiffres.
              </p>
            </div>

            {/* Bouton Submit */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Déjà membre de la communauté ?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest font-medium">
          Powered by LMS Intelligent v2.0
        </p>
      </div>
    </div>
  );
}