# 📝 Blog Management Web Application (Next.js + Supabase + Prisma)

ยินดีต้อนรับสู่โปรเจกต์ระบบจัดการบล็อกสมัยใหม่ พัฒนาด้วย Next.js (App Router), Supabase (Auth & Database) และ Prisma ORM ในการเชื่อมต่อฐานข้อมูล

คู่มือฉบับนี้ถูกเขียนขึ้นมาเพื่อให้ผู้พัฒนาทุกคนสามารถเอาโปรเจกต์นี้ไปรันบนเครื่องตัวเองเพื่อพัฒนาต่อ (Local Development) ได้อย่างราบรื่น ไม่มีติดขัด และป้องกันปัญหาเรื่องการเข้าสู่ระบบหรือระบบรูปภาพไม่แสดงผล

---

## 🚀 ฟีเจอร์หลักของโปรเจกต์ (Features)
*   **Next.js (App Router)** - พัฒนาด้วยโครงสร้างโฟลเดอร์แบบใหม่ รวดเร็วและเหมาะสมกับการทำ SEO
*   **Supabase SSR Authentication** - ระบบล็อกอิน จัดการเซสชันด้วยคุกกี้ที่ปลอดภัยผ่าน `@supabase/ssr`
*   **Prisma ORM & PostgreSQL** - เขียนโค้ดติดต่อฐานข้อมูลอย่างเป็นระบบ ปลอดภัย และมี Type-safe
*   **Modern Admin Dashboard** - หน้าแผงควบคุมสำหรับ Admin ในการเขียน/แก้ไข/ลบ บล็อก และจัดการความคิดเห็น (Comments)
*   **Seeding Mock Data** - มีคำสั่งสำหรับสร้างข้อมูลจำลองแบบคุณภาพสูง (11 บล็อกพร้อมรูปภาพจาก Unsplash และบัญชีผู้ดูแล) ทันทีหลังติดตั้ง

---

## 🛠️ สิ่งที่ต้องเตรียมก่อนเริ่ม (Prerequisites)
1.  **Node.js** (แนะนำเวอร์ชัน 18.x หรือใหม่กว่า)
2.  **Supabase Account** สำหรับสร้างโปรเจกต์ฐานข้อมูลฟรี (หรือใช้ Supabase CLI รันแบบ Local)
3.  **Git** สำหรับจัดการเวอร์ชันคอนโทรล

---

## 📋 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Quick Start)

ทำตามขั้นตอนด้านล่างนี้ตามลำดับเพื่อเริ่มรันโปรเจกต์:

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ชื่อ `.env` หรือ `.env.local` ไว้ที่ Root ของโปรเจกต์ (ข้างๆ `package.json`) และระบุค่าต่อไปนี้:

```env
# URL และ Anon Key ของ Supabase (หาได้จาก Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"

# URL เชื่อมต่อฐานข้อมูลสำหรับ Prisma (หาได้จาก Dashboard -> Project Settings -> Database -> Connection string -> Prisma)
# *แนะนำให้ใช้ Transaction Connection สำหรับ DATABASE_URL และ Session Connection สำหรับ DIRECT_URL*
DATABASE_URL="postgresql://postgres.your-project:...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project:...@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# URL ของ API หรือ Host (สำหรับรัน Local ให้ตั้งเป็น localhost)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> [!IMPORTANT]
> กรุณาตรวจสอบรหัสผ่านของฐานข้อมูลใน `DATABASE_URL` และ `DIRECT_URL` ว่าถูกต้องและไม่ได้ใส่ตัวอักษรพิเศษที่ไม่ผ่านการ Encode (เช่น `@`, `/`, `:`)

---

## ⚙️ 3. การตั้งค่าบน Supabase Dashboard (ห้ามข้าม!)

เพื่อให้ระบบล็อกอินและการอัปโหลดรูปภาพใช้งานได้ 100% โดยไม่ติดปัญหา กรุณาตั้งค่า Supabase 2 ส่วนดังต่อไปนี้:

### ส่วนที่ A: สร้าง Storage Bucket (สำหรับระบบอัปโหลดรูปภาพ)
เนื่องจากตัวแอปมีระบบเขียนบทความที่ผู้ใช้สามารถอัปโหลดรูปปก (Cover Image) และรูปภาพประกอบแกลเลอรี (Gallery Images) ได้ คุณจำเป็นต้องสร้างพื้นที่เก็บไฟล์ใน Supabase ดังนี้:
1.  ไปที่หน้า **Supabase Dashboard** ของโปรเจกต์คุณ
2.  คลิกเมนู **Storage** ในแถบซ้ายมือ
3.  คลิกปุ่ม **New Bucket** 
4.  ตั้งชื่อบักเก็ตว่า: **`blog-bucket`** (สะกดตัวเล็กทั้งหมดตามนี้เท่านั้น)
5.  สลับตัวเลือกเปิดใช้งาน **Public** (เพื่อให้บุคคลทั่วไปสามารถอ่านและแสดงผลรูปภาพบทความบนหน้าเว็บได้)
6.  คลิก **Save**

### ส่วนที่ B: สร้าง Database Trigger (สำหรับระบบซิงค์ข้อมูลผู้ใช้งานและสมัครสมาชิก)
เมื่อผู้ใช้งานทำการสมัครสมาชิก (Sign Up) บัญชีจะถูกสร้างอยู่ในส่วนของ Supabase Auth เสมอ แต่เพื่อให้ตาราง `users` ของโปรเจกต์รับทราบข้อมูลผู้ใช้ใหม่ คุณต้องสร้าง Trigger เพื่อทำการคัดลอกข้อมูลโดยอัตโนมัติ:
1.  ไปที่เมนู **SQL Editor** ใน Supabase Dashboard
2.  คลิก **New Query**
3.  คัดลอกโค้ด SQL ด้านล่างนี้ไปวางและกดปุ่ม **Run**:

```sql
-- 1. สร้างฟังก์ชันการคัดลอกข้อมูลผู้ใช้ใหม่ไปยังตาราง public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'member');
  return new;
end;
$$ language plpgsql security definer;

-- 2. สร้าง Trigger เพื่อเรียกใช้ฟังก์ชันด้านบนทุกครั้งเมื่อมีการเพิ่มผู้ใช้ใน auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### 4. ซิงค์ตารางฐานข้อมูลและสร้าง Prisma Client
คำสั่งนี้จะทำการแมป Schema ของ Prisma เข้าสู่ฐานข้อมูล PostgreSQL ของคุณ และสร้าง Type-safe Client สำหรับใช้งานในโค้ด:

```bash
# ซิงค์ตารางฐานข้อมูล
npx prisma db push

# สร้าง Prisma Client ล่าสุด
npx prisma generate
```

### 5. ใส่ข้อมูลจำลองในฐานข้อมูล (Seeding Mock Data)
รันคำสั่งด้านล่างนี้เพื่อล้างข้อมูลเดิมในฐานข้อมูลออกทั้งหมด และสร้างข้อมูลใหม่คุณภาพสูงจำนวน **11 บล็อก** (พร้อมรูปภาพประกอบและคอมเมนต์ที่สวยงาม) รวมถึงบัญชีสำหรับ Admin ในการทดสอบ:

```bash
npx prisma db seed
```

หลังจากคำสั่งนี้ทำงานเสร็จสิ้น คุณจะมีฐานข้อมูลที่มีความพร้อมสำหรับการทดสอบฟังก์ชันค้นหา, แสดงผลหน้าแรก, หน้าดีเทล และหน้า Admin ทันที!

### 6. วิธีเข้าใช้งานหน้า Admin (การตั้งค่าบัญชี Admin)
เนื่องจากระบบความปลอดภัยจะบล็อกผู้ใช้งานที่ไม่ใช่ Admin ไม่ให้เข้าถึงเส้นทาง `/admin` ดังนั้นคุณจะต้องดำเนินการตามขั้นตอนด้านล่างเพื่อเปิดสิทธิ์บัญชีของคุณ:

1.  เปิดหน้าเว็บแอปพลิเคชัน (ในขั้นตอนถัดไป) และสมัครสมาชิก (Sign Up) ด้วยอีเมลที่คุณต้องการใช้ทำงาน
2.  เมื่อสมัครเสร็จแล้ว บัญชีของคุณจะถูกบันทึกในฐานข้อมูล Supabase และคัดลอกลงตาราง `users` ของโปรเจกต์ด้วย Trigger ที่เซ็ตไว้
3.  เปิด **Supabase Dashboard** เข้าไปที่เมนู **SQL Editor** แล้วรันคำสั่ง SQL ด้านล่างเพื่ออัปเกรดบทบาท (Role) ของคุณให้เป็น **admin**:
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'อีเมลที่คุณใช้สมัคร@example.com';
    ```
4.  ล็อกอินใหม่อีกครั้งผ่านระบบ จะสามารถเข้าหน้าแดชบอร์ดจัดการหลังบ้านที่ `/admin` ได้ทันที!

> [!TIP]
> ในไฟล์ Seed มีการเตรียมบัญชี `admin@example.com` ไว้ในตาราง `users` ของฐานข้อมูลแล้ว หากคุณต้องการใช้บัญชีนี้ สามารถเข้าไปสร้างผู้ใช้ใหม่ในเมนู **Authentication** บน Supabase Dashboard ด้วยอีเมล `admin@example.com` เพื่อสร้างรหัสผ่านให้ตรงกัน จากนั้นก็พร้อมล็อกอินได้เลย!

### 7. เริ่มต้นรันเซิร์ฟเวอร์ Local
เมื่อทำทุกขั้นตอนด้านบนเสร็จเรียบร้อยแล้ว ให้เริ่มรันเว็บบนเครื่องเครื่องตนเองด้วยคำสั่ง:

```bash
npm run dev
```

เปิด Browser ไปที่ลิงก์ [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 โครงสร้างโปรเจกต์ที่สำคัญ (Project Structure)
*   `app/(blog)` - หน้าแสดงผลหน้าแรก, ดีเทลบล็อก และการเข้าใช้งานแบบผู้ใช้ทั่วไป
*   `app/(admin)` - แผงควบคุมหลังบ้านสำหรับเขียนบล็อก จัดการคอมเมนต์ ความคิดเห็น
*   `app/api` - API endpoints ต่างๆ ในการดึงข้อมูลและจัดการอัปโหลดไฟล์
*   `prisma/schema.prisma` - โครงสร้างตาราง (Database models) สำหรับ Prisma ORM
*   `prisma/seed.ts` - สคริปต์สร้างข้อมูลจำลองเพื่อเตรียมระบบตอนทำเริ่มต้น
*   `components/blog` - คอมโพเนนต์ต่างๆ ที่แชร์ใช้งานในหน้าระบบบล็อก
*   `lib/prisma.ts` - ตัวเชื่อมต่อ PrismaClient สำหรับประมวลผลดึงข้อมูล

---

## 🛠️ คำสั่งที่ใช้บ่อยในการพัฒนา (Useful Commands)
*   `npm run dev` - รันเซิร์ฟเวอร์พัฒนาในเครื่อง
*   `npm run build` - บิลด์เว็บบน Production (เพื่อตรวจสอบความถูกต้องก่อน Deploy)
*   `npx prisma studio` - เปิดหน้าเว็บ UI เพื่อเข้าไปจัดการดูแก้ไขข้อมูลใน PostgreSQL ได้สะดวกผ่านเบราว์เซอร์
*   `npx prisma generate` - รีเจเนอเรต Prisma client ทุกครั้งเมื่อมีการปรับโครงสร้างตารางใน `schema.prisma`
