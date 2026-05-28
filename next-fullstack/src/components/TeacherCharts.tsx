"use client";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TeacherCharts({ courses }: { courses: any[] }) {
  const labels = courses.map((c) => c.title);

  const globalOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const dataBar = {
    labels,
    datasets: [
      {
        label: "Étudiants",
        data: courses.map((c) => c.students),
        backgroundColor: "rgba(99, 102, 241, 0.8)", 
        borderRadius: 12,
        maxBarThickness: 50,
      },
    ],
  };

  const dataLine = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Certificats",
        data: courses.map((c) => c.certificates),
        borderColor: "rgb(16, 185, 129)", // Couleur emerald
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointRadius: 6,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-[350px]">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Inscriptions par cours</h3>
        <Bar data={dataBar} options={globalOptions} />
      </div>
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-[350px]">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Réussite (Certificats)</h3>
        <Line data={dataLine} options={globalOptions} />
      </div>
    </div>
  );
}