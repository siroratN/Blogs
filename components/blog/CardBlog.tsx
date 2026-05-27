import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Eye, BookOpen } from "lucide-react"
import Image from "next/image"
import { PaginationBlogs } from "@/components/blog/Pagination"
import { getAllPublicBlogsByPage } from "@/app/api/service/blog" 

interface BlogItem {
    id: string;
    title: string;
    summary: string;
    slug: string;
    coverImage: string | null;
    viewsCount: number;
    createdAt: Date;
}

interface BlogListProps {
    searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function BlogListPage({ searchParams }: BlogListProps) {
    const { q, page } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 10; 

    let blogs: BlogItem[] = [];
    let totalPages = 0;
    
    try {
        const blogsData = await getAllPublicBlogsByPage({
            searchQuery: q || "",
            page: currentPage,
            pageSize: limit
        });
        
        if (blogsData) {
            blogs = blogsData.blogs || [];
            totalPages = blogsData.totalPages || 0;
        }
    } catch (error) {
        console.error("Failed to query blogs via service in Page Component:", error);
    }

    if (!blogs || blogs.length === 0) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>บทความและสาระน่ารู้</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                        {q ? "ผลการค้นหาบทความ" : "บทความทั้งหมด"}
                    </h1>
                </div>

                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto p-8 backdrop-blur-sm">
                    <p className="text-slate-400 font-medium text-base">
                        {q ? `ไม่พบข้อมูลบทความที่ตรงกับ "${q}"` : "ไม่พบข้อมูลบทความในหน้านี้"}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-16 py-10 relative overflow-hidden">



            {/* Blog Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4 sm:px-0">
                {blogs.map((blog) => (
                    <Card 
                        key={blog.id} 
                        className="group relative w-full overflow-hidden flex flex-col justify-between bg-white border border-slate-100 rounded-[24px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)] pt-0"
                    >
                        <div>
                            {/* Image Container */}
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 rounded-t-[24px]">
                                <Image
                                    src={blog.coverImage || "https://avatar.vercel.sh/shadcn1"}
                                    alt={blog.title}
                                    width={400}
                                    height={250}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    priority
                                />
                                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            {/* Content Body */}
                            <CardHeader className="p-6 pb-2 space-y-4">
                                {/* Tags / Metadata Top */}
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 stroke-[1.8]" />
                                        <span>
                                            {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                                day: "numeric",
                                                month: "short",
                                                year: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="h-3.5 w-3.5 stroke-[1.8]" />
                                        <span>{blog.viewsCount.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                {/* Title & Summary */}
                                <div className="space-y-2">
                                    <CardTitle className="text-xl font-bold text-slate-900 tracking-tight leading-snug transition-colors duration-300 group-hover:text-blue-600 line-clamp-2">
                                        <Link href={`/blogs/${blog.slug}`}>
                                            {blog.title}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 font-normal text-sm leading-relaxed line-clamp-2">
                                        {blog.summary}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </div>

                        <CardFooter className="p-6 pt-4">
                            <Link href={`/blogs/${blog.slug}`} className="w-full">
                                <Button 
                                    variant="ghost"
                                    className="w-full h-11 bg-slate-50 hover:bg-slate-900 border-0 text-slate-700 hover:text-white font-medium text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 group/btn"
                                >
                                    <span>อ่านเนื้อหาเต็ม</span>
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination Container */}
            <div className="flex justify-center pt-4 border-t border-slate-100 max-w-6xl mx-auto">
                <PaginationBlogs currentPage={currentPage} totalPages={totalPages} />
            </div>
        </div>
    )
}