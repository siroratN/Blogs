import { z } from 'zod';

const thaiNumberRegex = /^[ก-๙๐-๙0-9\s]+$/;

export const commentSchema = z.object({
    authorName: z
        .string()
        .trim()
        .min(2, { message: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร' })
        .max(50, { message: 'ชื่อต้องมีความยาวไม่เกิน 50 ตัวอักษร' }),
    content: z
        .string()
        .trim()
        .min(4, { message: 'ข้อความคอมเมนต์ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' })
        .max(200, { message: 'ข้อความคอมเมนต์ต้องมีความยาวไม่เกิน 200 ตัวอักษร' })
        .regex(thaiNumberRegex, { message: 'คอมเมนต์ต้องเป็นภาษาไทยและตัวเลขเท่านั้น' }) 
});
const imageFileBaseSchema = z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "ขนาดไฟล์ต้องไม่เกิน 10MB")
    .refine((file) => ["png", "jpg", "jpeg"].includes(file.name.split('.').pop()?.toLowerCase() || ""), "รองรับเฉพาะ .png, .jpg, .jpeg");

export const editBlogSchema = z.object({
    blogId: z.string().min(1),
    title: z.string().trim().min(1, { message: "ต้องระบุชื่อบทความ" }),
    summary: z.string().trim().max(300, { message: "เรื่องย่อต้องไม่เกิน 300 ตัวอักษร" }),
    content: z.string().trim().max(5000, { message: "เนื้อหาต้องไม่เกิน 5,000 ตัวอักษร" }),
    
    coverImage: z.union([imageFileBaseSchema, z.string().url(), z.null()]).optional(),
    
    blogImagesMeta: z.array(z.object({
        type: z.enum(['url', 'file']),
        imageUrl: z.string().optional(),
        fileIndex: z.number().optional()
    })),
    
    extraImageFiles: z.array(imageFileBaseSchema)
});

export type EditBlogInput = z.infer<typeof editBlogSchema>;

export type CommentInput = z.infer<typeof commentSchema>;