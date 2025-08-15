import { LocationItem } from '../types';

/**
 * รวมข้อมูลตามหมวดหมู่เพื่อใช้สร้างโดนัตชาร์ต
 */
export function groupByCategory(items: LocationItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = item.category || 'ไม่ระบุ';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * สร้างสรุปจำนวนรายการทั้งหมดและต่อหมวดหมู่
 */
export function computeSummary(items: LocationItem[]): {
  total: number;
  byCategory: Record<string, number>;
} {
  return {
    total: items.length,
    byCategory: groupByCategory(items),
  };
}

/**
 * ฟังก์ชันค้นหา/กรองโดยรับคีย์เวิร์ดและหมวดหมู่
 */
export function filterItems(
  items: LocationItem[],
  keyword: string,
  categoryFilter: string,
): LocationItem[] {
  const kw = keyword.toLowerCase();
  return items.filter((item) => {
    const matchKeyword = !kw ||
      item.name.toLowerCase().includes(kw) ||
      (item.address?.toLowerCase().includes(kw) ?? false) ||
      (item.phone?.toLowerCase().includes(kw) ?? false);
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    return matchKeyword && matchCategory;
  });
}