"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  createFullModuleAction, 
  getCourseModulesForProf, 
  addContentToModuleAction, 
  uploadContentAction,
  deleteModuleAction,
  deleteContentAction,
  updateModuleAction,
  updateContentAction,
} from "@/app/actions/modules";
import { 
  Plus, HelpCircle, FileText, Video, AlignLeft, 
  Layout, Settings2, Upload, Search, Trash2, Edit3, Loader2, Save, FileUp, ExternalLink, Award, X
} from "lucide-react";
import Link from "next/link";

export default function ProfModuleManager() {
  const { id } = useParams() as { id: string };
  const [modules, setModules] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // États pour les Modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [viewingText, setViewingText] = useState<{title: string, description: string} | null>(null);
  
  // États pour l'Édition
  const [editModule, setEditModule] = useState<{id: string, title: string} | null>(null);
  const [editContent, setEditContent] = useState<{id: string, title: string, type: string, description?: string} | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [contentForm, setContentForm] = useState({ 
    title: '', type: 'VIDEO' as 'VIDEO' | 'PDF' | 'TEXT' | 'QUIZ', url: '', description: '' 
  });

  const loadData = async () => {
    const res = await getCourseModulesForProf(id); 
    if (res.success) setModules(res.data);
  };

  useEffect(() => { if (id) loadData(); }, [id]);

  const filteredModules = useMemo(() => {
    return modules.filter(mod => 
      mod.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [modules, searchQuery]);

  // --- ACTIONS MODULE ---
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createFullModuleAction(id, moduleTitle);
    if (res.success) { setIsModuleModalOpen(false); setModuleTitle(""); loadData(); }
    setIsSubmitting(false);
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModule) return;
    const res = await updateModuleAction(editModule.id, editModule.title);
    if (res.success) { setEditModule(null); loadData(); }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if(confirm("⚠️ Supprimer ce module et tout son contenu ?")) {
      const res = await deleteModuleAction(moduleId);
      if (res.success) loadData();
    }
  };

  // --- ACTIONS CONTENU ---
  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (contentForm.type === 'TEXT' || contentForm.type === 'QUIZ') {
      const res = await addContentToModuleAction(selectedModuleId, contentForm);
      if (res.success) finalizeAdd();
    } else {
      if (!file) {
        alert("Veuillez sélectionner un fichier");
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('type', contentForm.type);
      formData.append('moduleId', selectedModuleId);
      formData.append('file', file);

      const res = await uploadContentAction(formData);
      if (res.success) finalizeAdd();
      else alert("Erreur serveur : " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('contentId', editContent.id);
    formData.append('title', editContent.title);
    formData.append('type', editContent.type);
    formData.append('description', editContent.description || "");
    if (editFile) formData.append('file', editFile);
    
    const res = await updateContentAction(formData);
    if (res.success) { setEditContent(null); setEditFile(null); loadData(); }
    setIsSubmitting(false);
  };

  const handleDeleteContent = async (contentId: string) => {
    if(confirm("Supprimer ce support ?")) {
      const res = await deleteContentAction(contentId);
      if (res.success) loadData();
    }
  };

  const finalizeAdd = () => {
    setIsContentModalOpen(false); 
    setContentForm({ title: '', type: 'VIDEO', url: '', description: '' });
    setFile(null);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl"><Layout className="text-indigo-700" /></div>
          Gestion du Cours
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold text-slate-900 placeholder:text-slate-400 "
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModuleModalOpen(true)} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 uppercase text-xs">
            <Plus size={20} /> Nouveau Module
          </button>
        </div>
      </div>

      {/* LISTE DES MODULES */}
      <div className="grid gap-6">
        {filteredModules.map((mod) => (
          <div key={mod.id} className={`bg-white rounded-[32px] border-2 overflow-hidden shadow-md group transition-all ${mod.isFinal ? "border-amber-400" : "border-slate-200"}`}>
            <div className={`p-6 border-b-2 flex justify-between items-center ${mod.isFinal ? "bg-amber-50" : "bg-slate-50"}`}>
              <div className="flex items-center gap-3">
                {mod.isFinal && <div className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase flex items-center gap-1"><Award size={12}/> Certification</div>}
                <h3 className="text-xl font-black text-slate-950">{mod.title}</h3>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 ml-4">
                  <button onClick={() => setEditModule({id: mod.id, title: mod.title})} className="p-2 text-slate-500 hover:text-indigo-600"><Edit3 size={18}/></button>
                  <button onClick={() => handleDeleteModule(mod.id)} className="p-2 text-slate-500 hover:text-red-600"><Trash2 size={18}/></button>
                </div>
              </div>
              {!mod.isFinal && (
                <button onClick={() => { setSelectedModuleId(mod.id); setIsContentModalOpen(true); }} className="bg-white border-2 border-indigo-600 text-indigo-700 px-5 py-2 rounded-2xl text-xs font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">
                  + Support
                </button>
              )}
            </div>

            <div className="p-6 space-y-3 bg-white">
              {mod.contents?.length === 0 && <p className="text-center py-6 text-slate-400 font-bold italic text-sm">Aucun contenu</p>}
              {mod.contents?.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-indigo-200 hover:bg-white transition-all group/item">
                  {content.type === 'QUIZ' ? (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-amber-100 rounded-xl"><HelpCircle size={20} className="text-amber-600" /></div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950">{content.title}</span>
                        <span className="text-[10px] text-amber-600 font-black uppercase">Quiz interactif</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => content.type === 'TEXT' ? setViewingText({ title: content.title, description: content.description }) : window.open(content.url, '_blank')}
                      className="flex items-center gap-4 flex-1 group/link cursor-pointer"
                    >
                      <div className="p-2 bg-white border border-slate-200 rounded-xl">
                        {content.type === 'VIDEO' ? <Video size={20} className="text-blue-600" /> : content.type === 'TEXT' ? <AlignLeft size={20} className="text-slate-600" /> : <FileText size={20} className="text-red-600" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950 flex items-center gap-2 group-hover/link:text-indigo-600">
                          {content.title} {content.type === 'TEXT' ? <Search size={14}/> : <ExternalLink size={14}/>}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-black">
                          {content.type} • {content.type === 'TEXT' ? "Lire la note" : "Ouvrir le fichier"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {content.type === 'QUIZ' ? (
                      <Link href={`/dashboard/prof/quiz/${content.quiz?.id}`} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md">
                        <Settings2 size={18} /> <span className="text-xs font-black uppercase">Éditer</span>
                      </Link>
                    ) : (
                      <div className="flex opacity-0 group-hover/item:opacity-100 gap-1">
                        <button onClick={() => setEditContent({...content})} className="p-3 text-slate-500 hover:text-indigo-600"><Edit3 size={20}/></button>
                        <button onClick={() => handleDeleteContent(content.id)} className="p-3 text-slate-500 hover:text-red-600"><Trash2 size={20}/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: VISIONNER TEXTE */}
      {viewingText && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-white w-full max-w-2xl p-8 rounded-[40px] shadow-2xl border-2 border-indigo-100 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-950 uppercase">{viewingText.title}</h2>
              <button onClick={() => setViewingText(null)} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 whitespace-pre-wrap font-medium text-slate-800">
              {viewingText.description || "Aucun contenu."}
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setViewingText(null)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AJOUTER MODULE */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateModule} className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-2 border-indigo-100">
            <h2 className="text-2xl font-black mb-8 text-slate-950 uppercase">Nouveau Module</h2>
            <input 
              autoFocus placeholder="Titre..."
className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-lg text-slate-900"
              value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required
            />
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setIsModuleModalOpen(false)} className="flex-1 font-black text-slate-500 uppercase text-xs">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl">
                {isSubmitting ? "Création..." : "Confirmer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: AJOUTER CONTENU */}
      {isContentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddContent} className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl space-y-6 border-2 border-indigo-100">
            <h2 className="text-2xl font-black text-slate-950 uppercase">Nouveau Support</h2>
            <div className="space-y-2 text-slate-900 placeholder:text-slate-400 ">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest ">Titre</label>
              <input placeholder="Ex: TP1 NoSQL" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest ">Type</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-900 placeholder:text-slate-400 " value={contentForm.type} onChange={(e) => setContentForm({...contentForm, type: e.target.value as any})}>
                <option value="VIDEO">📹 Vidéo</option>
                <option value="PDF">📄 PDF</option>
                <option value="TEXT">📝 Texte</option>
                <option value="QUIZ">❓ Quiz</option>
              </select>
            </div>
            {contentForm.type === 'TEXT' ? (
              <textarea placeholder="Rédigez ici..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none h-40 font-medium text-slate-900 placeholder:text-slate-400 " value={contentForm.description} onChange={(e) => setContentForm({...contentForm, description: e.target.value})} />
            ) : contentForm.type !== 'QUIZ' && (
              <div className="p-8 border-4 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50 text-center hover:border-indigo-200 group">
                <input type="file" id="file-upload" className="hidden" accept={contentForm.type === 'PDF' ? '.pdf' : 'video/*'} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Upload className="text-indigo-600" size={32} /></div>
                  <span className="text-sm font-black text-slate-950">{file ? file.name : "Uploader un fichier"}</span>
                </label>
              </div>
            )}
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setIsContentModalOpen(false)} className="flex-1 font-black text-slate-500 uppercase text-xs">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl flex items-center justify-center">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: MODIFIER CONTENU */}
      {editContent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateContent} className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-2 border-indigo-100 space-y-5">
            <h2 className="text-2xl font-black text-slate-950 uppercase">Modifier Support</h2>
            <input className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-900"
 value={editContent.title} onChange={(e) => setEditContent({...editContent, title: e.target.value})} required />
            {editContent.type === 'TEXT' ? (
              <textarea  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-900"
  value={editContent.description} onChange={(e) => setEditContent({...editContent, description: e.target.value})} />
            ) : (
              <div className="p-6 bg-indigo-50/50 border-4 border-dashed border-indigo-100 rounded-[32px] text-center">
                <label className="flex flex-col items-center cursor-pointer gap-2">
                  <FileUp className="text-indigo-600" size={32}/>
                  <span className="text-sm font-black text-slate-950 px-4">{editFile ? editFile.name : `Remplacer le fichier`}</span>
                  <input type="file" className="hidden" accept={editContent.type === 'PDF' ? '.pdf' : 'video/*'} onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => {setEditContent(null); setEditFile(null);}} className="flex-1 font-black text-slate-500 uppercase text-xs">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 shadow-xl">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Enregistrer</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: RENOMMER MODULE */}
      {editModule && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdateModule} className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-2 border-indigo-100">
            <h2 className="text-2xl font-black mb-8 text-slate-950 uppercase">Renommer Module</h2>
            <input className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-black text-lg text-slate-900 placeholder:text-slate-400" value={editModule.title} onChange={(e) => setEditModule({...editModule, title: e.target.value})} required />
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setEditModule(null)} className="flex-1 font-black text-slate-500 uppercase text-xs">Annuler</button>
              <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl">Sauvegarder</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}