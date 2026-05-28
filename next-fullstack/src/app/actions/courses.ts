"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; 

// ✅ MODIFIER UN COURS
export async function updateCourseAction(id: string, formData: { title: string; description: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const updated = await prisma.course.update({
      where: { id, instructorId: session.user.id }, 
      data: {
        title: formData.title,
        description: formData.description,
      },
    });
    revalidatePath("/dashboard/prof/courses");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "Erreur lors de la modification" };
  }
}

// ✅ SUPPRIMER UN COURS
export async function deleteCourseAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const modules = await prisma.module.findMany({
      where: { courseId: id },
      select: { id: true }
    });
    const moduleIds = modules.map(m => m.id);

    const contents = await prisma.content.findMany({
      where: { moduleId: { in: moduleIds } },
      select: { id: true }
    });
    const contentIds = contents.map(c => c.id);

    const quizzes = await prisma.quiz.findMany({
      where: { contentId: { in: contentIds } },
      select: { id: true }
    });
    const quizIds = quizzes.map(q => q.id);

    const questions = await prisma.question.findMany({
      where: { quizId: { in: quizIds } },
      select: { id: true }
    });
    const questionIds = questions.map(q => q.id);


    await prisma.option.deleteMany({
      where: { questionId: { in: questionIds } }
    });

    await prisma.quizAttempt.deleteMany({
      where: { quizId: { in: quizIds } }
    });

    await prisma.question.deleteMany({
      where: { quizId: { in: quizIds } }
    });

    await prisma.quiz.deleteMany({
      where: { contentId: { in: contentIds } }
    });

    await prisma.comment.deleteMany({
      where: { contentId: { in: contentIds } }
    });

    await prisma.userContentProgress.deleteMany({
      where: { contentId: { in: contentIds } }
    });

    await prisma.content.deleteMany({
      where: { moduleId: { in: moduleIds } }
    });

    await prisma.module.deleteMany({
      where: { courseId: id }
    });

    await prisma.enrollment.deleteMany({
      where: { courseId: id }
    });

    await prisma.grade.deleteMany({
      where: { courseId: id }
    });

    await prisma.certificate.deleteMany({
      where: { courseId: id }
    });

    await prisma.course.delete({
      where: { 
        id, 
        instructorId: session.user.id 
      },
    });

    revalidatePath("/dashboard/prof/courses");
    return { success: true };

  } catch (error) {
    console.error("Erreur lors de la suppression manuelle :", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
// ✅ GET COURSES (Mis à jour avec recherche)
export async function getProfessorCourses(searchQuery?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const courses = await prisma.course.findMany({
      where: {
        instructorId: session.user.id,
        OR: searchQuery ? [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ] : undefined,
      },
    });
    return { success: true, data: courses };
  } catch (error) {
    return { success: false, error: "Erreur de récupération" };
  }
}

// ✅ CREATE COURSE
export async function createCourseAction(formData: {
  title: string;
  description: string;
}) {
  const session = await auth();

  console.log("SESSION SERVER :", session);

  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé - Session expirée" };
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        title: formData.title,
        description: formData.description,
        instructorId: session.user.id,
      },
    });

    revalidatePath("/dashboard/prof/courses");
    
    return { success: true, data: newCourse };
  } catch (error) {
    console.error("Erreur Prisma :", error);
    return { success: false, error: "Erreur lors de la création du cours" };
  }
}