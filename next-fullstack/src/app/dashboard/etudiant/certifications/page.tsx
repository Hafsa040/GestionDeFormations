import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; 
import Link from "next/link";
import { Award, Calendar, ChevronRight, FileText } from "lucide-react";

export default async function CertificationsListPage() {
  const session = await auth();

  // Récupération de tous les certificats de l'étudiante connectée
  const certifications = await prisma.certificate.findMany({
    where: {
      studentId: session?.user?.id,
    },
    include: {
      course: true, 
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
          Mes Certifications
        </h1>
        <p className="text-slate-500 font-medium">
          Retrouvez ici tous vos diplômes obtenus sur EMSI LMS.
        </p>
      </div>

      {certifications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Award size={32} />
          </div>
          <p className="text-slate-400 font-bold uppercase italic">Aucun certificat obtenu pour le moment.</p>
          <Link href="/dashboard/etudiant/courses" className="text-blue-600 text-sm font-black uppercase mt-4 inline-block hover:underline">
            Continuer mes cours →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert) => (
            <div 
              key={cert.id} 
              className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
                  <Award size={24} />
                </div>
                <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Validé
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 uppercase italic mb-1 leading-tight">
                {cert.course.title}
              </h3>
              
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-6">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Score: {cert.finalGrade}%
                </span>
              </div>

              <Link 
                href={`/dashboard/etudiant/certifications/${cert.id}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-colors"
              >
                Voir le certificat
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}