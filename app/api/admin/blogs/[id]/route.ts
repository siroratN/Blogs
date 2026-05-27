import { NextRequest, NextResponse } from "next/server";
import { editBlogService } from "@/app/api/service/blog";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: blogId } = await params;
        const formData = await request.formData();

        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const summary = formData.get("summary") as string;
        const coverImage = formData.get("coverImage");
        const blogImagesMetaStr = formData.get("blogImagesMeta") as string || "[]";
        const blogImagesMeta = JSON.parse(blogImagesMetaStr);
        const extraImageFiles = formData.getAll("extraImageFiles") as File[];

        if (!title || !content || !summary) {
            return NextResponse.json({ success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        const { updatedBlog } = await editBlogService({
            blogId,
            title,
            content,
            summary,
            coverImage: coverImage as File | string | null,
            blogImagesMeta,
            extraImageFiles
        });

        return NextResponse.json({ success: true, blog: updatedBlog }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                return NextResponse.json({ success: false, error: "ไม่พบข้อมูลบทความที่ต้องการแก้ไข" }, { status: 404 });
            }
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}
