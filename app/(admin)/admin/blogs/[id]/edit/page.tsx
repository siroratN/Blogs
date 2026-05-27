import React, { Suspense } from 'react';
import BlogEdit from '@/components/blog/blogEdit';



export default function EditBlogPage() {
    return (
        <div>
            <Suspense fallback={
                <div className="text-center py-24 bg-white rounded-2xl border border-[#FFE3E1] shadow-sm max-w-2xl mx-auto my-10 p-8">
                    <p className="text-slate-400 font-medium text-base animate-pulse">
                        loading
                    </p>
                </div>
            }>
                <BlogEdit />
            </Suspense>
        </div>
    );
}