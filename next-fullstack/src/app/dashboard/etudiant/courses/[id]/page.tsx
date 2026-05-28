import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CourseLearningPage from "./CourseLearningPage";
import { auth } from "@/lib/auth";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour accéder à ce cours");
  }

  const userId = session.user.id; 
  const resolvedParams = await params;
  const courseId = resolvedParams.id;


// 1. On récupère le cours avec ses modules et contenus
const course = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    modules: {
      include: {
        contents: true 
      }
    }
  }
});

if (!course) return notFound();

const enrollment = await prisma.enrollment.findUnique({
  where: {
    studentId_courseId: {
      studentId: userId,
      courseId: courseId
    }
  }
});


const progress = await prisma.userContentProgress.findMany({
  where: { userId: userId }
});
console.log("Nombre de lignes de progression trouvées :", progress.length);
return (
  <CourseLearningPage 
    course={course} 
    user={userId} 
    enrollment={enrollment}
    progress={progress}
  />
);}