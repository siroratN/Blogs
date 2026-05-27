import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'อีเมลนี้ถูกใช้งานไปแล้วในระบบ' },
                { status: 400 }
            );
        }

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Create the user (role defaults to 'member')
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                role: 'member',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จเรียบร้อย',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
