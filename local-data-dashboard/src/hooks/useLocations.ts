import { useEffect, useState } from 'react';
import { fetchLocationsFromCsv } from '../lib/sheet';
import type { LocationItem } from '../types';

/**
 * Hook สำหรับโหลดข้อมูลสถานที่จาก Google Sheet (CSV)
 */
export function useLocations() {
  const [data, setData] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchLocationsFromCsv();
      setData(items);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}