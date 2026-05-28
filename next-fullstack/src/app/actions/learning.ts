"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";






export async function enrollStudent(courseId: string, studentId: string) {
  try {
    // 1. Vérifier si l'étudiant a déjà un certificat pour ce cours
    const existingCert = await prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    });

    if (existingCert) {
      return { error: "Vous avez déjà obtenu la certification pour ce cours." };
    }

    await prisma.enrollment.create({
      data: { courseId, studentId }
    });
    
    
revalidatePath("/dashboard/etudiant/courses");    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de l'inscription." };
  }
}


export async function getQuizQuestions(contentId: string) {
  try {
    // 1. Récupérer le quiz lié au contenu
    const quiz = await prisma.quiz.findUnique({
      where: { contentId: contentId },
    });

    if (!quiz) return { error: "Quiz introuvable" };

    // 2. Récupérer les questions ET les options (incluant isCorrect)
    const questions = await prisma.question.findMany({
      where: { quizId: quiz.id },
      include: {
        options: true, // Prisma ramènera id, text, ET isCorrect d'après ton schéma
      },
    });

    return { success: true, questions, quizId: quiz.id };
  } catch (error) {
    return { error: "Erreur lors de la récupération du quiz" };
  }
}
// SE DÉSINSCRIRE
export async function unenrollStudent(courseId: string, studentId: string) {
  try {
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    });
    
    revalidatePath("/dashboard/etudiant/courses");
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la désinscription." };
  }
}

export async function markContentAsComplete(contentId: string, score?: number) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Non autorisé");

    // 1. Mise à jour de la progression dans UserContentProgress
    await prisma.userContentProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: { 
        completed: true, 
        score: score ?? null, 
        completedAt: new Date() 
      },
      create: { 
        userId, 
        contentId, 
        completed: true, 
        score: score ?? null, 
        completedAt: new Date() 
      }
    });

    // 2. Récupération des infos pour vérifier la fin du cours
    const currentContent = await prisma.content.findUnique({
      where: { id: contentId },
      include: { module: { include: { course: true } } }
    });

    if (currentContent?.module?.course) {
      const courseId = currentContent.module.course.id;

      // Compter le nombre de contenus de type QUIZ dans tout le cours
      const totalQuizzes = await prisma.content.count({
        where: { 
          moduleId: { in: await prisma.module.findMany({
            where: { courseId },
            select: { id: true }
          }).then(mods => mods.map(m => m.id)) },
          type: "QUIZ" 
        }
      });

      // Compter combien de QUIZ l'utilisateur a réussi (score >= 80)
      const userSuccessCount = await prisma.userContentProgress.count({
        where: {
          userId: userId,
          content: { module: { courseId: courseId } },
          score: { gte: 80 }
        }
      });

      // 3. LOGIQUE CERTIFICAT : Si tous les quiz sont validés
      if (userSuccessCount >= totalQuizzes && totalQuizzes > 0) {
        await prisma.certificate.upsert({
          where: { 
            studentId_courseId: { studentId: userId, courseId: courseId } 
          },
          update: { finalGrade: 100 }, 
          create: {
            studentId: userId,
            courseId: courseId,
            finalGrade: 100,
            issuedAt: new Date()
          }
        });
      }
    }

    revalidatePath("/dashboard/etudiant/courses/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Erreur serveur:", error);
    return { error: "Erreur lors de la validation" };
  }
}
export async function submitFinalExam(courseId: string, contentId: string, score: number) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Non autorisé" };

    const quiz = await prisma.quiz.findUnique({ where: { contentId } });
    if (!quiz) return { error: "Quiz introuvable" };

    // Enregistrement de la tentative
    await prisma.quizAttempt.create({
      data: { userId, quizId: quiz.id, score }
    });

    const passed = score >= 80;

    if (passed) {
      await prisma.certificate.upsert({
        where: { studentId_courseId: { studentId: userId, courseId } },
        update: { finalGrade: score },
        create: { 
          studentId: userId, 
          courseId, 
          finalGrade: score,
          certificateCode: `CERT-${Math.random().toString(36).toUpperCase().substring(2, 10)}`
        }
      });
      
      await markContentAsComplete(contentId);
    }

    revalidatePath("/dashboard/etudiant/courses", "layout");
    return { success: true, passed, score };
  } catch (error) {
    return { error: "Erreur technique" };
  }
}