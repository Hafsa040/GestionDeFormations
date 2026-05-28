"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Lock, Mail, User, Loader2, ShieldCheck } from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile";

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
    }
  }, [session, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await updateProfileAction(formData);
      if (result.success) {
        alert("Profil mis à jour avec succès !");
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Une erreur critique est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-10 flex items-center gap-6">
        <div className="p-4 bg-indigo-600 rounded-2xl border-2 border-black">
          <User className="text-white" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">Mon Profil</h1>
          <p className="text-black font-bold uppercase text-xs opacity-60">Gérez vos informations personnelles</p>
        </div>
      </div>
      
      <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-10">
        
        {/* SECTION: IDENTITÉ */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-black uppercase tracking-[0.2em] border-b-4 border-black pb-2 inline-block">
            Informations Générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase flex items-center gap-2 ml-2">
                <User size={14} /> Nom Complet
              </label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 bg-white border-4 border-black rounded-2xl font-black text-black outline-none focus:bg-indigo-50 transition-colors" 
                placeholder="Votre nom" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase flex items-center gap-2 ml-2">
                <Mail size={14} /> Email Professionnel
              </label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-white border-4 border-black rounded-2xl font-black text-black outline-none focus:bg-indigo-50 transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* SECTION: SÉCURITÉ */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
             <h2 className="text-sm font-black text-black uppercase tracking-[0.2em] border-b-4 border-black pb-2 inline-block">
              Sécurité du compte
            </h2>
          </div>
          
          <div className="bg-amber-50 border-2 border-black p-4 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="text-black" size={20} />
            <p className="text-[10px] font-black text-black uppercase">Laissez les champs vides si vous ne souhaitez pas modifier votre mot de passe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase ml-2">Ancien mot de passe</label>
              <input 
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-4 bg-white border-4 border-black rounded-2xl font-black text-black outline-none focus:bg-red-50 transition-colors" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-black uppercase ml-2">Nouveau mot de passe</label>
              <input 
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-4 bg-white border-4 border-black rounded-2xl font-black text-black outline-none focus:bg-green-50 transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* BOUTON ACTIONS */}
        <div className="pt-6">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={24} />
                Mettre à jour le profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}