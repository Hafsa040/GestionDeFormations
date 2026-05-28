"use client";

import { useState } from "react";
import { User, Mail, Save, ShieldCheck, Camera, Loader2, AlignLeft, Lock, KeyRound } from "lucide-react";
import { updateStudentProfile, updateStudentPassword } from "@/app/actions/users";

interface StudentProfileProps {
  user: {
    name: string | null;
    email: string | null;
    bio: string | null;
  };
}

export default function StudentProfile({ user }: StudentProfileProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [currentName, setCurrentName] = useState(user.name || "");
  const [currentBio, setCurrentBio] = useState(user.bio || "");

  async function handleProfileSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    const res = await updateStudentProfile(formData) as any;
    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: res.success || "Profil mis à jour" });
      const newName = formData.get("name") as string;
      const newBio = formData.get("bio") as string;
      if (newName) setCurrentName(newName);
      setCurrentBio(newBio || ""); 
    }
    setIsSubmitting(false);
  }

  async function handlePasswordSubmit(formData: FormData) {
    setIsChangingPwd(true);
    const res = await updateStudentPassword(formData) as any;
    if (res?.error) {
      alert(res.error);
    } else {
      alert(res.success || "Mot de passe modifié");
      (document.getElementById("password-form") as HTMLFormElement).reset();
    }
    setIsChangingPwd(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Paramètres du compte</h1>
        <p className="text-slate-500">Gérez vos informations et la sécurité de votre accès LMS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARTE GAUCHE */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-fit flex flex-col items-center text-center">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full bg-blue-100 border-4 border-white shadow-lg flex items-center justify-center text-blue-600 text-4xl font-black">
              {currentName.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-slate-100 shadow-md text-slate-600">
              <Camera size={18} />
            </button>
          </div>
          <h2 className="mt-4 font-bold text-lg text-slate-800">{currentName}</h2>
          <div className="mt-2 px-2 w-full">
            <p className="text-sm text-slate-500 italic leading-relaxed line-clamp-3">
              "{currentBio || "Ajoutez une biographie..."}"
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-xs font-bold border border-slate-100">
            <ShieldCheck size={14} /> Compte Étudiant
          </div>
        </div>

        {/* CARTE DROITE */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <form action={handleProfileSubmit} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} className="text-blue-500"/> Nom complet</label>
                  <input 
                    name="name" 
                    type="text" 
                    defaultValue={currentName} 
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={16} className="text-blue-500"/> Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    defaultValue={user.email || ""} 
                    readOnly 
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><AlignLeft size={16} className="text-blue-500"/> Ma Biographie</label>
                <textarea 
                  name="bio" 
                  rows={4} 
                  defaultValue={currentBio}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button disabled={isSubmitting} type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Enregistrer
                </button>
              </div>
            </form>
          </div>

          {/* FORMULAIRE MOT DE PASSE (CORRIGÉ) */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm border-t-4 border-t-amber-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Lock size={20} /></div>
              <h2 className="text-lg font-bold text-slate-800">Sécurité</h2>
            </div>

            <form id="password-form" action={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe actuel</label>
                <input 
                  name="currentPassword" 
                  type="password" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl outline-none focus:border-amber-400 transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nouveau</label>
                  <input 
                    name="newPassword" 
                    type="password" 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl outline-none focus:border-amber-400 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Confirmation</label>
                  <input 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl outline-none focus:border-amber-400 transition-all" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button disabled={isChangingPwd} type="submit" className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                  {isChangingPwd ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />} Changer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}