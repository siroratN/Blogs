import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CommentForm from "@/components/blog/CommentForm";
import { Eye, CalendarDays, MessageSquare } from "lucide-react";
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
        <main className="w-full bg-slate-50/50 min-h-screen selection:bg-indigo-50 selection:text-indigo-900 antialiased">
            <div className="w-full">
                {blog.coverImage ? (
                    <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-0 sm:pt-8 animate-fade-in">
                        <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] group bg-slate-900">
                            <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                                width={1600}
                                height={900}
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent hidden sm:block" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 hidden sm:block">
                                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-5xl max-w-5xl font-black tracking-tight leading-[1.15]">
                                    {blog.title}
                                </h1>
                                <div className="flex items-center gap-5 mt-6 text-slate-300 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-indigo-400" />
                                        <time dateTime={blog.createdAt.toISOString()}>
                                            {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                                year: "numeric", month: "long", day: "numeric",
                                            })}
                                        </time>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-600" />
                                    <span className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-indigo-400" />
                                        {blog.viewsCount + 1} ผู้เข้าชม
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <header className="max-w-4xl mx-auto px-6 pt-16 pb-4 animate-fade-in">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 mb-4">
                            บทความ
                        </span>
                        <h1 className="text-slate-900 text-4xl md:text-5xl lg:text-5xl font-black leading-tight mb-6 tracking-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-5 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                <time dateTime={blog.createdAt.toISOString()}>
                                    {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                        year: "numeric", month: "long", day: "numeric",
                                    })}
                                </time>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-slate-400" />
                                {blog.viewsCount + 1} ผู้เข้าชม
                            </span>
                        </div>
                    </header>
                )}
                {blog.coverImage && (
                    <header className="sm:hidden px-6 pt-8 pb-2 animate-fade-in">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                            บทความ
                        </span>
                        <h1 className="text-slate-900 text-2xl font-extrabold leading-tight mt-4 mb-4 tracking-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                            <time dateTime={blog.createdAt.toISOString()}>
                                {new Date(blog.createdAt).toLocaleDateString("th-TH", {
                                    year: "numeric", month: "long", day: "numeric",
                                })}
                            </time>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{blog.viewsCount + 1} ผู้เข้าชม</span>
                        </div>
                    </header>
                )}


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-32">
                    
                    <article className="lg:col-span-7 xl:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="text-slate-800 text-base sm:text-lg leading-[1.85] whitespace-pre-line tracking-normal font-normal break-words selection:bg-indigo-100/60">
                            {blog.content}
                        </div>

                        {blog.blogImages && blog.blogImages.length > 0 && (
                            <div className="mt-14 pt-10 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                                    <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold">รูปภาพประกอบบทความ</h3>
                                </div>
                                <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {blog.blogImages.map((img) => (
                                        <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-slate-50 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-md hover:ring-slate-950/10">
                                            <Image 
                                                width={800}
                                                height={450}
                                                src={img.imageUrl} 
                                                alt="ภาพประกอบบทความ" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                    ))}
                                </section>
                            </div>
                        )}
                    </article>

                    <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-8">
                        <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] backdrop-blur-md">
                            <h2 className="text-slate-900 font-black text-xl mb-1.5 tracking-tight">ร่วมแสดงความคิดเห็น</h2>
                            <p className="text-xs text-slate-400 mb-6 leading-relaxed">ความคิดเห็นของคุณจะได้รับการตรวจสอบจากทีมงานก่อนเผยแพร่ลงเว็บไซต์</p>
                            <CommentForm blogId={blog.id} />
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">ความคิดเห็น</h3>
                                </div>
                                {blog.comments.length > 0 && (
                                    <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                                        {blog.comments.length}
                                    </span>
                                )}
                            </div>

                            {blog.comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border border-dashed border-slate-200 gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                                    <div className="p-3 bg-slate-50 rounded-full text-slate-400">
                                        <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">ยังไม่มีความคิดเห็น</p>
                                        <p className="text-xs text-slate-400 mt-0.5">มาเป็นคนแรกที่แชร์ความคิดเห็นในบทความนี้กัน!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                    {blog.comments.map((comment) => (
                                        <div key={comment.id} className="bg-white rounded-2xl border border-slate-100/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-200 hover:border-slate-200/60">
                                            <div className="flex items-center gap-3.5 mb-3">
                                                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                                                    {comment.authorName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 leading-tight">{comment.authorName}</p>
                                                    <time className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(comment.createdAt).toLocaleDateString("th-TH", {
                                                            year: "numeric", month: "short", day: "numeric",
                                                        })}
                                                    </time>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed pl-12 whitespace-pre-line">{comment.content}</p>
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