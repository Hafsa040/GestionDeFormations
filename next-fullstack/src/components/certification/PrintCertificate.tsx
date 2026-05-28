"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Download } from "lucide-react";

interface PrintCertificateProps {
  children: React.ReactNode;
}

export default function PrintCertificate({ children }: PrintCertificateProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Mon_Certificat_EMSI",
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={contentRef} className="w-full">
        {children}
      </div>

      <button
        onClick={() => handlePrint()}
        className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
      >
        <Download size={20} />
        Télécharger mon certificat (PDF)
      </button>
    </div>
  );
}