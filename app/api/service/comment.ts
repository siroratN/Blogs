import { prisma } from '@/lib/prisma'
import { commentSchema, CommentInput } from '@/lib/validate'

type CreateCommentArgs = CommentInput & { blogId: string };
type CommentStatus = "pending" | "approved" | "rejected";

interface UpdateCommentInput {
    commentId: string;
    status: CommentStatus;
    count?: number;
}
export async function createComment(data: CreateCommentArgs) {
    try {
        const validation = commentSchema.safeParse(data);
        
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues.map((err) => err.message).join(", "),
            };
        }

        const { authorName, content } = validation.data;

        await prisma.comment.create({
            data: {
                blogId: data.blogId,
                authorName: authorName, 
                content: content,  
                status: "pending",
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating comment:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการส่งคอมเมนต์" };
    }
}

export async function getCommentsByBlogId(blogId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { blogId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, comments };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการดึงคอมเมนต์" };
    }
}

export async function updateCommentStatusService(input: UpdateCommentInput) {
    const { commentId, status } = input;
    
    try {
        if (!commentId || commentId.length === 0) {
            throw new Error("กรุณาระบุ commentIds");
        }

        const updatedComment = await prisma.comment.update({
            where: {
                id: commentId 
            },
            data: {
                status
            }
        });

        return { 
            success: true, 
            count: updatedComment
        };
        
    } catch (error) {
        console.error("Service Error - Updating comment status failed:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตสถานะคอมเมนต์ในระบบ" };
    }
}

export async function getAllComments(blogId?: string) {
    try {
        const whereClause = blogId ? { blogId: blogId } : {};
        const comments = await prisma.comment.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                blog: {
                    select: {
                        title: true,
                    },
                },
            },
        });
        return { success: true, comments };
    } catch (error) {
        console.error("Error fetching all comments:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการดึงคอมเมนต์ทั้งหมด" };
    }
}