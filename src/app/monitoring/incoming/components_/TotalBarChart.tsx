"use client";
import React from "react";
import ReactApexChart from "react-apexcharts";

type Item = {
  qtyPlan: number;
  done: number;
};

type Props = {
  items2r: Item[];
  items4r: Item[];
};

export const ProgressBarChart = ({ items2r, items4r }: Props) => {
  const totalPlan =
    items2r.reduce((sum, item) => sum + item.qtyPlan, 0) +
    items4r.reduce((sum, item) => sum + item.qtyPlan, 0);

  const totalDone =
    items2r.reduce((sum, item) => sum + item.done, 0) +
    items4r.reduce((sum, item) => sum + item.done, 0);

  const progress =
    totalPlan > 0
      ? Math.min(100, Math.round((totalDone / totalPlan) * 100))
      : 0;

  const series = [{ name: "Overall", data: [progress] }];

  const options: any = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      sparkline: { enabled: true }, // Sparkline on agar hemat tempat
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        borderRadius: 3,
        colors: {
          backgroundBarColors: ["#1e293b"],
          backgroundBarOpacity: 1,
        },
      },
    },
    colors: [progress === 100 ? "#10b981" : "#f59e0b"],
    xaxis: { max: 100 },
    tooltip: { enabled: false },
    dataLabels: {
      enabled: true,
      textAnchor: "middle",
      style: { fontSize: "12px", fontWeight: "bold" },
      formatter: (val: number) => `${val}% Total Progress`,
    },
  };

  return (
    <div className="w-full mt-2 border-t border-slate-800 pt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-slate-500 uppercase">
          Production Load
        </span>
        <span className="text-[10px] font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
          {totalDone} / {totalPlan}
        </span>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={60}
      />
    </div>
  );
};
