/**
 * Google Apps Script สำหรับให้บริการ API (Web App) กับเว็บแดชบอร์ด
 *
 * Endpoints:
 *   GET  /list             – ดึงข้อมูลทั้งหมดจากชีตในรูปแบบ JSON
 *   GET  /normalize        – ปรับแต่งข้อมูล (trim ช่องว่าง, แปลงตัวเลข) และเขียนกลับ
 *   GET  /geocode-missing  – เติมพิกัด GPS ที่หายไปโดยใช้ Maps API
 *   POST /bulk-upsert      – เพิ่ม/อัปเดตข้อมูลหลายรายการ
 */

const SPREADSHEET_ID = '1cutw_oqvcJF2n6us0PDDtfRcDck5CY8oReKgu_mm2S4';
const SHEET_NAME = 'ข้อมูล'; // ปรับให้ตรงกับชื่อแท็บ
const MAPS_API_KEY = 'AIzaSyDo6iytZ2FgH90VscgneUmne0z8CUnNfEA';

/**
 * Router สำหรับ GET requests
 */
function doGet(e) {
  const path = (e.pathInfo || '').replace(/^\//, '');
  switch (path) {
    case 'list':
      return handleList();
    case 'normalize':
      return handleNormalize();
    case 'geocode-missing':
      return handleGeocodeMissing();
    case '':
      // default route (root) – อาจใช้สำหรับตรวจสอบ
      return sendJson({ success: true, message: 'Apps Script API is running' });
    default:
      return sendJson({ success: false, error: 'Unknown GET path: ' + path });
  }
}

/**
 * Router สำหรับ POST requests
 */
function doPost(e) {
  const path = (e.pathInfo || '').replace(/^\//, '');
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  switch (path) {
    case 'bulk-upsert':
      return handleBulkUpsert(body.items || []);
    default:
      return sendJson({ success: false, error: 'Unknown POST path: ' + path });
  }
}

/**
 * ดึงข้อมูลทั้งหมดจากชีตและคืนค่า JSON
 */
function handleList() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const objects = toObjects(data);
  return sendJson({ success: true, data: objects });
}

/**
 * ปรับแต่งข้อมูล: ตัดช่องว่าง, แปลงตัวเลข, กำหนด id หากยังไม่มี และบันทึกกลับชีต
 */
function handleNormalize() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] === 'string') {
        row[j] = row[j].trim();
      }
    }
    // เติม id หากไม่มี
    const idIndex = header.indexOf('id');
    if (idIndex > -1 && !row[idIndex]) {
      row[idIndex] = Utilities.getUuid();
    }
  }
  // เขียนกลับ
  sheet.getRange(1, 1, data.length, header.length).setValues(data);
  return sendJson({ success: true, message: 'Normalized' });
}

/**
 * เติมพิกัด GPS ให้กับรายการที่ละติจูด/ลองจิจูดยังว่างอยู่ โดยใช้ Google Geocoding API
 */
function handleGeocodeMissing() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const latIndex = header.indexOf('lat');
  const lngIndex = header.indexOf('lng');
  const addressIndex = header.indexOf('address') !== -1 ? header.indexOf('address') : header.indexOf('ที่อยู่');
  let updatedCount = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((!row[latIndex] || !row[lngIndex]) && row[addressIndex]) {
      const address = encodeURIComponent(row[addressIndex]);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${MAPS_API_KEY}`;
      const response = UrlFetchApp.fetch(url);
      const json = JSON.parse(response.getContentText());
      if (json.results && json.results.length > 0) {
        const location = json.results[0].geometry.location;
        row[latIndex] = location.lat;
        row[lngIndex] = location.lng;
        updatedCount++;
      }
    }
  }
  // เขียนกลับชีตเฉพาะคอลัมน์ lat/lng
  sheet.getRange(2, latIndex + 1, data.length - 1, 1).setValues(data.slice(1).map((r) => [r[latIndex]]));
  sheet.getRange(2, lngIndex + 1, data.length - 1, 1).setValues(data.slice(1).map((r) => [r[lngIndex]]));
  return sendJson({ success: true, updated: updatedCount });
}

/**
 * เพิ่มหรืออัปเดตข้อมูลเป็นชุด ๆ ตาม id (หาก id ซ้ำให้เขียนทับ) หรือเพิ่มใหม่ถ้าไม่มี id ตรงกัน
 */
function handleBulkUpsert(items) {
  if (!Array.isArray(items)) {
    return sendJson({ success: false, error: 'Invalid items' });
  }
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const idIndex = header.indexOf('id');
  // สร้าง Map ของ id ไปยังแถวในชีต
  const idRowMap = {};
  for (let i = 1; i < data.length; i++) {
    const id = data[i][idIndex];
    if (id) idRowMap[id] = i;
  }
  items.forEach((item) => {
    const id = item.id || Utilities.getUuid();
    let rowIndex = idRowMap[id];
    const values = header.map((h) => item[h] !== undefined ? item[h] : '');
    if (rowIndex !== undefined) {
      // update row
      sheet.getRange(rowIndex + 1, 1, 1, values.length).setValues([values]);
    } else {
      // append
      sheet.appendRow(values);
    }
  });
  return sendJson({ success: true, upserted: items.length });
}

/**
 * แปลงข้อมูลแบบตาราง (Array of Arrays) ให้เป็นอาร์เรย์ของออบเจ็กต์
 */
function toObjects(data) {
  const header = data[0];
  const objects = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = row[j];
    }
    objects.push(obj);
  }
  return objects;
}

/**
 * Utility: คืน Sheet object ตามชื่อ
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

/**
 * ส่ง JSON response
 */
function sendJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}