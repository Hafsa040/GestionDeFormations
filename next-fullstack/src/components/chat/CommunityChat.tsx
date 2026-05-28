"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Send, Paperclip, Mic, FileText, Reply, X, Headphones, Square, Download } from "lucide-react";
import { Message, Role } from "@prisma/client";
import { useNotificationStore } from "@/hooks/use-notification-store";

type FullMessage = Message & {
  user: { id: string; name: string; role: Role };
  parentMessage?: {
    content: string | null;
    user: { name: string };
  } | null;
};

interface CommunityChatProps {
  currentUser: any;
  initialMessages: FullMessage[];
}

export default function CommunityChat({ currentUser, initialMessages }: CommunityChatProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<FullMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<FullMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const { setHasUnreadMessages } = useNotificationStore(); 
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (newMessage: FullMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      if (newMessage.userId !== currentUser.id) {
        setHasUnreadMessages(true); 
      }
    };

    socket.on("message:received", handleMessage);
    return () => { socket.off("message:received", handleMessage); };
  }, [socket, currentUser.id, setHasUnreadMessages]);

  const sendMessage = async (content: string | null, type: string = "TEXT", fileUrl: string | null = null) => {
    if (type === "TEXT" && !content?.trim()) return;
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content, 
          type, 
          fileUrl, 
          parentMessageId: replyingTo?.id || null,
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [...prev, savedMessage]);
        if (socket) socket.emit("message:send", savedMessage);
        
        setInputValue("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Erreur envoi:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const fileType = file.type.includes("pdf") ? "PDF" : "IMAGE";
      sendMessage(`Fichier : ${file.name}`, fileType, base64);
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          sendMessage("Message vocal", "AUDIO", reader.result as string);
        };
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Micro refusé", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <>
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-[9999]" 
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-10 right-10 text-white/70 hover:text-white transition-colors">
            <X size={40} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Agrandissement" 
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
          <a 
            href={fullscreenImage} 
            download="image_emsi.png"
            className="mt-8 flex items-center gap-3 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={20} /> Télécharger
          </a>
        </div>
      )}

      <div className="flex flex-col h-[700px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold uppercase text-xs tracking-widest text-indigo-400">Hub Communautaire</h3>
            <p className="text-[10px] text-slate-400 italic">Session : {currentUser.name}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${isConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
            {isConnected ? "LIVE" : "OFFLINE"}
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.userId === currentUser.id ? "items-end" : "items-start"}`}>
              <div className={`group relative max-w-[80%] p-4 rounded-2xl shadow-sm transition-all ${
                msg.userId === currentUser.id ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
              }`}>
                <button 
                  onClick={() => setReplyingTo(msg)} 
                  className={`absolute top-0 ${msg.userId === currentUser.id ? "-left-10" : "-right-10"} p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600`}
                >
                  <Reply size={18} />
                </button>
                
                <div className="flex justify-between items-center gap-4 mb-2">
                  <p className="font-black text-[10px] uppercase opacity-70">{msg.user.name}</p>
                  <p className="text-[8px] opacity-50">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {msg.parentMessage && (
                  <div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-indigo-400 text-[10px] italic truncate">
                      @{msg.parentMessage.user.name}: {msg.parentMessage.content}
                  </div>
                )}

                {msg.type === "TEXT" && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                {msg.type === "IMAGE" && msg.fileUrl && (
                  <img 
                    src={msg.fileUrl} 
                    alt="Shared" 
                    className="mt-2 max-h-60 rounded-lg object-cover cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => setFullscreenImage(msg.fileUrl!)}
                  />
                )}
                {msg.type === "AUDIO" && (
                  <audio src={msg.fileUrl!} controls className="h-8 w-44 mt-1 invert" />
                )}
                {msg.type === "PDF" && msg.fileUrl && (
                  <a href={msg.fileUrl} download className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl mt-2 border border-red-100 hover:bg-red-100">
                    <FileText size={20} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase">Document PDF</span>
                      <span className="text-[9px] opacity-70">Télécharger</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input Area CORRIGÉE */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2 shrink-0">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
          
          {replyingTo && (
            <div className="flex items-center justify-between bg-indigo-50 p-2 px-4 rounded-xl text-[10px] text-indigo-700 border border-indigo-100 animate-in slide-in-from-bottom-2">
              <span className="truncate">Réponse à <b>@{replyingTo.user.name}</b></span>
              <button onClick={() => setReplyingTo(null)}><X size={14} /></button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-600 p-2 transition-colors">
              <Paperclip size={20} />
            </button>
            <button 
              onClick={isRecording ? stopRecording : startRecording} 
              className={`p-2 rounded-full transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-red-500"}`}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
            </button>
            
      
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
              placeholder={isRecording ? "Enregistrement..." : "Écrivez votre message..."}
              disabled={isRecording}
              className="flex-1 bg-slate-100 text-slate-900 font-medium rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 border-none outline-none transition-all placeholder:text-slate-400"
            />

            <button 
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() && !isRecording}
              className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}