"use client";
import dynamic from "next/dynamic";
import React from "react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ProgressRadialChartProps = {
  label?: string;
  done: number;
  plan: number;
};

export const ProgressRadialChart: React.FC<ProgressRadialChartProps> = ({
  done,
  plan,
  label = "Progress",
}) => {
  const percentage = plan > 0 ? Math.min((done / plan) * 100, 100) : 0;

  let progressColor = "#dc2626";
  if (percentage >= 100) progressColor = "#10b981";
  else if (percentage >= 50) progressColor = "#f59e0b";

  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      // Mengurangi sparkline agar tidak memotong label bawah
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "65%" },
        track: {
          background: "#1e293b",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -2, // Atur posisi angka persentase agar di tengah semicricle
            fontSize: "16px",
            fontWeight: "800",
            color: "#ffffff",
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    fill: { colors: [progressColor] },
    stroke: { lineCap: "round" },
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      <div className="h-[100px] w-full flex justify-center items-center">
        <ReactApexChart
          options={chartOptions}
          series={[percentage]}
          type="radialBar"
          height={180} // Tetap 180 tapi terpotong semicricle jadi hemat ruang
          width="100%"
        />
      </div>
      <div className="text-center mt-1">
        <p className="text-xs font-mono font-bold text-white leading-none">
          {done}
          <span className="text-slate-500">/</span>
          {plan}
        </p>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
};
