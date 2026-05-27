import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'ออกจากระบบสำเร็จเรียบร้อย',
        });

        deleteAuthCookie(response.headers);

        return response;
    } catch (error) {
        console.error('Logout API Error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
            { status: 500 }
        );
    }
}
