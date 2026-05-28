"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Récupérer le quiz avec ses questions et ses options
export async function getQuizWithQuestionsAction(quizId: string) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { id: "asc" }
            }
          },
          orderBy: { id: "asc" }
        }
      }
    });

    if (!quiz) return { success: false, error: "Quiz introuvable" };
    return { success: true, data: quiz };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors du chargement" };
  }
}

// 5. Récupérer tous les quiz d'un module spécifique
export async function getModuleQuizzesAction(moduleId: string) {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { moduleId: moduleId },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: "desc" } 
    });

    return { success: true, data: quizzes };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors du chargement des quiz" };
  }
}

// 6. Créer un nouveau quiz vide rattaché à un module
export async function createQuizAction(moduleId: string, title: string) {
  try {
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        moduleId
      }
    });

    revalidatePath(`/modules/${moduleId}/quizzes`);
    return { success: true, data: newQuiz };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la création du quiz" };
  }
}

// 7. Supprimer un quiz entier (Cascade delete doit être configuré dans Prisma)
export async function deleteQuizAction(quizId: string) {
  try {
    await prisma.quiz.delete({
      where: { id: quizId }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la suppression du quiz" };
  }
}

// 2. Ajouter une question avec ses options
export async function addQuestionToQuizAction(
  quizId: string, 
  text: string, 
  options: { text: string; isCorrect: boolean }[]
) {
  try {
    // Validation minimale
    if (!text.trim()) return { success: false, error: "Le texte de la question est requis" };
    if (options.length < 2) return { success: false, error: "Il faut au moins 2 options" };
    if (!options.some(opt => opt.isCorrect)) return { success: false, error: "Il faut cocher au moins une réponse correcte" };

    const newQuestion = await prisma.question.create({
      data: {
        text,
        quizId,
        options: {
          create: options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        }
      },
      include: { options: true }
    });

    revalidatePath(`/dashboard/prof/quiz/${quizId}`);
    return { success: true, data: newQuestion };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'ajout" };
  }
}

// 3. Modifier une question et ses options
export async function updateQuestionAction(
  questionId: string,
  text: string,
  options: { id?: string; text: string; isCorrect: boolean }[]
) {
  try {
    if (!text.trim()) return { success: false, error: "Le texte de la question est requis" };
    if (options.length < 2) return { success: false, error: "Il faut au moins 2 options" };
    if (!options.some(opt => opt.isCorrect)) return { success: false, error: "Il faut cocher au moins une réponse correcte" };

    // On utilise une transaction Prisma pour supprimer les anciennes options et recréer les nouvelles proprement
    await prisma.$transaction(async (tx) => {
      // Mettre à jour le texte de la question
      await tx.question.update({
        where: { id: questionId },
        data: { text }
      });

      // Supprimer les options existantes
      await tx.option.deleteMany({
        where: { questionId }
      });

      // Recréer les nouvelles options
      await tx.option.createMany({
        data: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          questionId
        }))
      });
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la modification" };
  }
}

// 4. Supprimer une question
export async function deleteQuestionAction(questionId: string, quizId: string) {
  try {
    await prisma.$transaction([
      prisma.option.deleteMany({ where: { questionId } }),
      prisma.question.delete({ where: { id: questionId } })
    ]);

    revalidatePath(`/dashboard/prof/quiz/${quizId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
export async function updateQuizTitleAction(quizId: string, title: string) {
  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { title }
    });
    revalidatePath(`/dashboard/prof/quiz/${quizId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la modification du titre" };
  }
}