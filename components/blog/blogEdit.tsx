"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Trash2, ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { useDropzone, FileRejection } from "react-dropzone";

interface BlogData {
    title: string;
    summary: string;
    content: string;
}

interface GalleryItem {
    type: "url" | "file";
    imageUrl: string; 
    file?: File;
}

interface BlogImageResponse {
    id?: string | number;
    imageUrl: string;
}

export default function BlogEdit() {
    const { id } = useParams() ?? {};
    const router = useRouter();
    const blogId = id ? decodeURIComponent(id as string) : "";

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverFilePreview, setCoverFilePreview] = useState("");
    const [initialCoverUrl, setInitialCoverUrl] = useState("");
    const [coverCleared, setCoverCleared] = useState(false);

    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [initialGalleryUrls, setInitialGalleryUrls] = useState<string[]>([]);

    const { register, reset, handleSubmit, formState: { isDirty, errors } } = useForm<BlogData>({
        defaultValues: { title: "", summary: "", content: "" },
        mode: "onTouched",
    });

    useEffect(() => {
        if (!blogId) return;
        async function fetchBlog() {
            try {
                setIsLoading(true);
                const res = await fetch(`/api/blogs/${blogId}`, { cache: "no-store" });
                if (!res.ok) throw new Error(res.statusText);
                const { blog } = await res.json();

                reset({
                    title: blog.title || "",
                    summary: blog.summary || "",
                    content: blog.content || "",
                });

                setInitialCoverUrl(blog.coverImage || "");
                setCoverCleared(false);
                setCoverFile(null);
                setCoverFilePreview("");

                const gallery = ((blog.blogImages || []) as BlogImageResponse[]).map((img) => ({
                    type: "url" as const,
                    imageUrl: img.imageUrl,
                }));

                setGalleryItems(gallery);
                setInitialGalleryUrls(gallery.map((img) => img.imageUrl));
            } catch (error) {
                console.error("Failed to load blog:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBlog();
    }, [blogId, reset]);

    const onCoverDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                toast.error("ขนาดไฟล์รูปภาพหน้าปกต้องไม่เกิน 10MB");
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                toast.error("รองรับเฉพาะไฟล์รูปภาพนามสกุล .png, .jpg, .jpeg เท่านั้น");
            } else {
                toast.error(rejection.errors[0]?.message || "ไฟล์รูปภาพไม่ถูกต้อง");
            }
            return;
        }
        const file = acceptedFiles[0];
        if (file) {
            setCoverFile(file);
            setCoverFilePreview(URL.createObjectURL(file));
            setCoverCleared(false);
        }
    }, []);

    const removeCoverImage = () => {
        setCoverFile(null);
        if (coverFilePreview) URL.revokeObjectURL(coverFilePreview);
        setCoverFilePreview("");
        setCoverCleared(true);
    };

    const onGalleryDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (fileRejections.length > 0) {
            fileRejections.forEach((rejection) => {
                if (rejection.errors[0]?.code === 'file-too-large') {
                    toast.error(`ไฟล์ ${rejection.file.name} มีขนาดใหญ่เกินไป (ต้องไม่เกิน 10MB)`);
                } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                    toast.error(`ไฟล์ ${rejection.file.name} ไม่รองรับ (รองรับเฉพาะ .png, .jpg, .jpeg)`);
                } else {
                    toast.error(`ไฟล์ ${rejection.file.name} ไม่ถูกต้อง: ${rejection.errors[0]?.message}`);
                }
            });
        }

        if (acceptedFiles.length > 0) {
            setGalleryItems((prev) => {
                const newItems = acceptedFiles.map((file) => ({
                    type: "file" as const,
                    file,
                    imageUrl: URL.createObjectURL(file),
                }));
                return [...prev, ...newItems];
            });
        }
    }, []);

    const removeGalleryItem = (index: number) => {
        const item = galleryItems[index];
        if (item.type === "file") URL.revokeObjectURL(item.imageUrl);
        setGalleryItems((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
        onDrop: onCoverDrop,
        accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] },
        maxSize: 10 * 1024 * 1024,
        multiple: false
    });

    const { getRootProps: getGalleryRootProps, getInputProps: getGalleryInputProps, isDragActive: isGalleryDragActive } = useDropzone({
        onDrop: onGalleryDrop,
        accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] },
        maxSize: 10 * 1024 * 1024
    });

    const onSubmit: SubmitHandler<BlogData> = async (data) => {
        if (isSaving) return;
        setIsSaving(true);

        if (galleryItems.length > 6) {
        toast.error("รูปภาพประกอบทั้งหมดต้องไม่เกิน 6 รูป");
        return;
    }

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, val]) => formData.append(key, val));

            if (coverFile) formData.append("coverImage", coverFile);
            else formData.append("coverImage", coverCleared ? "" : initialCoverUrl);

            const blogImagesMeta: unknown[] = [];
            let fileIndex = 0;

            galleryItems.forEach((item) => {
                if (item.type === "url") {
                    blogImagesMeta.push({ type: "url", imageUrl: item.imageUrl });
                } else if (item.type === "file" && item.file) {
                    blogImagesMeta.push({ type: "file", fileIndex });
                    formData.append("extraImageFiles", item.file);
                    fileIndex++;
                }
            });
            
            formData.append("blogImagesMeta", JSON.stringify(blogImagesMeta));

            const res = await fetch(`/api/admin/blogs/${blogId}`, { method: "PUT", body: formData });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || `HTTP ${res.status}`);

            toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
            router.refresh();
            
            const updated = resData.blog;
            reset({ title: updated.title, summary: updated.summary, content: updated.content });
            setInitialCoverUrl(updated.coverImage || "");
            setCoverCleared(false);
            setCoverFile(null);
            setCoverFilePreview("");
            
            const nextGallery = ((updated.blogImages || []) as BlogImageResponse[]).map((img: BlogImageResponse) => ({ 
                type: "url" as const, 
                imageUrl: img.imageUrl 
            }));
            setGalleryItems(nextGallery);
            setInitialGalleryUrls(nextGallery.map((img: BlogImageResponse) => img.imageUrl));
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(`${error.message || "ไม่สามารถบันทึกได้"}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const isGalleryDirty = JSON.stringify(galleryItems.map(i => i.imageUrl)) !== JSON.stringify(initialGalleryUrls);
    const isCoverDirty = coverFile !== null || coverCleared;
    const canSave = isDirty || isGalleryDirty || isCoverDirty;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFF5E4] flex flex-col items-center justify-center gap-3">
                <p className="text-sm font-semibold text-[#FF9494] animate-pulse">Loading...</p>
            </div>
        );
    }

    const activeCoverPreview = coverFilePreview || (!coverCleared ? initialCoverUrl : "");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-[#FFF5E4] pb-16 text-[#5C2D2D]">
            {/* Header */}
            <div className="bg-white border-b border-[#FFD1D1] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div>
                    <h1 className="text-base font-bold flex items-center gap-2">แก้ไข Blog</h1>
                    <p className="text-xs text-[#FF9494]">{canSave ? "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" : "ไม่มีการเปลี่ยนแปลง"}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => router.push("/admin")} className="px-4 py-2 rounded-xl text-sm border border-[#FFE3E1] bg-white hover:bg-slate-50 flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                    </button>
                    <button type="submit" disabled={isSaving || !canSave} className="px-6 py-2 rounded-xl text-sm font-semibold bg-[#FF9494] hover:bg-[#FF7070] text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                {/* Cover Image Section */}
                <div className="bg-white rounded-2xl border border-[#FFE3E1] p-6 space-y-4 shadow-sm">
                    <h2 className="text-sm font-bold flex items-center gap-2 pb-2 border-b border-[#FFE3E1]">
                        <span className="w-1.5 h-5 rounded-full bg-[#FF9494]" /> รูปภาพหน้าปก (Cover Image)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="relative aspect-video bg-[#FFE3E1]/40 rounded-xl overflow-hidden border border-[#FFE3E1] flex items-center justify-center">
                            {activeCoverPreview ? (
                                <Image src={activeCoverPreview} alt="cover" fill className="object-cover" unoptimized />
                            ) : (
                                <span className="text-xs font-semibold text-[#FF9494]">ยังไม่มีรูปภาพหน้าปก</span>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div {...getCoverRootProps()} className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${isCoverDragActive ? 'border-[#FF9494] bg-[#FFE3E1]/20 scale-[1.02] shadow-sm' : 'border-[#FFE3E1] hover:border-[#FF9494] bg-[#FFF5E4]/20'}`}>
                                <input {...getCoverInputProps()} />
                                <UploadCloud className={`w-8 h-8 text-[#FF9494] mb-2 transition-transform duration-300 ${isCoverDragActive ? 'scale-125' : ''}`} />
                                <span className="text-xs font-semibold text-center select-none">
                                    {isCoverDragActive ? "ปล่อยไฟล์ที่นี่..." : "ลากรูปภาพมาวาง หรือ คลิกเพื่ออัปโหลดปกใหม่"}
                                </span>
                                <span className="text-[10px] text-[#FF9494]/70 mt-1 select-none">รองรับเฉพาะ .png, .jpg, .jpeg (ไม่เกิน 10MB)</span>
                            </div>
                            {activeCoverPreview && (
                                <button type="button" onClick={removeCoverImage} className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-1.5 transition">
                                    <Trash2 className="w-4 h-4" /> ลบรูปภาพปก
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Main Content Card */}
                <div className="bg-white rounded-2xl border border-[#FFE3E1] p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold flex items-center gap-2"><span className="w-1.5 h-5 rounded-full bg-[#FF9494]" /> เนื้อหาหลักบทความ</h2>
                    <div>
                        <label className="block text-xs font-bold text-[#FF9494] mb-1">ชื่อบทความ *</label>
                        <input type="text" {...register("title", { required: "กรุณากรอกชื่อบทความ" })} className="w-full px-4 py-2.5 rounded-xl border border-[#FFE3E1] bg-[#FFF5E4]/40 text-sm focus:outline-none focus:border-[#FF9494]" />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#FF9494] mb-1">สรุปสั้นๆ (Summary)</label>
                        <textarea {...register("summary", { required: "กรุณากรอกสรุปสั้นๆ" ,maxLength: { value: 300, message: "ห้ามเกิน 300 ตัวอักษร" } })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-[#FFE3E1] bg-[#FFF5E4]/40 text-xs focus:outline-none focus:border-[#FF9494] resize-none" />
                        {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#FF9494] mb-1">เนื้อหาหลัก (Content)</label>
                        <textarea {...register("content", { required: "กรุณากรอกเนื้อหาหลัก", maxLength: { value: 5000, message: "ห้ามเกิน 5000 ตัวอักษร" }})} rows={8} className="w-full px-4 py-2.5 rounded-xl border border-[#FFE3E1] bg-[#FFF5E4]/40 text-xs focus:outline-none focus:border-[#FF9494]" />
                    </div>
                </div>

                {/* 3. Extra Gallery Images Block */}
                <div className="bg-white rounded-2xl border border-[#FFE3E1] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#FFE3E1]">
                        <h2 className="text-sm font-bold flex items-center gap-2"><span className="w-1.5 h-5 rounded-full bg-[#FF9494]" /> รูปภาพประกอบ ({galleryItems.length} รูป)</h2>
                        <div {...getGalleryRootProps()} className="cursor-pointer">
                            <input {...getGalleryInputProps()} />
                            <div className="px-4 py-2 rounded-xl border border-dashed border-[#FFE3E1] hover:border-[#FF9494] bg-[#FFF5E4]/10 hover:bg-[#FFE3E1]/20 text-xs font-bold flex items-center gap-1.5 transition-all">
                                <UploadCloud className="w-4 h-4 text-[#FF9494]" /> อัปโหลดเพิ่ม
                            </div>
                        </div>
                    </div>

                    <div {...getGalleryRootProps()} className={`outline-none transition-all duration-200 ${isGalleryDragActive ? 'border-2 border-dashed border-[#FF9494] bg-[#FFE3E1]/20 rounded-xl p-4 scale-[1.01]' : ''}`}>
                        <input {...getGalleryInputProps()} />
                        {isGalleryDragActive ? (
                            <div className="flex flex-col items-center justify-center py-8 text-[#FF9494] gap-2 select-none">
                                <UploadCloud className="w-12 h-12 animate-bounce" />
                                <p className="text-xs font-bold">ปล่อยไฟล์รูปภาพที่นี่เพื่อเพิ่มรูปประกอบ...</p>
                            </div>
                        ) : galleryItems.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {galleryItems.map((item, index) => (
                                    <div key={index} className="relative group rounded-xl border border-[#FFE3E1] overflow-hidden aspect-video shadow-sm">
                                        <Image src={item.imageUrl} alt="gallery" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex justify-end p-2">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeGalleryItem(index); }} className="p-1.5 bg-red-500 text-white rounded-lg h-fit transition hover:bg-red-600">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-[#FFE3E1] rounded-xl text-[#FF9494] text-xs bg-[#FFF5E4]/10 hover:bg-[#FFE3E1]/15 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer select-none">
                                <UploadCloud className="w-8 h-8" />
                                <span className="font-semibold">ลากรูปภาพประกอบมาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์</span>
                                <span className="text-[10px] text-[#FF9494]/60">รองรับสูงสุด 6 รูป เฉพาะ .png, .jpg, .jpeg (ไฟล์ละไม่เกิน 10MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}