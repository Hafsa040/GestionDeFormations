import { getAdminDashboardStats } from "@/app/actions/getAdminStats";
import { Users, BookOpen, GraduationCap, TrendingUp, User, Activity } from "lucide-react";
import EtudiantDashboard from "@/components/EtudiantDashboard"; // Ton composant client
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // 1. Vérifier la session
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 2. Récupérer les stats depuis la DB (Côté Serveur)
  const stats = await getAdminDashboardStats();

  // 3. Passer les données au composant Client
  return (
    <EtudiantDashboard 
      currentUser={session.user} 
      initialStats={stats} 
    />
  );
}