import React from 'react';
import SummaryCards from './components/SummaryCards';
import DonutChart from './components/DonutChart';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import { useLocations } from './hooks/useLocations';

export default function App() {
  const { data, loading, error, reload } = useLocations();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">
            ข้อมูลท้องถิ่น สภ.นิคมพัฒนา
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">
            <p className="mb-2">เกิดข้อผิดพลาด: {error}</p>
            <button
              onClick={reload}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              ลองโหลดใหม่
            </button>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <SummaryCards items={data} />
            {/* Map view */}
            <MapView items={data} height="450px" />
            {/* Donut chart */}
            <DonutChart items={data} />
            {/* Data table */}
            <DataTable items={data} />
          </>
        )}
      </main>
    </div>
  );
}