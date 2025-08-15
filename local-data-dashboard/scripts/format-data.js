#!/usr/bin/env node
// สคริปต์จัดรูปแบบข้อมูลก่อน deploy
// จะเรียก Apps Script endpoint /normalize เพื่อจัดระเบียบข้อมูล (trim, เติม id)

const baseUrl = process.env.VITE_APP_SCRIPT_BASE_URL;
if (!baseUrl) {
  console.error('Missing VITE_APP_SCRIPT_BASE_URL in environment');
  process.exit(1);
}

async function main() {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/normalize`);
    const json = await res.json();
    if (json.success) {
      console.log('Data normalized successfully');
    } else {
      console.error('Normalization failed:', json.error);
    }
  } catch (err) {
    console.error('Error calling normalize API:', err);
  }
}

main();