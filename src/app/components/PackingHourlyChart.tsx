"use client";
import React from "react";
import ReactApexChart from "react-apexcharts";

export default function PackingHourlyChart({
  hourlyData,
}: {
  hourlyData: { hour: string; approved2R: number; approved4R: number }[];
}) {
  const hours = hourlyData.map((d) => d.hour);
  const series = [
    {
      name: "2R",
      data: hourlyData.map((d) => d.approved2R),
    },
    {
      name: "4R",
      data: hourlyData.map((d) => d.approved4R),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      height: 250, // diperkecil
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 3,
        left: 2,
        blur: 4,
        opacity: 0.1,
      },
      zoom: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: ["#3B82F6", "#22C55E"],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "10px", // diperkecil
        fontWeight: 600,
      },
    },
    stroke: {
      curve: "straight",
      width: 2, // lebih tipis
    },
    title: {
      text: "Jumlah Packing Per Hour",
      align: "left",
      style: {
        fontSize: "10px", // lebih kecil
        fontWeight: 600,
        color: "#374151",
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      row: {
        colors: ["#F9FAFB", "transparent"],
        opacity: 0.5,
      },
    },
    markers: {
      size: 3,
      hover: {
        sizeOffset: 1.5,
      },
    },
    xaxis: {
      categories: hours,
      title: {
        text: "Jam",
        style: {
          fontSize: "8px",
          fontWeight: 600,
        },
      },
      labels: {
        style: {
          fontSize: "10px",
          colors: "#4B5563",
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah",
        style: {
          fontSize: "8px",
          fontWeight: 600,
        },
      },
      labels: {
        style: {
          fontSize: "10px",
          colors: "#4B5563",
        },
      },
      min: 0,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "10px",
      labels: {
        colors: "#374151",
      },
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "10px",
      },
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={235}
    />
  );
}
