import React, { useMemo, useState } from 'react';
import type { LocationItem } from '../types';
import { filterItems } from '../lib/utils';

interface Props {
  items: LocationItem[];
}

/**
 * แสดงตารางข้อมูลพร้อมค้นหา กรอง และเพจิเนชัน
 */
export default function DataTable({ items }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const categories = useMemo(() => {
    const setCat = new Set<string>();
    items.forEach((i) => {
      if (i.category) setCat.add(i.category);
    });
    return Array.from(setCat).sort();
  }, [items]);

  const filtered = useMemo(() => filterItems(items, search, category), [items, search, category]);
  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  function handleReset() {
    setSearch('');
    setCategory('');
    setPage(0);
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className="text-lg font-semibold mb-3">ตารางข้อมูล</h3>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="border border-gray-300 rounded-md p-2 min-w-[150px]"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={handleReset}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
        >
          รีเซ็ต
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">ไม่พบข้อมูล</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ชื่อสถานที่</th>
                <th className="px-4 py-2 text-left">หมวดหมู่</th>
                <th className="px-4 py-2 text-left">ที่อยู่</th>
                <th className="px-4 py-2 text-left">โทรศัพท์</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap font-medium">{item.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.category || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.address || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.phone || '-'}</td>
                  <td className="px-4 py-2 text-right">
                    {item.lat && item.lng ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        ดูแผนที่
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className="flex justify-end mt-3 space-x-2">
              {Array.from({ length: pageCount }).map((_, idx) => {
                const isActive = idx === page;
                const btnClass = isActive
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border-primary';
                return (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={
                      'px-2 py-1 rounded-md border text-sm ' + btnClass
                    }
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}