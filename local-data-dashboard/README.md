# ข้อมูลท้องถิ่น สภ.นิคมพัฒนา – เว็บแดชบอร์ด

โปรเจ็กต์นี้เป็นเว็บแดชบอร์ดสาธารณะสำหรับดูข้อมูลสถานที่ในอำเภอนิคมพัฒนา (หรือพื้นที่อื่น ๆ) จาก Google Sheets พร้อมแผนที่, ชาร์ตโดนัต และตารางค้นหา/กรองแบบอินเทอร์แอ็กทีฟ ตัวโปรเจ็กต์ถูกสร้างด้วย **Vite + React + TypeScript**, ใช้ **Leaflet** ในการแสดงแผนที่, **Chart.js** ในการแสดงชาร์ต และ **Tailwind CSS** สำหรับสไตล์ นอกจากนี้ยังมี Google Apps Script ที่ทำหน้าที่เป็น API สำหรับอ่าน/เขียนข้อมูลกลับไปยังชีต

## โครงสร้างรีโปสิตอรี

```
local-data-dashboard/
├── .github/workflows/deploy.yml           # คอนฟิก GitHub Actions สำหรับ build และ deploy ไปยัง gh-pages
├── apps-script/
│   └── apps-script.gs                     # สคริปต์ Google Apps Script (Web App) สำหรับจัดการข้อมูล
├── public/
│   └── index.html                         # ไฟล์ HTML พื้นฐานที่ใช้โดย Vite
├── src/
│   ├── components/                        # React components แบบแยกส่วน
│   │   ├── MapView.tsx                    # แผนที่ด้วย Leaflet พร้อมการคลัสเตอร์
│   │   ├── DonutChart.tsx                 # โดนัตชาร์ตด้วย react‑chartjs‑2
│   │   ├── DataTable.tsx                  # ตารางข้อมูลพร้อมการค้นหา/กรอง/เพจิเนชัน
│   │   └── SummaryCards.tsx               # การ์ดสรุปจำนวน (เช่น จำนวนสถานที่)
│   ├── lib/
│   │   ├── sheet.ts                       # ฟังก์ชันดึงข้อมูลจาก Google Sheets (CSV publish)
│   │   ├── api.ts                         # ฟังก์ชันเรียก Google Apps Script API
│   │   └── utils.ts                       # ฟังก์ชันช่วยเหลือทั่วไป
│   ├── types/
│   │   └── index.ts                       # ประกาศ TypeScript interfaces สำหรับข้อมูลสถานที่ ฯลฯ
│   ├── App.tsx                            # หน้าเว็บหลักรวมส่วนประกอบต่าง ๆ
│   └── main.tsx                           # จุดเริ่มต้นของแอป (mount React)
├── .env.example                           # ตัวอย่างไฟล์ environment variables
├── package.json                           # คำสั่ง npm scripts และ dependencies
├── postcss.config.cjs                     # การตั้งค่า PostCSS สำหรับ Tailwind
├── tailwind.config.ts                     # การตั้งค่า Tailwind
├── tsconfig.json                          # การตั้งค่า TypeScript
├── vite.config.ts                         # การตั้งค่า Vite
└── README.md                              # เอกสารนี้
```

## การติดตั้งและใช้งาน

1. **โคลนและติดตั้ง** – ติดตั้ง dependencies ด้วย `npm install` (จำเป็นต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดึงแพ็กเกจ) แล้วคัดลอกไฟล์ `.env.example` เป็น `.env` และกำหนดค่าตามที่ใช้จริง เช่น `VITE_SHEET_ID`, `VITE_SHEET_TAB`, `VITE_APP_SCRIPT_BASE_URL` และ `VITE_MAP_API_KEY` เป็นต้น
2. **รันโหมดพัฒนา** – ใช้คำสั่ง `npm run dev` เพื่อสั่ง Vite ให้เปิดเซิร์ฟเวอร์ development จากนั้นเปิดเบราว์เซอร์ที่ `http://localhost:5173`
3. **สร้างไฟล์ผลิต** – ใช้คำสั่ง `npm run build` เพื่อ build แอปและสร้างไฟล์สเตติกในโฟลเดอร์ `dist/`
4. **ดีพลอยไป GitHub Pages** – เมื่อ push ไปยัง branch `main` GitHub Actions จะ build และ deploy อัตโนมัติไปที่ branch `gh-pages` โดยสามารถเข้าชมได้ที่ `https://<username>.github.io/<repository>`

ดูรายละเอียดการตั้งค่าเพิ่มเติมในไฟล์ `.github/workflows/deploy.yml`

## การเชื่อมต่อ Google Sheets แบบ Published CSV

แอปนี้ใช้วิธีการ **Publish to the web** ของ Google Sheets เพื่ออ่านข้อมูลอย่างรวดเร็วโดยไม่ต้องใช้ API key ขนาดใหญ่ เมื่อเผยแพร่ชีตไปบนเว็บแล้ว (File → Share → Publish to web) ผู้ใช้สามารถเลือก “Spreadsheet” และ “Publish format” เป็น “CSV”【320754360503979†L63-L72】 จากนั้นจะแสดง URL สำหรับดาวน์โหลดไฟล์ CSV ของแต่ละแท็บ ข้อมูลในหน้าเว็บนี้จะถูกดึงโดยฟังก์ชันใน `src/lib/sheet.ts` ผ่านการ fetch URL CSV นั้น และแปลงเป็นออบเจ็กต์โดยใช้ TypeScript interfaces

## การเชื่อมต่อ Google Apps Script

เมื่อจำเป็นต้องแก้ไขข้อมูล (เพิ่ม/อัปเดต/เติมพิกัด ฯลฯ) แอปจะเรียกไปยัง Google Apps Script ที่สร้างในโฟลเดอร์ `apps-script/` ซึ่งต้อง deploy เป็น **Web App** ด้วยการตั้งค่า “Execute as me” และ “Anyone” เพื่อให้เว็บไซต์เรียกผ่าน URL ได้ ตัวอย่าง endpoints:

| Endpoint | รายละเอียด |
|---------|-----------|
| `/list` | ดึงข้อมูลทั้งหมดจากชีตและส่งคืน JSON |
| `/normalize` | จัดรูปแบบข้อมูล (trim, ปรับชื่อ, ฯลฯ) และเขียนกลับชีต |
| `/geocode-missing` | ค้นหาพิกัด GPS สำหรับรายการที่ยังไม่ระบุพิกัดผ่าน Google Maps API แล้วอัปเดตชีต |
| `/bulk-upsert` | เพิ่มหรืออัปเดตข้อมูลจำนวนมากภายหลังจากการแก้ไขจากหน้าเว็บ |

โค้ดฝั่งไคลเอนต์ใน `src/lib/api.ts` จะรับผิดชอบในการเรียก endpoints เหล่านี้ผ่าน fetch

## สคริปต์จัดการข้อมูล

นอกจากการแสดงข้อมูลแล้ว ยังมีสคริปต์ `npm run format-data` เพื่อเรียก Apps Script `/normalize` ก่อน deploy ทุกครั้ง (ช่วยจัดระเบียบข้อมูลและเติมพิกัดที่ว่างเปล่า) และมีสคริปต์ที่ช่วย geocode อัตโนมัติหากต้องการ

## เช็กลิสต์ก่อน deploy

* ตรวจสอบว่าไฟล์ `.env` กำหนดค่าถูกต้อง (Sheet ID, Tab ID, Apps Script URL, API key)
* ตรวจสอบว่าได้แชร์ Google Sheet เป็น “Anyone with link can view” และ Publish to web แบบ CSV【320754360503979†L63-L72】
* ตรวจสอบว่า Apps Script deploy เป็น Web App และเลือก “Anyone”
* รัน `npm run format-data` เพื่อจัดระเบียบข้อมูล
* Commit และ push ไปที่ branch `main` – GitHub Actions จะ deploy ให้โดยอัตโนมัติ

โปรเจ็กต์นี้ช่วยให้หน่วยงานท้องถิ่นสามารถเผยแพร่ข้อมูลสถานที่ได้สะดวก และสามารถต่อยอด/ปรับแต่งตามต้องการ
