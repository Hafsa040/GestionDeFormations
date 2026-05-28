// src/app/actions/certification.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generateCertificate(courseId: string, finalGrade: number) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Non autorisé" };

    
    const certificate = await prisma.certificate.upsert({
      where: { 
        studentId_courseId: { 
          studentId: userId, 
          courseId: courseId 
        } 
      },
      update: {
        finalGrade: finalGrade,
      },
      create: {
        studentId: userId,
        courseId: courseId,
        finalGrade: finalGrade,
      }
    });

    revalidatePath("/dashboard/etudiant/certifications");
    return { success: true, certificateId: certificate.id };
  } catch (error) {
    console.error("Erreur certification:", error);
    return { error: "Impossible de générer le certificat" };
  }
}