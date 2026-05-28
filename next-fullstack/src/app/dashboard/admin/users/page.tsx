"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Trash2, 
  Edit, 
  Search, 
  UserPlus, 
  X, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { getUsers, deleteUserAction, createUserAction, updateUserAction } from "@/app/actions/users";

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<{ id: number; name: string; email: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "PROF", password: "" });
  const [editingUser, setEditingUser] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      if (Array.isArray(result)) setUsers(result);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = editingUser 
      ? await updateUserAction(editingUser, formData) 
      : await createUserAction(formData);

    if (result.success) {
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "PROF", password: "" });
      loadUsers();
    } else {
      alert(result.error);
    }
  }

  const handleEditClick = (user: any) => {
    setEditingUser(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role, password: "" });
    setIsModalOpen(true);
  };

  async function handleDelete(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      const result = await deleteUserAction(id);
      if (result.success) loadUsers();
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Supervisez les accès et les rôles de votre personnel.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: "", email: "", role: "PROF", password: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 font-bold text-sm"
        >
          <UserPlus size={18} />
          Ajouter un membre
        </button>
      </div>

      {/* --- RECHERCHE --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <CheckCircle2 size={14} className="text-emerald-500" />
          {filteredUsers.length} Membres trouvés
        </div>
      </div>

      {/* --- TABLEAU --- */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest">Utilisateur</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Email</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest">Rôle</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {/* --- AVATAR AVEC INITIALE --- */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-sm transition-transform hover:rotate-3 ${
                        user.role === 'ADMIN' 
                        ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-slate-800 border-slate-700 text-slate-100 shadow-lg shadow-slate-200'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 md:hidden">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-slate-500 text-sm hidden md:table-cell font-medium">
                    {user.email}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      user.role === 'ADMIN'
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEditClick(user)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100 font-bold text-xs">
                        <Edit size={14} /> <span className="hidden lg:inline">Modifier</span>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all border border-rose-100 font-bold text-xs">
                        <Trash2 size={14} /> <span className="hidden lg:inline">Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 {editingUser ? <Edit size={20} /> : <UserPlus size={20} />}
              </div>
              {editingUser ? "Édition Profil" : "Nouveau Compte"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom complet</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rôle</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900" 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="PROF">Professeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                <input 
                  required={!editingUser} 
                  type="password" 
                  placeholder={editingUser ? "...." : "••••••••"} 
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-900" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all">Annuler</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                   {editingUser ? "Mettre à jour" : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}