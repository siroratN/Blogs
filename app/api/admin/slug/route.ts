import { NextResponse } from "next/server";
import {getBlogForSlug, editSlug} from "@/app/api/service/blog";

// Get all blog slugs for admin slug management
export async function GET() {
    try {
        const result = await getBlogForSlug();
        return NextResponse.json({ success: true, blogSlugs: result, }, { status: 200 });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลบล็อก" }, { status: 500 });
    }
}

// Update blog slug
export async function PATCH(request: Request) {
    try {
        const { id, slug } = await request.json();
        
        if (!id || !slug) {
            return NextResponse.json({ success: false, error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }

        const updatedBlog = await editSlug(id, slug);
        return NextResponse.json({ success: true, blog: updatedBlog }, { status: 200 });

    } catch (error: unknown) {
        console.error("API Error - PATCH slug failed:", error);
        if (error instanceof Error) {
            if (error.message === "SLUG_TAKEN") {
                return NextResponse.json({ success: false, error: "URL Slug นี้ถูกใช้งานไปแล้วในบทความอื่น" }, { status: 400 });
            }
        }

        return NextResponse.json({ 
            success: false, error: "เกิดข้อผิดพลาดภายในระบบหลังบ้าน ไม่สามารถบันทึกข้อมูลได้"}, { status: 500 });
    }
}