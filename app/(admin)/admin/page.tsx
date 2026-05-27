'use client';

import React, { useState, useEffect } from 'react';
import { 
    Edit2, 
    Eye, 
    EyeOff, 
    MessageSquare, 
    Search, 
    TrendingUp, 
    Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Blog {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    viewsCount: number;
    commentsCount: number;
}

export default function AdminBlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all blogs
    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch('/api/admin/blogs');
                const data = await res.json();
                if (data.blogs) {
                    setBlogs(data.blogs);
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    // Toggle status
    const togglePublish = async (id: string, currentStatus: boolean) => {
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, isPublished: !currentStatus } : b));
    
        try {
            const res = await fetch(`api/admin/blogs/${id}/status`, { 
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ id })
            });
    
            if (!res.ok) throw new Error("Update failed");
            toast.success(`บทความถูก${!currentStatus ? 'เผยแพร่' : 'เก็บเป็นร่าง'}เรียบร้อยแล้ว`);
        } catch (error: unknown) {
            setBlogs(prev => prev.map(b => b.id === id ? { ...b, isPublished: currentStatus } : b));
            console.error(error);
            toast.error("ไม่สามารถเปลี่ยนสถานะบทความได้ กรุณาลองใหม่อีกครั้ง");
        }
    };
    


    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FFF5E4]/30 p-6 md:p-10 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-wide">Blog Management</h1>
                    <p className="text-sm text-gray-500">แก้ไขข้อมูล, เปิด/ปิดสถานะ</p>
                </div>
                {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FF9494] text-white rounded-xl font-semibold shadow-sm hover:bg-[#ff8080] transition-colors self-start md:self-auto text-sm">
                    <Plus size={18} />
                    เขียนบทความใหม่
                </button> */}
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="ค้นหาชื่อบล็อก หรือ Slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FFE3E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9494]/20 focus:border-[#FF9494] transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#FFE3E1] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FFF5E4] text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-[#FFE3E1]">
                                <th className="p-4 pl-6">title</th>
                                <th className="p-4">status</th>
                                <th className="p-4">date</th> 
                                <th className="p-4">view</th>
                                <th className="p-4 text-center pr-6">management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FFE3E1] text-sm text-gray-600">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">กำลังโหลดข้อมูลบทความ...</td>
                                </tr>
                            ) : filteredBlogs.map((blog) => (
                                <tr key={blog.id} className="hover:bg-[#FFF5E4]/10 transition-colors">
                                    <td className="p-4 pl-6 max-w-md">
                                        <div className="font-semibold text-gray-800 mb-1 line-clamp-1">{blog.title}</div>
                                        {/* <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                                            <Globe size={12} />
                                            <span>/{blog.slug}</span>
                                        </div> */}
                                    </td>

                                    <td className="p-4">
                                        <button 
                                            onClick={() => togglePublish(blog.id, blog.isPublished)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-colors ${
                                                blog.isPublished 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                                            }`}
                                        >
                                            {blog.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {blog.isPublished ? 'Published' : 'Draft'}
                                        </button>
                                    </td>

                                    <td className="p-4 text-gray-500 text-xs">
                                        <div className="flex items-center gap-1.5"><Calendar size={14} />{new Date(blog.createdAt).toLocaleDateString('th-TH')}</div>
                                    </td>

                                    <td className="p-4 text-gray-700 text-xs font-medium">
                                        <div className="flex items-center gap-1.5"><TrendingUp size={14} className="text-gray-400" />{blog.viewsCount.toLocaleString()} ครั้ง</div>
                                    </td>

                                    <td className="p-4 text-center pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/admin/blogs/${blog.id}/edit`} 
                                                title="แก้ไขบล็อก & Slug"
                                                className="p-2 text-gray-400 hover:text-[#FF9494] hover:bg-[#FFE3E1]/40 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <Link  href={`/admin/blogs/${blog.id}/comments`}
                                                title="ดูความคิดเห็น"
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors relative"
                                            >
                                                <MessageSquare size={16} />
                                                {blog.commentsCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}