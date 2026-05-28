# Blog Web Application (Next.js + Custom JWT Auth + Prisma)

พัฒนาด้วย Next.js (App Router), Custom Auth (JWT + Cookie-Based), PostgreSQL และ Prisma ORM ในการเชื่อมต่อฐานข้อมูล
---


## คำอธิบายเทคโนโลยีที่เลือกใช้ (Tech Stack)

| เทคโนโลยี (Tech) | เหตุผลในการตัดสินใจเลือกใช้ (Rationale) |
| :--- | :--- |
| **Next.js (App Router)** | เลือกใช้เพราะฟีเจอร์ **Server Components (RSC)** ทำให้บล็อกสามารถ Render ข้อมูลจากฐานข้อมูลที่ฝั่งเซิร์ฟเวอร์ได้ทันที |
| **Custom JWT & Cookies** | ตัดสินใจทำระบบ Auth เองโดยใช้ **JWT (JSON Web Tokens)** ร่วมกับคุกกี้ |
| **Prisma ORM** | ทำหน้าที่เป็นตัวเชื่อมต่อนช่วยลดข้อผิดพลาดในการเขียนคำสั่ง SQL ดิบ มีระบบ Auto-completion คอยเดาชื่อฟิลด์ขณะเขียนโค้ด และจัดการเรื่อง Database Migration ได้ง่ายผ่านคำสั่งสั้นๆ |
| **Supabase (PostgreSQL & Storage)** | เลือกใช้ **PostgreSQL** ของ Supabase เพราะมีบริการ **Supabase Storage** (S3-Compatible) เพื่อแยกหน้าที่จัดเก็บไฟล์รูปภาพ ปกบทความ/แกลเลอรี ออกจากตัวแอปหลัก |

---
## Database
<img width="2314" height="1478" alt="image" src="https://github.com/user-attachments/assets/0a1c9feb-2071-477e-9ad8-320315e2e391" />

---


## โครงสร้างและความสัมพันธ์ของฐานข้อมูล (Database Schema & ER Diagram)

### 1. รายละเอียดตาราง (Table Structural Specifications)

#### ตาราง `users` (ระบบบัญชีผู้ดูแลระบบ)
ใช้สำหรับจัดเก็บข้อมูลและสิทธิ์ของแอดมินในการเข้าถึงแผงควบคุมหลังบ้าน (Admin Dashboard)
* `id` (UUID): คีย์หลัก (Primary Key) สุ่มรหัสประจำตัวผู้ใช้ไม่ให้ซ้ำกัน
* `email` (Text): อีเมลของผู้ใช้งาน (ใช้เป็น Username ในการ Login)
* `password_hash` (Text): รหัสผ่านที่ผ่านการ Salt & Hash ด้วย `bcryptjs`
* `role` (Text): สิทธิ์การใช้งานระบบ (เช่น `admin` เพื่อใช้ตรวจสอบสิทธิ์ใน Middleware)
* `created_at`

#### ตาราง `blogs`
ตารางหลักที่ทำหน้าที่เก็บข้อมูลและสถานะทั้งหมดของบทความแต่ละเรื่อง
* `id` (UUID)
* `title` หัวข้อบทความ
* `summary` เนื้อหาเรื่องย่อสำหรับพรีวิวหน้าแรก
* `slug` 
* `cover_image` ลิงก์ URL รูปภาพปกหลัก (อ้างอิงจาก Supabase Storage)
* `content` เนื้อหาบทความ
* `views_count` ตัวนับยอดผู้เข้าชม
* `is_published` (Boolean): สถานะการเผยแพร่ (`true` = แสดงหน้าแรก, `false` = ฉบับร่าง)
* `created_at` / `updated_at`

#### ตาราง `blog_images` (ภาพประกอบ)
ใช้สำหรับเก็บรูปภาพเพิ่มเติมอื่นๆ ที่แอดมินอัปโหลดแทรกไว้ในเนื้อหาบทความ
* `id` 
* `blog_id` Foreign Key
* `image_url` ลิงก์ URL ไฟล์รูปภาพบน Supabase Storage
* `created_at`

#### ตาราง `comments` (ความคิดเห็นจากผู้เข้าชม)
ใช้สำหรับเก็บความคิดเห็นที่พิมพ์มาจากหน้าบ้าน
* `id` 
* `blog_id` Foreign Key
* `author_name` ชื่อผู้เขียนคอมเมนต์
* `content` เนื้อหาข้อความ
* `status` สถานะการตรวจสอบคอมเมนต์ (`pending` = รอตรวจ, `approved` = อนุมัติให้แสดงบนเว็บ, `rejected` = บล็อก)
* `created_at`

---

### 2. อธิบายความสัมพันธ์ระหว่างตาราง (Database Relationships)

1. **`blogs` -> `blog_images` (ความสัมพันธ์แบบ 1:N)**
   * บทความ 1 บทความ สามารถมีรูปภาพประกอบแกลเลอรีได้ **หลายรูปภาพ (Many)**
2. **`blogs` -> `comments` (ความสัมพันธ์แบบ 1:N)**
   * บทความ 1 บทความ มีความคิดเห็นเข้ามาได้ **หลายความคิดเห็น (Many)**
3. **ตาราง `users`**
   * ตาราง `users` สิทธิ์แอดมินจะสามารถเข้าควบคุม สร้าง/แก้ไข/ลบ ข้อมูลทุกตารางได้โดยตรง 

---

## สิ่งที่ต้องเตรียมก่อนเริ่ม
1.  **Node.js** (แนะนำเวอร์ชัน 18.x หรือใหม่กว่า)
2.  **Supabase Account** สำหรับสร้างโปรเจกต์ฐานข้อมูล PostgreSQL และ Storage สำหรับเก็บรูปภาพ

---

## ขั้นตอนการติดตั้งและรันโปรเจกต์ (Quick Start)

ทำตามขั้นตอนง่ายๆ ด้านล่างนี้เพื่อเริ่มรันโปรเจกต์:

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ชื่อ `.env` ไว้ที่ Root ของโปรเจกต์ (ข้างๆ `package.json`) และระบุค่าต่อไปนี้:

```env
# URL และ Anon Key ของ Supabase (Project Overview -> Framwork(next.js))
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"

# URL เชื่อมต่อฐานข้อมูลสำหรับ Prisma (Project Overview -> ORM(prisma))
DATABASE_URL="postgresql://postgres.your-project:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# คีย์ลับสำหรับเซ็นชื่อ JWT Token (ตั้งเป็นข้อความยาวๆ อะไรก็ได้)
JWT_SECRET="your-super-secret-key-make-it-long-and-random-12345"

# URL ของ API หรือ Host (สำหรับรัน Local ให้ตั้งเป็น localhost)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 3. การตั้งค่าบน Supabase Dashboard

เนื่องจากตัวแอปมีระบบเขียนบทความที่ผู้ใช้สามารถอัปโหลดรูปปก (Cover Image) และรูปภาพประกอบได้ คุณจำเป็นต้องสร้างพื้นที่เก็บไฟล์ใน Supabase Storage ดังนี้:
1.  ไปที่หน้า **Supabase Dashboard** ของโปรเจกต์คุณ
2.  คลิกเมนู **Storage** ในแถบซ้ายมือ
3.  คลิกปุ่ม **New Bucket** 
4.  ตั้งชื่อบักเก็ตว่า: **`blog-bucket`** (สะกดตัวเล็กทั้งหมดตามนี้เท่านั้น)
5.  สลับตัวเลือกเปิดใช้งาน **Public** (เพื่อให้บุคคลทั่วไปสามารถอ่านและแสดงผลรูปภาพบทความบนหน้าเว็บได้)
6.  คลิก **Save**

---

### 4. ซิงค์ตารางฐานข้อมูลและสร้าง Prisma Client
รันคำสั่งเพื่อแมปโครงสร้างตารางเข้าสู่ฐานข้อมูล PostgreSQL และสร้าง Prisma Client:

```bash
# ซิงค์ตารางฐานข้อมูล (และรีเซ็ตตารางใหม่)
npx prisma db push

# สร้าง Prisma Client
npx prisma generate
```

### 5. ใส่ข้อมูลจำลองในฐานข้อมูล (Seeding Mock Data)
รันคำสั่งด้านล่างนี้เพื่อล้างข้อมูลเดิมในฐานข้อมูลออกทั้งหมด และสร้างข้อมูลใหม่คุณภาพสูงจำนวน **11 บล็อก** พร้อมบัญชี **Super Admin** สำหรับใช้ล็อกอินทดสอบทันที:

```bash
npx prisma db seed
```

---

### 6. บัญชีผู้ใช้สำหรับทดสอบ
หลังจากทำการ Seed สำเร็จเรียบร้อยแล้ว คุณสามารถนำบัญชีแอดมินด้านล่างนี้ไปล็อกอินเข้าใช้งานหน้าระบบหลังบ้าน `/auth/login` (หรือกดล็อกอินผ่านปุ่ม Admin) ได้ทันที:

*   **Email**: `admin@example.com`
*   **Password**: `admin123`

---

### 7. เริ่มต้นรันเซิร์ฟเวอร์ Local
เมื่อทำทุกขั้นตอนด้านบนเสร็จเรียบร้อยแล้ว ให้เริ่มรันเว็บบนเครื่องเครื่องตนเองด้วยคำสั่ง:

```bash
npm run dev
```

เปิด Browser ไปที่ลิงก์ [http://localhost:3000](http://localhost:3000)
และเข้าหน้าล็อกอินแอดมินได้โดยตรงที่ [http://localhost:3000/auth/login](http://localhost:3000/auth/login) หรือคลิกปุ่มล็อกอินจากแถบเมนูด้านซ้าย

---

## โครงสร้างโปรเจกต์ที่สำคัญ (Project Structure)
*   `app/(blog)` - หน้าแสดงผลหน้าแรก, ดีเทลบล็อก และการเข้าใช้งานแบบผู้ใช้ทั่วไป
*   `app/(admin)` - แผงควบคุมหลังบ้านสำหรับเขียนบล็อก จัดการคอมเมนต์ ความคิดเห็น
*   `app/api/auth` - API endpoints ในการทำระบบ Sign-Up, Login และ Logout แบบปลอดภัย
*   `lib/auth.ts` - ตัวช่วยการแฮชรหัสผ่าน จัดการเซสชัน และตรวจสิทธิ์คุกกี้ JWT
*   `prisma/schema.prisma` - โครงสร้างตาราง (Database models) สำหรับ Prisma ORM
*   `prisma/seed.ts` - สคริปต์สร้างข้อมูลจำลองเพื่อเตรียมบล็อกและแอดมิน
*   `components/blog` - คอมโพเนนต์ต่างๆ ที่แชร์ใช้งานในหน้าระบบบล็อก
*   `lib/prisma.ts` - ตัวเชื่อมต่อ PrismaClient สำหรับประมวลผลดึงข้อมูล

## สมมติฐานและข้อจำกัดของระบบ (Assumptions & Constraints)

ในการพัฒนาโปรเจกต์เวอร์ชันนี้ มีการกำหนดข้อจำกัดและขอบเขตสถาปัตยกรรมไว้ดังนี้:

* **Role-Based Access Control (RBAC)**: ระบบกำหนดให้มีระดับสิทธิ์ผู้ใช้ตายตัว โดยมีเพียงสิทธิ์ `admin` เท่านั้นที่สามารถเข้าถึงกลุ่ม URL เส้นทางหลังบ้านอย่าง `/admin` หรือ `/api/admin` ได้ หากผู้ใช้ทั่วไปพยายามเข้าถึง ระบบมิดเดิลแวร์จะสกัดกั้นและดีดกลับไปหน้าล็อกอินโดยอัตโนมัติ
* **Single-Session Refresh Token**: การทำระบบต่ออายุโทเค็น (Token Refresh) บนคุกกี้ จะบันทึกทับค่า `refreshToken` ล่าสุดลงบน Database เสมอ ซึ่งหมายความว่า หากแอดมินล็อกอินเข้าใช้งานในอุปกรณ์ใหม่ (เช่น ย้ายจากคอมมาเปิดในมือถือ) เซสชันบนอุปกรณ์เก่าจะถูกมองว่าเป็น Token เก่าและหลุดออกจากระบบทันที (Force Logout) เพื่อความปลอดภัยสูงสุด
* **Image Size & Format Limitation**: ระบบอัปโหลดรูปภาพผ่าน Supabase Storage ในโปรเจกต์นี้ สมมติฐานว่าฝั่ง Client ได้มีการบีบอัดไฟล์ภาพมาก่อนแล้ว โดยจำกัดขนาดไฟล์ไม่เกิน 5MB ต่อรูป และรองรับเฉพาะฟอร์แมตมาตรฐาน (`.jpg`, `.jpeg`, `.png`, `.webp`) เพื่อควบคุมอัตราการรับส่งข้อมูล (Bandwidth) ไม่ให้สูงเกินไป
* **No Cache On View Counter**: เพื่อให้ยอดผู้เข้าชมบทความอัปเดตแบบเรียลไทม์ ฟังก์ชันเพิ่มยอดวิวจะถูกยิงคำสั่ง `increment` โดยตรงทุกครั้งที่หน้าดีเทลบทความโหลดเสร็จ ซึ่งระบบนี้จะทำงานได้ดีในสเกลปัจจุบัน แต่หากเว็บมีทราฟฟิกมหาศาลในอนาคต อาจต้องปรับไปใช้ระบบ Redis Cache เป็นตัวพักข้อมูลแทนเพื่อลดโหลดของ PostgreSQL