import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CommentForm from "@/components/blog/CommentForm";
import { Eye, CalendarDays } from "lucide-react";
import Image from "next/image";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
    const resolvedParams = await params;
    const rawSlug = resolvedParams.slug;
    const slug = decodeURIComponent(rawSlug);
    
    const blog = await prisma.blog.findFirst({
        where: { slug },
        include: {
            blogImages: true,
            comments: {
                where: { status: "approved" },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!blog) {
        notFound();
    }

    await prisma.blog.update({
        where: { id: blog.id },
        data: { viewsCount: { increment: 1 } }
    });

    return (
        <main className="w-full bg-white min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full">
                {blog.coverImage ? (
                    <div className="w-full max-w-screen-2xl mx-auto px-0 sm:px-6 lg:px-10 pt-8 fade-up">
                        <div className="cover-img-wrapper relative w-full aspect-[21/9] sm:aspect-[16/7] sm:rounded-3xl overflow-hidden shadow-2xl group">
                            <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                width={1200}
                                height={675}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent hidden sm:block" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10 hidden sm:block">
                                <h1 className="blog-title text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-4xl font-black tracking-tight leading-tight drop-shadow-md">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex gap-1">
                                        <CalendarDays className="h-4 w-4 text-white/80" />
                                        <time dateTime={blog.createdAt.toISOString()} className="text-white/70 text-sm font-medium">
                                            {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                                year: "numeric", month: "long", day: "numeric",
                                            })}
                                        </time>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-white/80">
                                        <Eye className="h-4 w-4 text-white/80" />
                                        {blog.viewsCount + 1} ผู้เข้าชม
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <header className="max-w-4xl mx-auto px-6 pt-14 pb-4 fade-up">
                        <p className="section-label mb-3 text-xs uppercase tracking-widest text-blue-600 font-bold">บทความ</p>
                        <h1 className="blog-title text-gray-950 text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4" />
                            <time dateTime={blog.createdAt.toISOString()} className="font-medium">
                                {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                    year: "numeric", month: "long", day: "numeric",
                                })}
                            </time>
                            <span className="flex items-center gap-1.5 ">
                                <Eye className="h-4 w-4" />
                                {blog.viewsCount + 1} ผู้เข้าชม
                            </span>
                        </div>
                    </header>
                )}

                {blog.coverImage && (
                    <header className="sm:hidden px-5 pt-7 pb-2 fade-up fade-up-delay-1">
                        <p className="section-label mb-2">บทความ</p>
                        <h1 className="blog-title text-gray-950 text-3xl leading-tight mb-3">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <time dateTime={blog.createdAt.toISOString()}>
                                {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                    year: "numeric", month: "long", day: "numeric",
                                })}
                            </time>
                            <span className="text-gray-300">·</span>
                            <span>{blog.viewsCount + 1} ผู้เข้าชม</span>
                        </div>
                    </header>
                )}

                <div className="max-w-screen-xl mx-auto px-5 sm:px-8 lg:px-10 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start pb-24">
                    <main className="lg:col-span-7 xl:col-span-8 fade-up fade-up-delay-2">
                        <div className="blog-body whitespace-pre-line">
                            {blog.content}
                        </div>

                        {blog.blogImages && blog.blogImages.length > 0 && (
                            <>
                                <div className="divider-ornament">
                                    <span className="section-label">รูปภาพประกอบ</span>
                                </div>
                                <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {blog.blogImages.map((img) => (
                                        <div key={img.id} className="gallery-item relative aspect-video overflow-hidden rounded-2xl bg-gray-100 cursor-zoom-in shadow-sm ring-1 ring-black/5">
                                            <Image 
                                            width={800}
                                            height={450}
                                            src={img.imageUrl} 
                                            alt="ภาพประกอบบทความ" 
                                            className="gallery-img w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </section>
                            </>
                        )}
                    </main>

                    <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-10 space-y-10 fade-up fade-up-delay-3">
                        <section className="rounded-3xl border border-gray-100 bg-gray-50/60 p-7 shadow-sm">
                            <h2 className="blog-title text-gray-900 text-xl mb-1">ร่วมแสดงความคิดเห็น</h2>
                            <p className="text-xs text-gray-400 mb-5 leading-relaxed">ความคิดเห็นจะแสดงหลังผ่านการตรวจสอบจากทีมงาน</p>
                            <CommentForm blogId={blog.id} />
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-5">
                                <div><p className="section-label mb-1">ความเห็นทั้งหมด</p></div>
                                {blog.comments.length > 0 && (
                                    <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded-full">{blog.comments.length}</span>
                                )}
                            </div>

                            {blog.comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 py-12 rounded-2xl border border-dashed border-gray-200 gap-2">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-400">ยังไม่มีความคิดเห็น</p>
                                    <p className="text-xs text-gray-300">มาเป็นคนแรกที่แชร์ความคิดเห็น!</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                                    {blog.comments.map((comment) => (
                                        <div key={comment.id} className="comment-card bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                            <div className="flex items-center gap-3 mb-2.5">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
                                                    {comment.authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900 leading-tight">{comment.authorName}</p>
                                                    <time className="text-[11px] text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString("th-TH", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                        })}
                                                    </time>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed pl-12">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}