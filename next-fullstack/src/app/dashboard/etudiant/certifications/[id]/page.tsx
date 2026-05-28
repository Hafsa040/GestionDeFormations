import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintCertificate from "@/components/certification/PrintCertificate";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { course: true, student: true },
  });

  if (!certificate) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <PrintCertificate>
        {/* Ton design de certificat */}
        <div className="max-w-3xl w-full bg-white border-[12px] border-double border-indigo-600 p-16 shadow-2xl relative text-center mx-auto my-4">
          <div className="mb-10">
            <h1 className="text-5xl font-black uppercase italic text-slate-900 tracking-tighter">
              Diplôme de Réussite
            </h1>
            <div className="h-1.5 w-32 bg-indigo-600 mx-auto mt-4"></div>
          </div>

          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mb-8">
            Ce document officiel est décerné à
          </p>

          <h2 className="text-4xl font-black text-indigo-700 mb-8 underline decoration-slate-200 underline-offset-8">
            {certificate.student.name}
          </h2>

          <p className="text-slate-500 mb-8 italic">
            Pour avoir validé avec brio la formation en :
          </p>

          <h3 className="text-3xl font-black uppercase text-slate-900 mb-12">
            {certificate.course.title}
          </h3>

          <div className="grid grid-cols-2 gap-12 border-t-2 border-slate-100 pt-10">
            <div className="text-left">
              <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">Score Académique</span>
              <span className="text-2xl font-black text-slate-800">{certificate.finalGrade}%</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date d'obtention</span>
              <span className="text-2xl font-black text-slate-800">
                {new Date(certificate.issuedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>

          <div className="mt-12 opacity-20 text-[8px] font-mono">
            VERIFICATION ID: {certificate.id}
          </div>
        </div>
      </PrintCertificate>
    </div>
  );
}