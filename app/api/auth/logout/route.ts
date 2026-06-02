import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        await deleteAuthCookie();
        return NextResponse.json({
            success: true,
            message: 'ออกจากระบบสำเร็จเรียบร้อย',
        });
    } catch (error) {
        console.error('Logout API Error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
            { status: 500 }
        );
    }
}
