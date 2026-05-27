# 📝 Blog Management Web Application (Next.js + Custom JWT Auth + Prisma)

ยินดีต้อนรับสู่โปรเจกต์ระบบจัดการบล็อกสมัยใหม่ พัฒนาด้วย Next.js (App Router), Custom Auth (JWT + Cookie-Based), PostgreSQL และ Prisma ORM ในการเชื่อมต่อฐานข้อมูล

คู่มือฉบับนี้ถูกเขียนขึ้นมาเพื่อให้ผู้พัฒนาทุกคนสามารถรันโปรเจกต์นี้บนเครื่องตัวเองเพื่อพัฒนาต่อ (Local Development) ได้อย่างราบรื่น ง่ายดายที่สุด และไม่ต้องทำการตั้งค่าระบบสมัครสมาชิกหรือเขียน SQL ทริกเกอร์ใดๆ บน Supabase!

---

## 🚀 ฟีเจอร์หลักของโปรเจกต์ (Features)
*   **Next.js (App Router)** - พัฒนาด้วยโครงสร้างโฟลเดอร์แบบใหม่ รวดเร็วและเหมาะสมกับการทำ SEO
*   **Custom JWT Authentication** - ระบบล็อกอินแบบปลอดภัยที่สร้างขึ้นเองโดยจัดเก็บข้อมูลผู้ใช้และแฮชรหัสผ่านด้วย `bcryptjs` ไว้ในฐานข้อมูลของคุณเอง และจัดการเซสชันด้วย HTTP-Only Cookie + JWT
*   **Prisma ORM & PostgreSQL** - เขียนโค้ดติดต่อฐานข้อมูลอย่างเป็นระบบ ปลอดภัย และมี Type-safe
*   **Modern Admin Dashboard** - หน้าแผงควบคุมสำหรับ Admin ในการเขียน/แก้ไข/ลบ บล็อก และจัดการความคิดเห็น (Comments)
*   **Seeding Mock Data** - มีคำสั่งสำหรับสร้างข้อมูลจำลองแบบคุณภาพสูง (11 บล็อกพร้อมรูปภาพจาก Unsplash และบัญชีผู้ดูแลระบบพร้อมใช้งานทันที) หลังติดตั้ง

---

## 🛠️ สิ่งที่ต้องเตรียมก่อนเริ่ม (Prerequisites)
1.  **Node.js** (แนะนำเวอร์ชัน 18.x หรือใหม่กว่า)
2.  **Supabase Account** สำหรับสร้างโปรเจกต์ฐานข้อมูล PostgreSQL และ Storage สำหรับเก็บรูปภาพ
3.  **Git** สำหรับจัดการเวอร์ชันคอนโทรล

---

## 📋 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Quick Start)

ทำตามขั้นตอนง่ายๆ ด้านล่างนี้เพื่อเริ่มรันโปรเจกต์:

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ชื่อ `.env` ไว้ที่ Root ของโปรเจกต์ (ข้างๆ `package.json`) และระบุค่าต่อไปนี้:

```env
# URL และ Anon Key ของ Supabase (สำหรับระบบอัปโหลดรูปภาพ)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"

# URL เชื่อมต่อฐานข้อมูลสำหรับ Prisma (หาได้จาก Dashboard -> Project Settings -> Database -> Connection string)
DATABASE_URL="postgresql://postgres.your-project:...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project:...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# คีย์ลับสำหรับเซ็นชื่อ JWT Token (ตั้งเป็นข้อความยาวๆ อะไรก็ได้)
JWT_SECRET="your-super-secret-key-make-it-long-and-random-12345"

# URL ของ API หรือ Host (สำหรับรัน Local ให้ตั้งเป็น localhost)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## ⚙️ 3. การตั้งค่าบน Supabase Dashboard (ห้ามข้าม!)

เนื่องจากตัวแอปมีระบบเขียนบทความที่ผู้ใช้สามารถอัปโหลดรูปปก (Cover Image) และรูปภาพประกอบแกลเลอรี (Gallery Images) ได้ คุณจำเป็นต้องสร้างพื้นที่เก็บไฟล์ใน Supabase Storage ดังนี้:
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

### 🔑 6. บัญชีผู้ใช้สำหรับทดสอบหลังทำ Seed
หลังจากทำการ Seed สำเร็จเรียบร้อยแล้ว คุณสามารถนำบัญชีแอดมินด้านล่างนี้ไปล็อกอินเข้าใช้งานหน้าระบบหลังบ้าน `/auth/login` (หรือกดล็อกอินผ่านปุ่มที่แถบข้าง) ได้ทันที:

*   **Email**: `admin@example.com`
*   **Password**: `admin123`

---

### 7. เริ่มต้นรันเซิร์ฟเวอร์ Local
เมื่อทำทุกขั้นตอนด้านบนเสร็จเรียบร้อยแล้ว ให้เริ่มรันเว็บบนเครื่องเครื่องตนเองด้วยคำสั่ง:

```bash
npm run dev
```

เปิด Browser ไปที่ลิงก์ [http://localhost:3000](http://localhost:3000) 🎉
และเข้าหน้าล็อกอินแอดมินได้โดยตรงที่ [http://localhost:3000/auth/login](http://localhost:3000/auth/login) หรือคลิกปุ่มล็อกอินจากแถบเมนูด้านซ้าย

---

## 📁 โครงสร้างโปรเจกต์ที่สำคัญ (Project Structure)
*   `app/(blog)` - หน้าแสดงผลหน้าแรก, ดีเทลบล็อก และการเข้าใช้งานแบบผู้ใช้ทั่วไป
*   `app/(admin)` - แผงควบคุมหลังบ้านสำหรับเขียนบล็อก จัดการคอมเมนต์ ความคิดเห็น
*   `app/api/auth` - API endpoints ในการทำระบบ Custom Sign-Up, Login และ Logout แบบปลอดภัย
*   `lib/auth.ts` - ตัวช่วยการแฮชรหัสผ่าน จัดการเซสชัน และตรวจสิทธิ์คุกกี้ JWT (รองรับ Edge/Middleware)
*   `prisma/schema.prisma` - โครงสร้างตาราง (Database models) สำหรับ Prisma ORM
*   `prisma/seed.ts` - สคริปต์สร้างข้อมูลจำลองเพื่อเตรียมบล็อก 11 ชิ้นและแอดมิน
*   `components/blog` - คอมโพเนนต์ต่างๆ ที่แชร์ใช้งานในหน้าระบบบล็อก
*   `lib/prisma.ts` - ตัวเชื่อมต่อ PrismaClient สำหรับประมวลผลดึงข้อมูล
