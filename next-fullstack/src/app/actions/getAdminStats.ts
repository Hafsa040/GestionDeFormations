import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [totalStudents, totalCourses, totalCertificates, courseStats] = await Promise.all([
    // 1. Nombre total d'étudiants
    prisma.user.count({ where: { role: 'ETUDIANT' } }),
    
    // 2. Nombre total de cours existants
    prisma.course.count(),
    
    // 3. Total des certificats délivrés
    prisma.certificate.count(),
    
    // 4. Statistiques détaillées par cours
    prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            enrollments: true, 
            certificates: true, 
          }
        },
        instructor: {
          select: { name: true }
        }
      }
    })
  ]);

  return {
    overview: {
      totalStudents,
      totalCourses,
      totalCertificates,
      successRate: totalStudents > 0 ? (totalCertificates / totalStudents) * 100 : 0
    },
    courseDetails: courseStats.map(c => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor.name,
      studentsCount: c._count.enrollments,
      certificatesCount: c._count.certificates,
      conversionRate: c._count.enrollments > 0 
        ? ((c._count.certificates / c._count.enrollments) * 100).toFixed(1) 
        : 0
    }))
  };
}
export async function getInstructorStats(instructorId: string) {
  const myCourses = await prisma.course.findMany({
    where: { instructorId },
    include: {
      _count: {
        select: { enrollments: true, certificates: true }
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              progress: true, 
            }
          }
        }
      }
    }
  });

  return myCourses.map(course => ({
    courseTitle: course.title,
    activeStudents: course._count.enrollments,
    completedStudents: course._count.certificates,
  }));
}