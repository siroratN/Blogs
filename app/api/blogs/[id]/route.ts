import { NextResponse } from "next/server";
import { getBlogById } from "@/app/api/service/blog";

// Get blog post by ID for public view
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const blogData = await getBlogById(id);
        return NextResponse.json({ success: true, blog: blogData }, { status: 200 });
    } catch (error) {
        console.error("API Error - Fetching blog data failed:", error);
        return NextResponse.json({ success: false, error: "ไม่สามารถดึงข้อมูลบทความได้" }, { status: 500 });
    }
}