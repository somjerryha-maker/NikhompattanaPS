import React from 'react';
import type { LocationItem } from '../types';
import { computeSummary } from '../lib/utils';

interface Props {
  items: LocationItem[];
}

/**
 * แสดงการ์ดสรุปจำนวนรายการทั้งหมดและจำนวนแต่ละหมวดหมู่
 */
export default function SummaryCards({ items }: Props) {
  const summary = computeSummary(items);
  // จำกัดการแสดงหมวดหมู่ที่มีมากที่สุด 2 อันดับแรกเพื่อความกระชับ
  const categoryEntries = Object.entries(summary.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold text-primary">{summary.total}</div>
        <p className="mt-1 text-gray-500 text-sm">จำนวนสถานที่ทั้งหมด</p>
      </div>
      {categoryEntries.map(([category, count]) => (
        <div
          key={category}
          className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center justify-center"
        >
          <div className="text-5xl font-extrabold text-secondary">{count}</div>
          <p className="mt-1 text-gray-500 text-sm">{category}</p>
        </div>
      ))}
    </div>
  );
}