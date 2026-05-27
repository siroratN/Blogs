import { getAllBlogs } from "@/app/api/service/blog";
import { NextResponse } from "next/server";

// Get all blogs for admin management
export async function GET() {
    try {
        const blogs = await getAllBlogs();
        return NextResponse.json({ blogs });
    }
    catch (error) {
        console.error("API Error - Fetching all blogs failed:", error);
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลบทความได้จากฐานข้อมูล" }, { status: 500 });
    }
}
