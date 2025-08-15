/**
 * ประเภทข้อมูลของสถานที่
 */
export interface LocationItem {
  id: string;
  /** ชื่อสถานที่ */
  name: string;
  /** หมวดหมู่ หรือประเภท */
  category: string;
  /** ละติจูด (อาจเป็น string หรือ number ในขาเข้า) */
  lat?: number;
  /** ลองจิจูด */
  lng?: number;
  /** เบอร์โทรศัพท์ */
  phone?: string;
  /** ที่อยู่เต็ม */
  address?: string;
  /** ฟิลด์เพิ่มเติม */
  [key: string]: unknown;
}

/**
 * ผลลัพธ์จาก Apps Script API ที่อาจคืนค่า success / error
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}