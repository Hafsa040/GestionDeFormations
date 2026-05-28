import { prisma } from "@/lib/prisma";
import CourseCatalog from "./CourseCatalog"; 
import { auth } from "@/lib/auth";
import { getSmartRecommendations } from "@/app/actions/recommendation";
export default async function Page() {
  const session = await auth();
const userId = session?.user?.id;
if (!userId) return <div className="p-8 text-center font-black">Veuillez vous connecter.</div>;
const [courses, enrollments, recommended] = await Promise.all([
    prisma.course.findMany({ include: { instructor: true } }),
    prisma.enrollment.findMany({ where: { studentId: userId } }),
    getSmartRecommendations(userId as string)
  ]);
  return (
    <div className="p-8">
      <CourseCatalog 
        courses={courses} 
        userEnrollments={enrollments} 
        userId={userId} 
        recommendedCourses={recommended}
      />
    </div>
  );
}