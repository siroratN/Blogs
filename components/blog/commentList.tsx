"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type CommentStatus = "pending" | "approved" | "rejected";

interface Comment {
    id: string;
    authorName: string;
    content: string;
    status: CommentStatus;
    createdAt: string;
    blog: {
        title: string;
    };
}


const statusConfig = {
    pending: { label: "รอตรวจสอบ", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    approved: { label: "อนุมัติแล้ว", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    rejected: { label: "ปฏิเสธแล้ว", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" }
};


export default function CommentList() {

    const params = useParams();
    const id = params?.id; 
    const blogId = id ? decodeURIComponent(id as string) : "";

    const [comments, setComments] = useState<Comment[]>([]);
    const [filter, setFilter] = useState<CommentStatus | "all">("pending");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchComments() {
            try {
                setIsLoading(true);

                const apiUrl = blogId
                    ? `/api/admin/comments?blogId=${blogId}`
                    : "/api/admin/comments";

                const res = await fetch(apiUrl);

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setComments(data.comments?.comments || data.comments || []);
                    }
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchComments();
    }, [blogId]);

    const updateStatus = async (id: string, newStatus: CommentStatus) => {
        try {
            const res = await fetch(`/api/admin/comments`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentId: id, status: newStatus })
            });
            if (res.ok) {
                setComments((prev) => prev.map((c) => c.id === id ? { ...c, status: newStatus } : c));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = comments.filter((c) => filter === "all" || c.status === filter);
    const pendingCount = comments.filter((c) => c.status === "pending").length;
    const approvedCount = comments.filter((c) => c.status === "approved").length;
    const rejectedCount = comments.filter((c) => c.status === "rejected").length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFF5E4] flex items-center justify-center text-[#FF9494] animate-pulse font-medium text-sm">
                loading
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF5E4] font-sans">
            {/* Header */}
            <div className="bg-white border-b border-[#FFD1D1] px-8 py-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FF9494] flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-[#5C2D2D]">Comments</h1>
                            <p className="text-xs text-[#FF9494]">ตรวจสอบ approve / reject ความคิดเห็นทั้งหมดในระบบ</p>
                        </div>
                    </div>

                    <div className="hidden md:flex gap-2">
                        <div className="text-center px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100">
                            <div className="text-sm font-bold text-amber-700">{pendingCount}</div>
                            <div className="text-[10px] text-amber-500">รอตรวจ</div>
                        </div>
                        <div className="text-center px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
                            <div className="text-sm font-bold text-green-700">{approvedCount}</div>
                            <div className="text-[10px] text-green-500">อนุมัติ</div>
                        </div>
                        <div className="text-center px-3 py-1.5 rounded-xl bg-[#FFE3E1] border border-[#FFD1D1]">
                            <div className="text-sm font-bold text-[#5C2D2D]">{rejectedCount}</div>
                            <div className="text-[10px] text-[#FF9494]">ปฏิเสธ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-4 ">
                {/* Filter Tabs */}
                <div className="sticky top-24 flex gap-1 bg-white p-1 rounded-xl border border-[#FFE3E1] shadow-sm w-fit">
                    {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[#FF9494] text-white shadow-sm" : "text-[#5C2D2D] hover:bg-[#FFF5E4]"}`}
                        >
                            {f === "all" ? "ทั้งหมด" : statusConfig[f].label}
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? "bg-white/30 text-white" : "bg-[#FFE3E1] text-[#5C2D2D]"}`}>
                                {f === "all" ? comments.length : f === "pending" ? pendingCount : f === "approved" ? approvedCount : rejectedCount}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Comment Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#FFE3E1] p-12 text-center shadow-sm">
                        <p className="text-[#5C2D2D] font-medium text-sm">ไม่มีความคิดเห็นในหมวดนี้</p>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 pb-6 custom-scrollbar">                        {filtered.map((comment) => {
                        const sc = statusConfig[comment.status];

                        return (
                            <div key={comment.id} className="bg-white rounded-2xl border shadow-sm border-[#FFE3E1]">
                                <div className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex bg-[#FFD1D1] items-center justify-center text-sm font-bold text-[#5C2D2D]`}>
                                            {comment.authorName ? comment.authorName.substring(0, 2).toUpperCase() : "AN"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-[#5C2D2D]">{comment.authorName}</span>
                                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.text} border ${sc.border}`}>
                                                    {sc.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#FF9494] mt-0.5">
                                                {comment.blog?.title || "ไม่ทราบชื่อ"} · {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 ml-14 p-3 bg-[#FFF5E4] rounded-xl text-sm text-[#5C2D2D] border border-[#FFE3E1]">
                                        {comment.content}
                                    </div>
                                    {comment.status === "pending" && (
                                        <div className="flex gap-2 mt-3 ml-14">
                                            <button
                                                onClick={() => updateStatus(comment.id, "approved")}
                                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-xl transition"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(comment.id, "rejected")}
                                                className="flex-1 py-2 bg-[#FF9494] hover:bg-[#FF7070] text-white text-xs font-medium rounded-xl transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>
        </div>
    );
}