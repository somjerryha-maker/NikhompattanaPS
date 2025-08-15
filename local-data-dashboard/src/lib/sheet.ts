import { LocationItem } from '../types';

/**
 * สร้าง URL สำหรับดาวน์โหลด CSV จาก Google Sheets โดยอาศัย sheetId และ gid หรือชื่อแท็บ
 * หากกำหนด VITE_SHEET_TAB เป็นตัวเลข จะถูกตีความเป็น gid; หากเป็นชื่อจะใช้พารามิเตอร์ `sheet`
 */
export function getCsvUrl(): string {
  const sheetId = import.meta.env.VITE_SHEET_ID;
  const tab = import.meta.env.VITE_SHEET_TAB;
  // ถ้าเป็นตัวเลข ให้ใช้ gid; ถ้าเป็น string ที่ไม่ใช่ตัวเลข ให้ใช้ชื่อ sheet
  const isNumeric = /^[0-9]+$/.test(tab);
  if (isNumeric) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${tab}`;
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

/**
 * ดึงข้อมูล CSV จาก Google Sheets และแปลงเป็นอาร์เรย์ของ LocationItem
 */
export async function fetchLocationsFromCsv(): Promise<LocationItem[]> {
  const url = getCsvUrl();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ไม่สามารถดึงข้อมูลชีต: ${res.statusText}`);
  const text = await res.text();
  return parseCsvToLocations(text);
}

/**
 * แปลงสตริง CSV ให้เป็นอาร์เรย์ของ LocationItem
 * การพาร์สนี้เป็นแบบง่าย ๆ (แยกโดย comma) อาจต้องปรับปรุงเมื่อข้อมูลซับซ้อน
 */
export function parseCsvToLocations(csv: string): LocationItem[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  const items: LocationItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Skip empty lines
    if (!line.trim()) continue;
    const values = splitCsvLine(line, headers.length);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? '';
    });
    items.push(mapRecordToLocation(record));
  }
  return items;
}

/**
 * แยกบรรทัด CSV โดยรองรับค่าที่อยู่ใน double quotes
 */
function splitCsvLine(line: string, expectedFields: number): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // toggle inQuotes or escape
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  // Pad result to expected length
  while (result.length < expectedFields) {
    result.push('');
  }
  return result.map((val) => val.trim());
}

/**
 * แมปคีย์จาก record เป็น LocationItem
 */
function mapRecordToLocation(record: Record<string, string>): LocationItem {
  // รองรับทั้ง header ภาษาไทยและอังกฤษ
  const name = record['ชื่อ'] || record['name'] || '';
  const category = record['ประเภท'] || record['หมวดหมู่'] || record['category'] || '';
  const latRaw = record['lat'] || record['ละติจูด'] || '';
  const lngRaw = record['lng'] || record['ลองจิจูด'] || '';
  const phone = record['เบอร์โทร'] || record['phone'] || '';
  const address = record['ที่อยู่'] || record['address'] || '';
  const id = record['id'] || crypto.randomUUID();
  return {
    id,
    name,
    category,
    lat: latRaw ? parseFloat(latRaw) : undefined,
    lng: lngRaw ? parseFloat(lngRaw) : undefined,
    phone: phone || undefined,
    address: address || undefined,
    // เก็บคอลัมน์อื่น ๆ ไว้ด้วย
    ...record,
  } as LocationItem;
}