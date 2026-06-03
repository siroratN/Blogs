"use client";

import { useState, useEffect } from "react";
import { CircleCheck } from 'lucide-react';
import toast from "react-hot-toast";


interface blog {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
}

export default function SlugEdit() {
    const [blogs, setBlogs] = useState<blog[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftSlug, setDraftSlug] = useState("");
    const [slugError, setSlugError] = useState("");
    const [savedId, setSavedId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch("/api/admin/slug");
                const data = await res.json();
                if (data.success) {
                    setBlogs(data.blogSlugs);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            }
        }
        fetchBlogs();
    }, []);

    const startEdit = (blog: blog) => {
        setEditingId(blog.id);
        setDraftSlug(blog.slug);
        setSlugError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraftSlug("");
        setSlugError("");
    };

    const handleSlugChange = (val: string) => {
        setDraftSlug(val);
        if (!val.trim()) {
            setSlugError("กรุณาระบุ URL Slug");
        } else if (/[^a-z0-9]/.test(val)) {
            setSlugError("Slug ควรประกอบด้วยตัวพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น");
        } else {
            setSlugError("");
        }
    };

    const saveSlug = async (id: string) => {
        if (slugError || !draftSlug) return;

        try {
            setIsSaving(true);
            const res = await fetch("/api/admin/slug", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, slug: draftSlug })
            });

            if (res.ok) {
                setBlogs((prev) => prev.map((p) => p.id === id ? { ...p, slug: draftSlug } : p));
                setEditingId(null);
                setSavedId(id);
                toast.success("บันทึก URL Slug เรียบร้อยแล้ว");
                setSavedId(null);

            } else {
                setSlugError("ไม่สามารถบันทึกข้อมูลได้ เนื่องจาก Slug นี้อาจซ้ำในระบบ");
            }
        } catch (error) {
            console.error("Failed to save slug:", error);
            setSlugError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF5E4] font-sans">
            {/* Header */}
            <div className="bg-white border-b border-[#FFD1D1] px-8 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFE3E1] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#5C2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-[#5C2D2D]">แก้ไข URL Slug</h1>
                        <p className="text-xs text-[#FF9494]">จัดการ URL ของแต่ละบทความ</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
                {/* Info Box */}
                <div className="bg-white rounded-2xl border border-[#FFE3E1] p-4 flex gap-3 items-start shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#FFE3E1] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-[#FF9494]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-[#5C2D2D]">
                        <p className="font-medium mb-0.5">เกี่ยวกับ URL Slug</p>
                        <p className="text-xs text-[#FF9494] leading-relaxed">
                            URL Slug คือส่วนที่ระบุหน้าในลิงก์ควรใช้ตัวพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น
                        </p>
                    </div>
                </div>

                {/* blog List */}
                <div className="space-y-3">
                    {blogs.map((blog) => (
                        <div key={blog.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${editingId === blog.id ? "border-[#FF9494]" : "border-[#FFE3E1]"}`}>
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.isPublished ? "bg-green-50 text-green-700" : "bg-[#FFE3E1] text-[#5C2D2D]"}`}>
                                                {blog.isPublished ? "● Published" : "○ Draft"}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-[#5C2D2D]">{blog.title}</p>
                                    </div>
                                    {editingId !== blog.id && (
                                        <button
                                            onClick={() => startEdit(blog)}
                                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF5E4] hover:bg-[#FFE3E1] text-[#5C2D2D] text-xs font-medium transition border border-[#FFE3E1]"
                                        >
                                            <svg className="w-3.5 h-3.5 text-[#FF9494]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            แก้ไข
                                        </button>
                                    )}
                                </div>

                                {/* Current Slug Display */}
                                {editingId !== blog.id && (
                                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${savedId === blog.id ? "bg-green-50 border border-green-100" : "bg-[#FFF5E4] border border-[#FFE3E1]"}`}>
                                        <span className={`font-mono font-medium ${savedId === blog.id ? "text-green-700" : "text-[#5C2D2D]"}`}>{blog.slug}</span>
                                        {savedId === blog.id && (
                                            <CircleCheck size={16} className="ml-auto text-green-500 flex-shrink-0" />
                                        )}
                                    </div>
                                )}

                                {/* Edit Mode */}
                                {editingId === blog.id && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-[#FF9494] mb-1.5">URL Slug ใหม่</label>
                                            <div className={`flex items-center border rounded-xl overflow-hidden transition ${slugError ? "border-red-400" : "border-[#FF9494]"}`}>
                                                <input
                                                    type="text"
                                                    value={draftSlug}
                                                    onChange={(e) => handleSlugChange(e.target.value)}
                                                    className="flex-1 px-3 py-3 text-sm font-mono text-[#5C2D2D] focus:outline-none bg-white"
                                                    placeholder="your-slug-here"
                                                    autoFocus
                                                />
                                            </div>
                                            {slugError && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {slugError}
                                                </p>
                                            )}
                                        </div>


                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => saveSlug(blog.id)}
                                                disabled={!!slugError || !draftSlug || isSaving}
                                                className="flex-1 py-2.5 rounded-xl bg-[#FF9494] disabled:bg-[#FFD1D1] text-white text-sm font-medium transition hover:bg-[#FF7070] disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? "กำลังบันทึก..." : "บันทึก Slug"}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2.5 rounded-xl border border-[#FFE3E1] text-[#5C2D2D] text-sm font-medium transition hover:bg-[#FFF5E4]"
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
