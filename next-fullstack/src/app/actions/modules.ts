"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadContentAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'VIDEO' | 'PDF';
    const moduleId = formData.get('moduleId') as string;

    if (!file) return { success: false, error: "Aucun fichier" };

    // 1. Préparer le dossier et le nom du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Créer le dossier s'il n'existe pas
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, fileName);

    // 2. Écrire le fichier sur ton disque dur
    await writeFile(filePath, buffer);
    
    // 3. Enregistrer l'URL relative dans Prisma (/uploads/nomdufichier)
    const publicUrl = `/uploads/${fileName}`;

    const content = await prisma.content.create({
      data: {
        title,
        type,
        url: publicUrl, // C'est ici que le lien vers ton fichier est stocké
        moduleId
      }
    });

    revalidatePath(`/dashboard/prof/courses`);
    return { success: true, data: content };
  } catch (error) {
    console.error("Erreur Upload:", error);
    return { success: false, error: "Échec de l'importation" };
  }
}

export async function updateContentAction(formData: FormData) {
  try {
    const contentId = formData.get('contentId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    let updateData: any = { title, description };

    // Si un nouveau fichier est fourni, on le téléverse
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      updateData.url = `/uploads/${fileName}`;
    }

    await prisma.content.update({
      where: { id: contentId },
      data: updateData
    });

    revalidatePath(`/dashboard/prof/courses`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}
// Création d'un module avec son quiz vide par défaut
export async function createFullModuleAction(courseId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newModule = await tx.module.create({
        data: { title, courseId, isFinal: false },
      });

      const content = await tx.content.create({
        data: {
          title: `Quiz d'évaluation - ${title}`,
          type: 'QUIZ', 
          moduleId: newModule.id,
        },
      });

      await tx.quiz.create({ data: { contentId: content.id } });
      return newModule;
    });

    revalidatePath(`/dashboard/prof/courses/${courseId}`);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Erreur lors de la création" };
  }
}



export async function createFinalQuizAction(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier si un quiz final existe déjà pour ce cours
      const existingFinal = await tx.module.findFirst({
        where: { courseId, isFinal: true }
      });

      if (existingFinal) throw new Error("Un quiz final existe déjà.");

      // 2. Créer le module final
      const finalModule = await tx.module.create({
        data: { 
          title: "Examen Final de Certification", 
          courseId, 
          isFinal: true // C'est ici la clé
        },
      });

      // 3. Créer le contenu Quiz
      const content = await tx.content.create({
        data: {
          title: `Examen Final - Certification`,
          type: 'QUIZ', 
          moduleId: finalModule.id,
        },
      });

      // 4. Créer l'entrée Quiz
      await tx.quiz.create({ data: { contentId: content.id } });
      
      return finalModule;
    });

    revalidatePath(`/dashboard/prof/courses/${courseId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur" };
  }
}




export async function deleteContentAction(contentId: string) {
  try {
    // 1. Récupérer le contenu
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return { success: false, error: "Contenu non trouvé" };
    }

    await prisma.$transaction(async (tx) => {

      // 2. Supprimer progress utilisateur (IMPORTANT)
      await tx.userContentProgress.deleteMany({
        where: { contentId }
      });

      // 3. Supprimer commentaires
      await tx.comment.deleteMany({
        where: { contentId }
      });

      // 4. Supprimer quiz si existant
      if (content.type === "QUIZ") {
        await tx.quiz.deleteMany({
          where: { contentId }
        });
      }

      // 5. Supprimer le content
      await tx.content.delete({
        where: { id: contentId }
      });
    });

    // 6. Revalidate UI
    revalidatePath(`/dashboard/prof/courses`);

    return { success: true };

  } catch (error) {
    console.error("Erreur suppression:", error);

    return {
      success: false,
      error: "Erreur lors de la suppression du contenu"
    };
  }
}

// --- ACTIONS DE MODIFICATION ---

export async function updateModuleAction(moduleId: string, title: string) {
  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { title }
    });
    revalidatePath(`/dashboard/prof/courses`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erreur lors de la modification" };
  }
}
// --- SUPPRESSION ROBUSTE (MODULE) ---
export async function deleteModuleAction(moduleId: string) {
  try {
    await prisma.$transaction(async (tx) => {

      // 1. Récupérer les contenus du module
      const contents = await tx.content.findMany({
        where: { moduleId }
      });

      const contentIds = contents.map(c => c.id);

      // 2. Récupérer les quizzes liés aux contents
      const quizzes = await tx.quiz.findMany({
        where: {
          contentId: { in: contentIds }
        }
      });

      const quizIds = quizzes.map(q => q.id);

      // 3. Supprimer les options (niveau le plus bas)
      await tx.option.deleteMany({
        where: {
          question: {
            quizId: { in: quizIds }
          }
        }
      });

      // 4. Supprimer les questions
      await tx.question.deleteMany({
        where: {
          quizId: { in: quizIds }
        }
      });

      // 5. Supprimer les attempts de quiz
      await tx.quizAttempt.deleteMany({
        where: {
          quizId: { in: quizIds }
        }
      });

      // 6. Supprimer les quizzes
      await tx.quiz.deleteMany({
        where: {
          contentId: { in: contentIds }
        }
      });

      // 7. Supprimer progress utilisateur (IMPORTANT)
      await tx.userContentProgress.deleteMany({
        where: {
          contentId: { in: contentIds }
        }
      });

      // 8. Supprimer commentaires
      await tx.comment.deleteMany({
        where: {
          contentId: { in: contentIds }
        }
      });

      // 9. Supprimer contents
      await tx.content.deleteMany({
        where: { moduleId }
      });

      // 10. Supprimer module
      await tx.module.delete({
        where: { id: moduleId }
      });
    });

    revalidatePath(`/dashboard/prof/courses`);
    return { success: true };

  } catch (error) {
    console.error("Erreur deleteModuleAction:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Récupération simple pour le prof
export async function getCourseModulesForProf(courseId: string) {
  try {
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        contents: {
          include: { quiz: true },
          orderBy: { id: 'asc' }
        },
      },
      orderBy: { id: 'asc' },
    });
    return { success: true, data: modules };
  } catch (error) {
    return { success: false, error: "Erreur de chargement" };
  }
}


export async function addContentToModuleAction(moduleId: string, data: {
  title: string,
  type: 'VIDEO' | 'PDF' | 'TEXT' | 'QUIZ', 
  url?: string,
  description?: string
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le contenu
      const content = await tx.content.create({
        data: { 
          title: data.title,
          type: data.type,
          url: data.url,
          description: data.description,
          moduleId 
        }
      });

      if (data.type === 'QUIZ') {
        await tx.quiz.create({
          data: { contentId: content.id }
        });
      }

      return content;
    });

    revalidatePath(`/dashboard/prof/courses`);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'ajout du contenu" };
  }
}