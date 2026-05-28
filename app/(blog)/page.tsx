import { Suspense } from "react";
import BlogListPage from "@/components/blog/CardBlog";
import { SearchBar } from "@/components/blog/SearchBar";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default function Home({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-[#FAF6EE] text-slate-900 selection:bg-[#FFE3E1] pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.06))] via-transparent to-transparent -z-10 pointer-events-none" />
      
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 border-b border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Blogs
            </h1>
          </div>

          <div className="w-full sm:max-w-xs">
            <Suspense
              fallback={
                <div className="h-10 w-full bg-slate-200/60 animate-pulse rounded-xl" />
              }
            >
              <SearchBar />
            </Suspense>
          </div>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <Suspense
          fallback={
            <div className="text-center py-24 bg-white rounded-2xl border border-[#FFE3E1] shadow-sm max-w-2xl mx-auto my-10 p-8">
              <p className="text-slate-400 font-medium text-base animate-pulse">
                Loading
              </p>
            </div>
          }
        >
          <BlogListPage searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}