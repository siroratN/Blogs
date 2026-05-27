import { NextRequest, NextResponse } from "next/server";
import {toggleBlogStatusService} from "@/app/api/service/blog";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const updatedBlog = await toggleBlogStatusService({ blogId: id });

        return NextResponse.json({ success: true, blog: updatedBlog }, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "ไม่สามารถสลับสถานะบทความได้" }, { status: 500 });
    }
}