import { prisma } from "@/lib/prisma";

export async function getInstructorDashboardStats(instructorId: string) {


    const totalProfsPlatform = await prisma.user.count({
    where: { role: "PROF" }
  });
  const myCourses = await prisma.course.findMany({
    where: { instructorId: instructorId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          enrollments: true,   // Nombre d'étudiants inscrits à SES cours
          certificates: true,  // Nombre de certifiés pour SES cours
        }
      }
    }
  });

  // Calculs globaux pour les KPI du prof
  const totalInscrits = myCourses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const totalCertifs = myCourses.reduce((acc, c) => acc + c._count.certificates, 0);
  const nombreDeCours = myCourses.length;
  

  return {
    courses: myCourses.map(c => ({
      id: c.id,
      title: c.title,
      students: c._count.enrollments,
      certificates: c._count.certificates,
      // Progression : Taux de réussite par cours
      progression: c._count.enrollments > 0 
        ? ((c._count.certificates / c._count.enrollments) * 100).toFixed(1) 
        : 0
    })),
    stats: {
      totalInscrits,
      totalCertifs,
      nombreDeCours,
      totalProfsPlatform, 
      performanceGlobale: totalInscrits > 0 ? (totalCertifs / totalInscrits) * 100 : 0
    }
  };
}