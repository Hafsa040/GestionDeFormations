import StudentProfile from "@/components/StudentProfile";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      bio: true,
    }
  });

  if (!dbUser) return <div>Utilisateur non trouvé</div>;

  return <StudentProfile user={dbUser} />;
}