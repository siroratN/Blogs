import { NextResponse } from "next/server";
import { createBlogService } from "@/app/api/service/blog";
import { revalidatePath } from "next/cache";
import {getAllPublicBlogsByPage} from "@/app/api/service/blog";

//create new blog
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const content = formData.get("content") as string;
        const summary = formData.get("summary") as string;
        const coverImageFile = formData.get("coverImage") as File | null;
        const extraImageFiles = formData.getAll("blogImages") as File[];

        if (!title || !content || !summary) {
            return NextResponse.json({ success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
        }

        if (extraImageFiles.filter(f => f.size > 0).length > 6) {
            return NextResponse.json({ success: false, error: "อัปโหลดรูปภาพประกอบได้สูงสุด 6 รูป" }, { status: 400 });
        }

        const newBlog = await createBlogService({
            title, content, summary, coverImageFile, extraImageFiles
        });

        revalidatePath('/blog');
        return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
        }
    }
}

//get all blogs with pagination and search
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const searchQuery = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const blogsData = await getAllPublicBlogsByPage({
            searchQuery: searchQuery,
            page: page,
            pageSize: limit
        });
        
        return NextResponse.json({ success: true, ...blogsData }, { status: 200 });

    } catch (error: unknown) {
        console.error("API GET Blogs Error:", error);
        
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message || "เกิดข้อผิดพลาดภายในระบบ" }, 
                { status: 500 }
            );
        }
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดภายในระบบ" }, 
            { status: 500 }
        );
    }
}

