import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMessages } from "@/app/actions/getMessages";
import CommunityChat from "@/components/chat/CommunityChat";

export default async function CommunautePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // On récupère l'historique avant d'afficher la page
  const initialMessages = await getMessages();

  return (
    <div className="min-h-screen bg-[#f9fafb] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Hub Communautaire</h1>
          <p className="text-slate-500">Échangez avec les étudiants et professeurs en temps réel.</p>
        </div>

        {/* Le composant de chat avec les données initiales */}
        <CommunityChat 
          currentUser={session.user} 
          initialMessages={initialMessages} 
        />
      </div>
    </div>
  );
}