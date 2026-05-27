'use client'

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CommentForm = ({ blogId }: { blogId: string }) => {
    const [authorName, setAuthorName] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/blogs/${blogId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ authorName, content }),
            });
            
            const result = await response.json();

            if (result.success) {
                toast.success("ส่งคอมเมนต์เรียบร้อยแล้ว! รอแอดมินอนุมัติ");
                setAuthorName('');
                setContent('');
            } else {
                toast.error(result.error || "เกิดข้อผิดพลาดในการส่งคอมเมนต์");
            }

        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่ในภายหลัง");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-sm border max-w-lg mt-6">
            <div className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="ชื่อของคุณ"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="border p-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                    placeholder="ข้อความคอมเมนต์"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="border p-2 rounded-lg text-gray-800 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="submit" className="bg-[#FF9494] hover:bg-[#FFD1D1] text-white hover:text-black font-semibold py-2 rounded-lg transition">
                    ส่งข้อมูล
                </button>
            </div>
        </form>
    );
};

export default CommentForm;