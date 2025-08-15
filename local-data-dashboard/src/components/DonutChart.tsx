import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { groupByCategory } from '../lib/utils';
import type { LocationItem } from '../types';

// Register necessary chart components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  items: LocationItem[];
}

/**
 * แสดงโดนัตชาร์ต 2 วงแสดงสัดส่วนหมวดหมู่
 */
export default function DonutChart({ items }: Props) {
  const byCategory = groupByCategory(items);
  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  // เลือกสีสวย ๆ สำหรับแต่ละหมวดหมู่
  const palette = [
    '#1e3a8a', // blue
    '#f97316', // orange
    '#22c55e', // green
    '#a855f7', // purple
    '#ef4444', // red
    '#14b8a6', // teal
  ];
  const backgroundColors = labels.map((_, i) => palette[i % palette.length]);
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="text-lg font-semibold mb-2">สัดส่วนหมวดหมู่</h3>
      <Doughnut
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right' as const,
            },
          },
        }}
      />
    </div>
  );
}