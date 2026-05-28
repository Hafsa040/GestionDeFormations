"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: any) {
  const session = await auth();
  
  console.log("=== DEBUG SESSION ===");
  console.log("Session complète:", JSON.stringify(session, null, 2));
  console.log("User ID:", session?.user?.id);
  console.log("=====================");


  const userId = session?.user?.id; 

  if (!userId) {
    return { 
      success: false, 
      message: `Session vide sur le serveur. Email détecté: ${session?.user?.email || 'aucun'}` 
    };
  }
  

  try {
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      bio: formData.bio, 
    };

    if (formData.newPassword && formData.currentPassword) {
      const user = await prisma.user.findUnique({ 
        where: { id: userId } 
      });

      if (!user || !user.password) {
        return { success: false, message: "Utilisateur non trouvé" };
      }

      const isMatch = await compare(formData.currentPassword, user.password);
      if (!isMatch) {
        return { success: false, message: "L'ancien mot de passe est incorrect" };
      }

      updateData.password = await hash(formData.newPassword, 12);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/dashboard/prof/profile");
    return { success: true, message: "Profil mis à jour avec succès !" };
  } catch (error) {
    console.error("Erreur Prisma:", error);
    return { success: false, message: "Erreur de base de données" };
  }
}