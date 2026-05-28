import { prisma } from "@/lib/prisma";

export async function getSmartRecommendations(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bio: true }
  });

  if (!user?.bio || user.bio.length < 3) return [];

const availableCourses = await prisma.course.findMany({
  include: { instructor: true }
});

  const clean = (text: string) => {
    const lower = text.toLowerCase();
    const noDash = lower.replace(/-/g, ""); 
    const spaceDash = lower.replace(/-/g, " "); 
    
    return `${lower} ${noDash} ${spaceDash}`
      .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2);
  };

  const userInterests = clean(user.bio);
  console.log("Mots bio nettoyés :", userInterests);

  const scoredCourses = availableCourses.map(course => {
    const title = (course.title || "").toLowerCase();
    const desc = (course.description || "").toLowerCase();
    const searchableText = `${title} ${desc} ${title.replace(/-/g, "")} ${title.replace(/-/g, " ")}`;
    const matches = userInterests.filter(interest => searchableText.includes(interest));
    
    return {
      ...course,
      score: matches.length,
      matchReason: matches.length > 0 ? matches[0] : ""
    };
  });

  const recommendations = scoredCourses
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log("RECOMMANDATIONS TROUVÉES :", recommendations.length);
  return recommendations;
}