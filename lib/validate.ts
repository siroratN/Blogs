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

export type CommentInput = z.infer<typeof commentSchema>;