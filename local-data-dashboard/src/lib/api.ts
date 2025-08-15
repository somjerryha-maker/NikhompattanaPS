import { LocationItem, ApiResponse } from '../types';

/**
 * Base URL of the deployed Google Apps Script web app. Should end without trailing slash.
 */
const BASE_URL: string = import.meta.env.VITE_APP_SCRIPT_BASE_URL;

function buildUrl(path: string): string {
  // Ensure there is no double slash
  return `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * เรียก endpoint /list เพื่อดึงข้อมูลทั้งหมดในรูปแบบ JSON
 */
export async function fetchList(): Promise<LocationItem[]> {
  const url = buildUrl('list');
  const res = await fetch(url);
  const data: ApiResponse<LocationItem[]> = await res.json();
  if (!data.success) throw new Error(data.error || 'Unknown error');
  return data.data || [];
}

/**
 * เรียก endpoint /normalize เพื่อตัดช่องว่าง ปรับชื่อคอลัมน์ และบันทึกกลับชีต
 */
export async function normalize(): Promise<ApiResponse> {
  const url = buildUrl('normalize');
  const res = await fetch(url);
  return res.json();
}

/**
 * เรียก endpoint /geocode-missing เพื่อเติมพิกัด GPS ที่หายไปจาก Google Maps API
 */
export async function geocodeMissing(): Promise<ApiResponse> {
  const url = buildUrl('geocode-missing');
  const res = await fetch(url);
  return res.json();
}

/**
 * ส่งข้อมูลหลายรายการเพื่อเพิ่มหรืออัปเดต (bulk upsert)
 */
export async function bulkUpsert(items: LocationItem[]): Promise<ApiResponse> {
  const url = buildUrl('bulk-upsert');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return res.json();
}