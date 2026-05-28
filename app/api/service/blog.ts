import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

interface CreateBlogInput {
    title: string;
    content: string;
    summary: string;
    coverImageFile: File | null;
    extraImageFiles: File[];
}

interface EditBlogInput {
    blogId: string;
    title: string;
    content: string;
    summary: string;
    coverImage: string | File | null;
    blogImagesMeta: Array<{ type: 'url'; imageUrl: string } | { type: 'file'; fileIndex: number }>;
    extraImageFiles: File[];
}

function validateImageFile(file: File, fieldName: string) {
    if (!file || file.size === 0) return;
    
    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`ไฟล์รูปภาพ${fieldName}มีขนาดใหญ่เกินกว่าที่กำหนด (ต้องไม่เกิน 10MB)`);
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error(`รูปแบบไฟล์รูปภาพ${fieldName}ไม่ถูกต้อง (รองรับเฉพาะ .png, .jpg, .jpeg เท่านั้น)`);
    }
}

interface FetchBlogsInput {
    searchQuery?: string;
    page?: number;
    pageSize?: number;
}

export async function createBlogService(input: CreateBlogInput) {
    const { title, content, summary, coverImageFile, extraImageFiles } = input;
    const uploadedPathsForRollback: string[] = [];
    const supabase = await createClient();

    try {
        if (coverImageFile && coverImageFile.size > 0) {
            validateImageFile(coverImageFile, "หน้าปก");
        }

        const validExtraFiles = extraImageFiles.filter(file => file.size > 0);
        validExtraFiles.forEach((file, index) => {
            validateImageFile(file, `ประกอบลำดับที่ ${index + 1}`);
        });
        
        let generatedSlug = title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9ก-๙\s]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const existingBlog = await prisma.blog.findFirst({ where: { slug: generatedSlug } });
        if (existingBlog) {
            generatedSlug = `${generatedSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        let coverImageUrl: string | null = null;
        if (coverImageFile && coverImageFile.size > 0) {
            const fileExtension = coverImageFile.name.split('.').pop();
            const filePath = `covers/cover-${Date.now()}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-bucket')
                .upload(filePath, coverImageFile, { contentType: coverImageFile.type, upsert: true });

            if (uploadError) throw new Error(`อัปโหลดรูปภาพปกไม่สำเร็จ: ${uploadError.message}`);
            uploadedPathsForRollback.push(filePath);

            const { data: { publicUrl } } = supabase.storage.from('blog-bucket').getPublicUrl(filePath);
            coverImageUrl = publicUrl;
        }

        const uploadedExtraUrls: string[] = [];
        if (validExtraFiles.length > 0) {
            const uploadPromises = validExtraFiles.map(async (file) => {
                const fileExtension = file.name.split('.').pop();
                const randomString = Math.random().toString(36).substring(7);
                const filePath = `extras/extra-${Date.now()}-${randomString}.${fileExtension}`;

                const { error: extraUploadError } = await supabase.storage
                    .from('blog-bucket')
                    .upload(filePath, file, { contentType: file.type, upsert: true });

                if (extraUploadError) throw new Error(extraUploadError.message);
                uploadedPathsForRollback.push(filePath);

                const { data: { publicUrl } } = supabase.storage.from('blog-bucket').getPublicUrl(filePath);
                return publicUrl;
            });

            const urls = await Promise.all(uploadPromises);
            uploadedExtraUrls.push(...urls);
        }

        const newBlog = await prisma.blog.create({
            data: {
                title,
                slug: generatedSlug,
                summary,
                content,
                coverImage: coverImageUrl,
                isPublished: false, 
                blogImages: {
                    create: uploadedExtraUrls.map(url => ({ imageUrl: url }))
                }
            },
            include: { blogImages: true }
        });

        return newBlog;

    } catch (error) {
        if (uploadedPathsForRollback.length > 0) {
            await supabase.storage.from('blog-bucket').remove(uploadedPathsForRollback);
        }
        throw error;
    }
}

export async function editBlogService(input: EditBlogInput) {
    const { blogId, title, content, summary, coverImage, blogImagesMeta, extraImageFiles } = input;
    const newUploadedPathsForRollback: string[] = [];
    const oldPathsToDeleteAfterSuccess: string[] = [];
    const supabase = await createClient();

    try {
        if (coverImage instanceof File && coverImage.size > 0) {
            validateImageFile(coverImage, "หน้าปก");
        }

        const validExtraFiles = extraImageFiles.filter(file => file.size > 0);
        validExtraFiles.forEach((file, index) => {
            validateImageFile(file, `ประกอบลำดับที่ ${index + 1}`);
        });

        const currentBlog = await prisma.blog.findUnique({
            where: { id: blogId },
            include: { blogImages: true }
        });

        if (!currentBlog) throw new Error("NOT_FOUND");

        let coverImageUrl = currentBlog.coverImage;
        if (coverImage instanceof File && coverImage.size > 0) {
            // Upload new file
            const fileExtension = coverImage.name.split('.').pop();
            const filePath = `covers/cover-${Date.now()}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-bucket')
                .upload(filePath, coverImage, { contentType: coverImage.type, upsert: true });

            if (uploadError) throw new Error(uploadError.message);
            newUploadedPathsForRollback.push(filePath);

            // Delete old file if existed
            if (currentBlog.coverImage) {
                const oldPath = currentBlog.coverImage.split('/public/blog-bucket/')[1];
                if (oldPath) oldPathsToDeleteAfterSuccess.push(oldPath);
            }

            const { data: { publicUrl } } = supabase.storage.from('blog-bucket').getPublicUrl(filePath);
            coverImageUrl = publicUrl;

        } else if (coverImage === null) {
            // Clear cover image
            coverImageUrl = null;
            if (currentBlog.coverImage) {
                const oldPath = currentBlog.coverImage.split('/public/blog-bucket/')[1];
                if (oldPath) oldPathsToDeleteAfterSuccess.push(oldPath);
            }
        }

        // 2. Handle Gallery Images
        const uploadedExtraUrls: string[] = [];
        
        for (const meta of blogImagesMeta) {
            if (meta.type === 'url') {
                uploadedExtraUrls.push(meta.imageUrl);
            } else if (meta.type === 'file') {
                const file = extraImageFiles[meta.fileIndex];
                if (file && file.size > 0) {
                    const fileExtension = file.name.split('.').pop();
                    const randomString = Math.random().toString(36).substring(7);
                    const filePath = `extras/extra-${Date.now()}-${randomString}.${fileExtension}`;

                    const { error: extraUploadError } = await supabase.storage
                        .from('blog-bucket')
                        .upload(filePath, file, { contentType: file.type, upsert: true });

                    if (extraUploadError) throw new Error(extraUploadError.message);
                    newUploadedPathsForRollback.push(filePath);

                    const { data: { publicUrl } } = supabase.storage.from('blog-bucket').getPublicUrl(filePath);
                    uploadedExtraUrls.push(publicUrl);
                }
            }
        }

        // Identify which old supabase gallery files were removed
        currentBlog.blogImages.forEach(img => {
            if (!uploadedExtraUrls.includes(img.imageUrl)) {
                const oldPath = img.imageUrl.split('/public/blog-bucket/')[1];
                if (oldPath) oldPathsToDeleteAfterSuccess.push(oldPath);
            }
        });

        // 3. Database Transaction
        const updatedBlog = await prisma.$transaction(async (tx) => {

            await tx.blogImage.deleteMany({ where: { blogId: blogId } });

            return await tx.blog.update({
                where: { id: blogId },
                data: {
                    title,
                    summary,
                    content,
                    coverImage: coverImageUrl,
                    blogImages: {
                        create: uploadedExtraUrls.map(url => ({ imageUrl: url }))
                    }
                },
                include: { blogImages: true }
            });
        });

        // Cleanup deleted files from Supabase Storage
        if (oldPathsToDeleteAfterSuccess.length > 0) {
            await supabase.storage.from('blog-bucket').remove(oldPathsToDeleteAfterSuccess);
        }

        return { updatedBlog, oldSlug: currentBlog.slug };

    } catch (error) {
        if (newUploadedPathsForRollback.length > 0) {
            await supabase.storage.from('blog-bucket').remove(newUploadedPathsForRollback);
        }
        throw error;
    }
}

export async function getAllPublicBlogsByPage(input: FetchBlogsInput = {}) {
    const { searchQuery = "", page = 1, pageSize = 10 } = input;
    const skip = (page - 1) * pageSize;

    try {
        const whereCondition = {
            isPublished: true,
            ...(searchQuery ? {
                title: {
                    contains: searchQuery,
                    mode: 'insensitive' as const
                }
            } : {})
        };

        const [blogs, totalCount] = await Promise.all([
            prisma.blog.findMany({
                where: whereCondition,
                skip: skip,           
                take: pageSize,       
                orderBy: { createdAt: 'desc' }, 
                include: {
                    blogImages: true,
                    comments: {
                        where: { status: 'approved' },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            prisma.blog.count({ where: whereCondition })
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        return { blogs, totalPages, totalCount };

    } catch (error) {
        console.error("Service Error - Fetching public blogs failed:", error);
        throw new Error("ไม่สามารถดึงข้อมูลบทความได้จากฐานข้อมูล");
    }
}

export async function getAllBlogs() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                blogImages: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        return blogs;
    } catch (error) {
        console.error("Service Error - Fetching all blogs failed:", error);
        throw new Error("ไม่สามารถดึงข้อมูลบทความได้จากฐานข้อมูล");
    }
}

export async function toggleBlogStatusService(input: { blogId: string }) {
    const { blogId } = input;
    try {
        const currentBlog = await prisma.blog.findUnique({
            where: { id: blogId },
            select: { isPublished: true }
        });

        if (!currentBlog) throw new Error("ไม่พบบทความนี้");

        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: { isPublished: !currentBlog.isPublished }, 
        });
        
        return updatedBlog;
    } catch (error) {
        console.error("Service Error:", error);
        throw new Error("ไม่สามารถสลับสถานะบทความได้");
    }
}

export async function getBlogById(blogId: string) {
    try {
        const blogData = await prisma.blog.findUnique({
            where: { id: blogId },
            include: {
                blogImages: true,
                comments: {
                    where: { status: 'approved' },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!blogData) throw new Error("ไม่พบข้อมูลบทความ");

        return blogData;
    } catch (error) {
        console.error("Service Error - Fetching blog by ID failed:", error);
        throw new Error("ไม่สามารถดึงข้อมูลบทความได้จากฐานข้อมูล");
    }
}

export async function getBlogForSlug() {
    try {
        const blogSlugs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                isPublished: true,
            },
            orderBy: { createdAt: "desc" }
        });

        if (!blogSlugs) throw new Error("ไม่พบข้อมูลบทความ");

        return blogSlugs;
    } catch (error) {
        console.error("Service Error - Fetching blog by slug failed:", error);
        throw new Error("ไม่สามารถดึงข้อมูลบทความได้จากฐานข้อมูล");
    }
}

export async function editSlug(blogId: string, newSlug: string) {
    try {

        const isSlugTaken = await prisma.blog.findFirst({
            where: {
                slug: newSlug,
                id: { not: blogId }
            }
        });

        if (isSlugTaken) throw new Error("SLUG_TAKEN");

        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: { slug: newSlug },
        });

        return updatedBlog;
    } catch (error) {
        console.error("Service Error - Editing slug failed:", error);
        throw new Error("ไม่สามารถแก้ไข slug ได้");
    }
}