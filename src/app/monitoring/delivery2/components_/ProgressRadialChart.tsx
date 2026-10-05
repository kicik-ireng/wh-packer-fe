

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as any;

interface DeliveryOrder {
  customer: { id: number; name: string };
  deliverytime?: string | null;
}

interface ProgressRadialChartProps {
  deliveries: DeliveryOrder[];
}

// ✅ Calculate progress by customer (pakai rata-rata per customer)
function calculateCustomerProgress(deliveries: DeliveryOrder[]) {
  const customers = new Map<string, { total: number; completed: number }>();

  deliveries.forEach((order) => {
    const name = order.customer.name;
    if (!customers.has(name)) {
      customers.set(name, { total: 0, completed: 0 });
    }
    const data = customers.get(name)!;
    data.total += 1;
    if (order.deliverytime) {
      data.completed += 1;
    }
  });

  let totalCustomers = customers.size;
  let totalPercentage = 0;

  customers.forEach(({ total, completed }) => {
    if (total > 0) {
      totalPercentage += (completed / total) * 100;
    }
  });

  const avgPercentage =
    totalCustomers > 0 ? Math.round(totalPercentage / totalCustomers) : 0;

  return {
    percentage: avgPercentage,
    total: totalCustomers,
  };
}

export const ProgressRadialChart: React.FC<ProgressRadialChartProps> = ({
  deliveries,
}) => {
  const { percentage, total } = calculateCustomerProgress(deliveries);

  const color =
    percentage >= 80
      ? "#22c55e" // Bright Green
      : percentage >= 50
        ? "#facc15" // Bright Yellow
        : "#f87171"; // Bright Red

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "40%",
        },
        track: {
          background: "#f3f4f6",
          strokeWidth: "85%",
          margin: 5,
        },
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            fontSize: "34px",
            fontWeight: 800,
            offsetY: 0,
            color: "#111",
            formatter: () => `${percentage}%`,
          },
        },
      },
    },
    fill: {
      colors: [color],
    },
    stroke: {
      lineCap: "round",
    },
  };

  const series = [percentage];

  return (
    <div className="flex flex-col items-center">
      <Chart options={options} series={series} type="radialBar" height={300} />
      <p className="text-base text-white mt-4 font-semibold">
        {percentage}% average completion across {total} customers
      </p>
    </div>
  );
};

export default ProgressRadialChart;
