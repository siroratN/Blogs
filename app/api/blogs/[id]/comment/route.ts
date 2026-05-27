import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createComment, getCommentsByBlogId } from "@/app/api/service/comment";


interface RouteParams {
    params: Promise<{ id: string }>;
}

//create comment for blog by id
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: blogId } = await params;
        const { authorName, content } = await request.json();

        if (!authorName || !content) {
            return NextResponse.json({ success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        const result = await createComment({ blogId, authorName, content });

        if (result.success) {
            revalidatePath(`/blog/${blogId}`);
            return NextResponse.json({ success: true }, { status: 201 });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }
}

//get comments for blog by id
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id: blogId } = await params;
        const result = await getCommentsByBlogId(blogId);

        if (result.success) {
            return NextResponse.json({ success: true, comments: result.comments }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    }
}