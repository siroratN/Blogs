import { NextResponse } from "next/server";
import {getAllComments, updateCommentStatusService} from "@/app/api/service/comment";

// Get all comments, optionally filtered by blogId
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const blogId = searchParams.get("blogId") as string;
        const result = await getAllComments(blogId);
        return NextResponse.json({ success: true, comments: result.comments }, { status: 200 });

    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลคอมเมนต์" }, { status: 500 });
    }
}

// Update comment status (approve, reject)
export async function PATCH(request: Request) {
    try {
        const { commentId, status } = await request.json();
        if (!commentId || !status) {
            return NextResponse.json({ success: false, error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
        }
        const result = await updateCommentStatusService({ commentId, status });
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, count: result.count }, { status: 200 });

    } catch (error) {
        console.error("API Error - PATCH comments failed:", error);
        return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดภายในระบบหลังบ้าน" }, { status: 500 });
    }
}