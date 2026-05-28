"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "PROF"] },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    
    return users;
  } catch (error: any) {
    console.log("---------- ERREUR PRISMA DÉTAILLÉE ----------");
    console.log(error.message); 
    console.log("Code d'erreur:", error.code); 
    console.log("---------------------------------------------");
    
    return { error: error.message || "Erreur inconnue" };
  }
}
export async function updateUserAction(id: number, formData: any) {
  try {
    const { prisma } = await import("@/lib/prisma");
    
    // Préparation des données de mise à jour
    const updateData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    if (formData.role === "PROF") {
      updateData.role = "PROF"; 
    } else {
      updateData.role = formData.role; //  "ADMIN" ou "ETUDIANT"
    }

    // Si un nouveau mot de passe est saisi, on le hache
    if (formData.password && formData.password.trim() !== "") {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(formData.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur Update:", error);
    return { success: false, error: "Erreur lors de la modification." };
  }
}
export async function updateStudentPassword(formData: FormData) {
  const session = await auth();
  
  if (!session || session.user.role !== "ETUDIANT") {
    return { error: "Non autorisé" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { error: "Les nouveaux mots de passe ne correspondent pas." };
  }

  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }

  try {
    // 1. Récupérer l'utilisateur pour vérifier l'ancien mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { error: "Utilisateur non trouvé." };
    }

    // 2. Vérification de l'ancien mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "L'ancien mot de passe est incorrect." };
    }

    // 3. Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update en base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: "Mot de passe modifié avec succès !" };
  } catch (error) {
    console.error("Password Update Error:", error);
    return { error: "Erreur technique lors du changement de mot de passe." };
  }
}
export async function updateStudentProfile(formData: FormData) {
  const session = await auth();
  
  if (!session || session.user.role !== "ETUDIANT") {
    return { error: "Non autorisé" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const bio = formData.get("bio") as string; 

  try {
  const updateData: any = {
      name: name,
      bio: bio,
    };

    if (email && email.trim() !== "") {
      updateData.email = email;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });


    revalidatePath("/dashboard/etudiant/profile");
    revalidatePath("/dashboard/etudiant/courses"); 
    return { success: "Profil mis à jour avec succès !" };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function createUserAction(formData: { name: string; email: string; role: string }) {
  try {
    const hashedPassword = await bcrypt.hash("InitialPass123!", 10);
    const newUser = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email,
        password: hashedPassword,
        role: formData.role
              },
      
    });
    
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("ERREUR SERVEUR:", error); 
    return { success: false, error: error.message }; 
  }
}
// 2. Supprimer un utilisateur
export async function deleteUserAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {

      // 1. messages
      await tx.message.deleteMany({ where: { userId: id } });

      // 2. comments
      await tx.comment.deleteMany({ where: { userId: id } });

      // 3. quiz attempts
      await tx.quizAttempt.deleteMany({ where: { userId: id } });

      // 4. progress
      await tx.userContentProgress.deleteMany({ where: { userId: id } });

      // 5. grades
      await tx.grade.deleteMany({ where: { studentId: id } });

      // 6. certificates
      await tx.certificate.deleteMany({ where: { studentId: id } });

      // 7. enrollments
      await tx.enrollment.deleteMany({ where: { studentId: id } });

      // 🔥 IMPORTANT (PROF RELATION)
      await tx.course.deleteMany({
        where: { instructorId: id }
      });

      // 8. user final
      await tx.user.delete({
        where: { id }
      });
    });

    revalidatePath("/dashboard/admin/users");

    return { success: true };

  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return {
      success: false,
      error: "Impossible de supprimer cet utilisateur"
    };
  }
}