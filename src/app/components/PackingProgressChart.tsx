"use client";
import React from "react";
import ReactApexChart from "react-apexcharts";

export default function PackingProgressChart({
  done2R,
  done4R,
  total2RPlan,
  total4RPlan,
}: {
  done2R: number;
  done4R: number;
  total2RPlan: number;
  total4RPlan: number;
}) {
  return (
    <ReactApexChart
      options={{
        chart: {
          type: "bar",
          height: 180, // lebih ramping
          toolbar: { show: false },
        },
        title: {
          text: "Packing Progress",
          align: "left",
          style: {
            fontSize: "10px",
            fontWeight: 600,
            color: "#374151",
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,

            barHeight: "60%", // sempitkan batang
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val.toFixed(2)}%`,
          style: {
            fontSize: "10px",
            fontWeight: 600,
            colors: ["#fff"],
          },
        },
        xaxis: {
          categories: ["2R", "4R"],
          max: 100,
          labels: {
            style: { fontSize: "10px" },
          },
        },
        yaxis: {
          labels: {
            style: { fontSize: "10px" },
          },
        },
        legend: { show: false },
        colors: ["#3B82F6", "#22C55E"],
        tooltip: {
          y: {
            formatter: (val: number) => `${val.toFixed(2)}%`,
          },
        },
      }}
      series={[
        {
          name: "Packing Progress",
          data: [
            {
              x: "2R",
              y: (done2R / (total2RPlan || 1)) * 100,
              fillColor: "#3B82F6",
            },
            {
              x: "4R",
              y: (done4R / (total4RPlan || 1)) * 100,
              fillColor: "#22C55E",
            },
          ],
        },
      ]}
      type="bar"
      height={220}
    />
  );
}
